import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postMaterialData, getMaterialsByConnectionId, updateMaterialData } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { ArrowLeft, Settings, Zap, Calendar, CheckCircle, AlertCircle, Package, Gauge, Shield } from "lucide-react";

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
      toast.error("Connection Id is missing",{
        autoClose:1000,
        hideProgressBar:true,
      });
      return;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/OnboardedConsumers`)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Material Details</h1>
              <p className="text-gray-600 mt-1">Configure system specifications and components</p>
            </div>
          </div>
        </div>

        {/* Consumer Info Card */}
        {consumer && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Consumer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600">Consumer Name</span>
                <p className="text-gray-900 font-semibold">{consumer.govIdName || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600">Consumer Number</span>
                <p className="text-gray-900 font-semibold">{consumer.consumerId || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600">Mobile Number</span>
                <p className="text-gray-900 font-semibold">{consumer.mobileNumber || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600">Email Address</span>
                <p className="text-gray-900 font-semibold">{consumer.emailAddress || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Specifications
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* System Capacity Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Gauge className="h-5 w-5 text-blue-600" />
                System Capacity & Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* System Capacity */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    System Capacity (kW)
                  </label>
                  <select
                    name="systemKw"
                    value={formData.systemKw}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select System kW</option>
                    {[...Array(24)].map((_, i) => {
                      const value = ((i + 1) * 1.1).toFixed(1);
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
                      className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  )}
                </div>

                {/* Panel Brand */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Panel Brand
                  </label>
                  <select
                    name="makeOfModule"
                    value={formData.makeOfModule}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
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
                      className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  )}
                </div>

                {/* ALMM Model Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    ALMM Model Number
                  </label>
                  <input
                    type="text"
                    name="almmModelNo"
                    value={formData.almmModelNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Wattage Per Panel */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Wattage Per Panel
                  </label>
                  <select
                    name="wattagePerModule"
                    value={formData.wattagePerModule}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
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
                      className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  )}
                </div>

                {/* Number of PV Modules */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Number of PV Modules
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="noOfModules"
                    value={formData.noOfModules}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Warranty Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Warranty Details
                  </label>
                  <input
                    type="text"
                    name="warrantyDetails"
                    value={formData.warrantyDetails}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Inverter Section */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Inverter Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Inverter Brand */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Inverter Brand
                  </label>
                  <input
                    type="text"
                    name="inverterMake"
                    value={formData.inverterMake}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Inverter Module Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Inverter Module Number
                  </label>
                  <input
                    type="text"
                    name="inverterModuleNo"
                    value={formData.inverterModuleNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Rating
                  </label>
                  <input
                    type="text"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Charge Controller Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Charge Controller Type
                  </label>
                  <input
                    type="text"
                    name="chargeControllerType"
                    value={formData.chargeControllerType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Inverter Capacity */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Inverter Capacity (kW)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="inverterCapacity"
                    value={formData.inverterCapacity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Number of Earthing Rods */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Number of Earthing Rods
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="earthingRod"
                    value={formData.earthingRod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Installation & Project Details */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Installation & Project Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date of Installation */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Date of Installation
                  </label>
                  <input
                    type="date"
                    name="dateOfInstallation"
                    value={formData.dateOfInstallation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Capacity Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Capacity Type
                  </label>
                  <input
                    type="text"
                    name="capacityType"
                    value={formData.capacityType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Project Model */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Project Model
                  </label>
                  <input
                    type="text"
                    name="projectModel"
                    value={formData.projectModel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Reinstalled Capacity Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Reinstalled Capacity Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reinstalled Capacity Rooftop */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Reinstalled Capacity Rooftop
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="reInstalledCapacityRooftop"
                    value={formData.reInstalledCapacityRooftop}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Reinstalled Capacity Ground */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Reinstalled Capacity Ground
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="reInstalledCapacityGround"
                    value={formData.reInstalledCapacityGround}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Reinstalled Capacity Total */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Reinstalled Capacity Total
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="reInstalledCapacityTotal"
                    value={formData.reInstalledCapacityTotal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {existingMaterialData ? "Update Material Data" : "Save Material Data"}
              </button>
            </div>
          </form>
        </div>

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

