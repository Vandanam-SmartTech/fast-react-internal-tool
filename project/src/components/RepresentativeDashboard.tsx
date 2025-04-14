import React, { useEffect, useState } from 'react';
import { fetchClaims, getOnboardedCustomerCount, getCustomerCount } from '../services/api';
import { useLocation, useNavigate } from "react-router-dom";

const RepresentativeDashboard = () => {
    const [name, setName] = useState('');
    const [preferredName, setPreferredName] = useState('');
    const [greeting, setGreeting] = useState('');
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route
    const [count, setCount] = useState<number | null>(null);
    const [onboardedCount, setOnboardedCount] = useState<number | null>(null);

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

    useEffect(()=> {
      getOnboardedCustomerCount()
      .then(setOnboardedCount)
      .catch((err)=> console.error("Error:",err));
    },[]);

    useEffect(()=>{
      getCustomerCount()
      .then(setCount)
      .catch((err)=> console.error("Error:",err));
    })
  
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-2xl font-semibold mb-10">
          {preferredName ? `Hello ${preferredName}, ${greeting}` : 'Loading...'}
        </div>
    
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-8">
          <button 
            onClick={goToListOfConsumers}
            className="flex flex-col items-center justify-center bg-blue-100 text-blue-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-blue-200 transition-all h-36 sm:h-48"
          >
            <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">{count !== null ? count : "Loading..."}</div>
            <div className="text-sm sm:text-lg font-medium tracking-wide text-center">All Customers</div>
          </button>
    
          <button 
            onClick={goToOnboardedCustomers}
            className="flex flex-col items-center justify-center bg-green-100 text-green-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-green-200 transition-all h-36 sm:h-48"
          >
            <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">{onboardedCount !== null ? onboardedCount : "Loading..."}</div>
            <div className="text-sm sm:text-lg font-medium tracking-wide text-center">Onboarded Customers</div>
          </button>
        </div>
      </div>
    );
    
  };

export default RepresentativeDashboard;
