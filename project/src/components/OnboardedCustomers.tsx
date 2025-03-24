import React, { useState, useEffect } from "react";
import { fetchOnboardedConsumers} from "../services/api";
import { useNavigate } from "react-router-dom";

interface Consumer {
  id: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  customerId:number;
  consumerId:number;
  connectionType:string;
}

const OnboardedCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleViewConsumer = (consumer: Consumer) => {
    navigate(`/view-connection/${consumer.id}`, { state: { customerId: consumer.customerId, connectionId: consumer.id, consumerId:consumer.consumerId } });
  };

  const goToQuotationForm = () => {
    navigate("/quotationform"); 
  };

  const handleGenerateDocuments = (consumer: Consumer) => {
    navigate(`/generatedocuments/${consumer.id}`, { state: { consumer } });
  };

  const goToGenerateDocuments = () => {
    navigate("/generateDocuments"); 
  };

  const loadOnboardedConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchOnboardedConsumers(page);
      
      setConsumers(data.content); // Directly use the response without extra mapping
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardedConsumers(currentPage);
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
                <div key={consumer.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                  <div className="mb-4">
                    <p className="truncate"><span className="font-medium">Consumer Number:</span> {consumer.consumerId}</p>
                    <p className="break-words"><span className="font-medium">Connection Type:</span> {consumer.connectionType}</p>
                    <p className="break-words"><span className="font-medium">Consumer Name:</span> {consumer.govIdName}</p>
                    <p className="truncate"><span className="font-medium">Email Address:</span> {consumer.emailAddress}</p>
                    <p className="truncate"><span className="font-medium">Mobile Number:</span> {consumer.mobileNumber}</p>
                  </div>
                  <div className="flex flex-col gap-2">
  {/* Row with two buttons, each taking 50% width */}
  <div className="flex gap-2">
    <button
      onClick={() => handleViewConsumer(consumer)}
      className="px-2 py-1 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none w-1/2"
    >
      View Details
    </button>
    <button
      onClick={() => handleGenerateDocuments(consumer)}
      className="px-2 py-1 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none w-1/2"
    >
      Generate Documents
    </button>
  </div>
  {/* Full-width button below */}
  <button
    className="px-2 py-1 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none w-full"
  >
    Add Material Details
  </button>
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

      <button onClick={goToQuotationForm}
        className="mt-6 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none">
        Back to Home
      </button>
    </div>
  );
};

export default OnboardedCustomers;