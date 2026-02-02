import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, UserCog, Calendar, Clock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getParentDetails } from '../../services/organizationService';
import Card, { CardBody } from '../../components/ui/Card';


const AgencyAdminDashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [parentOrgId, setParentOrgId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { userClaims } = useUser();
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

    const fetchParentOrg = async () => {
      if (userInfo?.orgId) {
        try {
          const data = await getParentDetails(userInfo.orgId);
          setParentOrgId(data.id);
        } catch (error) {
          console.error("Error fetching parent org:", error);
        }
      }
    };

    fetchParentOrg();

    return () => clearInterval(timeInterval);
  }, [userInfo?.orgId]);




  const dashboardItems = [

    {
      title: 'Manage Customers',
      description: 'List, View, Add, Update customers',
      icon: <Users className="h-8 w-8 text-primary-600" />,
      path: '/manage-customers',
      color: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700',
    },
    {
      title: 'My Agency',
      description: 'View, Update my agency',
      icon: <Building2 className="h-8 w-8 text-warning-600" />,
      path: '/agency-view',
      state: { agencyId: userInfo?.orgId || null, orgId: parentOrgId },
      color: 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700',
    },
    {
      title: 'Agency Users',
      description: 'Manage users within my agency',
      icon: <UserCog className="h-8 w-8 text-error-600" />,
      path: '/user-management',
      color: 'bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-700'
    },

  ];

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-2">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">


        <div>
          <h1 className="font-bold text-secondary-900
                     text-lg sm:text-xl lg:text-2xl
                     leading-tight">
            {userClaims?.preferred_name
              ? `${greeting}, ${userClaims.preferred_name}!`
              : 'Welcome back!'}
          </h1>

          <p className="mt-1 text-secondary-700 dark:text-secondary-300
                      text-xs sm:text-sm lg:text-base">
            Here's what's happening with your agency today
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


      {/* Management Tools */}
      <div className="space-y-2">
        <h2 className="font-semibold text-secondary-900 dark:text-secondary-100
                     text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">
          Management Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {dashboardItems.map((item, index) => (
            <Card
              key={index}
              hover
              onClick={() => navigate(item.path, { state: item.state })}
              className={`bg-gradient-to-br ${item.color}`}
            >
              <CardBody className="p-3 md:p-4 flex items-center">
                <div className="flex items-center gap-2 w-full">

                  {/* Icon */}
                  <div className="p-1 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                    {item.icon}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">

                    {/* Title */}
                    <h3 className="font-semibold text-secondary-900
                     text-sm sm:text-base lg:text-lg
                     leading-tight mb-0.5">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-secondary-700 dark:text-secondary-300
                    text-xs sm:text-sm
                    leading-snug line-clamp-2 mb-1">
                      {item.description}
                    </p>

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

export default AgencyAdminDashboard;