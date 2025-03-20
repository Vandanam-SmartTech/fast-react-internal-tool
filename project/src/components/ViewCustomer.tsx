import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation} from "react-router-dom";
import { getCustomerById, getConnectionsByCustomerId } from "../services/api";

export const ViewCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;

  useEffect(() => {
    const fetchCustomer = async () => {
      if (id) {
        const data = await getCustomerById(Number(id));
        setCustomer(data);
      }
    };

    const fetchConnections = async () => {
      if (id) {
        const data = await getConnectionsByCustomerId(Number(id));
        if (data) setConnections(data);
      }
    };

    fetchCustomer();
    fetchConnections();
  }, [id]);

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Customer Details</h2>
  
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
          onClick={() => navigate(`/CustomerForm`, { state: customer })}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Update Customer
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
                onClick={() => navigate(`/view-connection/${connection.id}`, { state: { consumerId: connection.consumerId, customerId: id } })}
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
          onClick={() => navigate(`/ConnectionForm`, { state: { customerId: id } })}
          className="py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Add New Connection
        </button>
      </div>
    </div>
  );
  
};
