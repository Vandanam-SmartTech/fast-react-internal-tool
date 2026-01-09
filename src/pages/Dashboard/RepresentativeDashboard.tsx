import React, { useEffect, useState } from 'react';
import { getOnboardedCustomerCount, getCustomerCount, getCustomerStats } from '../../services/customerRequisitionService';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Users, Calendar, Clock } from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import { useUser } from '../../contexts/UserContext';
import { connectCustomerSocket, disconnectCustomerSocket } from '../../services/websocket';

const RepresentativeDashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const [onboardedCount, setOnboardedCount] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [count, setCount] = useState<number | null>(null);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedOnboardedCount, setAnimatedOnboardedCount] = useState(0);
  const [, setData] = useState([]);
  const { userClaims } = useUser();
  const [, setStatsLoading] = useState(true);



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

  const buildCustomerParams = () => {
    const selectedOrgStr = localStorage.getItem("selectedOrg");
    if (!selectedOrgStr) return null;

    const selectedOrg = JSON.parse(selectedOrgStr);

    const params: Record<string, any> = {};

    if (
      selectedOrg.role === "ROLE_ORG_STAFF" ||
      selectedOrg.role === "ROLE_ORG_REPRESENTATIVE"
    ) {
      params.orgId = selectedOrg.orgId;
      params.userRole = selectedOrg.role;
    } else if (
      selectedOrg.role === "ROLE_AGENCY_STAFF" ||
      selectedOrg.role === "ROLE_AGENCY_REPRESENTATIVE"
    ) {
      params.agencyId = selectedOrg.orgId;
      params.userRole = selectedOrg.role;
    }

    return params;
  };


  const refreshCustomerCount = async (animate = true) => {
    try {
      const params = buildCustomerParams();
      if (!params) return;

      const updatedCount = await getCustomerCount(params);

      setCount((prev) => {
        const previous = prev ?? 0;

        if (animate) {
          animateCountUp(previous, updatedCount, setAnimatedCount);
        } else {
          setAnimatedCount(updatedCount);
        }

        return updatedCount;
      });
    } catch (err) {
      console.error("Failed to refresh customer count", err);
    }
  };



  useEffect(() => {
    connectCustomerSocket((event) => {
      if (event === "CUSTOMER_ADDED") {
        refreshCustomerCount(true);
      }
    });

    return () => {
      disconnectCustomerSocket();
    };
  }, []);

  useEffect(() => {
    refreshCustomerCount(false);

    const params = buildCustomerParams();
    if (!params) return;

    getOnboardedCustomerCount(params)
      .then((actualCount) => {
        setOnboardedCount(actualCount);
        setAnimatedOnboardedCount(actualCount);
      })
      .catch(console.error);

    getCustomerStats(params)
      .then((rawData) => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const filtered = rawData.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate >= oneYearAgo;
        });

        setData(filtered);
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);


  const animateCountUp = (
    from: number,
    to: number,
    setDisplay: (val: number) => void
  ) => {
    let current = from;
    const diff = to - from;

    if (diff <= 0) {
      setDisplay(to);
      return;
    }

    const step = Math.max(Math.floor(diff / 30), 1);

    const interval = setInterval(() => {
      current += step;
      if (current >= to) {
        setDisplay(to);
        clearInterval(interval);
      } else {
        setDisplay(current);
      }
    }, 20);
  };

  const handleActivate = (path: string) => navigate(path);

  const handleKeyActivate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = e.currentTarget.getAttribute('data-path');
      if (target) navigate(target);
    }
  };

  const dashboardItems = [
    {
      title: 'Manage Customers',
      description: 'List, View, Add, Update customers',
      icon: <Users className="h-12 w-12 text-blue-600" />,
      path: '/manage-customers',
      color: 'bg-blue-50 hover:bg-blue-100'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between
                gap-3 sm:gap-4 mb-6 sm:mb-8">

        {/* Left - Greeting */}
        <div>
          <h1 className="font-bold text-secondary-900
                   text-xl sm:text-2xl lg:text-3xl
                   leading-tight">
            {userClaims?.preferred_name
              ? `${greeting}, ${userClaims.preferred_name}!`
              : 'Welcome back!'}
          </h1>

          <p className="mt-1 text-gray-600
                  text-xs sm:text-sm lg:text-base">
            Manage customers and track progress
          </p>
        </div>

        {/* Right - Time & Date */}
        <div className="flex items-center gap-3 sm:gap-4
                  text-xs sm:text-sm text-gray-600">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                gap-4 sm:gap-6 mt-4 sm:mt-6">

        <Card
          className="bg-gradient-to-r from-purple-50 to-purple-100
               border-purple-200 hover-lift focus-ring"
          onClick={() => handleActivate('/list-of-consumers')}
        >
          <CardBody className="p-4 sm:p-5">
            <div
              className="flex items-center justify-between"
              role="button"
              tabIndex={0}
              data-path="/list-of-consumers"
              aria-label="View total customers"
              onKeyDown={handleKeyActivate}
            >
              <div>
                <p className="font-medium text-purple-600
                        text-xs sm:text-sm">
                  Total Customers
                </p>
                <p className="font-bold text-purple-900
                        text-lg sm:text-2xl"
                  aria-live="polite">
                  {count !== null ? animatedCount : 0}
                </p>
              </div>

              <div className="p-2 sm:p-2.5 bg-purple-200 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card
          className="bg-gradient-to-r from-solar-50 to-solar-100
               border-solar-200 hover-lift focus-ring"
          onClick={() => handleActivate('/OnboardedConsumers')}
        >
          <CardBody className="p-4 sm:p-5">
            <div
              className="flex items-center justify-between"
              role="button"
              tabIndex={0}
              data-path="/onboarded-consumers"
              aria-label="View onboarded customers"
              onKeyDown={handleKeyActivate}
            >
              <div>
                <p className="font-medium text-solar-600
                        text-xs sm:text-sm">
                  Onboarded Customers
                </p>
                <p className="font-bold text-solar-900
                        text-lg sm:text-2xl"
                  aria-live="polite">
                  {onboardedCount !== null ? animatedOnboardedCount : 0}
                </p>
              </div>

              <div className="p-2 sm:p-2.5 bg-solar-200 rounded-lg">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-solar-700" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                gap-4 sm:gap-6 mb-6 sm:mb-8 mt-6">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
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
                         text-sm sm:text-lg mb-1 sm:mb-2
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


      {/* Progress Chart */}
      {/* {count !== 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Customer Progress Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
              <XAxis
                dataKey="date"
                tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM yyyy')}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                label={{ value: 'Month & Year', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                label={{ value: 'Customer Count', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} customers`, 'Count']}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )} */}
    </div>
  );
};

export default RepresentativeDashboard;