import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, UserCog, Settings, Calendar, Clock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const AgencyAdminDashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { userClaims } = useUser();

  useEffect(() => {
    const setTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning!');
      } else if (hour < 16) {
        setGreeting('Good Afternoon!');
      } else {
        setGreeting('Good Evening!');
      }
    };

    setTimeBasedGreeting();

  const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
  
      return () => clearInterval(timeInterval);
    }, []);
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
      description: 'List, View, Update my agencies',
      icon: <Building2 className="h-12 w-12 text-purple-600" />,
      path: '/organizations',
      color: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Agency Users',
      description: 'Manage users within my agencies',
      icon: <UserCog className="h-12 w-12 text-orange-600" />,
      path: '/user-management',
      color: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      title: 'User Agency Roles',
      description: 'Manage user roles in my agencies',
      icon: <Settings className="h-12 w-12 text-indigo-600" />,
      path: '/admin-management',
      color: 'bg-indigo-50 hover:bg-indigo-100'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          {userClaims?.preferred_name
            ? `${greeting}, ${userClaims.preferred_name}!`
            : 'Welcome back!'}
        </h1>
        <p className="text-secondary-700 dark:text-secondary-300 mt-1">
          Here's what's happening with your agency today
        </p>
      </div>
      
                
                <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{currentTime.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <div 
            key={index}
            onClick={() => navigate(item.path)}
            className={`${item.color} p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-200`}
          >
            <div className="flex items-start gap-4">
              {item.icon}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgencyAdminDashboard;