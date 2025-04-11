import { useState } from "react";
import { useLocation } from "react-router-dom";
import { materialformDefaults } from "../constants/materialformdefaults";
import { postMaterialData } from "../services/api";

export default function MaterialForm() {
  const [formData, setFormData] = useState(materialformDefaults);
  const location = useLocation();
  const connectionId = location.state?.connectionId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    const parsedValue =
      type === "number"
        ? value === ""
          ? ""
          : Number(value)
        : value;

    setFormData({ ...formData, [name]: parsedValue });
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
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full lg:w-[85%]">
        <h2 className="text-2xl font-semibold mb-6">Material Details Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="max-w-6xl bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <InputField name="systemKw" label="System KW" value={formData.systemKw} handleChange={handleChange} type="number" />
              <InputField name="makeOfModule" label="Make Of Module" value={formData.makeOfModule} handleChange={handleChange} />
              <InputField name="almmModelNo" label="ALMM Model Number" value={formData.almmModelNo} handleChange={handleChange} />
              <InputField name="serialNoOfModules" label="Serial Number Of Modules" value={formData.serialNoOfModules} handleChange={handleChange} />
              <InputField name="wattagePerModule" label="Wattage Per Module" value={formData.wattagePerModule} handleChange={handleChange} type="number" />
              <InputField name="noOfModules" label="Number Of Modules" value={formData.noOfModules} handleChange={handleChange} type="number" />
              <InputField name="totalCapacity" label="Total Capacity" value={formData.totalCapacity} handleChange={handleChange} type="number" />
              <InputField name="warrantyDetails" label="Warranty Details" value={formData.warrantyDetails} handleChange={handleChange} />
              <InputField name="inverterModuleNo" label="Inverter Module Number" value={formData.inverterModuleNo} handleChange={handleChange} />
              <InputField name="inverterMake" label="Inverter Make" value={formData.inverterMake} handleChange={handleChange} />
              <InputField name="rating" label="Rating" value={formData.rating} handleChange={handleChange} />
              <InputField name="chargeControllerType" label="Charge Controller Type" value={formData.chargeControllerType} handleChange={handleChange} />
              <InputField name="inverterCapacity" label="Inverter Capacity" value={formData.inverterCapacity} handleChange={handleChange} type="number" />
              <InputField name="earthingRod" label="Earthing Rod" value={formData.earthingRod} handleChange={handleChange} type="number" />
              <InputField name="dateOfInstallation" label="Date Of Installation" value={formData.dateOfInstallation} handleChange={handleChange} type="date" />
              <InputField name="capacityType" label="Capacity Type" value={formData.capacityType} handleChange={handleChange} />
              <InputField name="projectModel" label="Project Model" value={formData.projectModel} handleChange={handleChange} />
              <InputField name="reInstalledCapacityRooftop" label="ReInstalled Capacity Rooftop" value={formData.reInstalledCapacityRooftop} handleChange={handleChange} type="number" />
              <InputField name="reInstalledCapacityGround" label="ReInstalled Capacity Ground" value={formData.reInstalledCapacityGround} handleChange={handleChange} type="number" />
              <InputField name="reInstalledCapacityTotal" label="ReInstalled Capacity Total" value={formData.reInstalledCapacityTotal} handleChange={handleChange} type="number" />
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

type InputFieldProps = {
  name: string;
  label: string;
  value: string | number;
  type?: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ name, label, value, handleChange, type = "text" }: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-gray-600 mb-1">{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        className="p-2 border border-blue-500 rounded-md bg-white text-blue-900 text-base sm:text-lg w-full"
      />
    </div>
  );
}
