import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getOnboardedCustomerCount, getCustomerCount, getCustomerStats } from '../../services/customerRequisitionService';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Users, Calendar, Clock } from 'lucide-react';
import Card, { CardBody } from '../../components/ui/Card';
import { useUser } from '../../contexts/UserContext';
import { safeConnectWebSocket } from '../../utils/websocketHelper';

const BDODashboard: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const [onboardedCount, setOnboardedCount] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [count, setCount] = useState<number | null>(null);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedOnboardedCount, setAnimatedOnboardedCount] = useState(0);
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
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const buildCustomerParams = useCallback(() => {
    const selectedOrgStr = localStorage.getItem("selectedOrg");
    if (!selectedOrgStr) return null;

    try {
      const selectedOrg = JSON.parse(selectedOrgStr);
      
      if (!selectedOrg || typeof selectedOrg !== 'object' || !selectedOrg.role) {
        console.warn("Invalid selectedOrg structure");
        return null;
      }

      const params: Record<string, any> = {};

      if (
        selectedOrg.role === "ROLE_ORG_STAFF" ||
        selectedOrg.role === "ROLE_ORG_REPRESENTATIVE"
      ) {
        params.orgId = selectedOrg.orgId;
        params.userRole = selectedOrg.role;
      } else if(selectedOrg.role === "ROLE_BDO") {
        params.userRole = selectedOrg.role;
        params.talukaCode = selectedOrg.deptCode;
      } else if (
        selectedOrg.role === "ROLE_AGENCY_STAFF" ||
        selectedOrg.role === "ROLE_AGENCY_REPRESENTATIVE"
      ) {
        params.agencyId = selectedOrg.orgId;
        params.userRole = selectedOrg.role;
      }

      return Object.keys(params).length > 0 ? params : null;
    } catch (err) {
      console.error("Failed to parse selectedOrg from localStorage:", err);
      return null;
    }
  }, []);


  const refreshCustomerCount = useCallback(async (animate = true) => {
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
  }, [buildCustomerParams]);



  useEffect(() => {
    const cleanup = safeConnectWebSocket((event) => {
      if (event === "CUSTOMER_ADDED") {
        refreshCustomerCount(true);
      }
    });
    return cleanup;
  }, [refreshCustomerCount]);

  useEffect(() => {
    const params = buildCustomerParams();
    if (!params) return;

    refreshCustomerCount(false);

    Promise.all([
      getOnboardedCustomerCount(params),
      getCustomerStats(params)
    ]).then(([actualCount]) => {
      setOnboardedCount(actualCount);
      setAnimatedOnboardedCount(actualCount);
    }).catch(console.error);
  }, [buildCustomerParams, refreshCustomerCount]);


  const animateCountUp = useCallback((
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
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleActivate = (path: string) => navigate(path);

  const handleKeyActivate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = e.currentTarget.getAttribute('data-path');
      if (target) navigate(target);
    }
  };

  const dashboardItems = useMemo(() => [
     {
          title: 'Manage Customers',
          description: 'List, View, Add, Update customers',
          icon: <Users className="h-8 w-8 text-primary-600" />,
          path: '/manage-customers',
          color: 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700',
        },
  ], []);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-2">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

          <div>
          <h1 className="font-bold text-secondary-900
                     text-lg sm:text-xl lg:text-2xl
                     leading-tight">
            {userClaims?.preferred_name
              ? `${greeting}, ${userClaims.preferred_name}!`
              : 'Welcome back!'}
          </h1>

          <p className="mt-1 text-secondary-700 dark:text-secondary-300
                    text-xs sm:text-sm lg:text-base">
            Manage Customers and View Progress
          </p>
        </div>

        {/* Time & Date */}
        <div className="flex items-center gap-3 sm:gap-4
                      text-xs sm:text-sm
                      text-secondary-600 dark:text-secondary-300">
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
      </div>

      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-semibold text-secondary-900">
          Customer Records
        </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">

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
          onClick={() => handleActivate('/onboarded-consumers')}
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

      </div>

    </div>
  );

};

export default BDODashboard;