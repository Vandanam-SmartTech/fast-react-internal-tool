import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveInstallation, updateInstallationSpaceDetails } from "../services/api";


export const InstallationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId || null;
  const customerId = location.state?.customerId || null;
  const consumerId = location.state?.consumerId || null;
  const existingInstallation = location.state?.existingInstallation || null;
  const installationId = location.state?.installationId || existingInstallation?.id || null;

  const installationSpaceTypeMapping = {
    'Slab': 1,
    'Clay Tiles': 2,
    'Metal Sheets': 3,
    'Plastic Sheets': 4,
    'Bathroom Slab': 5,
    'Cement Sheets': 6,
    'On Ground': 7,
  };

  useEffect(() => {
    if (existingInstallation) {
        console.log("Existing Installation Data:", existingInstallation);

        setFormData((prev) => ({
            ...prev,
            ...existingInstallation, // Spread existing data into form
            spaceType: Object.keys(installationSpaceTypeMapping).find(
                key => installationSpaceTypeMapping[key] === existingInstallation.installationSpaceTypeId
            ) || "Slab" // Convert ID to readable text for dropdown
        }));
    }
}, [existingInstallation]);

  


  const [formData, setFormData] = useState({
    acWireLengthFt: 0,
    dcWireLengthFt: 0,
    earthingWireLengthFt: 0,
    numberOfGpPipes: 0,
    descriptionOfInstallation:'',
    availableSouthNorthLengthFt: 0,
    availableEastWestLengthFt: 0,
    spaceType:'Slab',
  });
  


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Received connectionId:", connectionId);
    console.log("Received consumerId:", consumerId);
    console.log("Received customerId:", customerId);
    console.log("Installation ID:", installationId);

    if (!connectionId || !consumerId) {
        alert("Connection ID and Consumer ID are required!");
        return;
    }

    // Ensure space type ID mapping is correct
    const installationSpaceTypeId = installationSpaceTypeMapping[formData.spaceType] || null;
    if (!installationSpaceTypeId) {
        alert("Invalid installation space type.");
        return;
    }

    // Construct installation data object
    const installationData = {
        customerId: customerId || null, // Ensure customerId is passed correctly
        connectionId,
        consumerId,
        installationSpaceTypeId,
        availableEastWestLengthFt: formData.availableEastWestLengthFt,
        availableSouthNorthLengthFt: formData.availableSouthNorthLengthFt,
        acWireLengthFt: formData.acWireLengthFt,
        dcWireLengthFt: formData.dcWireLengthFt,
        earthingWireLengthFt: formData.earthingWireLengthFt,
        descriptionOfInstallation: formData.descriptionOfInstallation,
        numberOfGpPipes: formData.numberOfGpPipes,
    };

    try {
        if (installationId) {
            console.log("Updating existing installation with ID:", installationId);
            const response = await updateInstallationSpaceDetails(installationId, installationData);
            console.log("Update response:", response);
            alert("Installation details updated successfully!");
            navigate(`/view-installation/${installationId}`, { state: { consumerId, connectionId , installationId: installationId} });
        } else {
            console.log("Saving new installation...");
            const installationId = await saveInstallation(installationData);
            if (installationId) {
                console.log("New Installation saved with ID:", installationId);
                navigate(`/view-installation/${installationId}`, { state: { consumerId, connectionId, installationId: installationId } });
            }
        }
    } catch (error) {
        console.error("Error in installation process:", error);
        alert("Failed to process installation. Please try again.");
    }
};



  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">{existingInstallation ? "Update Installation" : "Add New Installation"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Installation Space Type</label>
          <select
            name="spaceType"
            value={formData.spaceType}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          >
            {Object.keys(installationSpaceTypeMapping).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet)</label>
          <input
            type="number"
            name="availableEastWestLengthFt"
            value={formData.availableEastWestLengthFt}
            onChange={handleChange}
            placeholder="eg.10"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet)</label>
          <input
            type="number"
            name="availableSouthNorthLengthFt"
            value={formData.availableSouthNorthLengthFt}
            placeholder='eg.10'
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">AC Wire Length (Feet)</label>
          <input
            type="number"
            id="acWireLengthFt"
            name="acWireLengthFt"
            value={formData.acWireLengthFt}
            placeholder='eg.10'
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">DC Wire Length (Feet)</label>
          <input
            type="number"
            id="dcWireLengthFt"
            name="dcWireLengthFt"
            value={formData.dcWireLengthFt}
            placeholder='eg.10'
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Earthing Wire Length (Feet)</label>
          <input
            type="number"
            id="earthingWireLengthFt"
            name="earthingWireLengthFt"
            value={formData.earthingWireLengthFt}
            placeholder='eg.10'
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of GP Pipes</label>
          <input
            type="number"
            id="numberOfGpPipes"
            name="numberOfGpPipes"
            value={formData.numberOfGpPipes}
            placeholder='eg.10'
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
          <input
            type="text"
            id="descriptionOfInstallation"
            name="descriptionOfInstallation"
            value={formData.descriptionOfInstallation}
            placeholder='eg.10'
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
  
        {/* Submit Button - Full Width */}
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
          >
            {existingInstallation ? "Update Installation" : "Save Installation"}
          </button>
        </div>
        
      </form>
    </div>
  );
  
};
