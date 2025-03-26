import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConnectionByConsumerId, getDistrictNameByCode, getTalukaNameByCode, getVillageNameByCode, getInstallationByConsumerId } from "../services/api"; // Import API functions
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Stepper, Step } from "react-form-stepper";

export const ViewConnection = () => {
  const { id } = useParams<{ id: string }>(); // Connection ID from URL
  const location = useLocation();
  const consumerId = location.state?.consumerId; // Get consumerId from state
  const [connection, setConnection] = useState<any>(null);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");
  const customerId = location.state?.customerId;
  const navigate = useNavigate();
  const [installations, setInstallations] = useState<any[]>([]);

  const phaseTypeMapping: { [key: number]: string } = {
    1: "Single-Phase",
    2: "Three-Phase",
  };

  const installationSpaceTypeMapping: { [key: number]: string } = {
    1: "Slab",
    2: "Clay Tiles",
    3: "Metal Sheets",
    4: "Plastic Sheets",
    5: "Bathroom Slab",
    6: "Cement Sheets",
    7: "On Ground",
  };

  const connectionTypeMapping: { [key: number]: string } = {
    1: "Residential",
    2: "Commercial",
    3: "Industrial",
    4: "PWW",
  };

  const correctionTypeMapping: { [key: number]: string } = {
    1: "Spell Correction",
    2: "Transfer Ownership",
  };

  const addressTypeMapping: { [key: number]: string } = {
    1: "Home",
    2: "Hotel",
    3: "Office",
    4: "Charitable",
    5: "Non_Commercial_Education",
    6: "Street_Light",
    7: "Construction",
    8: "Public_Water_Works",
  };




  useEffect(() => {
    const fetchConnection = async () => {
      if (!consumerId) {
        console.error("Consumer ID not found!");
        return;
      }

      // Fetch connection details using consumerId
      const data = await getConnectionByConsumerId(Number(consumerId));
      setConnection(data);
    };

    fetchConnection();
  }, [consumerId]);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (connection) {
        if (connection.districtCode) {
          const name = await getDistrictNameByCode(connection.districtCode);
          setDistrictName(name);
        }
        if (connection.talukaCode) {
          const name = await getTalukaNameByCode(connection.talukaCode);
          setTalukaName(name);
        }
        if (connection.villageCode) {
          const name = await getVillageNameByCode(connection.villageCode);
          setVillageName(name);
        }
      }
    };

    fetchLocationNames();
  }, [connection]);

  useEffect(() => {
    const fetchInstallations = async () => {
      if (!consumerId) return;
      const installationsData = await getInstallationByConsumerId(Number(consumerId));
      if (installationsData) {
        setInstallations(installationsData);
      }
    };

    fetchInstallations();
  }, [consumerId]);

  if (!connection) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-center space-x-3 col-span-1 md:col-span-2 mb-2">
      {/* Backward Arrow Button */}
      <button
        onClick={() => navigate(`/view-customer/${customerId}`,{ state: { consumerId, customerId, connectionId: id }})}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-700">View Connection Details</h2>
    </div>
    <div className="col-span-2 mb-4">
        <Stepper activeStep={1} styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }}>
          <Step label="Customer Details" />
          <Step label="Connection Details" />
          <Step label="Installation Space Details" />
          <Step label="System Specifications" />
        </Stepper>
      </div>
  
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Does the customer currently have an active grid connection with the local electricity provider (e.g., MSEB or BESCOM)?
        </label>
        <div className="mt-2 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="isMsebConnection"
              value="Yes"
              checked={connection.isMsebConnection === true}
              readOnly
              className="focus:ring-blue-500 text-blue-600 border-gray-300"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="isMsebConnection"
              value="No"
              checked={connection.isMsebConnection === false}
              readOnly
              className="focus:ring-blue-500 text-blue-600 border-gray-300"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>
  
      {connection.isMsebConnection && (
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
          <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">
            {connection.consumerId || ""}
          </p>
        </div>
      )}
  
      <div>
        <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.gstIn || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Billed To</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.billedTo || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">District</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{districtName || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Taluka</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{talukaName || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Village</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{villageName || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Pincode</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.postalCode || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.addressLine1 || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.addressLine2 || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{addressTypeMapping[connection.addressTypeId] || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Connection Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connectionTypeMapping[connection.connectionTypeId] || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phase Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">
            {phaseTypeMapping[connection.phaseTypeId] || ""}
        </p>
      </div>
      
    
      <div>
        <label className="block text-sm font-medium text-gray-700">Monthly Average Consumption Units</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.monthlyAvgConsumptionUnits || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Section ID</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.sectionId || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Latitude</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.latitude || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Longitude</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{connection.longitude || ""}</p>
      </div>
      <div>
  <label className="block text-sm font-medium text-gray-700">
    Does the connection require a name correction?
  </label>
  <div className="mt-2 flex items-center space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="nameCorrection"
        value="Yes"
        checked={connection.isNameCorrectionRequired === true}
        readOnly
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
      />
      <span className="text-sm text-gray-700">Yes</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="nameCorrection"
        value="No"
        checked={connection.isNameCorrectionRequired === false}
        readOnly
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
      />
      <span className="text-sm text-gray-700">No</span>
    </label>
  </div>

  {/* Show correction type only if isNameCorrectionRequired is true */}
  {connection.isNameCorrectionRequired && (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Correction Type</label>
      <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">
      {correctionTypeMapping[connection.correctionTypeId] || ""}
      </p>
    </div>
  )}
