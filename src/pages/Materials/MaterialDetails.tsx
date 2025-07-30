import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postMaterialData, getMaterialsByConnectionId, updateMaterialData } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { ArrowLeft} from "lucide-react";

export interface Consumer{
  id:number,
  customerId:number,
  govIdName:string,
  consumerId:number,
  connectionType:string,
  mobileNumber:string,
  emailAddress:string,
}

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
    rating: "IP65",
    chargeControllerType: "",
    inverterCapacity: NaN,
    earthingRod: NaN,
    dateOfInstallation: "",
    capacityType: "Rooftop",
    projectModel: "Capex",
    reInstalledCapacityRooftop: NaN,
    reInstalledCapacityGround: NaN,
    reInstalledCapacityTotal: NaN
  });
  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId;
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [messageBoxSeverity, setMessageBoxSeverity] = useState<"success" | "error">("success");
  const consumer = location.state?.consumer as Consumer;
  const [existingMaterialData, setExistingMaterialData] = useState<any | null>(null);


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

useEffect(() => {
  const fetchMaterialData = async () => {
    if (!connectionId) return;

    const materials = await getMaterialsByConnectionId(connectionId);
    if (materials.length > 0) {
      setFormData({ ...materials[0] }); // populate form with first entry
      setExistingMaterialData(materials[0]); // track edit mode
    }
  };

  fetchMaterialData();
}, [connectionId]);




const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!connectionId) {
    toast.error("Connection Id is missing",{
      autoClose:1000,
      hideProgressBar:true,
    });
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
    if (existingMaterialData) {
      await updateMaterialData(connectionId, dataToSubmit);
      toast.success("Material data updated successfully!", { 
        autoClose: 1000,
        hideProgressBar: true,
      });
    } else {
      await postMaterialData(connectionId, dataToSubmit);
       toast.success("Material data saved successfully!", {
      autoClose: 1000,
      hideProgressBar: true,
    });

    
    }

navigate("/OnboardedConsumers");
  } catch (error) {
    console.error("Material submission error:", error);
     toast.error("Failed to submit the data", {
      autoClose: 1000,
      hideProgressBar: true,
    });
  }
};

const handleDialogClose = () => {
  setMessageBoxOpen(false);

  if (messageBoxSeverity === "success") {
    navigate("/OnboardedConsumers");
  }
};


  return (
    <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-[85%]">

        {/* <h2 className="text-2xl font-semibold mb-4">Material Details</h2> */}

          <div className="flex items-center w-full md:w-auto">
<button
  onClick={() => navigate(`/OnboardedConsumers`)}
  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
>
  <ArrowLeft className="w-6 h-6 text-gray-700" />
</button>


    <h2 className="text-xl md:text-2xl font-semibold">
      Material Details
    </h2>
  </div>

        {consumer && (
  <div className="bg-white border border-gray-200 shadow-sm rounded-md p-4 mb-4 mt-6 w-full max-w-3xl">
    {/*<h3 className="text-base font-semibold text-gray-800 mb-3">Consumer Details</h3>*/}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-10 text-sm text-gray-700">
      <div>
        <span className="font-medium text-gray-700">Consumer Name:</span>
        <span className="ml-1 text-gray-800">{consumer.govIdName || "—"}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">Consumer Number:</span>
        <span className="ml-1 text-gray-800">{consumer.consumerId || "—"}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">Mobile Number:</span>
        <span className="ml-1 text-gray-800">{consumer.mobileNumber || "—"}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">Email Address:</span>
        <span className="ml-1 text-gray-800">{consumer.emailAddress || "—"}</span>
      </div>
    </div>
  </div>
)}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* <InputField name="systemKw" label="System KW" value={formData.systemKw} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">System Capacity(kW)</label>
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
  <label className="block text-sm font-medium text-gray-700">Panel Brand</label>
  <select
    name="makeOfModule"
    value={formData.makeOfModule}
    onChange={handleChange}
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  >
    <option value="">Select Make of Module</option>
    <option value="Sova">Sova</option>
    <option value="En-Icon">En-Icon</option>
    <option value="Tata">Tata</option>
    <option value="Adani">Adani</option>
    <option value="Waree">Waree</option>
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
  <label className="block text-sm font-medium text-gray-700">Wattage Per Panel</label>
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

              {/* <InputField name="inverterMake" label="Inverter Make" value={formData.inverterMake} handleChange={handleChange} /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Inverter Brand</label>
                <input
                  type="text"
                  name="inverterMake"
                  value={formData.inverterMake}
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
                <label className="block text-sm font-medium text-gray-700">Inverter Capacity(kW)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="inverterCapacity"
                  value={formData.inverterCapacity}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="earthingRod" label="Earthing Rod" value={formData.earthingRod} handleChange={handleChange} type="number" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Earthing Rods</label>
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="earthingRod"
                  value={formData.earthingRod}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* <InputField name="dateOfInstallation" label="Date Of Installation" value={formData.dateOfInstallation} handleChange={handleChange} type="date" /> */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Installation</label>
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
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
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
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
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
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="reInstalledCapacityTotal"
                  value={formData.reInstalledCapacityTotal}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Number of PV modules</label>
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => e.currentTarget.blur()}
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
  className="py-2 px-6 w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
>
  {existingMaterialData ? "Update Material Data" : "Save Material Data"}
</button>

            </div>
          </fieldset>
        </form>

<Dialog open={messageBoxOpen} onClose={handleDialogClose}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
  maxWidth="xs"
  fullWidth>
  <DialogTitle id="alert-dialog-title">
    {messageBoxSeverity === "success" ? "Success" : "Error"}
  </DialogTitle>
  <DialogContent dividers>
    <Alert severity={messageBoxSeverity}>{messageBoxContent}</Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleDialogClose} autoFocus>
      OK
    </Button>
  </DialogActions>
</Dialog>


      </div>
    </div>
  );
}

