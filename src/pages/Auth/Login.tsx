import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, sendLoginOtp, setAuthToken, verifyLoginOtp, type LoginOtpChannel } from '../../services/jwtService';
import { User, Lock, Sun, Shield, Zap, Sparkles, ArrowLeft, Mail, Smartphone, KeyRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody } from '../../components/ui/Card';
import { Logo } from '../../components/ui';
import ReusableDropdown from '../../components/ReusableDropdown';
import { useUser } from '../../contexts/UserContext';
import bgImage from '../../assets/Solar_Image.webp';

interface OrgRoleData {
  roles: string[];
  org_name: string;
  dept_code: number | null;
}

interface RoleOption {
  orgId: string;
  orgName: string;
  role: string;
  deptCode: number | null;
}

interface UserClaims {
  id: number;
  name_as_per_gov_id?: string;
  preferred_name?: string;
  email_address?: string;
  global_roles?: string[];
  org_roles?: Record<string, OrgRoleData>;
  has_password_changed?: boolean;
  [key: string]: any;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;

const normalizeOtpIdentifier = (value: string): string => value.trim();

const detectOtpChannel = (value: string): LoginOtpChannel | null => {
  const trimmed = normalizeOtpIdentifier(value);
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (EMAIL_REGEX.test(trimmed)) {
    return 'EMAIL';
  }

  if (PHONE_REGEX.test(digitsOnly)) {
    return 'SMS';
  }

  return null;
};

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUserClaims } = useUser();
  const detectedOtpChannel = detectOtpChannel(identifier);

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) return;


      const claims = await refreshUserClaims(); // ✅ use context

      if (claims) {
        handleRoleRouting(claims);
      }
    };

    checkAlreadyLoggedIn();
  }, []);


  const completeAuthenticatedLogin = async (jwt: string, refreshToken: string) => {
    localStorage.setItem('jwtToken', jwt);
    localStorage.setItem('refreshToken', refreshToken);
    setAuthToken(jwt, refreshToken);

    const claims = await refreshUserClaims();

    if (!claims) {
      setError('Unable to load user details. Please try again.');
      return;
    }

    if (!claims.has_password_changed) {
      navigate('/password-reset');
      return;
    }

    handleRoleRouting(claims);
  };

  const resetOtpState = () => {
    setOtp('');
    setOtpSent(false);
    setInfoMessage('');
  };

  const handleSendOtp = async () => {
    setError('');
    setInfoMessage('');

    const normalizedIdentifier = normalizeOtpIdentifier(identifier);

    if (!normalizedIdentifier) {
      setError('Enter your email address or mobile number first.');
      return;
    }

    const channel = detectOtpChannel(normalizedIdentifier);
    if (!channel) {
      setError('For OTP login, enter a valid email address or 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        identifier: normalizedIdentifier,
        channel,
        clientRequestId: `login-${Date.now()}`,
      };
      const response = await sendLoginOtp(payload);
      setOtpSent(true);
      setInfoMessage(response?.message || `OTP sent successfully via ${channel}.`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data || 'Failed to send OTP.';
      setError(typeof message === 'string' ? message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const normalizedIdentifier = normalizeOtpIdentifier(identifier);

    if (!normalizedIdentifier) {
      setError('Enter your email address or mobile number first.');
      return;
    }

    const channel = detectOtpChannel(normalizedIdentifier);
    if (!channel) {
      setError('For OTP login, enter a valid email address or 10-digit mobile number.');
      return;
    }

    if (!otp.trim()) {
      setError('Enter the OTP to continue.');
      return;
    }

    setLoading(true);
    try {
      const { jwt, refreshToken } = await verifyLoginOtp({
        identifier: normalizedIdentifier,
        channel,
        otp: otp.trim(),
      });
      await completeAuthenticatedLogin(jwt, refreshToken);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data || 'Invalid OTP.';
      setError(typeof message === 'string' ? message : 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { jwt, refreshToken } = await login({ identifier, password });
      await completeAuthenticatedLogin(jwt, refreshToken);

    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data || 'Invalid login credentials.';
      setError(typeof message === 'string' ? message : 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };




  const handleRoleRouting = (claims: UserClaims) => {
    if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
      navigate('/super-admin-dashboard');
      return;
    }

    const orgRoles = claims.org_roles || {};
    const orgEntries = Object.entries(orgRoles);

    if (orgEntries.length === 0) {
      setError('No roles assigned to this account.');
      return;
    }

    const options: RoleOption[] = orgEntries.flatMap(([orgId, orgData]) => {
      const data = orgData as OrgRoleData;
      return data.roles.map((role: string) => ({
        orgId,
        orgName: data.org_name,
        role,
        deptCode: data.dept_code ?? null,
      }));
    });

    if (options.length === 1) {
      const { role, orgId, orgName, deptCode } = options[0];
      routeByOrgRole(role, orgId, orgName, deptCode!);
      return;
    }

    setRoleOptions(options);
    setShowOrgSelection(true);
  };


  const routeByOrgRole = (role: string, orgId?: string, orgName?: string, deptCode?: number | null) => {
    if (orgId && orgName && role) {
      localStorage.setItem(
        'selectedOrg',
        JSON.stringify({ orgId, orgName, role, deptCode: deptCode ?? null })
      );
    }


    switch (role) {
      case 'ROLE_ORG_ADMIN':
        navigate('/org-admin-dashboard');
        break;
      case 'ROLE_AGENCY_ADMIN':
        navigate('/agency-admin-dashboard');
        break;
      case 'ROLE_ORG_STAFF':
        navigate('/staff-dashboard');
        break;
      case 'ROLE_ORG_REPRESENTATIVE':
        navigate('/representative-dashboard');
        break;
      case 'ROLE_AGENCY_STAFF':
        navigate('/staff-dashboard');
        break;
      case 'ROLE_AGENCY_REPRESENTATIVE':
        navigate('/representative-dashboard');
        break;
      case 'ROLE_CUSTOMER':
        navigate('/manage-customers');
        break;
      case 'ROLE_BDO':
        navigate('/bdo-dashboard');
        break;
      case 'ROLE_GRAMSEVAK':
        navigate('/grampanchayat-dashboard');
        break;
      case 'ROLE_HIRING_MANAGER':
        navigate('/workforce-management');
        break;
      case 'ROLE_ORG_VIEWER':
        navigate('/list-of-consumers');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden"

      style={{
        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(251, 191, 36, 0.1) 100%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-solar-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-secondary-400/10 to-primary-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>


      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div
        className={`relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 ${showOrgSelection ? 'mt-12 sm:mt-0' : 'mt-0'}`}>
        <Card className="relative glass-effect-enhanced border-0 shadow-2xl">
          <CardBody className="p-6 sm:p-8">
            {/* Logo and title */}

            <div className="text-center mb-2">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary-400 to-solar-400 rounded-full blur-lg opacity-30 animate-pulse-slow"></div>
                  <Logo
                    size="xl"
                    className="relative drop-shadow-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 via-solar-600 to-secondary-600 bg-clip-text text-transparent">
                  SolarPro
                </h1>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm sm:text-base">
                  Log in to manage your solar journey
                </p>
              </div>

              {/* Feature Icons */}
              <div className="flex justify-center items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-300">
                  <Shield className="h-3 w-3 text-primary-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-300">
                  <Zap className="h-3 w-3 text-solar-500" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-secondary-300">
                  <Sparkles className="h-3 w-3 text-secondary-500" />
                  <span>Modern</span>
                </div>
              </div>
            </div>
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl">
                <p className="text-error-700 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {infoMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-success-50 to-emerald-100 border border-success-200 rounded-xl">
                <p className="text-success-700 text-sm text-center font-medium">
                  {infoMessage}
                </p>
              </div>
            )}

            {/* Role selection */}
            {showOrgSelection ? (
              <div className="space-y-6 animate-fade-in">

                <ReusableDropdown
                  value={selectedRole}
                  onChange={(val) => setSelectedRole(String(val))}
                  options={roleOptions.map(({ orgId, orgName, role, deptCode }) => ({
                    value: `${role}|${orgId}|${orgName}|${deptCode ?? ''}`,
                    label: `${orgName} (${role.replace("ROLE_", "").replace(/_/g, " ")})`,
                  }))}
                  placeholder="Select Role & Organization"
                />


                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("jwtToken");
                      localStorage.removeItem("refreshToken");
                      setShowOrgSelection(false);
                      setSelectedRole('');
                      setError('');
                    }}
                    className="flex-1"
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!selectedRole) {
                        setError('Please select a role before continuing.');
                        return;
                      }
                      const [role, orgId, orgName, deptCode] = selectedRole.split('|');
                      routeByOrgRole(role, orgId, orgName, Number(deptCode));
                    }}
                    className="flex-1"
                    leftIcon={<Sun className="h-4 w-4" />}
                  >
                    Continue
                  </Button>

                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary-100/80 p-1 dark:bg-secondary-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password');
                      setError('');
                      setInfoMessage('');
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${loginMode === 'password'
                      ? 'bg-white text-primary-700 shadow-sm dark:bg-secondary-700 dark:text-white'
                      : 'text-secondary-600 dark:text-secondary-300'
                      }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('otp');
                      setPassword('');
                      resetOtpState();
                      setError('');
                      setInfoMessage('');
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${loginMode === 'otp'
                      ? 'bg-white text-primary-700 shadow-sm dark:bg-secondary-700 dark:text-white'
                      : 'text-secondary-600 dark:text-secondary-300'
                      }`}
                  >
                    OTP
                  </button>
                </div>

                <Input
                  label={loginMode === 'otp' ? 'Email / Mobile' : 'Username / Email / Mobile'}
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (loginMode === 'otp') {
                      resetOtpState();
                      setError('');
                    }
                  }}
                  placeholder={loginMode === 'otp' ? 'Registered email/mobile' : 'Enter username/email/mobile'}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                />

                {loginMode === 'password' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      showPasswordToggle
                      autoComplete="current-password"
                      required
                    />

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/password-reset')}
                        className="text-sm text-blue-600 font-medium hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full justify-center"
                      size="lg"
                      loading={loading}
                      leftIcon={!loading && <Sun className="h-4 w-4" />}
                    >
                      {!loading && 'Log In'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
                    <div className="rounded-xl border border-secondary-200 bg-secondary-50/80 px-4 py-3 dark:border-secondary-700 dark:bg-secondary-800/60">
                      <div className="flex items-center gap-2 text-sm font-medium text-secondary-700 dark:text-secondary-200">
                        {detectedOtpChannel === 'EMAIL' ? (
                          <Mail className="h-4 w-4 text-primary-600" />
                        ) : detectedOtpChannel === 'SMS' ? (
                          <Smartphone className="h-4 w-4 text-primary-600" />
                        ) : (
                          <KeyRound className="h-4 w-4 text-primary-600" />
                        )}
                        <span>
                          {detectedOtpChannel === 'EMAIL'
                            ? 'OTP will be sent to your email address.'
                            : detectedOtpChannel === 'SMS'
                              ? 'OTP will be sent to your mobile number by SMS.'
                              : 'Enter a valid email or 10-digit mobile number to continue with OTP login.'}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full justify-center"
                      loading={loading && !otpSent}
                      onClick={handleSendOtp}
                      leftIcon={!loading && <KeyRound className="h-4 w-4" />}
                    >
                      {!loading && (otpSent ? 'Resend OTP' : 'Send OTP')}
                    </Button>

                    <Input
                      label="OTP"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      leftIcon={<KeyRound className="h-4 w-4" />}
                      maxLength={6}
                      inputMode="numeric"
                      required
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full justify-center"
                      size="lg"
                      loading={loading && otpSent}
                      leftIcon={!(loading && otpSent) && <Sun className="h-4 w-4" />}
                    >
                      {!(loading && otpSent) && 'Verify OTP & Log In'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
