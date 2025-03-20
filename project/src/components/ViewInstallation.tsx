import { useEffect, useState } from "react";
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
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 col-span-1 md:col-span-2">Installation Details</h2>
      
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.descriptionOfInstallation || ""}</p>
      </div>
      

      <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
        <button
          onClick={() => navigate(`/InstallationForm`, { state: { existingInstallation: installation, installationId: id, connectionId ,consumerId}})}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
        >
          Edit Installation
        </button>

        <button
          onClick={() => navigate(`/SystemSpecifications`, { state: { connectionId }})}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
        >
          Get Recommendation
        </button>
      </div>
    </div>
  );
};
