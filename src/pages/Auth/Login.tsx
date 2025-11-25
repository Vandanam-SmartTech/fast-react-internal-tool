import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken, fetchClaims } from '../../services/jwtService';
import { User, Lock, Sun, Shield, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody } from '../../components/ui/Card';
import { Logo } from '../../components/ui';
import bgImage from '../../assets/Solar_Image.jpg';
import { useUser } from "../../contexts/UserContext";
import ReusableDropdown from '../../components/ReusableDropdown';

interface OrgRoleData {
  roles: string[];
  org_name: string;
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

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [roleOptions, setRoleOptions] = useState<[string, OrgRoleData][]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (userClaims) {
  //     handleRoleRouting(userClaims);
  //   }
  // }, [userClaims]);

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) return;


      window.dispatchEvent(new Event('userUpdated'));

      const claims = await fetchClaims();
      if (!claims) return;


      handleRoleRouting(claims);
    };

    checkAlreadyLoggedIn();
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { jwt } = await login({ identifier, password });
      localStorage.setItem('jwtToken', jwt);
      setAuthToken(jwt);

      window.dispatchEvent(new Event('userUpdated'));

      const claims = await fetchClaims();

      if (!claims.has_password_changed) {
        navigate('/password-reset');
        return;
      }


      handleRoleRouting(claims);

    } catch (err) {
      setError('Invalid login credentials.');
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

    const roleOptions = orgEntries.flatMap(([orgId, orgData]) =>
      orgData.roles.map((role: string) => ({
        orgId,
        orgName: orgData.org_name,
        role
      }))
    );

    if (roleOptions.length === 1) {
      // Only one org-role combination, route directly
      const { role, orgId, orgName } = roleOptions[0];
      routeByOrgRole(role, orgId, orgName);
      return;
    }

    // Multiple org-role combinations → show dropdown
    setRoleOptions(roleOptions);
    setShowOrgSelection(true);
  };


  const routeByOrgRole = (role: string, orgId?: string, orgName?: string) => {
    if (orgId && orgName && role) {
      localStorage.setItem(
        'selectedOrg',
        JSON.stringify({ orgId, orgName, role })
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

      {/* Floating Particles Effect */}
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

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6">
        <Card className="relative glass-effect-enhanced border-0 shadow-2xl">
          <CardBody className="p-8 sm:p-10">
            {/* Logo and title */}

            <div className="text-center mb-4">
              <div className="flex justify-center mb-4">
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
              <div className="flex justify-center items-center gap-4 mt-6">
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

            {/* Role selection */}
            {showOrgSelection ? (
              <div className="space-y-6 animate-fade-in">
                {/* <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="">Select Role & Organization</option>
                  {roleOptions.map(({ orgId, orgName, role }) => (
                    <option
                      key={`${orgId}-${role}`}
                      value={`${role}|${orgId}|${orgName}`}
                    >
                      {orgName} ({role.replace('ROLE_', '').replace(/_/g, ' ')})
                    </option>
                  ))}
                </select> */}

                <ReusableDropdown
                  value={selectedRole}
                  onChange={(val) => setSelectedRole(val)}
                  options={roleOptions.map(({ orgId, orgName, role }) => ({
                    value: `${role}|${orgId}|${orgName}`,
                    label: `${orgName} (${role.replace("ROLE_", "").replace(/_/g, " ")})`,
                  }))}
                  placeholder="Select Role & Organization"
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("jwtToken");
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
                      const [role, orgId, orgName] = selectedRole.split('|');
                      routeByOrgRole(role, orgId, orgName);
                    }}
                    className="flex-1"
                    leftIcon={<Sun className="h-4 w-4" />}
                  >
                    Continue
                  </Button>

                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Login ID"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                  placeholder="Enter username or email or contact number"
                  leftIcon={<User className="h-4 w-4" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  required
                />

                <div className="text-right">
                  <button
                    onClick={() => navigate("/password-reset")}
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
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
