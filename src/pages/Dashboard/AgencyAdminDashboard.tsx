import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClaims } from '../../services/jwtService';
import { Users, Building2, UserCog, Settings } from 'lucide-react';

const AgencyAdminDashboard: React.FC = () => {
  const [preferredName, setPreferredName] = useState('');
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

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

    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setPreferredName(claims.preferred_name);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getClaims();
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
      title: 'My Agencies',
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="text-2xl font-semibold mb-2">
          {preferredName ? `Hello ${preferredName}, ${greeting} 😊` : 'Loading...'}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agency Admin Dashboard</h1>
        <p className="text-gray-600">Manage your agencies and users</p>
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