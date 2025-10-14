import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Shield, Users, Building2, UserCog, Settings, Clock, Calendar } from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import OrganizationSelector from '../../components/OrganizationSelector';
import { useUser } from '../../contexts/UserContext';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { userClaims } = useUser();


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

  const handleItemClick = (item: any) => {
    if (item.requiresOrg) {
      setShowOrgSelector(true);
    } else {
      navigate(item.path);
    }
  };

  const handleSelectOrg = (orgId: string, orgName: string) => {
    setShowOrgSelector(false);
    navigate(`/agencies`,{ state: {orgId: orgId}});
  };

  const handleCancel = () => setShowOrgSelector(false);


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
      title: 'Manage Organizations',
      description: 'List, View, Add, Update organizations',
      icon: <Building className="h-8 w-8 text-success-600" />,
      path: '/organizations',
      color: 'bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700'
    },
    {
      title: 'Manage Agencies',
      description: 'List, View, Add, Update agencies',
      icon: <Building2 className="h-8 w-8 text-warning-600" />,
      path: '/organizations',
      color: 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700',
      requiresOrg: true
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
    {
      title: 'User Organization Roles',
      description: 'Manage user roles across organizations',
      icon: <Settings className="h-8 w-8 text-solar-600" />,
      path: '/admin-management',
      color: 'bg-gradient-to-r from-solar-50 to-solar-100 dark:from-solar-900/20 dark:to-solar-800/20 border-solar-200 dark:border-solar-700'
    }
  ];




  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            {userClaims?.preferred_name
              ? `${greeting}, ${userClaims.preferred_name}!`
              : 'Welcome back!'}
          </h1>
          <p className="text-secondary-700 dark:text-secondary-300 mt-1">
            Complete System Administration and Management
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
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="stat-card">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1">
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                  {stat.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div> */}

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
  <CardBody className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-purple-600">Total Organizations</p>
        <p className="text-2xl font-bold text-purple-900">156</p>
      </div>
      <div className="p-2 bg-purple-200 rounded-lg">
        <UserCog className="h-6 w-6 text-purple-700" />
      </div>
    </div> */}
      {/* <div className="mt-2 flex items-center gap-1">
      <TrendingUp className="h-4 w-4 text-success-600" />
      <span className="text-sm text-success-600">+8% from last month</span>
    </div> */}
      {/* </CardBody>
</Card> */}


      {/* <Card className="bg-gradient-to-r from-success-50 to-success-100 border-success-200">
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


      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Card
              key={index}
              className={`${item.color} hover:shadow-medium transition-all duration-200 cursor-pointer`}
              hover={true}
              onClick={() => handleItemClick(item)}
            >
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{item.title}</h3>
                    <p className="text-secondary-700 dark:text-secondary-300 text-sm">{item.description}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>



      {/* Recent Activity */}
      {/* <div>
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Recent Activity</h2>
        <Card>
          <CardBody className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">New organization "TechCorp" created</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-300">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-full">
                  <UserCog className="h-4 w-4 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">User "john.doe" assigned to Agency Admin role</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-300">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-full">
                  <Building2 className="h-4 w-4 text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">Agency "Solar Solutions" updated</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-300">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div> */}

      {/* Organization Selector Modal */}
      {showOrgSelector && (
        <OrganizationSelector
          onSelect={handleSelectOrg} 
          onCancel={handleCancel}    
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;