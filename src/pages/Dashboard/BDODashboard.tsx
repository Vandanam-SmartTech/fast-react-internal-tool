import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getCustomerCount,
  getOnboardedCustomerCount,
  fetchVillages,
} from "../../services/customerRequisitionService";
import { useUser } from "../../contexts/UserContext";
import ReusableDropdown from "../../components/ReusableDropdown";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Percent, Clock } from 'lucide-react';
interface Village {
  code: string;
  nameEnglish: string;
}


const BDODashboard: React.FC = () => {
  const { userClaims } = useUser();
  const navigate = useNavigate();


  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOnboarded, setTotalOnboarded] = useState(0);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
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

    fetchVillages(selectedOrg.deptCode)
      .then(setVillages)
      .catch(console.error);
  }, []);


  const loadDashboardData = useCallback(async () => {
    const selectedOrgStr = localStorage.getItem("selectedOrg");
    if (!selectedOrgStr) return;

    setIsLoading(true);

    const selectedOrg = JSON.parse(selectedOrgStr);

    const params = {
      userRole: selectedOrg.role,
      talukaCode: selectedOrg.deptCode,
      villageCode: selectedVillage || null,
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
  }, [selectedVillage]);


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




  /* ---------------- Hardcoded Stats ---------------- */

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



  const villageOptions = [
    { value: "", label: "All Villages" },
    ...villages.map((village) => ({
      value: village.code,
      label: village.nameEnglish,
    })),
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-3.5">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="font-bold text-secondary-900 text-lg sm:text-xl lg:text-2xl leading-tight">
            {userClaims?.preferred_name
              ? `${greeting}, ${userClaims.preferred_name}!`
              : 'Welcome back!'}
          </h1>
          <p className="mt-1 text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm lg:text-base">
            Here's what's happening with your taluka today
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-64">
            <ReusableDropdown
              value={selectedVillage}
              onChange={(value) => setSelectedVillage(value as string)}
              options={villageOptions}
              placeholder="Entire Taluka"
            />
          </div>

        </div>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Total Customers */}
        <div
          onClick={() => navigate("/list-of-consumers")}
          className="flex items-center justify-between
    p-3 rounded-xl border
    bg-purple-50 dark:bg-purple-900/20
    border-purple-200 dark:border-purple-700
    cursor-pointer transition-all duration-200
    hover:shadow-md hover:-translate-y-1"
        >
          <div>
            <p className="font-medium text-purple-600 text-xs sm:text-sm">
              Total Customers
            </p>
            <p
              className="font-bold text-purple-900 dark:text-purple-300 text-lg sm:text-2xl"
              aria-live="polite"
              title={totalCustomers?.toLocaleString()}
            >
              {formatNumber(totalCustomers)}
            </p>

          </div>

          <div className="p-2 sm:p-2.5 bg-purple-200 dark:bg-purple-800/40 rounded-lg">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-700 dark:text-purple-300" />
          </div>
        </div>


        {/* Onboarded */}
        <div
          onClick={() => navigate("/onboarded-consumers")}
          className="flex items-center justify-between
    p-3 rounded-xl border
    bg-emerald-50 dark:bg-emerald-900/20
    border-emerald-200 dark:border-emerald-700
    cursor-pointer transition-all duration-200
    hover:shadow-md hover:-translate-y-1"
        >
          <div>
            <p className="font-medium text-emerald-600 text-xs sm:text-sm">
              Onboarded Customers
            </p>
            <p className="font-bold text-emerald-900 dark:text-emerald-300 text-lg sm:text-2xl"
              aria-live="polite"
              title={totalOnboarded?.toLocaleString()}>
              {formatNumber(totalOnboarded)}
            </p>
          </div>

          <div className="p-2 sm:p-2.5 bg-emerald-200 dark:bg-emerald-800/40 rounded-lg">
            <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-700 dark:text-emerald-300" />
          </div>
        </div>


        {/* Completion Rate */}
        <div
          className="flex items-center justify-between
    p-3 rounded-xl border
    bg-indigo-50 dark:bg-indigo-900/20
    border-indigo-200 dark:border-indigo-700
    transition-all duration-200
    hover:shadow-md hover:-translate-y-1"
        >
          <div>
            <p className="font-medium text-indigo-600 text-xs sm:text-sm">
              Completion Rate
            </p>
            <p className="font-bold text-indigo-900 dark:text-indigo-300 text-lg sm:text-2xl">
              {completionPercentage}%
            </p>
          </div>

          <div className="p-2 sm:p-2.5 bg-indigo-200 dark:bg-indigo-800/40 rounded-lg">
            <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-700 dark:text-indigo-300" />
          </div>
        </div>


        {/* Remaining */}
        <div
          className="flex items-center justify-between
    p-3 rounded-xl border
    bg-orange-50 dark:bg-orange-900/20
    border-orange-200 dark:border-orange-700
    transition-all duration-200
    hover:shadow-md hover:-translate-y-1"
        >
          <div>
            <p className="font-medium text-orange-600 text-xs sm:text-sm">
              Remaining
            </p>
            <p className="font-bold text-orange-900 dark:text-orange-300 text-lg sm:text-2xl"
              aria-live="polite"
              title={(totalCustomers - totalOnboarded)?.toLocaleString()}>
              {formatNumber(totalCustomers - totalOnboarded)}
            </p>
          </div>

          <div className="p-2 sm:p-2.5 bg-orange-200 dark:bg-orange-800/40 rounded-lg">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-700 dark:text-orange-300" />
          </div>
        </div>

      </div>

    </div>
  );

};

export default BDODashboard;
