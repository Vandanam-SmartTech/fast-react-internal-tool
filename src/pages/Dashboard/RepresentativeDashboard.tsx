import React, { useEffect, useState } from 'react';
import { getOnboardedCustomerCount, getCustomerCount, getCustomerStats } from '../../services/customerRequisitionService';
import { fetchClaims } from '../../services/jwtService';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Users, BarChart3, Calendar, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const RepresentativeDashboard: React.FC = () => {
  const [preferredName, setPreferredName] = useState('');
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const [onboardedCount, setOnboardedCount] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [count, setCount] = useState<number | null>(null);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedOnboardedCount, setAnimatedOnboardedCount] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    getCustomerStats()
      .then((rawData) => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const filtered = rawData.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate >= oneYearAgo;
        });

        setData(filtered);
      })
      .catch(console.error);
  }, []);

  const goToListOfConsumers = () => {
    navigate('/list-of-consumers');
  };

  const goToOnboardedCustomers = () => {
    navigate('/OnboardedConsumers');
  };

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

  useEffect(() => {
    getCustomerCount()
      .then(actualCount => {
        setCount(actualCount);
        animateCountUp(actualCount, setAnimatedCount);
      })
      .catch(console.error);

    getOnboardedCustomerCount()
      .then(actualCount => {
        setOnboardedCount(actualCount);
        animateCountUp(actualCount, setAnimatedOnboardedCount);
      })
      .catch(console.error);
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        
       <div>
<h1 className="text-3xl font-bold text-secondary-900">
            {preferredName ? `${greeting}, ${preferredName}!` : 'Welcome back!'}
          </h1>
        <p className="text-gray-600">Manage customers and track progress</p>
      </div>
      {/* Right - Time & Date */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
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

      

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <button 
          onClick={goToListOfConsumers}
          className="flex flex-col items-center justify-center bg-blue-200 text-blue-800 px-4 py-7 rounded-xl shadow-md hover:bg-blue-300 transition-all h-40"
        >
          <Users className="w-7 h-7 mb-1" />
          <div className="text-5xl font-extrabold mb-1">
            {count !== null ? animatedCount : '0'}
          </div>
          <div className="text-base font-medium tracking-wide text-center">All Customers</div>
        </button>

        <button 
          onClick={goToOnboardedCustomers}
          className="flex flex-col items-center justify-center bg-green-200 text-green-800 px-4 py-7 rounded-xl shadow-md hover:bg-green-300 transition-all h-40"
        >
          <UserCheck className="w-7 h-7 mb-1" />
          <div className="text-5xl font-extrabold mb-1">
            {onboardedCount !== null ? animatedOnboardedCount : '0'}
          </div>
          <div className="text-base font-medium tracking-wide text-center">Onboarded Consumers</div>
        </button>
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