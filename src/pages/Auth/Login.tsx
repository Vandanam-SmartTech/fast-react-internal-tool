import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken, fetchClaims } from '../../services/jwtService';
import { showError, showSuccess } from '../../services/apiService';
import { User, Lock, Building, Sun } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody } from '../../components/ui/Card';
import bgImage from '../../assets/Solar_Image.jpg';
import logo1 from '../../assets/Vandanam_SmartTech_Logo.png';

interface UserClaims {
  name?: string;
  preferred_name?: string;
  email?: string;
  global_roles?: string[];
  org_roles?: Record<string, any>;
  is_password_changed?: boolean;
  [key: string]: any;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      const token = localStorage.getItem('jwtToken');
      const selectedOrgId = localStorage.getItem('selectedOrganization');
      if (!token) return;

      const claims = await fetchClaims();
      if (!claims || !claims.roles) return;

      if (claims.roles.includes('ROLE_SUPER_ADMIN')) {
        navigate('/SuperAdminDashboard');
        return;
      }

      if (selectedOrgId && claims.organizationRoles?.length > 0) {
        navigate('/');
      }
    };

    checkAlreadyLoggedIn();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { jwt } = await login({ username, password });
      localStorage.setItem('jwtToken', jwt);
      setAuthToken(jwt);
      const claims = await fetchClaims();
      console.log('User claims:', claims);

      const isPasswordChanged = claims.is_password_changed;
      if (!isPasswordChanged) {
        navigate('/PasswordReset');
        return;
      }

      // Super admin doesn't need org selection
      console.log('Checking global roles:', claims.global_roles);
      if (claims.global_roles && Array.isArray(claims.global_roles) && claims.global_roles.includes('ROLE_SUPER_ADMIN')) {
        console.log('Super admin detected, redirecting to dashboard');
        showSuccess('Welcome back!');
        // Trigger user update event for immediate UI update
        window.dispatchEvent(new CustomEvent('userUpdated'));
        navigate('/SuperAdminDashboard');
        return;
      }

      // Check if user has organization roles
      if (claims.org_roles && Object.keys(claims.org_roles).length > 0) {
        const orgIds = Object.keys(claims.org_roles);
        if (orgIds.length === 1) {
          // Single org, auto-select
          const orgId = orgIds[0];
          const orgData = claims.org_roles[orgId];
          localStorage.setItem('selectedOrganization', orgId);
          localStorage.setItem('selectedOrganizationName', orgData.org_name);
          showSuccess('Login successful!');
          // Trigger user update event for immediate UI update
          window.dispatchEvent(new CustomEvent('userUpdated'));
          navigate('/');
        } else {
          // Multiple orgs, show selection
          setUserClaims(claims);
          setShowOrgSelection(true);
        }
      } else {
        console.log('No organization roles found for user:', claims);
        setError('No organization access found.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSelection = () => {
    if (!selectedOrg) {
      setError('Please select an organization.');
      return;
    }

    if (!userClaims?.org_roles) {
      setError('No organization data available.');
      return;
    }

    const orgData = userClaims.org_roles[selectedOrg];
    localStorage.setItem('selectedOrganization', selectedOrg);
    localStorage.setItem('selectedOrganizationName', orgData.org_name);
    showSuccess('Login successful!');
    // Trigger user update event for immediate UI update
    window.dispatchEvent(new CustomEvent('userUpdated'));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-solar-50 dark:from-primary-900/20 dark:via-secondary-900 dark:to-solar-900/20 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <Card className="glass-effect">
          <CardBody className="p-6 sm:p-8">
            {/* Logo and Title */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4">
                <img src={logo1} alt="Logo" className="h-10 sm:h-12 w-auto" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                Welcome to SolarPro
              </h1>
              <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                Sign in to your account
              </p>
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                <p className="text-error-700 dark:text-error-300 text-sm text-center">{error}</p>
              </div>
            )}

            {showOrgSelection ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <h2 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    Select Organization
                  </h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Choose the organization you want to access
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {userClaims?.org_roles && Object.entries(userClaims.org_roles).map(([orgId, orgData]: [string, any]) => (
                    <button
                      key={orgId}
                      onClick={() => setSelectedOrg(orgId)}
                      className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-all duration-200 ${
                        selectedOrg === orgId
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base truncate">{orgData.org_name}</div>
                          <div className="text-xs sm:text-sm opacity-75 truncate">{orgData.role.replace('ROLE_', '')}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 sm:gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOrgSelection(false);
                      setSelectedOrg('');
                      setError('');
                    }}
                    className="flex-1 text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleOrgSelection}
                    className="flex-1 text-sm"
                    leftIcon={<Sun className="h-4 w-4" />}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label="Username or Email"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    leftIcon={<User className="h-4 w-4" />}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    showPasswordToggle
                    required
                  />
                </div>

                <div className="text-center">
                  <a
                    href="/PasswordReset"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Forgot your password?
                  </a>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  loading={loading}
                  leftIcon={<Sun className="h-4 w-4" />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
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