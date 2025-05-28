import React, { useEffect, useState } from 'react';
import { fetchClaims, getOnboardedCustomerCount, getCustomerCount } from '../services/api';
import { useLocation, useNavigate } from "react-router-dom";
import { UserCheck,Users } from 'lucide-react';

const RepresentativeDashboard = () => {
    const [name, setName] = useState('');
    const [preferredName, setPreferredName] = useState('');
    const [greeting, setGreeting] = useState('');
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route
    const [count, setCount] = useState<number | null>(null);
    const [onboardedCount, setOnboardedCount] = useState<number | null>(null);

    const [animatedCount, setAnimatedCount] = useState(0);
    const [animatedOnboardedCount, setAnimatedOnboardedCount] = useState(0);
    

    const goToListOfConsumers = () => {
      navigate("/list-of-consumers");
    };

    const goToOnboardedCustomers = () => {
      navigate("/OnboardedCustomers");
    };
  
    useEffect(() => {
      // Set greeting based on current time
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
  
      // Fetch user name
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
    
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
  <button 
    onClick={goToListOfConsumers}
    className="flex flex-col items-center justify-center bg-blue-200 text-blue-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-blue-300 transition-all h-36 sm:h-48"
  >
    <Users className="w-8 h-8 mb-2" />
    <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">
      {count !== null ? animatedCount : ''}
    </div>
    <div className="text-sm sm:text-lg font-medium tracking-wide text-center">All Customers</div>
  </button>

  <button 
    onClick={goToOnboardedCustomers}
    className="flex flex-col items-center justify-center bg-green-200 text-green-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-green-300 transition-all h-36 sm:h-48"
  >
    <UserCheck className="w-8 h-8 mb-2" />
    <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">
      {onboardedCount !== null ? animatedOnboardedCount : ''}
    </div>
    <div className="text-sm sm:text-lg font-medium tracking-wide text-center">Onboarded Customers</div>
  </button>
</div>
      </div>
    );
    
  };

export default RepresentativeDashboard;
