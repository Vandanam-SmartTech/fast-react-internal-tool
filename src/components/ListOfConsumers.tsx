import React, { useState, useEffect } from "react";
import { fetchConsumers, fetchConsumerNumber, searchCustomers } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Eye, Mail, Phone, Lightbulb } from "lucide-react";
import SearchBar from "../components/SearchBar"; // Import SearchBar component

interface Consumer {

  id: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
}


const ListOfConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [filteredConsumers, setFilteredConsumers] = useState<Consumer[]>([]);
  const [consumerNumbers, setConsumerNumbers] = useState<{ [key: number]: number | string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>(""); // existing state
  const [searchResults, setSearchResults] = useState<Consumer[]>([]); // new state for search results
  const [isSearching, setIsSearching] = useState<boolean>(false); // new state for search indicator


  const handleViewConsumer = (consumer: Consumer) => {
    navigate(`/view-customer/${consumer.id}`, { state: { consumer, customerId: consumer.id, } });
  };

  const loadConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchConsumers(page);
      setConsumers(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);

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
      } = {};

      await Promise.all(
        consumerIds.map(async (id) => {
          const response = await fetchConsumerNumber(id); // Expecting an array
          if (Array.isArray(response)) {
            consumerNumberMap[id] = response.map((item) => ({
              connectionId: item.id, // Store connectionId
              consumerId: item.consumerId, // Store consumerId
            }));
          } else {
            consumerNumberMap[id] = [];
          }
        })
      );

      setConsumerNumbers((prev) => ({ ...prev, ...consumerNumberMap })); // Update state correctly
    } catch (error) {
      console.error("Error fetching consumer numbers:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      loadConsumers(0);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchCustomers(query);
      console.log('Search Results:', result); // Inspect API response
      if (Array.isArray(result)) {
        const filteredResults = result
          .filter((consumer) => consumer !== null && consumer !== undefined)
          .filter((consumer: any) => {
            const baseMatch =
              consumer.govIdName?.toLowerCase().includes(query.toLowerCase()) ||
              consumer.emailAddress?.toLowerCase().includes(query.toLowerCase()) ||
              consumer.mobileNumber?.toString().includes(query);

            // Include match from connection consumerId
            const connectionMatches = consumerNumbers[consumer.id]?.some(
              (entry) =>
                entry.consumerId?.toString().includes(query)
            );

            return baseMatch || connectionMatches;
          });
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }

    } catch (err) {
      console.error("Error searching consumers:", err);
    } finally {
      setIsSearching(false);
    }
  };

  //  useEffect(() => {
  //   const stompClient = createStompClient();

  //   stompClient.onConnect = () => {
  //     console.log("Connected to WebSocket");


  //     stompClient.subscribe('/topic/customerAdded', (message: Message) => {
  //       console.log("Received customerAdded message:", message.body);
  //       loadConsumers(0);  // Reload consumers on new customer addition
  //     });

  //     stompClient.subscribe('/topic/connection', (message: Message) => {
  //       console.log("Received connection update message:", message.body);
  //       const consumerIds = consumers.map((consumer) => consumer.id);
  //       fetchConsumerNumbers(consumerIds);  // Refresh consumer numbers
  //     });
  //   };

  //   stompClient.activate();

  //   return () => {
  //     stompClient.deactivate();
  //   };
  // }, [consumers]);


  useEffect(() => {
    loadConsumers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      loadConsumers(currentPage);
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);


  const goToPage = (page: number) => {
    if (searchQuery.trim() === "") {
      if (page >= 0 && page < totalPages) setCurrentPage(page);
    } else {
      handleSearch(searchQuery);
    }
  };
  const renderPagination = () => {
    if (searchQuery.trim() === "") {
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
    } else {
      return null;
    }
  };

  return (
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-[87%]">
        <h1 className="text-2xl font-semibold mb-6 text-center sm:text-left">
          List of Customers
        </h1>

        {/* Search Bar */}
        <SearchBar placeholder="Search by name, email, or mobile..." onSearch={handleSearch} />

        {isSearching ? (
          <div className="text-center py-10">
            <span>Loading search results...</span>
          </div>
        ) : (
          <div>
            {searchQuery.trim() !== "" ? ( // if searching, display search results
              <div>
                {searchResults.length === 0 ? (
                  <p className="col-span-full text-center text-gray-600">
                    No search results found.
                  </p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((consumer) => (
                      <div
                        key={consumer.id}
                        className="relative bg-white p-4 sm:p-5 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 w-full overflow-hidden break-words"
                      >
                        {/* View Button */}
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleViewConsumer(consumer)}
                            className="px-2 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
                          >
                            View
                          </button>
                        </div>

                        <div className="space-y-3">
                          <h2 className="text-lg font-semibold text-gray-800">
                            {consumer.govIdName}
                          </h2>

                          <div className="flex items-center space-x-2 text-gray-700 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="break-all">{consumer.emailAddress}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-gray-700 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{consumer.mobileNumber}</span>
                          </div>
                        </div>

                        {/* Connection IDs */}
                        {consumerNumbers[consumer.id] !== undefined && consumerNumbers[consumer.id].length > 0 && (
                          <div className="mt-4 space-y-2">
                            {consumerNumbers[consumer.id].map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                              >
                                <span className="text-sm break-words">
                                  <span className="font-medium">
                                    Connection {index + 1}:
                                  </span>{" "}
                                  {entry.consumerId}
                                </span>
                                <button
                                  onClick={() =>
                                    navigate(`/view-connection/${entry.connectionId}`, {
                                      state: {
                                        customerId: consumer.id,
                                        connectionId: entry.connectionId,
                                        consumerId: entry.consumerId,
                                      },
                                    })
                                  }
                                >
                                  <Eye className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                  </div>
                )}

              </div>
            ) : (

              // if not searching, display regular consumers
              <div>
                {loading ? (
                  <div className="text-center py-10">
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div>
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {consumers.length === 0 ? (
                        <p className="col-span-full text-center text-gray-600">
                          No consumers found.
                        </p>
                      ) : (
                        consumers.map((consumer) => (
                          <div
                            key={consumer.id}
                            className="relative bg-white p-4 sm:p-5 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 w-full overflow-hidden break-words"
                          >
                            {/* View Button */}
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={() => handleViewConsumer(consumer)}
                                className="px-2 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
                              >
                                View
                              </button>
                            </div>

                            <div className="space-y-3">
                              <h2 className="text-lg font-semibold text-gray-800">
                                {consumer.govIdName}
                              </h2>

                              <div className="flex items-center space-x-2 text-gray-700 text-sm">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="break-all">{consumer.emailAddress}</span>
                              </div>

                              <div className="flex items-center space-x-2 text-gray-700 text-sm">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{consumer.mobileNumber}</span>
                              </div>
                            </div>

                            {/* Connection IDs */}
                            {consumerNumbers[consumer.id] !== undefined && consumerNumbers[consumer.id].length > 0 && (
                              <div className="mt-4 space-y-2">
                                {consumerNumbers[consumer.id].map((entry, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                                  >
                                    <span className="text-sm break-words">
                                      <span className="font-medium">
                                        Connection {index + 1}:
                                      </span>{" "}
                                      {entry.consumerId}
                                    </span>

                                    {/* Icons with minimal spacing */}
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() =>
                                          navigate(`/view-connection/${entry.connectionId}`, {
                                            state: {
                                              customerId: consumer.id,
                                              connectionId: entry.connectionId,
                                              consumerId: entry.consumerId,
                                            },
                                          })
                                        }
                                        title="View Connection"
                                      >
                                        <Eye className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                      </button>


                                      <button
                                        onClick={() =>
                                          navigate(`/SystemSpecifications`, {
                                            state: {
                                              connectionId: entry.connectionId,
                                              consumerId: entry.consumerId,
                                              customerId: consumer.id,
                                            },
                                          })
                                        }
                                        title="Get Recommendation"
                                      >
                                        <Lightbulb className="w-5 h-5 text-green-500 hover:text-green-700" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-8 space-x-2">
                      {renderPagination()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOfConsumers;