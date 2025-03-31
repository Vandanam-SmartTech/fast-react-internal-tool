import { useState } from "react";
import { useParams } from "react-router-dom";
import { materialformDefaults } from "../constants/materialformdefaults";
import { postMaterialData } from "../services/api";

export default function MaterialForm() {
    const [formData, setFormData] = useState(materialformDefaults);
    const { id: connectionId } = useParams(); // Route param as connectionId
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!connectionId) {
        alert("Connection ID is missing from URL!");
        return;
      }
  
      try {
        const response = await postMaterialData(connectionId, formData);
        console.log("Success:", response.data);
        alert("Data submitted successfully!");
      } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to submit data. Please check inputs or try again.");
      }
    };
  
    return (  
      <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
        <div className="w-full lg:w-[85%]">
        <h2 className="text-2xl font-semibold mb-6   ">
            Material Details Form
          </h2>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="max-w-6xl bg-white rounded-lg shadow-lg p-6 sm:p-8">
              {/* <legend className="text-md sm:text-lg font-bold text-blue-700 px-2">Installation Details</legend> */}
  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
  
                {/* Example Fields */}
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">System KW:</label>
                  <input
                    type="text"
                    name="systemKw"
                    value={formData.systemKw}
                    onChange={handleChange}
                    className="p-2 border border-blue-500 rounded-md bg-white text-blue-900 text-base sm:text-lg w-full"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Make Of Module:</label>
                  <input
                    type="text"
                    name="makeOfModule"
                    value={formData.makeOfModule}
                    onChange={handleChange}
                    className="p-2 border border-blue-500 rounded-md bg-white text-blue-900 text-base sm:text-lg w-full"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">ALMM Model Number:</label>
                  <input
                    type="text"
                    name="almmModelNo"
                    value={formData.almmModelNo}
                    onChange={handleChange}
                    className="p-2 border border-blue-500 rounded-md bg-white text-blue-900 text-base sm:text-lg w-full"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Serial Number Of Modules:</label>
                  <input
                    type="text"
                    name="serialNoOfModules"
                    value={formData.serialNoOfModules}
                    onChange={handleChange}
                    className="p-2 border border-blue-500 rounded-md bg-white text-blue-900 text-base sm:text-lg w-full"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Wattage Per Module:</label>
                  <input
                    type="text"
                    name="wattagePerModule"
                    value={formData.wattagePerModule}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Number Of Modules:</label>
                  <input
                    type="text"
                    name="noOfModules"
                    value={formData.noOfModules}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Total Capacity:</label>
                  <input
                    type="text"
                    name="totalCapacity"
                    value={formData.totalCapacity}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Warranty Details:</label>
                  <input
                    type="text"
                    name="warrantyDetails"
                    value={formData.warrantyDetails}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Inverter Module Number:</label>
                  <input
                    type="text"
                    name="inverterModuleNo"
                    value={formData.inverterModuleNo}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Inverter Make:</label>
                  <input
                    type="text"
                    name="inverterMake"
                    value={formData.inverterMake}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Rating:</label>
                  <input
                    type="text"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Charge Controller Type:</label>
                  <input
                    type="text"
                    name="chargeControllerType"
                    value={formData.chargeControllerType}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Inverter Capacity:</label>
                  <input
                    type="text"
                    name="inverterCapacity"
                    value={formData.inverterCapacity}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Earthing Rod:</label>
                  <input
                    type="text"
                    name="earthingRod"
                    value={formData.earthingRod}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Date Of Installation:</label>
                  <input
                    type="date"
                    name="dateOfInstallation"
                    value={formData.dateOfInstallation}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Capacity Type:</label>
                  <input
                    type="text"
                    name="capacityType"
                    value={formData.capacityType}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">Project Model:</label>
                  <input
                    type="text"
                    name="projectModel"
                    value={formData.projectModel}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">ReInstalled Capacity Rooftop:</label>
                  <input
                    type="text"
                    name="reInstalledCapacityRooftop"
                    value={formData.reInstalledCapacityRooftop}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">ReInstalled Capacity Ground:</label>
                  <input
                    type="text"
                    name="reInstalledCapacityGround"
                    value={formData.reInstalledCapacityGround}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-600 mb-1">ReInstalled Capacity Total:</label>
                  <input
                    type="text"
                    name="reInstalledCapacityTotal"
                    value={formData.reInstalledCapacityTotal}
                    onChange={handleChange}
                    className="p-2 border-2 border-blue-500 rounded-md bg-white text-blue-900 text-lg"
                  />
                </div>
  
                {/* Add more fields similarly as per your form structure */}
              </div>
  
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 text-base sm:text-lg font-bold rounded-md hover:bg-blue-500 transition w-full sm:w-auto"
                >
                  Submit
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }