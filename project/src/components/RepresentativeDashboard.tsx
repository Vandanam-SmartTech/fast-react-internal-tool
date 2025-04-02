import React, { useEffect, useState } from 'react';
import { fetchClaims } from '../services/api';
import { useLocation, useNavigate } from "react-router-dom";

const RepresentativeDashboard = () => {
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
          {name ? `${greeting}, ${name}` : 'Loading...'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button 
        onClick={goToListOfConsumers}
        className="w-full bg-blue-100 text-blue-800 text-lg font-bold py-6 rounded-lg shadow hover:bg-blue-200 transition-all">
          Total No. of Customers: 50
        </button>

        <button 
        onClick={goToOnboardedCustomers}
        className="w-full bg-green-100 text-green-800 text-lg font-bold py-6 rounded-lg shadow hover:bg-green-200 transition-all">
          Total No. of Onboarded Customers: 25
        </button>
      </div>

      </div>
    );
  };

export default RepresentativeDashboard;
