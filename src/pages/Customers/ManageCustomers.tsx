import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, UserRoundCheck } from 'lucide-react';

const ManageCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [pendingPath, setPendingPath] = useState<string>('');

  // useEffect(() => {
  //   const checkUserRole = async () => {
  //     try {
  //       const claims = await fetchClaims();
  //       const isSuper = claims.global_roles?.includes('ROLE_SUPER_ADMIN');
  //       setIsSuperAdmin(isSuper);
  //     } catch (error) {
  //       console.error('Error checking user role:', error);
  //     }
  //   };
  //   checkUserRole();
  // }, []);

  const customerActions = [
    {
      title: 'Add New Customer',
      description: 'Create a new customer record',
      icon: <UserPlus className="h-12 w-12 text-blue-600" />,
      path: '/CustomerForm',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'List of Customers',
      description: 'View all customers',
      icon: <Users className="h-12 w-12 text-green-600" />,
      path: '/list-of-consumers',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Onboarded Consumers',
      description: 'View onboarded consumers',
      icon: <UserRoundCheck className="h-12 w-12 text-purple-600" />,
      path: '/OnboardedConsumers',
      color: 'bg-purple-50 hover:bg-purple-100'
    }
  ];

  // const handleActionClick = (path: string) => {
  //   if (isSuperAdmin) {
  //     setPendingPath(path);
  //     setShowOrgSelector(true);
  //   } else {
  //     navigate(path);
  //   }
  // };

  const handleActionClick = (path: string) => {
  navigate(path); 
};


  // const handleOrgSelect = (orgId: string, orgName: string) => {
  //   localStorage.setItem('selectedOrganization', orgId);
  //   localStorage.setItem('selectedOrganizationName', orgName);
  //   setShowOrgSelector(false);
  //   navigate(pendingPath);
  // };

  // const handleOrgCancel = () => {
  //   setShowOrgSelector(false);
  //   setPendingPath('');
  // };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Customers</h1>
        <p className="text-gray-600">Customer management and operations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customerActions.map((action, index) => (
          <div 
            key={index}
            onClick={() => handleActionClick(action.path)}
            className={`${action.color} p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-200`}
          >
            <div className="flex items-start gap-4">
              {action.icon}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{action.title}</h2>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* {showOrgSelector && (
        <OrganizationSelector
          onSelect={handleOrgSelect}
          onCancel={handleOrgCancel}
        />
      )} */}
    </div>
  );
};

export default ManageCustomers;