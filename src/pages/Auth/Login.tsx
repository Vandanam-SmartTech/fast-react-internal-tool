import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken, fetchClaims } from '../../services/jwtService';
import { showError, showSuccess } from '../../services/apiService';
import { User, Lock, Building, Sun, Sparkles, Shield, Zap } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody } from '../../components/ui/Card';
import { Logo } from '../../components/ui';
import bgImage from '../../assets/Solar_Image.jpg';

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
    <div 
      className="min-h-screen relative flex items-center justify-center overflow-hidden top-0"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(251, 191, 36, 0.1) 100%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Animated Background Elements */}
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
        {/* Enhanced Glass Card */}
        <div className="relative">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 via-solar-600/20 to-secondary-600/20 rounded-2xl blur-lg opacity-75 animate-pulse-slow"></div>
          
          <Card className="relative glass-effect-enhanced border-0 shadow-2xl">
            <CardBody className="p-8 sm:p-10">
              {/* Logo and Title Section */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
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
                    Sign in to access your solar management dashboard
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

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border border-error-200 dark:border-error-700 rounded-xl backdrop-blur-sm">
                  <p className="text-error-700 dark:text-error-300 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              {/* Organization Selection */}
              {showOrgSelection ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                      Select Organization
                    </h2>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                      Choose the organization you want to access
                    </p>
                  </div>

                  <div className="space-y-3">
                    {userClaims?.org_roles && Object.entries(userClaims.org_roles).map(([orgId, orgData]: [string, any]) => (
                      <button
                        key={orgId}
                        onClick={() => setSelectedOrg(orgId)}
                        className={`w-full p-4 text-left rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                          selectedOrg === orgId
                            ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-lg'
                            : 'border-secondary-200 dark:border-secondary-700 bg-white/50 dark:bg-secondary-800/50 text-secondary-700 dark:text-secondary-300 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-white/70 dark:hover:bg-secondary-800/70 backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedOrg === orgId 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                          }`}>
                            <Building className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm sm:text-base truncate">{orgData.org_name}</div>
                            <div className="text-xs opacity-75 truncate">{orgData.role.replace('ROLE_', '')}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOrgSelection(false);
                        setSelectedOrg('');
                        setError('');
                      }}
                      className="flex-1 text-sm hover:scale-105 transition-transform"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleOrgSelection}
                      className="flex-1 text-sm hover:scale-105 transition-transform"
                      leftIcon={<Sun className="h-4 w-4" />}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Input
                        label="Username or Email"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username or email"
                        leftIcon={<User className="h-4 w-4" />}
                        required
                        className="group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="relative group">
                      <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        leftIcon={<Lock className="h-4 w-4" />}
                        showPasswordToggle
                        required
                        className="group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <a
                      href="/PasswordReset"
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full group hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                    loading={loading}
                    leftIcon={<Sun className="h-4 w-4 group-hover:rotate-12 transition-transform" />}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-secondary-600 dark:text-secondary-300">
          <p>© 2024 Vandanam SmartTech. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;