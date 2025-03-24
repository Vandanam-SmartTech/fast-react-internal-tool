import React, { useState, useEffect } from "react";
import { fetchConsumers, fetchConsumerNumber } from "../services/api";
import { useNavigate } from "react-router-dom";
import { QuotationData } from "../types/quotation";
import { Eye } from "lucide-react";

interface Consumer {
  id: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
}

const ListOfConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [consumerNumbers, setConsumerNumbers] = useState<{ [key: number]: number | string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleViewConsumer = (consumer: Consumer) => {
    navigate(`/view-customer/${consumer.id}`, { state: { consumer } });
  };

  const loadConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchConsumers(page);
      
      setConsumers(data.content); // Directly use the response without extra mapping
      setTotalPages(data.totalPages);

      const consumerIds = data.content.map((consumer: Consumer) => consumer.id);
      fetchConsumerNumbers(consumerIds);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumerNumbers = async (consumerIds: number[]) => {
    try {
      const consumerNumberMap: { 
        [key: number]: { connectionId: number; consumerId: number }[] 
      } = {}; // Store multiple consumerIds and their IDs per customerId
  
      await Promise.all(
        consumerIds.map(async (id) => {
          const response = await fetchConsumerNumber(id); // Expecting an array
          if (Array.isArray(response)) {
            consumerNumberMap[id] = response.map((item) => ({
              connectionId: item.id, // Store connectionId
              consumerId: item.consumerId, // Store consumerId
            }));
          } else {
            consumerNumberMap[id] = []; // Handle cases where response isn't an array
          }
        })
      );
  
      setConsumerNumbers((prev) => ({ ...prev, ...consumerNumberMap })); // Update state correctly
    } catch (error) {
      console.error("Error fetching consumer numbers:", error);
    }
  };
  
  
  

  useEffect(() => {
    loadConsumers(currentPage);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(
        <button key="first" onClick={() => goToPage(0)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">1</button>
      );
      if (currentPage > 3) pages.push(<span key="dots1">...</span>);
    }

    for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(
        <button key={i} onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400"}`}>
          {i + 1}
        </button>
      );
    }

    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) pages.push(<span key="dots2">...</span>);
      pages.push(
        <button key="last" onClick={() => goToPage(totalPages - 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">List of Consumers</h1>

      {loading ? (
        <div className="text-center py-10">
          <span>Loading...</span>
        </div>
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {consumers.length === 0 ? (
              <p>No consumers found.</p>
            ) : (
              consumers.map((consumer) => (
<div key={consumer.id} className="relative bg-white p-3 rounded-lg shadow-md hover:shadow-lg">
  {/* View Button Positioned at the Top Right */}
  <div className="absolute top-4 right-6">
    <button
      onClick={() => handleViewConsumer(consumer)}
      className="px-3 py-1 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none"
    >
      View
    </button>
  </div>

  <div className="mb-4">
    <p className="break-words"><span className="font-medium">Consumer Name:</span> {consumer.govIdName}</p>
    <p className="truncate"><span className="font-medium">Email Address:</span> {consumer.emailAddress}</p>
    <p className="truncate"><span className="font-medium">Mobile Number:</span> {consumer.mobileNumber}</p>

    {consumerNumbers[consumer.id] && consumerNumbers[consumer.id].length > 0 && (
  <div className="mt-2 space-y-1">
    {consumerNumbers[consumer.id].map((entry, index) => (
      <div key={index} className="flex items-center justify-between bg-gray-200 px-3 py-2 rounded-md">
        {/* "Connection {index+1}" is bold, consumerId remains normal */}
        <span className="text-sm">
          <span className="font-medium">Connection {index + 1}:</span> {entry.consumerId}
        </span> 

        {/* Eye icon button to navigate */}
        <button 
          onClick={() => 
            navigate(`/view-connection/${entry.connectionId}`, {
              state: { 
                customerId: consumer.id, 
                connectionId: entry.connectionId, 
                consumerId: entry.consumerId 
              }
            })
          }
        >
          <Eye className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700" />
        </button>
      </div>
    ))}
  </div>
)}



  </div>
</div>

              ))
            )}
          </div>

          <div className="flex justify-center items-center mt-6 space-x-2">
            {renderPagination()}
          </div>
        </div>
      )}

    </div>
  );
};

export default ListOfConsumers;
