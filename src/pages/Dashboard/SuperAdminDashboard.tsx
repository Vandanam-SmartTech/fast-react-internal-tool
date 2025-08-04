import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Shield, Users, Plus, Building2, UserCog, Settings, List } from 'lucide-react';
import OrganizationSelector from '../../components/OrganizationSelector';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showOrgSelector, setShowOrgSelector] = useState(false);

  const dashboardItems = [
    {
      title: 'Manage Customers',
      description: 'List, View, Add, Update customers',
      icon: <Users className="h-12 w-12 text-blue-600" />,
      path: '/manage-customers',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Manage Organizations',
      description: 'List, View, Add, Update organizations',
      icon: <Building className="h-12 w-12 text-green-600" />,
      path: '/organizations',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Manage Agencies',
      description: 'List, View, Add, Update agencies',
      icon: <Building2 className="h-12 w-12 text-purple-600" />,
      path: '/organizations',
      color: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Manage Users',
      description: 'Search, List, View, Add, Update users',
      icon: <UserCog className="h-12 w-12 text-orange-600" />,
      path: '/user-management',
      color: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      title: 'Manage Roles',
      description: 'List, View, Add new roles',
      icon: <Shield className="h-12 w-12 text-red-600" />,
      path: '/admin-management',
      color: 'bg-red-50 hover:bg-red-100'
    },
    {
      title: 'User Organization Roles',
      description: 'Manage user roles across organizations',
      icon: <Settings className="h-12 w-12 text-indigo-600" />,
      path: '/admin-management',
      color: 'bg-indigo-50 hover:bg-indigo-100'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Complete system administration and management</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <div 
            key={index}
            onClick={() => {
              if (item.path === '/manage-customers') {
                setShowOrgSelector(true);
              } else {
                navigate(item.path);
              }
            }}
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

      {showOrgSelector && (
        <OrganizationSelector
          onSelect={(orgId, orgName) => {
            localStorage.setItem('selectedOrganization', orgId);
            localStorage.setItem('selectedOrganizationName', orgName);
            setShowOrgSelector(false);
            navigate('/manage-customers');
          }}
          onCancel={() => setShowOrgSelector(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;