import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getInstallationByConsumerId } from "../services/api";

export const ViewInstallation = () => {
  const { id } = useParams<{ id: string }>();
  const [installation, setInstallation] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const consumerId = location.state?.consumerId; // Use consumerId from navigation state if available
  const connectionId = location.state?.connectionId;
  const installationId = location.state?.installationId || id;
  const customerId = location.state?.customerId;

  const installationSpaceTypeMapping: { [key: number]: string } = {
    1: "Slab",
    2: "Clay Tiles",
    3: "Metal Sheets",
    4: "Plastic Sheets",
    5: "Bathroom Slab",
    6: "Cement Sheets",
    7: "On Ground",
  };

  useEffect(() => {
    const fetchInstallation = async () => {
      if (consumerId && installationId) {
        const data = await getInstallationByConsumerId(Number(consumerId));
        
        if (data && Array.isArray(data)) {
          // Find the specific installation based on installationId
          const selectedInstallation = data.find(inst => inst.id === Number(installationId));
          setInstallation(selectedInstallation || null);
        }
      }
    };
    fetchInstallation();
  }, [consumerId, installationId]);

  if (!installation) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-center space-x-3 col-span-1 md:col-span-2 mb-4">
      {/* Backward Arrow Button */}
      <button
        onClick={() => navigate(`/view-connection/${connectionId}`,{ state: { consumerId, customerId, connectionId }})}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-700">View Installation Details</h2>
    </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Installation Space Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installationSpaceTypeMapping[installation.installationSpaceTypeId] || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.availableEastWestLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.availableSouthNorthLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">AC Wire Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.acWireLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">DC Wire Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.dcWireLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Earthing Wire Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.earthingWireLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Number of GP Pipes</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.numberOfGpPipes || ""}</p>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.descriptionOfInstallation || ""}</p>
      </div>
      

      <div className="col-span-1 md:col-span-2 flex justify-center mt-6 space-x-14">
        <button
          onClick={() => navigate(`/InstallationForm`, { state: { existingInstallation: installation, installationId: id, connectionId ,consumerId}})}
          className="py-3 px-16 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
        >
          Edit Installation
        </button>

        <button
          onClick={() => navigate(`/view-connection/${connectionId}`, { state: { consumerId, customerId, connectionId }})}
          className="py-3 px-16 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 mx-2"
        >
          Done
        </button>
      </div>
    </div>

  );
};
