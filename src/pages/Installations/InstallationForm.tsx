import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveInstallation, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import ReusableDropdown from "../../components/ReusableDropdown";

export const InstallationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId || null;
  const customerId = location.state?.customerId || null;
  const consumerId = location.state?.consumerId || null;
  const [installationSpaceTypes, setInstallationSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);


  const [, setNavigateAfterClose] = useState(false);
  const [, setCreatedInstallationId] = useState<number | null>(null);


  const [activeTab, setActiveTab] = useState("Installation Details");

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  const [formData, setFormData] = useState({
    arresterEarthDistanceFt: '',
    inverterEarthDistanceFt: '',
    inverterMeterDistanceFt: '',
    structureInverterDistanceFt: '',
    descriptionOfInstallation: '',
    availableSouthNorthLengthFt: '',
    availableEastWestLengthFt: '',
    installationSpaceTypeId: 1,
    installationSpaceTitle: '',
    customInstallationSpaceTitle: '',
    minimumElevationFt: '',
  });

  ///////////////////////////////////////////////////////////
  // useEffect(() => {
  //   const savedForm = localStorage.getItem('installationFormData');
  //   if (savedForm) {
  //     setFormData(JSON.parse(savedForm));
  //   }
  // }, []);
  ///////////////////////////////////////////////////////////


  useEffect(() => {
    const getInstallationSpaceTypesNames = async () => {
      try {
        const data = await fetchInstallationSpaceTypesNames();
        setInstallationSpaceTypes(data);
      } catch (error) {
        console.error("Failed to fetch connection types", error);
      }
    };

    getInstallationSpaceTypesNames();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    ///////////////
    //localStorage.setItem('installationFormData', JSON.stringify(formData));
    //////////////
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Received connectionId:", connectionId);
    console.log("Received consumerId:", consumerId);
    console.log("Received customerId:", customerId);

    if (!connectionId || !consumerId) {
      // alert("Connection ID and Consumer ID are required!");
      toast.error("Connection ID and Consumer ID are required!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      return;
    }

    // Construct installation data object
    const installationData = {
      customerId: customerId || null,
      connectionId,
      consumerId,
      installationSpaceTypeId: formData.installationSpaceTypeId,
      availableEastWestLengthFt: formData.availableEastWestLengthFt,
      availableSouthNorthLengthFt: formData.availableSouthNorthLengthFt,
      arresterEarthDistanceFt: formData.arresterEarthDistanceFt,
      inverterEarthDistanceFt: formData.inverterEarthDistanceFt,
      inverterMeterDistanceFt: formData.inverterMeterDistanceFt,
      descriptionOfInstallation: formData.descriptionOfInstallation,
      structureInverterDistanceFt: formData.structureInverterDistanceFt,
      minimumElevationFt: formData.minimumElevationFt,
      installationSpaceTitle:
        formData.installationSpaceTitle === 'Other'
          ? formData.customInstallationSpaceTitle
          : formData.installationSpaceTitle,
    };

    try {
      console.log("Saving new installation...");
      const result = await saveInstallation(installationData);
      if (result.id) {

        setCreatedInstallationId(result.id);
        setNavigateAfterClose(true);

        toast.success(result.message || "Installation data saved successfully!", {
          autoClose: 1000,
          hideProgressBar: true,
        });
        navigate(`/view-installation`, {
          state: {
            customerId: customerId, connectionId: connectionId, consumerId: consumerId, installationId: result.id
          },
        });

        setNavigateAfterClose(false);
        setCreatedInstallationId(null);
      }
      else {
        toast.error("Failed to save installation data.", {
          autoClose: 1000,
          hideProgressBar: true,
        })
      }
    } catch (error) {
      console.error("Error in installation process:", error);
      toast.error("Failed to save installation. Please try again.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
    /////////////
    localStorage.removeItem('installationFormData');
    ////////////
  };




  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Back Arrow */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Heading - Adjusts Position on Small Screens */}
            <h1 className="text-xl font-bold text-gray-700">Add New Installation</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-4xl mx-auto mb-6 mt-2 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
          <div className="relative flex justify-center min-w-[500px] md:min-w-0">

            {/* Connector Line: between the first and last icon only */}
            <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

            <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;

                const Icon =
                  tab === "Customer Details"
                    ? UserCircleIcon
                    : tab === "Connection Details"
                      ? BoltIcon
                      : tab === "Installation Details"
                        ? HomeModernIcon
                        : Cog6ToothIcon;

                const shouldHighlightIcon = tab === "Customer Details" || tab === "Connection Details";


                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === "Customer Details") {
                        navigate(`/view-customer`, {
                          state: {
                            customerId,
                          },
                        });
                      } else if (tab === "Connection Details") {
                        navigate(`/view-connection`, {
                          state: { consumerId, customerId, connectionId },
                        });
                      }
                    }}
                    className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
                  >
                    <div
                      className={`rounded-full p-2 transition-all duration-300 ${shouldHighlightIcon
                        ? "bg-blue-500 text-white border border-transparent"
                        : "bg-white border border-gray-300 text-gray-500"}
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs md:text-sm font-semibold mt-1 ${isActive ? "text-gray-700" : "text-gray-700"
                        }`}
                    >
                      {tab}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>



        <form onSubmit={handleSubmit} className="space-y-3">

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">


            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <HomeModernIcon className="w-5 h-5 text-green-500" />
              Installation Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
              {/* Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Installation Space Type <span className="text-red-500">*</span></label>
                {/* <select
                name="installationSpaceTypeId"
                value={formData.installationSpaceTypeId}
                onChange={handleChange}
                className="w-full px-2 py-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              >
                {installationSpaceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nameEnglish}
                  </option>
                ))}
              </select> */}

                <ReusableDropdown
                  name="installationSpaceTypeId"
                  value={formData.installationSpaceTypeId || ""}
                  onChange={(val) =>
                    handleChange({ target: { name: "installationSpaceTypeId", value: Number(val) } })
                  }
                  options={installationSpaceTypes.map((type) => ({
                    value: type.id,
                    label: type.nameEnglish,
                  }))}
                  placeholder="Select Installation Space Type"
                  className="w-full"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installation Space Title <span className="text-red-500">*</span>
                </label>

                {/* <select
                name="installationSpaceTitle"
                value={formData.installationSpaceTitle}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Other') {

                    setFormData((prev) => ({
                      ...prev,
                      installationSpaceTitle: 'Other',
                      customInstallationSpaceTitle: '',
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      installationSpaceTitle: value,
                      customInstallationSpaceTitle: '',
                    }));
                  }
                }}
                required
                className="w-full px-2 py-3 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              >
                <option value="" disabled>Select Installation Title</option>
                <option value="At center">At center</option>
                <option value="At SW corner">At SW corner</option>
                <option value="At SE corner">At SE corner</option>
                <option value="At NW corner">At NW corner</option>
                <option value="At NE corner">At NE corner</option>
                <option value="At East side">At East side</option>
                <option value="At West side">At West side</option>
                <option value="At North side">At North side</option>
                <option value="At South side">At South side</option>
                <option value="Other">Other</option>
              </select> */}

                <ReusableDropdown
                  name="installationSpaceTitle"
                  value={formData.installationSpaceTitle || ""}
                  onChange={(val) => {
                    if (val === "Other") {
                      setFormData((prev) => ({
                        ...prev,
                        installationSpaceTitle: "Other",
                        customInstallationSpaceTitle: "",
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        installationSpaceTitle: val,
                        customInstallationSpaceTitle: "",
                      }));
                    }
                  }}
                  options={[
                    { value: "At center", label: "At center" },
                    { value: "At SW corner", label: "At SW corner" },
                    { value: "At SE corner", label: "At SE corner" },
                    { value: "At NW corner", label: "At NW corner" },
                    { value: "At NE corner", label: "At NE corner" },
                    { value: "At East side", label: "At East side" },
                    { value: "At West side", label: "At West side" },
                    { value: "At North side", label: "At North side" },
                    { value: "At South side", label: "At South side" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select Installation Title"
                  required
                  className="w-full"
                />

                {/* Show input only when "Other" is selected */}
                {formData.installationSpaceTitle === 'Other' && (
                  <input
                    type="text"
                    name="customInstallationSpaceTitle"
                    value={formData.customInstallationSpaceTitle || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[A-Za-z][A-Za-z\s]*$/.test(value) || value === "") {
                        handleChange(e);
                      }
                    }}
                    required
                    placeholder="Specify installation space title"
                    className="mt-2 w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                )}

              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">East-West-Length (Feet) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="availableEastWestLengthFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.availableEastWestLengthFt}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  required
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">South-North-Length (Feet) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="availableSouthNorthLengthFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.availableSouthNorthLengthFt}
                  placeholder="e.g. 10"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Structure to Inverter Distance (Feet)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="structureInverterDistanceFt"
                  name="structureInverterDistanceFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.structureInverterDistanceFt}
                  placeholder="e.g. 10"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inverter to GenMeter Distance (Feet)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="inverterMeterDistanceFt"
                  name="inverterMeterDistanceFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.inverterMeterDistanceFt}
                  placeholder="e.g. 10"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Earthing Pit to Inverter Distance (Feet)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="inverterEarthDistanceFt"
                  name="inverterEarthDistanceFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.inverterEarthDistanceFt}
                  placeholder="e.g. 10"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lightning Arrester to Ground Distance (Feet)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="arresterEarthDistanceFt"
                  name="arresterEarthDistanceFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.arresterEarthDistanceFt}
                  placeholder="e.g. 10"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height of Structure (feet)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="minimumElevationFt"
                  name="minimumElevationFt"
                  //onWheel={(e) => e.currentTarget.blur()}
                  value={formData.minimumElevationFt}
                  placeholder="e.g. 10"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description about Installation</label>
                <input
                  type="text"
                  id="descriptionOfInstallation"
                  name="descriptionOfInstallation"
                  value={formData.descriptionOfInstallation}
                  onChange={handleChange}
                  placeholder="e.g. Designated area is on rooftop"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-center sm:justify-center space-x-3 pt-1">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-2 px-8 sm:py-2.5 sm:px-5 w-auto inline-flex justify-center bg-gray-300 text-gray-800 font-semibold text-sm sm:text-base rounded-md hover:bg-gray-400 transition-colors shadow-sm hover:shadow-md"
            >
              Cancel
            </button>


            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md truncate"
            >
              Save Installation
            </button>
          </div>
        </form>

      </div>
    </div>
  );


};