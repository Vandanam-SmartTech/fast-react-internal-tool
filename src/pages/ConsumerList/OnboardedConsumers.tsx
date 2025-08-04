import React, { useState, useEffect } from "react";
import { fetchOnboardedConsumers , getMaterialsByConnectionId} from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import { Mail, Phone, User, Zap } from "lucide-react";


interface Consumer {
  id: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  customerId: number;
  consumerId: number;
  connectionType: string;
  materials?: { materialId: number; materialName: string; quantity: number; unitPrice: number }[];
}

const OnboardedConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [materialsMap, setMaterialsMap] = useState<Record<number, boolean>>({});

  const handleViewConsumer = (consumer: Consumer) => {
    navigate(`/view-connection/${consumer.id}`, {
      state: {
        customerId: consumer.customerId,
        connectionId: consumer.id,
        consumerId: consumer.consumerId,
      },
    });
  };

  const handleGenerateDocuments = (consumer: Consumer) => {
    navigate(`/generatedocuments/${consumer.id}`, { state: { consumer } });
  };

  // const handleMaterialDetails = (consumer: Consumer) => {
  //   navigate(`/material-form/${consumer.id}`, { state: { consumer,connectionId:consumer.id  } });
  // };
  
  
  const loadOnboardedConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchOnboardedConsumers(page);
      setConsumers(data.content);
      setTotalPages(data.totalPages);

            // Use materials data from API response
      const map: Record<number, boolean> = {};
      data.content.forEach((consumer: Consumer) => {
        map[consumer.id] = consumer.materials ? consumer.materials.length > 0 : false;
      });
      setMaterialsMap(map);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };

    const handleMaterialDetails = (consumer: Consumer) => {
    navigate(`/material-form/${consumer.id}`, {
      state: { consumer, connectionId: consumer.id },
    });
  };

  const handleViewMaterialDetails = (consumer: Consumer) => {
    navigate(`/material-form/${consumer.id}`, {
      state: { consumer, connectionId: consumer.id },
    });
  };


  useEffect(() => {
    loadOnboardedConsumers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleOrgChange = () => {
      setCurrentPage(0);
      loadOnboardedConsumers(0);
    };
    
    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
  }, []);

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredConsumers = consumers.filter((consumer) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      String(consumer.govIdName).toLowerCase().includes(lowerSearch) ||
      String(consumer.emailAddress).toLowerCase().includes(lowerSearch) ||
      String(consumer.mobileNumber).toLowerCase().includes(lowerSearch) ||
      String(consumer.consumerId).toLowerCase().includes(lowerSearch) ||
      String(consumer.connectionType).toLowerCase().includes(lowerSearch)
    );
  });

  const renderPagination = () => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(
        <button key="first" onClick={() => goToPage(0)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">1</button>
      );
      if (currentPage > 3) pages.push(<span key="dots1">...</span>);
    }

    for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400"}`}>
          {i + 1}
        </button>
      );
    }

    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) pages.push(<span key="dots2">...</span>);
      pages.push(
        <button key="last" onClick={() => goToPage(totalPages - 1)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-[87%]">
      <h1 className="text-2xl font-semibold mb-6 text-center sm:text-left">Onboarded Consumers</h1>

      <SearchBar placeholder="Search by name, email, or mobile..." onSearch={handleSearch} />

        {loading ? (
          <div className="text-center py-10">
            <span>Loading...</span>
          </div>
        ) : (
          <div>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredConsumers.length === 0 ? (
                <p className="col-span-full text-center text-gray-600">No consumers found.</p>
              ) : (
                filteredConsumers.map((consumer) => (
<div
  key={consumer.id}
  className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 space-y-3"
>
  {/* Consumer Name at the top */}
  <h2 className="text-lg font-semibold text-gray-800 truncate">
    {consumer.govIdName}
  </h2>

  {/* Info with Icons */}
  <div className="space-y-2 text-sm sm:text-base text-gray-700">

<div className="flex items-center gap-2">
  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
  <span className="truncate max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-700">
    {consumer.emailAddress ? consumer.emailAddress : "NA"}
  </span>
</div>

    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-gray-500" />
      <span>{consumer.mobileNumber}</span>
    </div>


    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-gray-500" />
      <span className="break-all">
        <span className="font-medium">Consumer No:</span> {consumer.consumerId}
      </span>
    </div>

    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-gray-500" />
      <span className="break-words">
        <span className="font-medium">Connection Type:</span> {consumer.connectionType}
      </span>
    </div>

  </div>

  {/* Buttons */}
  <div className="flex flex-col gap-2 pt-2">
    <div className="flex gap-2">
      <button
        onClick={() => handleViewConsumer(consumer)}
        className="px-2 h-9 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none w-2/5"
      >
        View Details
      </button>

      <div
        className="w-3/5"
        title={!materialsMap[consumer.id] ? "Please fill material details to generate documents" : ""}
      >
        {/* <button
          onClick={() => handleGenerateDocuments(consumer)}
          disabled={!materialsMap[consumer.id]}
          className={`px-2 h-9 text-white text-sm font-medium rounded-lg w-full bg-blue-500 hover:bg-blue-600 focus:outline-none ${
            !materialsMap[consumer.id] ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Generate Documents
        </button> */}
        <button
  onClick={() => handleGenerateDocuments(consumer)}
  className="px-2 h-9 text-white text-sm font-medium rounded-lg w-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
>
  Generate Documents
</button>

      </div>
    </div>

    <button
      onClick={() =>
        materialsMap[consumer.id]
          ? handleViewMaterialDetails(consumer)
          : handleMaterialDetails(consumer)
      }
      className={`px-2 h-9 text-white text-sm font-medium rounded-lg w-full ${
        materialsMap[consumer.id] ? "bg-green-500 hover:bg-green-600" : "bg-green-500 hover:bg-green-600"
      } focus:outline-none`}
    >
      {materialsMap[consumer.id] ? "View Material Details" : "Add Material Details"}
    </button>
  </div>
</div>

                ))
              )}
            </div>

            <div className="flex justify-center items-center mt-6 space-x-2 flex-wrap">
              {renderPagination()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardedConsumers;