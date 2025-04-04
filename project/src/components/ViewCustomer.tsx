import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation} from "react-router-dom";
import { getCustomerById, getConnectionsByCustomerId, fetchClaims } from "../services/api";
import { Stepper, Step } from "react-form-stepper";

export const ViewCustomer = () => {
  
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);


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
    const storedRep = localStorage.getItem("selectedRepresentative");
    if (storedRep) {
      setSelectedRepresentative(JSON.parse(storedRep));
    }
  }, []);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setCustomer(data);
      }
    };

    const fetchConnections = async () => {
      if (customerId) {
        const data = await getConnectionsByCustomerId(Number(customerId));
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


          <div className="mb-6 sm:mb-8 overflow-x-auto">
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
    </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-8">Customer Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gov ID Name</label>
          <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{customer.govIdName || ""}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
          <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{customer.mobileNumber || ""}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Name</label>
          <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{customer.preferredName || ""}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{customer.emailAddress || ""}</p>
        </div>
      </div>
  
      {/* Update Customer Button - Placed before connections */}
      <div className="flex justify-start mt-6">
        <button
          onClick={() => navigate(`/edit-customer/${customerId}`, { state: { ...customer } })}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Edit Customer
        </button>
      </div>
  
      {/* Connection Cards */}
      <h2 className="text-xl font-semibold text-gray-700 mt-8">Connections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {connections.length > 0 ? (
          connections.map((connection, index) => (
            <div key={connection.id} className="border rounded-lg shadow p-4 bg-white">
              <h3 className="text-lg font-medium text-gray-900">Connection {index + 1}</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Consumer Number:</span> {connection.consumerId}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Consumer Name:</span> {customer.govIdName || ""}
              </p>
              <button
                onClick={() => navigate(`/view-connection/${connection.id}`, { state: { consumerId: connection.consumerId, customerId: customerId} })}
                className="mt-3 py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No connections found.</p>
        )}
      </div>
  
      {/* Add New Connection Button - Placed after connections */}
      <div className="flex justify-start mt-6">
        <button
          onClick={() => navigate(`/ConnectionForm`, { state: { customerId: customerId} })}
          className="py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Add New Connection
        </button>
      </div>
    </div>
  );
  
};
