import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, UserRoundCheck } from 'lucide-react';

const ManageCustomers: React.FC = () => {
  const navigate = useNavigate();

  const customerActions = [
    {
      title: 'Add New Customer',
      description: 'Create a new customer record',
      icon: <UserPlus className="h-12 w-12 text-blue-600" />,
      path: '/customer-form',
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
      path: '/onboarded-consumers',
      color: 'bg-purple-50 hover:bg-purple-100'
    }
  ];


  const handleActionClick = (path: string) => {
  navigate(path); 
};

return (
  <div className="p-4 sm:p-6 max-w-7xl mx-auto">

    {/* Header */}
    <div className="mb-6 sm:mb-8">
      <h1 className="font-bold text-gray-900
                     text-xl sm:text-2xl lg:text-3xl
                     leading-tight mb-1 sm:mb-2">
        Manage Customers
      </h1>
      <p className="text-gray-600
                    text-xs sm:text-sm lg:text-base">
        Customer management and operations
      </p>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                    gap-4 sm:gap-6">
      {customerActions.map((action, index) => (
        <div 
          key={index}
          onClick={() => handleActionClick(action.path)}
          className={`${action.color}
                      p-4 sm:p-6
                      rounded-lg shadow hover:shadow-lg
                      cursor-pointer transition-all duration-200
                      border border-gray-200`}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {action.icon}

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900
                             text-sm sm:text-lg
                             mb-1 sm:mb-2
                             leading-tight">
                {action.title}
              </h2>
              <p className="text-gray-600
                            text-xs sm:text-sm
                            line-clamp-2">
                {action.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

  </div>
);

};

export default ManageCustomers;