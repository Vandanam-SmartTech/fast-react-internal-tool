import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchConsumers } from "../services/api";

interface Consumer {
  consumerId: number;
  connectionType: string;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
}

const ListOfConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchConsumers(page);
      setConsumers(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumers(currentPage);
  }, [currentPage]);

  const goBack = () => {
    navigate("/");
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];

    // Add the first page
    if (currentPage > 2) {
      pages.push(
        <button
          key="first"
          onClick={() => goToPage(0)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          1
        </button>
      );
      if (currentPage > 3) pages.push(<span key="dots1">...</span>);
    }

    // Add the previous two, current, and next two pages
    for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${
            i === currentPage
              ? "bg-blue-600 text-white"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    // Add the last page
    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) pages.push(<span key="dots2">...</span>);
      pages.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages - 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
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
                <div
                  key={consumer.consumerId}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
                >
                  <div className="mb-4">
                    <p className="truncate">
                      <span className="font-medium">Consumer Number:</span>{" "}
                      {consumer.consumerId}
                    </p>
                    <p className="break-words">
                      <span className="font-medium">Connection Type:</span>{" "}
                      {consumer.connectionType}
                    </p>
                    <p className="break-words">
                      <span className="font-medium">Consumer Name:</span>{" "}
                      {consumer.govIdName}
                    </p>
                    <p className="truncate">
                      <span className="font-medium">Email Address:</span>{" "}
                      {consumer.emailAddress}
                    </p>
                    <p className="truncate">
                      <span className="font-medium">Mobile Number:</span>{" "}
                      {consumer.mobileNumber}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none">
                      Modify
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none">
                      Delete
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
