import { useEffect, useState } from 'react';
import { getOnboardedCustomerCount, getCustomerCount, getCustomerStats } from '../../services/customerRequisitionService';
import { fetchClaims } from '../../services/jwtService';
import { useNavigate } from "react-router-dom";
import { UserCheck, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const AdminDashboard = () => {
  const [preferredName, setPreferredName] = useState('');
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const [onboardedCount, setOnboardedCount] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedOnboardedCount, setAnimatedOnboardedCount] = useState(0);

  const [data, setData] = useState([]);


  // useEffect(() => {
  //   getCustomerStats().then(setData).catch(console.error);
  // }, []);

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
    navigate("/list-of-consumers");
  };

  const goToOnboardedCustomers = () => {
    navigate("/OnboardedCustomers");
  };

  useEffect(() => {
    const setTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning!');
      } else if (hour < 18) {
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-2xl font-semibold mb-10">
        {preferredName ? `Hello ${preferredName}, ${greeting} 😊` : 'Loading...'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-10">
        <button 
          onClick={goToListOfConsumers}
          className="flex flex-col items-center justify-center bg-blue-200 text-blue-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-blue-300 transition-all h-36 sm:h-48"
        >
          <Users className="w-8 h-8 mb-2" />
          <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">
            {count !== null ? animatedCount : '0'}
          </div>
          <div className="text-sm sm:text-lg font-medium tracking-wide text-center">All Customers</div>
        </button>

        <button 
          onClick={goToOnboardedCustomers}
          className="flex flex-col items-center justify-center bg-green-200 text-green-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-green-300 transition-all h-36 sm:h-48"
        >
          <UserCheck className="w-8 h-8 mb-2" />
          <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">
            {onboardedCount !== null ? animatedOnboardedCount : '0'}
          </div>
          <div className="text-sm sm:text-lg font-medium tracking-wide text-center">Onboarded Customers</div>
        </button>
      </div>

      {count !== 0 && (<div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Customer Trend</h2>
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
      )}
    </div>
  );
};

export default AdminDashboard;
