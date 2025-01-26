import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchConsumers } from "../services/api"; // Importing fetchConsumers from api.ts

// Define the type of consumer data based on the DTO
interface Consumer {
  consumerId: number;
  govIdName: string;
  mobileNumber: number;
  connectionType: string; 
}

const ListOfConsumers: React.FC = () => {
  const navigate = useNavigate();

  // State to store fetched consumers and loading state
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data when the component mounts
  useEffect(() => {
    const loadConsumers = async () => {
      try {
        const data = await fetchConsumers(); // Use fetchConsumers from api.ts
        setConsumers(data); // Update state with the fetched consumer data
      } catch (error) {
        console.error("Error fetching consumers:", error);
      } finally {
        setLoading(false); // End loading once the data is fetched
      }
    };

    loadConsumers();
  }, []); // Empty dependency array to run once when the component mounts

  const goBack = () => {
    navigate("/"); // Navigate to home or previous page
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">List of Consumers</h1>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center py-10">
          <span>Loading...</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {consumers.length === 0 ? (
            <p>No consumers found.</p>
          ) : (
            consumers.map((consumer) => (
              <div
                key={consumer.consumerId} // Using consumerId as key for better performance
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
              >
                {/* Consumer details */}
                <div className="mb-4">
                  <p className="truncate">
                    <span className="font-medium">Consumer Number:</span>{" "}
                    {consumer.consumerId}
                  </p>
                  <p className="break-words">
                    <span className="font-medium">Consumer Name:</span>{" "}
                    {consumer.govIdName}
                  </p>
                  <p className="break-words">
                    <span className="font-medium">Phone:</span>{" "}
                    {consumer.mobileNumber}
                  </p>
                  <p className="truncate">
                    <span className="font-medium">Connection Type:</span>{" "}
                    {consumer.connectionType}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none"
                  >
                    Modify
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={goBack}
        className="mt-6 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ListOfConsumers;
