import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveInstallation, fetchInstallationSpaceTypesNames} from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import { ArrowLeft, Home, Ruler, Zap, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export const InstallationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const connectionId = location.state?.connectionId || null;
  const customerId = location.state?.customerId || null;
  const consumerId = location.state?.consumerId || null;
  const [roles, setRoles] = useState<string[]>([]);
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [installationSpaceTypes, setInstallationSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  const [navigateAfterClose, setNavigateAfterClose] = useState(false);
  const [createdInstallationId, setCreatedInstallationId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState("Installation Details");

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  const [formData, setFormData] = useState({
    acWireLengthFt: NaN,
    dcWireLengthFt: NaN,
    earthingWireLengthFt: NaN,
    numberOfGpPipes: NaN,
    descriptionOfInstallation:'',
    availableSouthNorthLengthFt: NaN,
    availableEastWestLengthFt: NaN,
    installationSpaceTypeId: 1,
    installationSpaceTitle:'',
    customInstallationSpaceTitle:'',
  });

  ///////////////////////////////////////////////////////////
  useEffect(() => {
    const savedForm = localStorage.getItem('installationFormData');
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }
  }, []);
  ///////////////////////////////////////////////////////////
  
  useEffect(() => {
    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setRoles(claims.roles || []);
      } catch (error) {
        console.error("Failed to fetch user claims", error);
      }
    };
  
    getClaims();
  }, []);

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

    localStorage.setItem('installationFormData', JSON.stringify(formData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Received connectionId:", connectionId);
    console.log("Received consumerId:", consumerId);
    console.log("Received customerId:", customerId);

    if (!connectionId || !consumerId) {
      toast.error("Connection ID and Consumer ID are required!",{
        autoClose:1000,
        hideProgressBar:true,
      });
      return;
    }

    const installationData = {
      customerId: customerId || null,
      connectionId,
      consumerId,
      installationSpaceTypeId:formData.installationSpaceTypeId,
      availableEastWestLengthFt: formData.availableEastWestLengthFt,
      availableSouthNorthLengthFt: formData.availableSouthNorthLengthFt,
      acWireLengthFt: formData.acWireLengthFt,
      dcWireLengthFt: formData.dcWireLengthFt,
      earthingWireLengthFt: formData.earthingWireLengthFt,
      descriptionOfInstallation: formData.descriptionOfInstallation,
      numberOfGpPipes: formData.numberOfGpPipes,
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
        navigate(`/view-installation/${result.id}`, {
          state: {
            customerId,connectionId,consumerId,
            selectedRepresentative: selectedRepresentative,installationId: result.id
          },
        });

        setNavigateAfterClose(false);
        setCreatedInstallationId(null);
      } else {
        toast.error("Failed to save installation data.",{
          autoClose:1000,
          hideProgressBar:true,
        })
      }
    } catch (error) {
      console.error("Error in installation process:", error);
      toast.error("Failed to save installation. Please try again.",{
        autoClose:1000,
        hideProgressBar:true,
      });
    }
    localStorage.removeItem('installationFormData');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Installation</h1>
                <p className="text-gray-600 mt-1">Configure installation specifications and requirements</p>
              </div>
            </div>

            {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 rounded-full"></div>
            <div className="relative flex justify-between">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab;
                const Icon = tab === "Customer Details" ? UserCircleIcon : 
                           tab === "Connection Details" ? BoltIcon :
                           tab === "Installation Details" ? HomeModernIcon : Cog6ToothIcon;

                return (
                  <div key={tab} className="flex flex-col items-center">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-110' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium mt-2 text-center ${
                      isActive ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {tab}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Home className="h-5 w-5" />
              Installation Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Installation Space Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                Installation Space Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Installation Space Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Installation Space Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="installationSpaceTypeId"
                    value={formData.installationSpaceTypeId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    {installationSpaceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Installation Space Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Installation Space Title <span className="text-red-500">*</span>
                  </label>
                  <select
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
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
                  </select>

                  {formData.installationSpaceTitle === 'Other' && (
                    <input
                      type="text"
                      name="customInstallationSpaceTitle"
                      value={formData.customInstallationSpaceTitle || ''}
                      onChange={handleChange}
                      required
                      placeholder="Specify installation space title"
                      className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Dimensions Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                Available Space Dimensions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* East-West Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    East-West Length (Feet) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="availableEastWestLengthFt"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={formData.availableEastWestLengthFt}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* South-North Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    South-North Length (Feet) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="availableSouthNorthLengthFt"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={formData.availableSouthNorthLengthFt}
                    placeholder="e.g. 10"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Wire Requirements Section */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Wire Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AC Wire Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Required AC Wire Length (Feet)
                  </label>
                  <input
                    type="number"
                    id="acWireLengthFt"
                    name="acWireLengthFt"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={formData.acWireLengthFt}
                    placeholder="e.g. 10"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* DC Wire Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Required DC Wire Length (Feet)
                  </label>
                  <input
                    type="number"
                    id="dcWireLengthFt"
                    name="dcWireLengthFt"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={formData.dcWireLengthFt}
                    placeholder="e.g. 10"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Earthing Wire Length */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Required Earthing Wire Length (Feet)
                  </label>
                  <input
                    type="number"
                    id="earthingWireLengthFt"
                    name="earthingWireLengthFt"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={formData.earthingWireLengthFt}
                    placeholder="e.g. 10"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Number of GP Pipes */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Required Number of GP Pipes
                  </label>
                  <input
                    type="number"
                    id="numberOfGpPipes"
                    name="numberOfGpPipes"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={formData.numberOfGpPipes}
                    placeholder="e.g. 10"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Installation Description
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description about Installation
                </label>
                <input
                  type="text"
                  id="descriptionOfInstallation"
                  name="descriptionOfInstallation"
                  value={formData.descriptionOfInstallation}
                  onChange={handleChange}
                  placeholder="e.g. Designated area is on rooftop"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Save Installation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
