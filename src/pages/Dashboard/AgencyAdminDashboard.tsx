import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, UserCog, Calendar, Clock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { getParentDetails } from '../../services/organizationService';


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
      icon: <Users className="h-12 w-12 text-blue-600" />,
      path: '/manage-customers',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'My Agency',
      description: 'View, Update my agency',
      icon: <Building2 className="h-12 w-12 text-purple-600" />,
      path: '/agency-view',
      state: { agencyId: userInfo?.orgId || null, orgId: parentOrgId },
      color: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Agency Users',
      description: 'Manage users within my agency',
      icon: <UserCog className="h-12 w-12 text-orange-600" />,
      path: '/user-management',
      color: 'bg-orange-50 hover:bg-orange-100'
    },
    
    // {
    //   title: 'User Agency Roles',
    //   description: 'Manage user roles in my agency',
    //   icon: <Settings className="h-12 w-12 text-indigo-600" />,
    //   path: '/admin-management',
    //   color: 'bg-indigo-50 hover:bg-indigo-100'
    // }
  ];

return (
  <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
    
    {/* Header */}
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between
                      gap-3 sm:gap-4">
        
        <div>
          <h1 className="font-bold text-secondary-900
                         text-xl sm:text-2xl lg:text-3xl
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
    </div>

    {/* Management Tools */}
    <div className="space-y-3 sm:space-y-4">
      <h2 className="font-semibold text-secondary-900
                     text-base sm:text-lg lg:text-xl">
        Management Tools
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                      gap-4 sm:gap-6">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path, { state: item.state })}
            className={`${item.color}
                        p-4 sm:p-6
                        rounded-lg shadow hover:shadow-lg
                        cursor-pointer transition-all duration-200
                        border border-gray-200`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {item.icon}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900
                               text-sm sm:text-lg
                               mb-1 sm:mb-2
                               leading-tight">
                  {item.title}
                </h2>
                <p className="text-gray-600
                              text-xs sm:text-sm
                              line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>
);

};

export default AgencyAdminDashboard;