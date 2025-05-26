import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postMaterialData, fetchBrandCapacityDetails } from "../services/api";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function MaterialForm() {
  const [formData, setFormData] = useState({
    systemKw: 0,
    makeOfModule: "",
    almmModelNo: "",
    // serialNoOfModules: [],
    wattagePerModule: null,
    noOfModules: null,
    warrantyDetails: "",
    inverterModuleNo: "",
    inverterMake: "",
    rating: "",
    chargeControllerType: "",
    inverterCapacity: null,
    earthingRod: null,
    dateOfInstallation: "",
    capacityType: "",
    projectModel: "",
    reInstalledCapacityRooftop: null,
    reInstalledCapacityGround: null,
    reInstalledCapacityTotal: null
  });
  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId;
  const [scanningIndex, setScanningIndex] = useState(false);

  // const handleScan = (scannedValue: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     serialNoOfModules: scannedValue,
  //   }));
  //   setScanning(false);
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!connectionId) return;

  //     try {
  //       const data = await fetchBrandCapacityDetails(connectionId);

  //       console.log("Fetched data:", data);

  //       setFormData((prev) => ({
  //         ...prev,
  //         systemKw: data.customerSelectedKW,
  //         makeOfModule: data.customerSelectedBrand || "",
  //       }));

  //     } catch (error) {
  //       console.error("Error fetching details:", error);
  //     }
  //   };

  //   fetchData();
  // }, [connectionId]);



 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;

  if (name === "systemKw" || name === "makeOfModule" || name === "wattagePerModule") {
    // If selected "Other", enable related custom field
    if (value === "Other") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        [`custom${capitalize(name)}`]: "", // Reset custom field
      }));
    } else {
      // Reset custom field and set value normally
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
        [`custom${capitalize(name)}`]: "",
      }));
    }
  } else {
    const parsedValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;

    setFormData({ ...formData, [name]: parsedValue });
  }
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!connectionId) {
    alert("Connection ID is missing from URL!");
    return;
  }

  // Use custom values if "Other" is selected
  const dataToSubmit = {
    ...formData,
    systemKw:
      formData.systemKw === "Other" ? formData.customSystemKw : formData.systemKw,
    makeOfModule:
      formData.makeOfModule === "Other"
        ? formData.customMakeOfModule
        : formData.makeOfModule,
    wattagePerModule:
      formData.wattagePerModule === "Other"
        ? formData.customWattagePerModule
        : formData.wattagePerModule,
  };

  try {
    const response = await postMaterialData(connectionId, dataToSubmit);
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
              {/* <InputField name="systemKw" label="System KW" value={formData.systemKw} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">System KW</label>
                <select
  name="systemKw"
  value={formData.systemKw}
  onChange={handleChange}
  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
>
  <option value="">Select System kW</option>
  {[...Array(24)].map((_, i) => {
    const value = ((i + 1) * 1.1).toFixed(1); // e.g., 2.2, 3.3...
    return <option key={value} value={value}>{value}</option>;
  })}
  <option value="Other">Other</option>
</select>

{formData.systemKw === "Other" && (
  <input
    type="number"
    step="0.1"
    name="customSystemKw"
    placeholder="Enter custom kW"
    value={formData.customSystemKw || ""}
    onChange={handleChange}
    className="mt-2 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
)}


              </div>
              {/* <InputField name="makeOfModule" label="Make Of Module" value={formData.makeOfModule} handleChange={handleChange} /> */}
              <div>
  <label className="block text-sm font-medium text-gray-700">Make of Module</label>
  <select
    name="makeOfModule"
    value={formData.makeOfModule}
    onChange={handleChange}
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  >
    <option value="">Select Make of Module</option>
    <option value="Vikram Solar">Vikram Solar</option>
    <option value="Waaree Energies">Waaree Energies</option>
    <option value="Tata Power Solar">Tata Power Solar</option>
    <option value="Adani Solar">Adani Solar</option>
    <option value="RenewSys">RenewSys</option>
    <option value="Goldi Solar">Goldi Solar</option>
    <option value="Saatvik Green">Saatvik Green</option>
    <option value="Jakson Group">Jakson Group</option>
    <option value="Premier Energies">Premier Energies</option>
    <option value="Other">Other</option>
  </select>

  {formData.makeOfModule === "Other" && (
    <input
      type="text"
      name="customMakeOfModule"
      placeholder="Enter custom make of module"
      value={formData.customMakeOfModule || ""}
      onChange={handleChange}
      className="mt-2 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  )}
</div>


              {/* <InputField name="almmModelNo" label="ALMM Model Number" value={formData.almmModelNo} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ALMM Model Number</label>
                <input
                  type="text"
                  name="almmModelNo"
                  value={formData.almmModelNo}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* <InputField name="noOfModules" label="Number Of Modules" value={formData.noOfModules} handleChange={handleChange} type="number" /> */}




              {/* <InputField name="wattagePerModule" label="Wattage Per Module" value={formData.wattagePerModule} handleChange={handleChange} type="number" /> */}
             <div>
  <label className="block text-sm font-medium text-gray-700">Wattage Per Module</label>
  <select
    name="wattagePerModule"
    value={formData.wattagePerModule}
    onChange={handleChange}
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  >
    <option value="">Select Wattage</option>
    <option value="540">540</option>
    <option value="545">545</option>
    <option value="550">550</option>
    <option value="555">555</option>
    <option value="560">560</option>
    <option value="570">570</option>
    <option value="580">580</option>
    <option value="590">590</option>
    <option value="Other">Other</option>
  </select>

  {formData.wattagePerModule === "Other" && (
    <input
      type="number"
      name="customWattage"
      placeholder="Enter custom wattage"
      value={formData.customWattage || ""}
      onChange={handleChange}
      className="mt-2 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  )}
</div>



              {/* <InputField name="warrantyDetails" label="Warranty Details" value={formData.warrantyDetails} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Warranty Details</label>
                <input
                  type="text"
                  name="warrantyDetails"
                  value={formData.warrantyDetails}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="inverterModuleNo" label="Inverter Module Number" value={formData.inverterModuleNo} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Inverter Module Number</label>
                <input
                  type="text"
                  name="inverterModuleNo"
                  value={formData.inverterModuleNo}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="inverterMake" label="Inverter Make" value={formData.inverterMake} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Inverter Make</label>
                <input
                  type="text"
                  name="inverterMake"
                  value={formData.inverterMake}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="rating" label="Rating" value={formData.rating} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="text"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="chargeControllerType" label="Charge Controller Type" value={formData.chargeControllerType} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Charge Controller Type</label>
                <input
                  type="text"
                  name="chargeControllerType"
                  value={formData.chargeControllerType}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* <InputField name="inverterCapacity" label="Inverter Capacity" value={formData.inverterCapacity} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Inverter Capacity</label>
                <input
                  type="number"
                  name="inverterCapacity"
                  value={formData.inverterCapacity}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="earthingRod" label="Earthing Rod" value={formData.earthingRod} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Earthing Rod</label>
                <input
                  type="number"
                  name="earthingRod"
                  value={formData.earthingRod}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="dateOfInstallation" label="Date Of Installation" value={formData.dateOfInstallation} handleChange={handleChange} type="date" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">date of Installation</label>
                <input
                  type="date"
                  name="dateOfInstallation"
                  value={formData.dateOfInstallation}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* <InputField name="capacityType" label="Capacity Type" value={formData.capacityType} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity Type</label>
                <input
                  type="text"
                  name="capacityType"
                  value={formData.capacityType}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="projectModel" label="Project Model" value={formData.projectModel} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Model</label>
                <input
                  type="text"
                  name="projectModel"
                  value={formData.projectModel}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* <InputField name="reInstalledCapacityRooftop" label="ReInstalled Capacity Rooftop" value={formData.reInstalledCapacityRooftop} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ReInstalled Capacity Rooftop</label>
                <input
                  type="number"
                  name="reInstalledCapacityRooftop"
                  value={formData.reInstalledCapacityRooftop}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="reInstalledCapacityGround" label="ReInstalled Capacity Ground" value={formData.reInstalledCapacityGround} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ReInstalled Capacity Ground</label>
                <input
                  type="number"
                  name="reInstalledCapacityGround"
                  value={formData.reInstalledCapacityGround}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="reInstalledCapacityTotal" label="ReInstalled Capacity Total" value={formData.reInstalledCapacityTotal} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ReInstalled Capacity Total</label>
                <input
                  type="number"
                  name="reInstalledCapacityTotal"
                  value={formData.reInstalledCapacityTotal}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">No of modules</label>
                <input
                  type="number"
                  name="noOfModules"
                  value={formData.noOfModules}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Number Of Modules</label>
                <input
                  type="number"
                  name="noOfModules"
                  value={formData.noOfModules}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      noOfModules: count,
                      serialNoOfModules: Array(count).fill(""),
                    }));
                  }}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div> */}

              {/* {formData.serialNoOfModules?.map((serial, index) => (
                <div key={index} className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Serial Number for Module {index + 1}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={serial}
                      onChange={(e) => {
                        const updated = [...formData.serialNoOfModules];
                        updated[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          serialNoOfModules: updated,
                        }));
                      }}
                      className="block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setScanningIndex(index)}
                      className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700 transition"
                    >
                      Scan
                    </button>
                  </div>

                  {scanningIndex === index && (
                    <div className="mt-2">
                      <BarcodeScannerComponent
                        width={400}
                        height={300}
                        onUpdate={(err, result) => {
                          if (result) {
                            const updated = [...formData.serialNoOfModules];
                            updated[index] = result.text;
                            setFormData((prev) => ({
                              ...prev,
                              serialNoOfModules: updated,
                            }));
                            setScanningIndex(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setScanningIndex(null)}
                        className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))} */}

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

