import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, UserRoundCheck } from 'lucide-react';

const ManageCustomers: React.FC = () => {
  const navigate = useNavigate();

  const customerActions = [
    {
      title: 'Add New Customer',
      description: 'Create a new customer record',
      icon: <UserPlus className="h-8 w-8 text-blue-600" />,
      path: '/customer-form',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'List of Customers',
      description: 'View all customers',
      icon: <Users className="h-8 w-8 text-green-600" />,
      path: '/list-of-consumers',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Onboarded Consumers',
      description: 'View onboarded consumers',
      icon: <UserRoundCheck className="h-8 w-8 text-purple-600" />,
      path: '/onboarded-consumers',
      color: 'bg-purple-50 hover:bg-purple-100'
    }
  ];


  const handleActionClick = (path: string) => {
  navigate(path); 
};

return (
  <div className="p-3 sm:p-5 max-w-7xl mx-auto">

    {/* Header */}
    <div className="mb-4 sm:mb-6">
      <h1 className="font-bold text-secondary-900
                     text-xl sm:text-2xl lg:text-2xl
                     leading-tight">
              Manage Customers
            </h1>
      <p className="text-gray-600
                    text-xs sm:text-sm lg:text-base">
        Customer management and operations
      </p>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  {customerActions.map((action, index) => (
    <div
      key={index}
      onClick={() => handleActionClick(action.path)}
      className={`${action.color}
                  p-3 sm:p-4
                  rounded-md
                  shadow-sm hover:shadow
                  cursor-pointer transition-all duration-150
                  border border-gray-200`}
    >
      <div className="flex items-center gap-2 w-full">

        <div className="p-0.5 bg-white dark:bg-secondary-800 rounded-md">
          {action.icon}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-semibold text-secondary-900
                     text-sm sm:text-base lg:text-lg
                     leading-tight mb-0.5">
            {action.title}
          </h3>

          <p className="text-secondary-700 dark:text-secondary-300
                    text-xs sm:text-sm
                    leading-snug line-clamp-2 mb-1">
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