</div>


  
      {/* Edit Connection Button (Before Installations) */}
      <div className="col-span-1 md:col-span-2 flex justify-start mt-6">
        <button
          onClick={() => navigate(`/ConnectionForm`, { state: { existingConnection: connection, connectionId: id, consumerId, customerId} })}
          className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
        >
          Edit Connection
        </button>
      </div>
  
      {/* Installation Cards */}
      {installations.length > 0 ? (
  <>
    <h2 className="text-2xl font-semibold text-gray-700 mt-6 col-span-1 md:col-span-2">Installations</h2>
    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      {installations.map((installation, index) => (
        <div key={installation.id} className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold">Installation {index + 1}</h3>
          <p className="text-sm text-gray-600">
            <strong>Space Type:</strong> {installationSpaceTypeMapping[installation.installationSpaceTypeId] || "Unknown"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>East-West Length:</strong> {installation.availableEastWestLengthFt} ft
          </p>
          <p className="text-sm text-gray-600">
            <strong>South-North Length:</strong> {installation.availableSouthNorthLengthFt} ft
          </p>
          <button
            onClick={() =>
              navigate(`/view-installation/${installation.id}`, { state: { connectionId: id, consumerId: consumerId, customerId } })
            }
            className="mt-2 py-1 px-3 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600"
          >
            View
          </button>
        </div>
      ))}
    </div>
  </>
) : (
  <p className="text-gray-500">No installations found.</p>
)}

  
      {/* Add New Installation Button (After Installations) */}
      <div className="col-span-1 md:col-span-2 flex justify-center mt-6 space-x-14">
  <button
    onClick={() => {
      console.log("Navigating with connectionId:", id);
      console.log("Navigating with consumerId:", consumerId);
      console.log("Navigating with customerId:",customerId);
      if (!id || !consumerId) {
        alert("Connection ID and Consumer Id is missing!");
        return;
      }
      navigate(`/InstallationForm`, { state: { connectionId: id, consumerId: consumerId, customerId } });
    }}
    className="py-3 px-6 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
  >
    Add New Installation
  </button>
  <button
    onClick={() => navigate(`/SystemSpecifications`, { state: { connectionId: id, consumerId: consumerId, customerId}})}
          className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
  >
    Get Recommendation
  </button>
</div>

    <div className="col-span-1 md:col-span-2 flex justify-start mt-6">
        <button
          className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
        >
          Do you want to Onboard the Customer?
        </button>
      </div>

    </div>
  );
  
};
