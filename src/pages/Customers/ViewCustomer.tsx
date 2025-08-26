import { useEffect, useState } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { getCustomerById, fetchConsumerNumber, getInstallationByConsumerId, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid"
import { Eye } from 'lucide-react';


export const ViewCustomer = () => {
  
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [roles, setRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Customer Details");
  const [installationsByConsumer, setInstallationsByConsumer] = useState<Record<string, any[]>>({});
  const [spaceTypes, setSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);


  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  useEffect(() => {
    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setRoles(claims.roles || []);
      } catch (error) {
        console.error("Failed to fetch user claims", error);
      }
    };

    getClaims();
  }, []);

useEffect(() => {
  const fetchAllInstallations = async () => {
    if (!connections || connections.length === 0) return;

    const newInstallationsMap: Record<string, any[]> = {};

    for (const connection of connections) {
      if (!connection.consumerId) continue;

      const data = await getInstallationByConsumerId(Number(connection.consumerId));
      newInstallationsMap[connection.consumerId] = data || [];
    }

    setInstallationsByConsumer(newInstallationsMap);
  };

  fetchAllInstallations();
}, [connections]);

    useEffect(() => {
    const loadSpaceTypes = async () => {
      try {
        const types = await fetchInstallationSpaceTypesNames();
        setSpaceTypes(types);
      } catch (error) {
        console.error("Failed to load space types", error);
      }
    };

    loadSpaceTypes();
  }, []);

  const getSpaceTypeName = (id: number) => {
    return spaceTypes.find((type) => type.id === id)?.nameEnglish || "Unknown";
  };

  useEffect(() => {
    console.log("Fetch Consumer Number API is used");
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setCustomer(data);
      }
    };

    const fetchConnections = async () => {
      if (customerId) {
        const data = await fetchConsumerNumber(Number(customerId));
        if (data) setConnections(data);
      }
    };

    fetchCustomer();
    fetchConnections();
  }, [customerId]);

 

  if (!customer) return <p>Loading...</p>;

  return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">View Customer</h1>
    <p className="text-gray-600 mt-1 text-sm">Review customer details and connections</p>
  </div>

  {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
    <div className="sm:ml-auto text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
      <span className="font-medium text-gray-800">Representative:</span> {selectedRepresentative.name}
    </div>
  )}

</div>


<div className="w-full max-w-4xl mx-auto mb-6 mt-4 overflow-x-auto">
  <div className="relative flex justify-center min-w-[500px] md:min-w-0">
    
    {/* Connector Line: between the first and last icon only */}
    <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-gray-200 z-0" />

    <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        const Icon =
          tab === "Customer Details"
            ? UserCircleIcon
            : tab === "Connection Details"
            ? BoltIcon
            : tab === "Installation Details"
            ? HomeModernIcon
            : Cog6ToothIcon;

            const shouldHighlightIcon = tab === "Customer Details";


        return (
          <button
      key={tab}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
          shouldHighlightIcon
            ? "bg-blue-500 text-white shadow-lg"
            : isActive
            ? "bg-blue-500 text-white shadow-lg"
            : "bg-white border-2 border-gray-300 text-gray-400"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span
        className={`text-[10px] font-medium text-center max-w-20 ${
          isActive ? "text-blue-600" : "text-gray-500"
        }`}
      >
        {tab}
      </span>
    </button>
        );
      })}
    </div>
  </div>
</div>




{/* Customer Card */}
<div className="px-2 mt-4">
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-4xl mx-auto">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Details</h3>
    <div className="border-b border-gray-200 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-gray-800">
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Name as per Gov ID</h3>
        <p className="mt-1 text-base text-gray-800">{customer.govIdName || "....."}</p>
      </div>
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
        <p className="mt-1 text-base text-gray-800">+91 {customer.mobileNumber || "....."}</p>
      </div>
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Preferred Name</h3>
        <p className="mt-1 text-base text-gray-800">{customer.preferredName || "....."}</p>
      </div>
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
        <p className="mt-1 text-base text-gray-800">{customer.emailAddress || "....."}</p>
      </div>
    </div>
  </div>

  <div className="flex gap-3 justify-start mt-6 max-w-4xl mx-auto">
    <button
      onClick={() =>
        navigate(`/edit-customer/${customerId}`, {
          state: {
            customerId,
            selectedRepresentative,
          },
        })
      }
      className="py-2 px-5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition"
    >
      Edit Customer
    </button>

    {connections.length === 0 && (
      <button
        onClick={() =>
          navigate(`/ConnectionForm`, {
            state: {
              customerId,
              selectedRepresentative,
              govIdName: customer.govIdName,
            },
          })
        }
        className="py-2 px-5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition"
      >
        Add New Connection
      </button>
    )}
  </div>
</div>



