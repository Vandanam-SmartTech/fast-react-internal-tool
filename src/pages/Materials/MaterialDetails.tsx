import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postMaterialData, getMaterialsByConnectionId, updateMaterialData } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

export interface Consumer {
  id: number,
  customerId: number,
  govIdName: string,
  consumerId: number,
  connectionType: string,
  mobileNumber: string,
  emailAddress: string,
}

export default function MaterialForm() {
  const [formData, setFormData] = useState({
    systemKw: "",
    makeOfModule: "",
    almmModelNo: "",
    wattagePerModule: null,
    noOfModules: null,
    warrantyDetails: "",
    inverterModuleNo: "",
    inverterMake: "",
    rating: "IP65",
    chargeControllerType: "",
    inverterCapacity: "",
    earthingRod: "",
    dateOfInstallation: "",
    capacityType: "Rooftop",
    projectModel: "Capex",
    reInstalledCapacityRooftop: "",
    reInstalledCapacityGround: "",
    reInstalledCapacityTotal: ""
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

      if (value === "Other") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          [`custom${capitalize(name)}`]: "", 
        }));
      } else {

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
        setFormData({ ...materials[0] }); 
        setExistingMaterialData(materials[0]); 
      }
    };

    fetchMaterialData();
  }, [connectionId]);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectionId) {
      toast.error("Connection Id is missing", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      return;
    }

    const dataToSubmit = {
      ...formData,
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
    <div className="flex justify-start max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="w-full">

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
            

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PV System Capacity (kW)</label>
                <input
                  type="text"
                  name="systemKw"
                  value={formData.systemKw}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PV Panel Brand</label>
                <input
                  type="text"
                  name="makeOfModule"
                  value={formData.makeOfModule}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z][A-Za-z\s]*$/.test(value) || value === "") {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ALMM Model Number</label>
                <input
                  type="text"
                  name="almmModelNo"
                  value={formData.almmModelNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wattage Per Panel</label>
                <input
                  type="text"
                  name="wattagePerModule"
                  value={formData.wattagePerModule}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Details</label>
                <input
                  type="text"
                  name="warrantyDetails"
                  value={formData.warrantyDetails}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Brand</label>
                <input
                  type="text"
                  name="inverterMake"
                  value={formData.inverterMake}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Module Number</label>
                <input
                  type="text"
                  name="inverterModuleNo"
                  value={formData.inverterModuleNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Capacity(kW)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="inverterCapacity"
                  value={formData.inverterCapacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <input
                  type="text"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Charge Controller Type</label>
                <input
                  type="text"
                  name="chargeControllerType"
                  value={formData.chargeControllerType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Earthing Rods</label>
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="earthingRod"
                  value={formData.earthingRod}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Installation</label>
                <input
                  type="date"
                  name="dateOfInstallation"
                  value={formData.dateOfInstallation}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity Type</label>
                <input
                  type="text"
                  name="capacityType"
                  value={formData.capacityType}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Model</label>
                <input
                  type="text"
                  name="projectModel"
                  value={formData.projectModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ReInstalled Capacity Rooftop</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="reInstalledCapacityRooftop"
                  value={formData.reInstalledCapacityRooftop}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ReInstalled Capacity Ground</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="reInstalledCapacityGround"
                  value={formData.reInstalledCapacityGround}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ReInstalled Capacity Total</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="reInstalledCapacityTotal"
                  value={formData.reInstalledCapacityTotal}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of PV Panels</label>
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => e.currentTarget.blur()}
                  name="noOfModules"
                  value={formData.noOfModules}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>


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