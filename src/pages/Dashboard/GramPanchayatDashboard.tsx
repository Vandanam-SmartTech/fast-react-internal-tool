import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getCustomerCount,
  getOnboardedCustomerCount
} from "../../services/customerRequisitionService";
import { useUser } from "../../contexts/UserContext";
import ReusableDropdown from "../../components/ReusableDropdown";
import { Clock, Calendar } from 'lucide-react';
import { useNavigate } from "react-router-dom";


import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";


const COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
];

const GramPanchayatDashboard: React.FC = () => {
  const { userClaims } = useUser();
  const navigate = useNavigate();


  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOnboarded, setTotalOnboarded] = useState(0);

  const [greeting, setGreeting] = useState('');
  const [onboardedCount, setOnboardedCount] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };



  /* ---------------- Load Data ---------------- */

  useEffect(() => {
  const selectedOrgStr = localStorage.getItem("selectedOrg");
  if (!selectedOrgStr) return;

  const selectedOrg = JSON.parse(selectedOrgStr);

}, []);


  const loadDashboardData = useCallback(async () => {
    const selectedOrgStr = localStorage.getItem("selectedOrg");
    if (!selectedOrgStr) return;

    setIsLoading(true);

    const selectedOrg = JSON.parse(selectedOrgStr);

    const params = {
      userRole: selectedOrg.role,
      villageCode: selectedOrg.deptCode
    };

    try {
      const [total, onboarded] = await Promise.all([
        getCustomerCount(params),
        getOnboardedCustomerCount(params)
      ]);

      setTotalCustomers(total);
      setTotalOnboarded(onboarded);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);


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
    loadDashboardData();
  }, [loadDashboardData]);

  /* ---------------- Derived Stats ---------------- */

  const completionPercentage = useMemo(() => {
    if (totalCustomers === 0) return 0;
    return Math.round((totalOnboarded / totalCustomers) * 100);
  }, [totalCustomers, totalOnboarded]);


  const projectData = useMemo(() => [
    { name: "Material Delivered", value: Math.round(totalOnboarded * 0.8) },
    { name: "Installed", value: Math.round(totalOnboarded * 0.6) },
    { name: "Inspected", value: Math.round(totalOnboarded * 0.5) },
    { name: "Commissioned", value: Math.round(totalOnboarded * 0.4) },
    { name: "Completed", value: Math.round(totalOnboarded * 0.25) },
  ], [totalOnboarded]);


  const hasProjectData =
    totalOnboarded &&
    projectData.some(item => item.value > 0);

  const loanData = useMemo(() => [
    { name: "Loan Applied", value: Math.round(totalCustomers * 0.5) },
    { name: "Loan Approved", value: Math.round(totalCustomers * 0.35) },
    { name: "Partial Paid", value: Math.round(totalCustomers * 0.2) },
    { name: "Fully Paid", value: Math.round(totalCustomers * 0.15) },
  ], [totalCustomers]);

  const hasLoanData =
    totalCustomers > 0 &&
    loanData.some(item => item.value > 0);


  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-2">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
  <div>
    <h1 className="font-bold text-secondary-900 text-lg sm:text-xl lg:text-2xl leading-tight">
      {userClaims?.preferred_name
        ? `${greeting}, ${userClaims.preferred_name}!`
        : 'Welcome back!'}
    </h1>
    <p className="mt-1 text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm lg:text-base">
      Here's what's happening with your village today
    </p>
  </div>

  <div className="flex flex-col sm:flex-row items-center gap-4">
   

    <div className="hidden lg:flex items-center gap-3 text-sm text-secondary-600 dark:text-secondary-300 bg-white/60 backdrop-blur px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>
          {currentTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          })}
        </span>
      </div>
      <div className="w-px h-4 bg-gray-300"></div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-indigo-500" />
        <span>{currentTime.toLocaleDateString("en-IN")}</span>
      </div>
    </div>
  </div>
</div>


      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => navigate("/list-of-consumers")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <p className="text-sm opacity-80">Total Applications</p>
          <h3 className="text-lg font-semibold mt-1">
            {formatNumber(totalCustomers)}
          </h3>
        </div>

        {/* Onboarded */}
        <div
          onClick={() => navigate("/onboarded-consumers")}
          className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-4 rounded-xl shadow-md cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <p className="text-sm opacity-80">Onboarded</p>
          <h3 className="text-lg font-semibold mt-1">
            {formatNumber(totalOnboarded)}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4 rounded-xl shadow-md">
          <p className="text-sm opacity-80">Completion Rate</p>
          <h3 className="text-lg font-semibold mt-1">{completionPercentage}%</h3>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white p-4 rounded-xl shadow-md">
          <p className="text-sm opacity-80">Remaining</p>
          <h3 className="text-lg font-semibold mt-1">
            {formatNumber(totalCustomers - totalOnboarded)}
          </h3>
        </div>
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-5">

          <h2 className="text-lg font-semibold mb-4">
            Project Status Overview
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              Loading...
            </div>
          ) : hasProjectData ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={projectData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  isAnimationActive={false}   // 🔥 important
                >

                  {projectData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
              <p className="text-sm font-medium">No Project Data Available</p>
              <p className="text-xs mt-1">
                Data will appear once customers get onboarded
              </p>
            </div>
          )}
        </div>



        <div className="bg-white rounded-xl shadow-md p-4 sm:p-5">

          <h2 className="text-lg font-semibold mb-4">
            Loan Status Overview
          </h2>

          {hasLoanData ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={loanData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3B82F6"
                  radius={[0, 8, 8, 0]}
                  barSize={28}
                  isAnimationActive={false}
                />

              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
              <p className="text-sm font-medium">No Loan Data Available</p>
              <p className="text-xs mt-1">Data will appear once applications are received</p>
            </div>
          )}
        </div>


      </div>

    </div>
  );

};

export default GramPanchayatDashboard;