{connections.length > 0 && (
  <div className="mt-6 px-2">
    <div className="max-w-4xl mx-auto space-y-6">

    <div className="space-y-6">
      {connections.map((connection, index) => (
        <details
          key={connection.id}
          className="group rounded-xl border border-gray-200 bg-white shadow-lg"
        >
<summary className="cursor-pointer flex justify-between items-center px-6 py-4 text-base font-semibold text-gray-800">
  <span>Connection {index + 1}</span>

  <div className="flex items-center gap-4">
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/view-connection/${connection.id}`, {
          state: {
            consumerId: connection.consumerId,
            customerId,
            connectionId: connection.id,
            selectedRepresentative,
          },
        });
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200"
    >
      <Eye size={16} className="text-gray-700" />
      <span className="text-gray-700 text-sm font-medium">View</span>
    </button>

    <svg
      className="w-3 h-3 text-gray-500 transition-transform duration-300 group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</summary>



          <div className="px-5 pb-5 space-y-6 text-sm text-gray-700">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">

    <div>
      <h3 className="text-sm font-medium text-gray-500">Active Grid Connection</h3>
      <p className="mt-1 text-base text-gray-800">Yes</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Consumer Number</h3>
      <p className="mt-1 text-base text-gray-800">{connection.consumerId || "....."}</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Billed To</h3>
      <p className="mt-1 text-base text-gray-800">{connection.billedTo || "....."}</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Monthly Avg Consumption Units</h3>
      <p className="mt-1 text-base text-gray-800">{connection.monthlyAvgConsumptionUnits || "....."}</p>
    </div>
     

    <div>
      <h3 className="text-sm font-medium text-gray-500">Connection Type</h3>
      <p className="mt-1 text-base text-gray-800">{connection.connectionTypeName || "....."}</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Phase Type</h3>
      <p className="mt-1 text-base text-gray-800">{connection.phaseTypeName || "....."}</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Section ID</h3>
      <p className="mt-1 text-base text-gray-800">{connection.sectionId || "....."}</p>
    </div>


    <div>
      <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
      <p className="mt-1 text-base text-gray-800">{connection.gstIn || "....."}</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Address Type</h3>
      <p className="mt-1 text-base text-gray-800">{connection.addressTypeName || "....."}</p>
    </div>



    <div>
      <h3 className="text-sm font-medium text-gray-500">Address</h3>
      <p className="mt-1 text-base text-gray-800">
        {connection.addressLine1}, {connection.villageName}, {connection.talukaName}, {connection.districtName}
      </p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Postal Code</h3>
      <p className="mt-1 text-base text-gray-800">{connection.postalCode || "....."}</p>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-500">Latitude , Longitude</h3>
      <p className="mt-1 text-base text-gray-800">{connection.latitude || "--"}, {connection.longitude || "--"}</p>
    </div>

    {connection.isNameCorrectionRequired && (
      <div>
        <h3 className="text-sm font-medium text-gray-500">Correction Required</h3>
        <p className="mt-1 text-base text-gray-800">{connection.correctionName || "....."}</p>
      </div>
    )}
  </div>

    {/* View/Edit Buttons */}
<div className="w-full grid grid-cols-2 gap-4 md:flex md:justify-start md:gap-4">
  <button
    onClick={() =>
      navigate(`/edit-connection/${connection.id}`, {
        state: {
          consumerId: connection.consumerId,
          connectionId: connection.id,
          customerId: customerId,
          selectedRepresentative: selectedRepresentative,
        },
      })
    }
    className="w-full md:w-auto py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center justify-center"
  >
    Edit Connection
  </button>

  <button
    onClick={() =>
      navigate(`/SystemSpecifications`, {
        state: {
          connectionId: connection.id,
          consumerId: connection.consumerId,
          customerId,
          selectedRepresentative: selectedRepresentative,
        },
      })
    }
    className="w-full md:w-auto py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center"
  >
    Get Recommendation
  </button>
</div>



  {/* Nested Installations */}
{(installationsByConsumer[connection.consumerId] || []).map((installation, idx) => (
  <details key={installation.id} className="group bg-white rounded-md px-4 py-2 border border-gray-200 mb-4">
    <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-gray-800 group">
  <span>
    Installation {idx + 1} - On {spaceTypes.find(type => type.id === installation.installationSpaceTypeId)?.nameEnglish || "....."} ({installation.installationSpaceTitle})
  </span>
  <svg
    className="w-4 h-4 text-gray-500 transform transition-transform duration-300 group-open:rotate-180"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</summary>


    {/* Full Installation Info Block */}
    <div className="mt-4">
      <div className="p-6 w-full">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20 mb-10">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {spaceTypes.find(type => type.id === installation.installationSpaceTypeId)?.nameEnglish || "....."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Installation Space Title</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.installationSpaceTitle || "....."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">East-West-Length (Feet)</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.availableEastWestLengthFt || "....."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">South-North-Length (Feet)</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.availableSouthNorthLengthFt || "....."}
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20">
          <div>
            <h3 className="text-sm font-medium text-gray-500">AC Wire Length (Feet)</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.acWireLengthFt || "....."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">DC Wire Length (Feet)</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.dcWireLengthFt || "....."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Earthing Wire Length (Feet)</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.earthingWireLengthFt || "....."}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Number of GP Pipes</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.numberOfGpPipes || "....."}
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description about Installation</h3>
            <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
              {installation.descriptionOfInstallation || "....."}
            </p>
          </div>
        </div>

        {/* Optional Edit Button */}
        <div className="flex mt-6">
          <button
            onClick={() =>
              navigate(`/edit-installation/${installation.id}`, {
                state: {
                  installationId: installation.id,
                  connectionId:connection.id,
                  consumerId: connection.consumerId,
                  customerId,
                  selectedRepresentative,
                }
              })
            }
            className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Edit Installation
          </button>
        </div>
      </div>
    </div>
  </details>
))}

  <button
    onClick={() => {
      navigate(`/InstallationForm`, { state: { connectionId: connection.id, consumerId: connection.consumerId, customerId, selectedRepresentative:selectedRepresentative } });
    }}
    className="py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    Add New Installation
  </button>



</div>

        </details>
      ))}
    </div>

    {/* Add New Connection button below the collapsibles */}
    <div className="flex justify-start mt-6">
      <button
        onClick={() =>
          navigate(`/ConnectionForm`, {
            state: {
              customerId: customerId,
              selectedRepresentative: selectedRepresentative,
              govIdName: customer.govIdName,
            },
          })
        }
        className="py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Add New Connection
      </button>
    </div>
  </div>
  </div>
)}


    </div>
  </div>
  );
  
};