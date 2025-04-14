import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postMaterialData } from "../services/api";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function MaterialForm() {
  const [formData, setFormData] = useState({
    systemKw: 0,                              
    makeOfModule: "",                         
    almmModelNo: "",                          
    serialNoOfModules: "",                    
    wattagePerModule: 0,                      
    noOfModules: 0,                           
    totalCapacity: 0,                         
    warrantyDetails: "",                      
    inverterModuleNo: "",                     
    inverterMake: "",                         
    rating: "",                               
    chargeControllerType: "",                 
    inverterCapacity: 0,                      
    earthingRod: 0,                           
    dateOfInstallation: "",                   
    capacityType: "",                         
    projectModel: "",                         
    reInstalledCapacityRooftop: 0,            
    reInstalledCapacityGround: 0,             
    reInstalledCapacityTotal: 0               
  });
  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId;
  const [scanning, setScanning] = useState(false);

  const handleScan = (scannedValue: string) => {
    setFormData((prev) => ({
      ...prev,
      serialNoOfModules: scannedValue,
    }));
    setScanning(false);
  };
  
  

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
      navigate("/OnboardedCustomers");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit data. Please check inputs or try again.");
    }
  };

  return (
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full lg:w-[85%]">
        <h2 className="text-2xl font-semibold mb-6">Material Details</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <InputField name="systemKw" label="System KW" value={formData.systemKw} handleChange={handleChange} type="number" />
              <InputField name="makeOfModule" label="Make Of Module" value={formData.makeOfModule} handleChange={handleChange} />
              <InputField name="almmModelNo" label="ALMM Model Number" value={formData.almmModelNo} handleChange={handleChange} />
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
  <div className="flex flex-col">
    <label className="block text-sm font-medium text-gray-700">
      Serial Number Of Modules:
    </label>
    <div className="flex gap-2 mt-1">
      <input
        type="text"
        name="serialNoOfModules"
        value={formData.serialNoOfModules}
        onChange={handleChange}
        className="block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => setScanning(true)}
        className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700 transition"
      >
        Scan
      </button>
    </div>
  </div>

  {scanning && (
    <div className="mt-4">
      <BarcodeScannerComponent
        width={400}
        height={300}
        onUpdate={(err, result) => {
          if (result) {
            handleScan(result.text);
          }
        }}
      />
      <button
        type="button"
        onClick={() => setScanning(false)}
        className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
      >
        Cancel
      </button>
    </div>
  )}
</div>


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

            <div className="flex justify-center sm:justify-start mt-4 sm:mt-6">
              <button
                type="submit"
                className="py-3 px-6 w-full sm:w-auto bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Save Material Data
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
      <label className="block text-sm font-medium text-gray-700">{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}
