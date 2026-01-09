import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Building2, UserCog, Calendar, Clock, Shield } from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import { useUser } from '../../contexts/UserContext';
import { getOrganizationById } from '../../services/organizationService';
import { toast } from 'react-toastify';

const AdminDashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { userClaims } = useUser();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gstNumber, setGstNumber] = useState<string | null>(null);
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");

  useEffect(() => {
    const setTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning');
      } else if (hour < 16) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    setTimeBasedGreeting();


    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (userInfo.orgId) {
      loadOrganization(parseInt(userInfo.orgId));
    }
  }, [userInfo.orgId]);

  const loadOrganization = async (orgId: number) => {
    try {
      const org = await getOrganizationById(orgId);
      setOrganization(org);
      setGstNumber(org.gstNumber); // ✅ store gst
    } catch (error) {
      toast.error('Failed to load organization');
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };


  const dashboardItems = [

        {
      title: 'Manage Customers',
      description: 'List, View, Add, Update customers',
      icon: <Users className="h-8 w-8 text-primary-600" />,
      path: '/manage-customers',
      color: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700',
      // requiresOrg: true
    },
    {
      title: 'My Organization',
      description: 'View, Update my organization',
      icon: <Building className="h-8 w-8 text-purple-600" />,
      path: '/organization-view',
      state: { orgId: userInfo?.orgId },
      color: 'bg-purple-50 hover:bg-purple-100',
    },

    {
      title: 'Manage Agencies',
      description: 'List, View, Add, Update agencies',
      icon: <Building2 className="h-8 w-8 text-warning-600" />,
      path: '/agencies',
      state: {
        orgId: userInfo?.orgId,
        gstNumber: gstNumber // ✅ passed here
      },
      color: 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700'
    },

    {
      title: 'Manage Users',
      description: 'Search, List, View, Add, Update users',
      icon: <UserCog className="h-8 w-8 text-error-600" />,
      path: '/user-management',
      color: 'bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-700'
    },
    {
      title: 'Manage User Roles',
      description: 'Manage user roles across organizations',
      icon: <Shield className="h-8 w-8 text-secondary-700 dark:text-secondary-300" />,
      path: '/admin-management',
      color: 'bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border-secondary-200 dark:border-secondary-700'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
<div className="space-y-3 sm:space-y-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
    
    <div>
      {/* Greeting */}
      <h1 className="font-bold text-secondary-900
                     text-xl sm:text-2xl lg:text-3xl
                     leading-tight">
        {userClaims?.preferred_name
          ? `${greeting}, ${userClaims.preferred_name}!`
          : 'Welcome back!'}
      </h1>

      {/* Subtitle */}
      <p className="mt-1 text-secondary-700 dark:text-secondary-300
                    text-xs sm:text-sm lg:text-base">
        Here's what's happening with your organization today
      </p>
    </div>

    {/* Time & Date */}
    <div className="flex items-center gap-3 sm:gap-4
                    text-xs sm:text-sm
                    text-secondary-600 dark:text-secondary-300">

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>{currentTime.toLocaleTimeString()}</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>{currentTime.toLocaleDateString()}</span>
      </div>

    </div>
  </div>
</div>



      {/* Main Dashboard Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-secondary-900">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {dashboardItems.map((item, index) => (
            <Card
              key={index}
              hover
              onClick={() => navigate(item.path, { state: item.state })}
              className={`bg-gradient-to-br ${item.color} ${item.borderColor}`}
            >
              <CardBody className="p-4 md:p-5">
                <div className="flex items-start gap-3">

                  {/* Icon */}
                  <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-secondary-900
                       text-sm sm:text-base lg:text-lg
                       leading-tight mb-1">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-secondary-700 dark:text-secondary-300
                      text-xs sm:text-sm
                      leading-snug line-clamp-2 mb-2">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-secondary-900
                           text-lg sm:text-xl lg:text-2xl">
                        {item.stats}
                      </span>

                      <span
                        className={`text-xs sm:text-sm font-medium ${item.changeType === 'positive'
                            ? 'text-success-600 dark:text-success-400'
                            : item.changeType === 'negative'
                              ? 'text-error-600 dark:text-error-400'
                              : 'text-secondary-700 dark:text-secondary-300'
                          }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>

                </div>
              </CardBody>
            </Card>

          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
