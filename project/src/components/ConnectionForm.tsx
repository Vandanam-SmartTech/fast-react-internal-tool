import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveConnection , updateConsumerConnectionDetails } from "../services/api";
import { getDistrictNameByCode, getTalukaNameByCode, getVillageNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../services/api';

interface District {
  code: number;
  nameEnglish: string;
}

interface Taluka {
  code: number;
  nameEnglish: string;
}

interface Village {
  code: number;
  nameEnglish: string;
  postalCode: string;
}

const phaseTypeMapping = {
  "Single-Phase": 1,
  "Three-Phase": 2,
};

const connectionTypeMapping = {
  Residential: 1,
  Commercial: 2,
  Industrial: 3,
  PWW: 4,
};

const addressTypeMapping = {
  Home: 1,
  Hotel: 2,
  Office: 3,
  Charitable: 4,
  Non_Commercial_Education: 5,
  Street_Light: 6,
  Construction: 7,
  Public_Water_Works: 8,
};

const correctionTypeMapping = {
  'Spell Correction': 1,
  'Transfer Ownership': 2,
};




export const ConnectionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const customerId = location.state?.customerId || null;
  const existingConnection = location.state?.existingConnection || null;
  const connectionId = location.state?.connectionId || existingConnection?.id || null;

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [postalCode, setPostalCode] = useState<String>("");
  const [villageCode, setVillageCode] = useState<number>(0);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");
  const [isNameCorrecction, setIsNameCorrection] = useState("No");

  const [formData, setFormData] = useState({
    consumerId: "",
    isMsebConnection: "Yes",
    phase: "Single-Phase",
    connectionType: "Residential",
    addressType: "Home",
    latitude: "",
    longitude: "",
    gstIn: "",
    billedTo: "",
    addressLine1: "",
    addressLine2: "",
    districtCode: 0,
    talukaCode: 0,
    villageCode: 0,
    postalCode: "",
    sectionId: "",
    isNameCorrection: "No",
    correctionType: "",
    monthlyAvgConsumptionUnits: 0,
  });

  useEffect(() => {
    const fetchDistrictsData = async () => {
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistrictsData();
  }, []);

  useEffect(() => {
    if (districtCode) {
        getDistrictNameByCode(districtCode)
            .then((name) => setDistrictName(name))
            .catch(() => setDistrictName("Unknown District"));
    }
}, [districtCode]);

  useEffect(() => {
    const fetchTalukasData = async () => {
      if (districtCode) {
        try {
          const talukaData = await fetchTalukas(districtCode);
          setTalukas(talukaData);
        } catch (err) {
          console.error('Error fetching talukas:', err);
        }
      } else {
        setTalukas([]);
      }
    };
    fetchTalukasData();
  }, [districtCode]);

  useEffect(() => {
    const fetchVillagesData = async () => {
      if (talukaCode) {
        try {
          const villageData = await fetchVillages(talukaCode);
          setVillages(villageData);
        } catch (err) {
          console.error('Error fetching villages:', err);
        }
      } else {
        setVillages([]);
      }
    };
    fetchVillagesData();
  }, [talukaCode]);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (!existingConnection) return;
  
      console.log("Existing Connection Data:", existingConnection);
  
      setFormData((prev) => ({
        ...prev,
        ...existingConnection, // Populate form with existing connection data
      }));
  
      // Fetch and set District Name + Taluka List
      if (existingConnection.districtCode) {
        const districtName = await getDistrictNameByCode(existingConnection.districtCode);
        setDistrictName(districtName);
  
        const talukaData = await fetchTalukas(existingConnection.districtCode);
        setTalukas(talukaData);
      }
  
      // Fetch and set Taluka Name + Village List
      if (existingConnection.talukaCode) {
        const talukaName = await getTalukaNameByCode(existingConnection.talukaCode);
        setTalukaName(talukaName);
  
        const villageData = await fetchVillages(existingConnection.talukaCode);
        setVillages(villageData);
  
        // Now fetch the pincode after villages are fetched
        const selectedVillage = villageData.find(v => v.code === existingConnection.villageCode);
        if (selectedVillage) {
          setPostalCode(selectedVillage.postalCode);
        }
      }
  
      // Fetch and set Village Name
      if (existingConnection.villageCode) {
        const villageName = await getVillageNameByCode(existingConnection.villageCode);
        setVillageName(villageName);
      }
    };
  
    fetchLocationNames();
  }, [existingConnection]); // Removed `villages` dependency to avoid unnecessary re-renders
  
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "isMsebConnection" && value === "No" ? { consumerId: "" } : {}),
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setTalukaCode(0);
    setVillageCode(0);
    setTalukaName(""); 
    setVillageName(""); 
    setPostalCode("");
    setFormData((prev) => ({
      ...prev,
      districtCode: value,
      talukaCode: 0,
      villageCode: 0,
      postalCode: "",
    }));
  };

  const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setTalukaCode(value);

    setVillageCode(0);
    setVillageName("");
    setPostalCode("");
    setFormData((prev) => ({
      ...prev,
      talukaCode: value,
      villageCode: 0,
      postalCode: "",
    }));
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const selectedVillage = villages.find((village) => village.code === value);

    if (selectedVillage) {
      setVillageCode(value);
      setFormData((prev) => ({
        ...prev,
        villageCode: value,
        postalCode: selectedVillage.postalCode,
      }));
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setPostalCode(value);
      setFormData((prev) => ({ ...prev, postalCode: value }));
    };

    const handleNameCorrection = (e) => {
      const { value } = e.target;
      setFormData((prev) => ({
        ...prev,
        isNameCorrection: value,
        correctionType: value === "No" ? "" : prev.correctionType,
      }));
    };
  
    // Handle Correction Type Change
    const handleCorrectionTypeChange = (e) => {
      setFormData((prev) => ({ ...prev, correctionType: e.target.value }));
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Received connectionId:", connectionId);

    console.log("Received CustomerId:", customerId);

    if (!customerId) {
      alert("Customer ID is missing!");
      return;
    }
  


    const isMsebConnection = formData.isMsebConnection === "Yes";
    const isNameCorrectionRequired = formData.isNameCorrection === "Yes"
      ? correctionTypeMapping[formData.correctionType] // 1 or 2 when "Yes"
      : false;

    const connectionData = {
      customerId, // Assuming customerId is in state
      consumerId: formData.consumerId,
      isMsebConnection, // Now a boolean
      isNameCorrectionRequired,
      phaseTypeId: phaseTypeMapping[formData.phase],
      addressTypeId: addressTypeMapping[formData.addressType],
      connectionTypeId: connectionTypeMapping[formData.connectionType],
      correctionTypeId: formData.isNameCorrection === "Yes"
        ? correctionTypeMapping[formData.correctionType]
        : null,
      monthlyAvgConsumptionUnits: formData.monthlyAvgConsumptionUnits,
      districtCode: formData.districtCode,
      talukaCode: formData.talukaCode,
      villageCode: formData.villageCode,
      postalCode: formData.postalCode,
      gstIn: formData.gstIn,
      latitude: formData.latitude,
      longitude: formData.longitude,
      sectionId: formData.sectionId,
      billedTo: formData.billedTo,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
    };



    try {
            if (connectionId) {
                console.log("Updating existing connection with ID:", connectionId);
                const response = await updateConsumerConnectionDetails(connectionId, connectionData);
                console.log("Update response:", response);
                alert("Connection details updated successfully!");
                navigate(`/view-connection/${connectionId}`, { state: { consumerId: formData.consumerId, customerId } });
            } else {
                console.log("Saving new connection...");
                const connectionId = await saveConnection(connectionData);
                if (connectionId) {
                    console.log("New connection saved with ID:", connectionId);
                    navigate(`/view-connection/${connectionId}`, { state: { consumerId: formData.consumerId, customerId, connectionId }});
                }
            }
        } catch (error) {
            console.error("Error in connection process:", error);
            alert("Failed to process connection. Please try again.");
        }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">{existingConnection ? "Update Connection" : "Add New Connection"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MSEB Connection Question - Full Width */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Does the customer currently have an active grid connection with the local electricity provider (e.g., MSEB or BESCOM)?
          </label>
          <div className="mt-2 flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="isMsebConnection"
                value="Yes"
                onChange={handleChange}
                className="focus:ring-blue-500 text-blue-600 border-gray-300"
                checked={formData.isMsebConnection === "Yes"}
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="isMsebConnection"
                value="No"
                onChange={handleChange}
                className="focus:ring-blue-500 text-blue-600 border-gray-300"
                checked={formData.isMsebConnection === "No"}
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
  
        {/* Two-Column Layout for Other Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
          <input
            type="text"
            id="consumerId"
            name="consumerId"
            value={formData.consumerId}
            onChange={handleChange}
            placeholder="000000000000"
            disabled={formData.isMsebConnection === "No"}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm disabled:bg-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
          <input
            type="text"
            name="gstIn"
            value={formData.gstIn}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Billed To</label>
          <input
            type="text"
            name="billedTo"
            value={formData.billedTo}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              name="distrct"
              id="district"
              value={districtCode}
              onChange={handleDistrictChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              <option value={0}>{districtName || "Select District"}</option>
              {districts.map((district) => (
                <option key={district.nameEnglish} value={district.code}>
                  {district.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taluka</label>
            <select
              name="talukaCode"
              id="taluka"
              value={talukaCode}
              onChange={handleTalukaChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              <option value={0}>{talukaName || "Select Taluka"}</option>
              {talukas.map((taluka) => (
                <option key={taluka.nameEnglish} value={taluka.code}>
                  {taluka.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Village</label>
            <select
              name="villageCode"
              id="village"
              value={villageCode}
              onChange={handleVillageChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              <option value={0}>{villageName || "Select Village"}</option>
              {villages.map((village) => (
                <option key={village.code} value={village.code}>
                  {village.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode || ''}  // Ensure it uses formData.pincode
              onChange={handlePostalCodeChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phase Type</label>
          <select
            name="phase"
            value={formData.phase}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          >
            {Object.keys(phaseTypeMapping).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Connection Type</label>
          <select
            name="connectionType"
            value={formData.connectionType}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          >
            {Object.keys(connectionTypeMapping).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Type</label>
          <select
            name="addressType"
            value={formData.addressType}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          >
            {Object.keys(addressTypeMapping).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Average Consumption Units</label>
          <input
            type="number"
            name="monthlyAvgConsumptionUnits"
            value={formData.monthlyAvgConsumptionUnits}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Section ID</label>
          <input
            type="text"
            name="sectionId"
            value={formData.sectionId}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700">
    Does the connection require a name correction?
  </label>
  <div className="mt-2 flex items-center space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="nameCorrection"
        value="Yes"
        onChange={handleNameCorrection}
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
        checked={formData.isNameCorrection === "Yes"}
      />
      <span className="text-sm text-gray-700">Yes</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="nameCorrection"
        value="No"
        onChange={handleNameCorrection}
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
        checked={formData.isNameCorrection === "No"}
      />
      <span className="text-sm text-gray-700">No</span>
    </label>
  </div>
</div>

{/* Correction Type should be in a single column */}
{formData.isNameCorrection === "Yes" && (
  <div className="col-span-1">
    <label className="block text-sm font-medium text-gray-700">
      Select Correction Type
    </label>
    <select
      name="correctionType"
      value={formData.correctionType || ""}
      onChange={handleCorrectionTypeChange}
      className="mt-1 block w-full p-2 border rounded-md shadow-sm"
    >
      <option value="" disabled>
        Select an option
      </option>
      <option value="Spell Correction">Spell Correction</option>
      <option value="Transfer Ownership">Transfer Ownership</option>
    </select>
  </div>
)}

  
        {/* Submit Button - Full Width */}
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
          >
            {existingConnection ? "Update Connection" : "Save Connection"}
          </button>
        </div>
        
      </form>
    </div>
  );
  
};
