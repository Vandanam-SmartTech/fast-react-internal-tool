import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClaims } from '../../services/jwtService';
import { 
  Users, 
  Building, 
  Building2, 
  UserCog, 
  Settings, 
  TrendingUp,
  UserPlus,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Shield
} from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const [preferredName, setPreferredName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

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

    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setPreferredName(claims.preferred_name);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getClaims();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const dashboardItems = [

    {
          title: 'Manage Agencies',
          description: 'List, View, Add, Update agencies',
          icon: <Building2 className="h-8 w-8 text-warning-600" />,
          path: '/organizations',
          color: 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700'
    },
    
    {
          title: 'Manage Customers',
          description: 'List, View, Add, Update customers',
          icon: <Users className="h-8 w-8 text-primary-600" />,
          path: '/manage-customers',
          color: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700',
          // requiresOrg: true
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
    },
  ];

  const quickActions = [
    {
      title: 'Add Customer',
      description: 'Create a new customer record',
      icon: <UserPlus className="h-5 w-5" />,
      path: '/CustomerForm',
      variant: 'primary' as const
    },
    {
      title: 'View Reports',
      description: 'Access analytics and reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/analytics',
      variant: 'secondary' as const
    },
    {
      title: 'Schedule Meeting',
      description: 'Book appointments and meetings',
      icon: <Calendar className="h-5 w-5" />,
      path: '/schedule',
      variant: 'success' as const
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {preferredName ? `${greeting}, ${preferredName}!` : 'Welcome back!'}
            </h1>
            <p className="text-secondary-700 dark:text-secondary-300 mt-1">
              Here's what's happening with your organization today
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

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Card className="bg-gradient-to-r from-success-50 to-success-100 border-success-200">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success-600">Active Users</p>
                  <p className="text-2xl font-bold text-success-900">156</p>
                </div>
                <div className="p-2 bg-success-200 rounded-lg">
                  <UserCog className="h-6 w-6 text-success-700" />
                </div>
              </div> */}
              {/* <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-600">+8% from last month</span>
              </div> */}
            {/* </CardBody>
          </Card> */}


          {/* <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">Total Customers</p>
                  <p className="text-2xl font-bold text-primary-900">1,234</p>
                </div>
                <div className="p-2 bg-primary-200 rounded-lg">
                  <Users className="h-6 w-6 text-primary-700" />
                </div>
              </div> */}
              {/* <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-600">+12% from last month</span>
              </div> */}
            {/* </CardBody>
          </Card> */}

          

          {/* <Card className="bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning-600">Agencies</p>
                  <p className="text-2xl font-bold text-warning-900">23</p>
                </div>
                <div className="p-2 bg-warning-200 rounded-lg">
                  <Building2 className="h-6 w-6 text-warning-700" />
                </div>
              </div> */}
              {/* <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-600">+3 new this month</span>
              </div> */}
            {/* </CardBody>
          </Card> */}

          {/* <Card className="bg-gradient-to-r from-solar-50 to-solar-100 border-solar-200">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-solar-600">Documents</p>
                  <p className="text-2xl font-bold text-solar-900">89</p>
                </div>
                <div className="p-2 bg-solar-200 rounded-lg">
                  <FileText className="h-6 w-6 text-solar-700" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-600">+15 this week</span>
              </div>
            </CardBody>
          </Card> */}
        {/* </div> */}
      </div>

      {/* Quick Actions */}
      {/* <div className="space-y-4">
        <h2 className="text-xl font-semibold text-secondary-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} hover onClick={() => navigate(action.path)}>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${action.variant}-100`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary-900">{action.title}</h3>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">{action.description}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div> */}
      
      {/* Main Dashboard Items */}
<div className="space-y-4">
  <h2 className="text-xl font-semibold text-secondary-900">Management Tools</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {dashboardItems.map((item, index) => (
      <Card 
        key={index}
        hover 
        onClick={() => navigate(item.path)}
        className={`bg-gradient-to-br ${item.color} ${item.borderColor}`}
      >
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            
            {/* Icon with white background */}
            <div className="p-3 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
              {item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {item.title}
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300 text-sm mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-secondary-900">
                    {item.stats}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      item.changeType === 'positive' ? 'text-success-600 dark:text-success-400' : 
                      item.changeType === 'negative' ? 'text-error-600 dark:text-error-400' : 
                      'text-secondary-700 dark:text-secondary-300'
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
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
