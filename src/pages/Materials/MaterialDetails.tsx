import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postMaterialData, getMaterialsByConnectionId, updateMaterialData, saveInverter, saveInstallationDetails, saveModule } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { fetchSystemRelatedDetails } from "../../services/quotationService";
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
    wattagePerModule: "",
    noOfModules: "",
    warrantyDetails: "",
    inverterModuleNo: "",
    inverterMake: "",
    rating: "IP65",
    chargeControllerType: "MPPT",
    inverterCapacity: "",
    earthingRod: "",
    dateOfInstallation: "",
    capacityType: "Rooftop",
    projectModel: "Capex",
    reInstalledCapacityRooftop: "",
    reInstalledCapacityGround: "",
    reInstalledCapacityTotal: "",
    serials: [] as { serialNumber: string }[],
  });


  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId;
  //const [connectionId, setConnectionId] = useState<number | null>(null);
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [messageBoxSeverity, setMessageBoxSeverity] = useState<"success" | "error">("success");
  const consumer = location.state?.consumer as Consumer;
  const [existingMaterialData, setExistingMaterialData] = useState<any | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  // Helper function to check valid decimal >= 0 (no negatives)
  const isValidDecimal = (val: string) => /^(\d+(\.\d*)?)?$/.test(val);

  // Special handling for number of modules (already done)
  if (name === "noOfModules") {
    if (/^[1-9][0-9]*$/.test(value) || value === "") {
      const count = value === "" ? 0 : parseInt(value);
      const newSerials = Array.from({ length: count }, (_, i) => ({
        serialNumber: formData.serials[i]?.serialNumber || "",
      }));

      setFormData((prev) => ({
        ...prev,
        noOfModules: value,
        serials: newSerials,
      }));
    }
    return;
  }

  // Handle Rooftop, Ground, and Total fields
  if (
    name === "reInstalledCapacityRooftop" ||
    name === "reInstalledCapacityGround" ||
    name === "reInstalledCapacityTotal"
  ) {
    if (!isValidDecimal(value)) return;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Convert values safely to floats
      const rooftop = parseFloat(updated.reInstalledCapacityRooftop) || 0;
      const ground = parseFloat(updated.reInstalledCapacityGround) || 0;

      // Auto-update total whenever rooftop or ground changes
      if (name !== "reInstalledCapacityTotal") {
        updated.reInstalledCapacityTotal = (rooftop + ground).toString();
      }

      return updated;
    });
    return;
  }

  // Default case
  setFormData((prev) => ({ ...prev, [name]: value }));
};


  const handleSerialChange = (index: number, value: string) => {
    const updatedSerials = [...formData.serials];
    updatedSerials[index].serialNumber = value;
    setFormData((prev) => ({ ...prev, serials: updatedSerials }));
  };



  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  useEffect(() => {
    const fetchMaterialData = async () => {
      if (!connectionId) return;

      const materials = await getMaterialsByConnectionId(connectionId);
      if (materials.length > 0) {
        setFormData({ ...materials[0] });
        setExistingMaterialData(materials[0]);
      } else {
        // Fallback to fetch system details
        try {
          const systemDetails = await fetchSystemRelatedDetails(connectionId);
          setFormData((prev) => ({
            ...prev,
            systemKw: systemDetails.customerSelectedKW || "",
            makeOfModule: systemDetails.customerSelectedBrand || "",
            inverterCapacity: systemDetails.inverterCapacity || "",
            inverterMake: systemDetails.inverterBrand || "",
            noOfModules: systemDetails.panelCount || "",
            reInstalledCapacityTotal: systemDetails.customerSelectedKW || "",
          }));
        } catch (error) {
          console.error("Error fetching system details:", error);
        }
      }
    };

    fetchMaterialData();
  }, [connectionId]);





  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!connectionId) {
  //     toast.error("Connection Id is missing", {
  //       autoClose: 1000,
  //       hideProgressBar: true,
  //     });
  //     return;
  //   }

  //   const dataToSubmit = {
  //     ...formData,
  //   };

  //   try {
  //     if (existingMaterialData) {
  //       await updateMaterialData(connectionId, dataToSubmit);
  //       toast.success("Material data updated successfully!", {
  //         autoClose: 1000,
  //         hideProgressBar: true,
  //       });
  //     } else {
  //       await postMaterialData(connectionId, dataToSubmit);
  //       toast.success("Material data saved successfully!", {
  //         autoClose: 1000,
  //         hideProgressBar: true,
  //       });
  //     }
  //     navigate("/onboarded-consumers");
  //   } catch (error) {
  //     console.error("Material submission error:", error);
  //     toast.error("Failed to submit the data", {
  //       autoClose: 1000,
  //       hideProgressBar: true,
  //     });
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectionId) {
      toast.error("Connection Id is missing", { autoClose: 1000, hideProgressBar: true });
      return;
    }

    try {
      const inverterData = {
        connectionId: Number(connectionId),
        inverterMake: formData.inverterMake,
        almmModelNo: formData.almmModelNo,
        rating: formData.rating,
        chargeControllerType: formData.chargeControllerType,
        inverterCapacity: parseFloat(formData.inverterCapacity),
      };

      const installationData = {
        connectionId: Number(connectionId),
        earthingRod: parseInt(formData.earthingRod),
        dateOfInstallation: formData.dateOfInstallation,
        capacityType: formData.capacityType,
        projectModel: formData.projectModel,
        reInstallCapacityRooftop: parseFloat(formData.reInstalledCapacityRooftop),
        reInstallCapacityGround: parseFloat(formData.reInstalledCapacityGround),
        reInstallCapacityTotal: parseFloat(formData.reInstalledCapacityTotal),
      };

      const moduleData = {
        connectionId: Number(connectionId),
        systemKw: parseFloat(formData.systemKw),
        makeOfModule: formData.makeOfModule,
        wattagePerModule: parseFloat(formData.wattagePerModule),
        noOfModules: parseInt(formData.noOfModules),
        warrantyDetails: formData.warrantyDetails,
        serials: formData.serials.filter((s) => s.serialNumber.trim() !== ""),
      };

      // Call imported APIs
      await saveInverter(inverterData);
      await saveInstallationDetails(installationData);
      await saveModule(moduleData);

      toast.success("All data submitted successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      navigate("/onboarded-consumers");
    } catch (error) {
      console.error("Material submission error:", error);
      toast.error("Failed to submit one or more requests", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  };

  const handleDialogClose = () => {
    setMessageBoxOpen(false);

    if (messageBoxSeverity === "success") {
      navigate("/onboarded-consumers");
    }
  };


  return (
    <div className="flex justify-start max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="w-full">

        <div className="flex items-center w-full md:w-auto">
          <button
            onClick={() => navigate(`/onboarded-consumers`)}
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
            {/* Inverter Details Section */}
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Inverter Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Brand</label>
                  <input
                    type="text"
                    name="inverterMake"
                    value={formData.inverterMake}
                    onChange={handleChange}
                    placeholder="e.g. Growatt"
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
                    placeholder="e.g. ALMM12345"
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
                    placeholder="e.g. IP65"
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
                    placeholder="e.g. MPPT"
                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inverter Capacity (kW)
                  </label>
                  <input
                    type="text"
                    name="inverterCapacity"
                    inputMode="decimal"
                    value={formData.inverterCapacity}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow only positive decimals or integers, no leading zeros unless "0."
                      if (/^(?!0\d)\d*(\.\d*)?$/.test(val) || val === "") {
                        handleChange(e);
                      }
                    }}
                    placeholder="e.g. 4.4"
                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>


              </div>
            </div>

            {/* Panel Details Section */}
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Panel Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PV Panel Brand</label>
                  <input
                    type="text"
                    name="makeOfModule"
                    value={formData.makeOfModule}
                    onChange={handleChange}
                    placeholder="e.g. Sova"

                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PV System Capacity (kW)
                  </label>
                  <input
                    type="text"
                    name="systemKw"
                    inputMode="decimal"
                    value={formData.systemKw}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow only positive integers or decimals (no negatives or invalid formats)
                      if (/^(?!0\d)\d*(\.\d*)?$/.test(val) || val === "") {
                        handleChange(e);
                      }
                    }}
                    placeholder="e.g. 3.3"
                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wattage Per Panel</label>
                  <input
                    type="text"
                    name="wattagePerModule"
                    value={formData.wattagePerModule}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty value or positive numbers with optional decimal
                      if (/^\d*\.?\d*$/.test(val)) {
                        handleChange(e);
                      }
                    }}
                    placeholder="e.g. 550"
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
                    placeholder="e.g. 10 yrs product + 25 yrs performance"
                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of PV Panels
                  </label>
                  <input
                    type="text"
                    name="noOfModules"
                    inputMode="numeric"
                    value={formData.noOfModules}
                    onChange={(e) => {
                      // Allow only positive integers, no leading zeros
                      const val = e.target.value;
                      if (/^[1-9][0-9]*$/.test(val) || val === "") {
                        handleChange(e);
                      }
                    }}
                    placeholder="e.g. 6"
                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />

                  {formData.noOfModules === "0" && (
                    <p className="text-red-500 text-sm mt-1">
                      Number of panels must be greater than 0
                    </p>
                  )}
                </div>

                {formData.serials.length > 0 && (
                  <div className="mt-4 col-span-full">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Panel Serial Numbers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formData.serials.map((serial, index) => (
                        <input
                          key={index}
                          type="text"
                          value={serial.serialNumber}
                          onChange={(e) => handleSerialChange(index, e.target.value)}
                          placeholder={`Serial Number ${index + 1}`}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* Installation Details Section */}
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Installation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Earthing Rods</label>
                  <input
                    type="text"
                    name="earthingRod"
                    value={formData.earthingRod}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty or digits only (no negatives, no decimals)
                      if (/^\d*$/.test(val)) {
                        handleChange(e);
                      }
                    }}
                    placeholder="e.g. 7"
                    inputMode="numeric"
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
                    placeholder="e.g., Rooftop"
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
                    placeholder="e.g. Capex"
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
                    placeholder="e.g. 2.2"
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
                    placeholder="e.g. 1.1"
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
                    placeholder="e.g. 3.3"
                    className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center sm:justify-center mt-4 sm:mt-6">
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