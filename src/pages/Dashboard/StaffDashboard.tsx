import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnboardedCustomerCount, getCustomerCount, getCustomerStats } from '../../services/customerRequisitionService';
import { Users, UserCheck, BarChart3, Calendar, Clock } from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { useUser } from '../../contexts/UserContext';

const StaffDashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [onboardedCount, setOnboardedCount] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedOnboardedCount, setAnimatedOnboardedCount] = useState(0);

  const [data, setData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();
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


useEffect(() => {
  const selectedOrgStr = localStorage.getItem("selectedOrg");
  if (!selectedOrgStr) return;

  let selectedOrg;
  try {
    selectedOrg = JSON.parse(selectedOrgStr);
  } catch {
    console.error("Invalid selectedOrg format in localStorage");
    return;
  }

  const params: Record<string, any> = {};
  if (selectedOrg.role === "ROLE_ORG_STAFF" || selectedOrg.role === "ROLE_ORG_REPRESENTATIVE") {
    params.orgId = selectedOrg.orgId;
  } else if (selectedOrg.role === "ROLE_AGENCY_STAFF" || selectedOrg.role === "ROLE_AGENCY_REPRESENTATIVE") {
    params.agencyId = selectedOrg.orgId;
  }

  
  getCustomerCount(params)
    .then((actualCount) => {
      setCount(actualCount);
      animateCountUp(actualCount, setAnimatedCount);
    })
    .catch(console.error);

  getOnboardedCustomerCount(params)
    .then((actualCount) => {
      setOnboardedCount(actualCount);
      animateCountUp(actualCount, setAnimatedOnboardedCount);
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


  const animateCountUp = (target: number, setDisplay: (val: number) => void) => {
    let current = 0;
    const step = Math.max(Math.floor(target / 50), 1);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplay(target);
        clearInterval(interval);
      } else {
        setDisplay(current);
      }
    }, 5);
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
      icon: <Users className="h-8 w-8 text-primary-600" />,
      path: '/manage-customers',
      color: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700',
      // requiresOrg: true
    },

  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">


        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            {userClaims?.preferred_name
              ? `${greeting}, ${userClaims.preferred_name}!`
              : 'Welcome back!'}
          </h1>
          <p className="text-secondary-700 dark:text-secondary-300 mt-1">
            Manage Customers and View Progress
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


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">



        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover-lift focus-ring" onClick={() => handleActivate('/list-of-consumers')}>
          <CardBody className="p-4" >
            <div className="flex items-center justify-between" role="button" tabIndex={0} data-path="/list-of-consumers" aria-label="View total customers" onKeyDown={handleKeyActivate}>
              <div>
                <p className="text-sm font-medium text-purple-600">Total Customers</p>
                <p className="text-2xl font-bold text-purple-900" aria-live="polite">
                  {count !== null ? animatedCount : 0}
                </p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Users className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-solar-50 to-solar-100 border-solar-200 hover-lift focus-ring" onClick={() => handleActivate('/OnboardedConsumers')}>
          <CardBody className="p-4">
            <div className="flex items-center justify-between" role="button" tabIndex={0} data-path="/onboarded-consumers" aria-label="View onboarded customers" onKeyDown={handleKeyActivate}>
              <div>
                <p className="text-sm font-medium text-solar-600">Onboarded Customers</p>
                <p className="text-2xl font-bold text-solar-900" aria-live="polite"> {onboardedCount !== null ? animatedOnboardedCount : 0}</p>
              </div>
              <div className="p-2 bg-solar-200 rounded-lg">
                <UserCheck className="h-6 w-6 text-solar-700" />
              </div>
            </div>
          </CardBody>
        </Card>

      </div>


      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-6">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className={`${item.color} p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition-all duration-200 border border-gray-200 hover-lift focus-ring`}
            role="button"
            tabIndex={0}
            data-path={item.path}
            aria-label={item.title}
            onKeyDown={handleKeyActivate}
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


      {/* Progress Chart */}
      {/* <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Customer Progress Trend
        </h2>
        {statsLoading ? (
          <SkeletonLoader className="w-full" height="h-[300px]" variant="rectangular" />
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM yyyy')}
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
                tickMargin={12}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value} customers`, 'Count']}
                labelFormatter={(label: string) => format(parseISO(label), 'MMM dd, yyyy')}
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                wrapperStyle={{ outline: 'none' }}
                cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, stroke: '#2563eb', fill: '#ffffff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#2563eb', fill: '#2563eb' }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-secondary-600 dark:text-secondary-300 py-16">
            No trend data available for the last 12 months.
          </div>
        )}
      </div> */}
    </div>
  );
};

export default StaffDashboard;