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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [userClaims, setUserClaims] = useState(null);
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
    
    const orgData = userClaims.org_roles[selectedOrg];
    localStorage.setItem('selectedOrganization', selectedOrg);
    localStorage.setItem('selectedOrganizationName', orgData.org_name);
    showSuccess('Organization selected successfully!');
    navigate('/');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="glass-effect">
          <CardBody className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src={logo1} alt="Vandanam SmartTech Logo" className="h-16 w-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gradient mb-2">
                SolarPro
              </h1>
              <p className="text-secondary-600 text-sm">
                Solar Energy Management Platform
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Organization Selection */}
            {showOrgSelection ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <Building className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                    Select Organization
                  </h2>
                  <p className="text-secondary-600 text-sm">
                    Choose the organization you want to access
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="form-label">
                    Organization
                  </label>
                  <select
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Organization</option>
                    {userClaims?.org_roles && Object.entries(userClaims.org_roles).map(([orgId, orgData]: [string, any]) => (
                      <option key={orgId} value={orgId}>
                        {orgData.org_name} ({orgData.role.replace('ROLE_', '')})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleOrgSelection}
                  className="w-full"
                  size="lg"
                  leftIcon={<Building className="h-4 w-4" />}
                >
                  Continue
                </Button>
              </div>
            ) : (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
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

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/PasswordReset')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
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

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            © 2024 Vandanam SmartTech. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;