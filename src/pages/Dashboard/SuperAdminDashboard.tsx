import React, { useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Shield, Users, Building2, UserCog, Clock, Calendar } from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import OrganizationSelector from '../../components/OrganizationSelector';
import { useUser } from '../../contexts/UserContext';

// Memoized time display component
const TimeDisplay = memo(() => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>{time.toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>{time.toLocaleDateString()}</span>
      </div>
    </div>
  );
});

TimeDisplay.displayName = 'TimeDisplay';

// Memoized dashboard item component
const DashboardItem = memo(({ item, onClick }: any) => (
  <Card
    className={`${item.color} hover:shadow-medium transition-all duration-200 cursor-pointer`}
    hover
    onClick={onClick}
  >
    <CardBody className="p-3 md:p-4 flex items-center">
      <div className="flex items-center gap-2 w-full">
        <div className="p-1 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-semibold text-secondary-900 text-sm sm:text-base lg:text-lg leading-tight mb-0.5">
            {item.title}
          </h3>
          <p className="text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm leading-snug line-clamp-2 mb-1">
            {item.description}
          </p>
        </div>
      </div>
    </CardBody>
  </Card>
));

DashboardItem.displayName = 'DashboardItem';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const { userClaims } = useUser();

  // Memoize greeting calculation
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : hour < 16 ? 'Good Afternoon' : 'Good Evening';
  }, []);

  // Memoize dashboard items
  const dashboardItems = useMemo(() => [
    {
      title: 'Manage Customers',
      description: 'List, View, Add, Update customers',
      icon: <Users className="h-8 w-8 text-primary-600" />,
      path: '/manage-customers',
      color: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700',
    },
    {
      title: 'Manage Organizations',
      description: 'List, View, Add, Update organizations',
      icon: <Building className="h-8 w-8 text-success-600" />,
      path: '/organizations',
      color: 'bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700'
    },
    {
      title: 'Manage Agencies',
      description: 'List, View, Add, Update agencies',
      icon: <Building2 className="h-8 w-8 text-warning-600" />,
      path: '/organizations',
      color: 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700',
      requiresOrg: true
    },
    {
      title: 'Manage Users',
      description: 'Search, List, View, Add, Update users',
      icon: <UserCog className="h-8 w-8 text-error-600" />,
      path: '/user-management',
      color: 'bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-700'
    },
    {
      title: 'Manage Roles',
      description: 'List, View, Add new roles',
      icon: <Shield className="h-8 w-8 text-secondary-700 dark:text-secondary-300" />,
      path: '/admin-management',
      color: 'bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-secondary-200 dark:border-secondary-700'
    }
  ], []);

  const handleItemClick = (item: any) => {
    if (item.requiresOrg) {
      setShowOrgSelector(true);
    } else {
      navigate(item.path);
    }
  };

  const handleSelectOrg = (orgId: string) => {
    setShowOrgSelector(false);
    navigate('/agencies', { state: { orgId } });
  };

  const handleCancel = () => setShowOrgSelector(false);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-2">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-bold text-secondary-900 text-lg sm:text-xl lg:text-2xl leading-tight">
              {userClaims?.preferred_name
                ? `${greeting}, ${userClaims.preferred_name}!`
                : 'Welcome back!'}
            </h1>
            <p className="mt-1 text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm lg:text-base">
              Complete System Administration and Management
            </p>
          </div>
          <TimeDisplay />
        </div>
      </div>

      {/* Management Tools */}
      <div className="space-y-2">
        <h2 className="font-semibold text-secondary-900 dark:text-secondary-100 text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">
          Management Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {dashboardItems.map((item, index) => (
            <DashboardItem
              key={index}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </div>

      {/* Organization Selector Modal */}
      {showOrgSelector && (
        <OrganizationSelector
          onSelect={handleSelectOrg}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
