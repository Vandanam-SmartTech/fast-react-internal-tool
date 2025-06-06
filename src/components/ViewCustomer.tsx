import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation} from "react-router-dom";
import { getCustomerById, fetchConsumerNumber, fetchClaims } from "../services/api";
import { Stepper, Step } from "react-form-stepper";
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid"

export const ViewCustomer = () => {
  
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [roles, setRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Customer Details");

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

  // useEffect(() => {
  //   const storedRep = localStorage.getItem("selectedRepresentative");
  //   if (storedRep) {
  //     setSelectedRepresentative(JSON.parse(storedRep));
  //   }
  // }, []);


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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">View Customer Details</h2>

      {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}

  </div>


          {/* <div className="mb-6 sm:mb-8 overflow-x-auto">
      <Stepper 
        activeStep={0} 
        styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }}
        className="min-w-max sm:w-full"
      >
        <Step label="Customer Details" />
        <Step label="Connection Details" />
        <Step label="Installation Space Details" />
        <Step label="System Specifications" />
      </Stepper>
    </div> */}

<div className="w-full max-w-4xl mx-auto mb-14 mt-10 overflow-x-auto">
  <div className="relative flex justify-center min-w-[500px] md:min-w-0">
    
    {/* Connector Line: between the first and last icon only */}
    <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

    <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
      {tabs.map((tab, index) => {
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
      className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
    >
      <div
        className={`rounded-full p-2 transition-all duration-300 ${
          shouldHighlightIcon
            ? "bg-blue-500 text-white"
            : "bg-white border border-gray-300 text-gray-500"
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={`text-xs md:text-sm font-semibold mt-1 ${
          isActive ? "text-gray-700" : "text-gray-700"
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


<h2 className="text-2xl font-semibold text-gray-700 mb-8">Customer Details</h2>
<div className="flex items-start px-2 mt-4">
  <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Gov ID Name</h3>
        <p className="mt-1 text-base text-gray-800 break-words">{customer.govIdName || "....."}</p>
      </div>
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
        <p className="mt-1 text-base text-gray-800 break-words">{customer.mobileNumber || "....."}</p>
      </div>
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Preferred Name</h3>
        <p className="mt-1 text-base text-gray-800 break-words">{customer.preferredName || "....."}</p>
      </div>
      <div className="break-words">
        <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
        <p className="mt-1 text-base text-gray-800 break-words">{customer.emailAddress || "....."}</p>
      </div>
    </div>
  </div>
</div>

  
      {/* Update Customer Button - Placed before connections */}
      <div className="flex flex-col sm:flex-row justify-start mt-8 sm:gap-16 gap-4">
  <button
    onClick={() =>
      navigate(`/edit-customer/${customerId}`, {
        state: {
          customerId: customerId,
          selectedRepresentative: selectedRepresentative,
        },
      })
    }
    className="py-3 px-10 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
  >
    Edit Customer
  </button>

  {connections.length === 0 && (
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
      className="py-3 px-10 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-auto"
    >
      Add New Connection
    </button>
  )}
</div>


{/* Only show Connections section if there are connections */}
{connections.length > 0 && (
  <>
    <h2 className="text-xl font-semibold text-gray-700 mt-8">Connections</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {connections.map((connection, index) => (
        <div
          key={connection.id}
          className="border rounded-lg shadow p-4 bg-white"
        >
          <h3 className="text-lg font-medium text-gray-900">
            Connection {index + 1}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">Consumer Number:</span>{" "}
            {connection.consumerId}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">Consumer Name:</span>{" "}
            {customer.govIdName || ""}
          </p>
          <div className="flex gap-4 mt-3">
            <button
              onClick={() =>
                navigate(`/view-connection/${connection.id}`, {
                  state: {
                    consumerId: connection.consumerId,
                    connectionId: connection.id,
                    customerId: customerId,
                    selectedRepresentative: selectedRepresentative,
                  },
                })
              }
              className="mt-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              View
            </button>

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
              className="mt-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* Show Add Connection button only when there are connections */}
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
        className="py-3 px-10 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Add New Connection
      </button>
    </div>
  </>
)}

    </div>
  );
  
};
