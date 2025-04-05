import React, { useEffect, useState } from 'react';
import { fetchClaims } from '../services/api';
import { useLocation, useNavigate } from "react-router-dom";



const AdminDashboard = () => {
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

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
        setGreeting('Good Morning');
      } else if (hour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    setTimeBasedGreeting();

    // Fetch user name
    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setName(claims.name_as_per_gov_id);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    getClaims();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-2xl font-semibold mb-10">
        {name ? `${greeting} ${name}` : 'Loading...'}
      </div>
  
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-8">
        <button 
          onClick={goToListOfConsumers}
          className="flex flex-col items-center justify-center bg-blue-100 text-blue-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-blue-200 transition-all h-36 sm:h-48"
        >
          <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">100</div>
          <div className="text-sm sm:text-lg font-medium tracking-wide text-center">All Customers</div>
        </button>
  
        <button 
          onClick={goToOnboardedCustomers}
          className="flex flex-col items-center justify-center bg-green-100 text-green-800 px-4 py-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:bg-green-200 transition-all h-36 sm:h-48"
        >
          <div className="text-3xl sm:text-5xl font-extrabold mb-1 sm:mb-2">75</div>
          <div className="text-sm sm:text-lg font-medium tracking-wide text-center">Onboarded Customers</div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
