import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveInstallation, fetchInstallationSpaceTypesNames} from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import { ArrowLeft } from "lucide-react";
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

    ///////////////
    localStorage.setItem('installationFormData', JSON.stringify(formData));
    //////////////
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Received connectionId:", connectionId);
    console.log("Received consumerId:", consumerId);
    console.log("Received customerId:", customerId);

    if (!connectionId || !consumerId) {
        // alert("Connection ID and Consumer ID are required!");
        toast.error("Connection ID and Consumer ID are required!",{
          autoClose:1000,
          hideProgressBar:true,
        });
        return;
    }

    // Construct installation data object
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
        }
        else {
            toast.error("Failed to save installation data.",{
              autoClose:1000,
              hideProgressBar:true,
            })
    }
    } catch (error) {
        console.error("Error in installation process:", error);
        // alert("Failed to process installation. Please try again.");
        toast.error("Failed to save installation. Please try again.",{
          autoClose:1000,
          hideProgressBar:true,
        });
    }
    /////////////
    localStorage.removeItem('installationFormData');
    ////////////
};




return (
  <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">

  <div className="flex items-center w-full md:w-auto">
    <button
      onClick={() =>
        navigate(`/view-connection/${connectionId}`, {
          state: { consumerId, customerId, connectionId,selectedRepresentative:selectedRepresentative },
        })
      }
      className="p-2 rounded-full hover:bg-gray-200 transition"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>

    {/* Heading - Adjusts Position on Small Screens */}
    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
      Add New Installation
    </h2>
  </div>

  {/* Selected Representative - Adjusts for Desktop & Mobile */}
  {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}
</div>

<div className="w-full max-w-4xl mx-auto mb-10 mt-6 overflow-x-auto">
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

            const shouldHighlightIcon = tab === "Customer Details" || tab==="Connection Details";


            return (
              <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            if (tab === "Customer Details") {
              navigate(`/view-customer/${customerId}`, {
                state: {
                  customerId,
                  selectedRepresentative: selectedRepresentative || "",
                },
              });
            } else if (tab === "Connection Details") {
              navigate(`/view-connection/${connectionId}`, {
                state: { consumerId, customerId, connectionId, selectedRepresentative: selectedRepresentative },
              });
            }
          }}
          className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
        >
          <div
            className={`rounded-full p-2 transition-all duration-300 ${
              shouldHighlightIcon
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-500"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <span
            className={`text-xs md:text-sm font-semibold mt-1 ${
              isActive ? "text-gray-700" : "text-gray-700"
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


    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 sm:mb-8">
      Installation Details
    </h2>

    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Input Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Installation Space Type <span className="text-red-500">*</span></label>
        <select
          name="installationSpaceTypeId"
          value={formData.installationSpaceTypeId}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {installationSpaceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nameEnglish}
              </option>
              ))}
        </select>
      </div>

<div>
  <label className="block text-sm font-medium text-gray-700">
    Installation Space Title <span className="text-red-500">*</span>
  </label>

<select
  name="installationSpaceTitle"
  value={formData.installationSpaceTitle}
  onChange={(e) => {
    const value = e.target.value;
    if (value === 'Other') {
      // Keep value as 'Other' so the select reflects it
      setFormData((prev) => ({
        ...prev,
        installationSpaceTitle: 'Other',
        customInstallationSpaceTitle: '', // introduce a new field
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        installationSpaceTitle: value,
        customInstallationSpaceTitle: '', // clear if previously typed
      }));
    }
  }}
  required
  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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


  {/* Show input only when "Other" is selected */}
{formData.installationSpaceTitle === 'Other' && (
  <input
    type="text"
    name="customInstallationSpaceTitle"
    value={formData.customInstallationSpaceTitle || ''}
    onChange={handleChange}
    required
    placeholder="Specify installation space title"
    className="mt-2 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
)}

</div>


      <div>
        <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet) <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="availableEastWestLengthFt"
          min="0"
          onWheel={(e) => e.currentTarget.blur()}
          value={formData.availableEastWestLengthFt}
          onChange={handleChange}
          required
          placeholder="e.g. 10"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet) <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="availableSouthNorthLengthFt"
          min="0"
          onWheel={(e) => e.currentTarget.blur()}
          value={formData.availableSouthNorthLengthFt}
          placeholder="e.g. 10"
          required
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Required AC Wire Length (Feet)</label>
        <input
          type="number"
          id="acWireLengthFt"
          name="acWireLengthFt"
          min="0"
          onWheel={(e) => e.currentTarget.blur()}
          value={formData.acWireLengthFt}
          placeholder="e.g. 10"
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Required DC Wire Length (Feet)</label>
        <input
          type="number"
          id="dcWireLengthFt"
          name="dcWireLengthFt"
          min="0"
          onWheel={(e) => e.currentTarget.blur()}
          value={formData.dcWireLengthFt}
          placeholder="e.g. 10"
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Required Earthing Wire Length (Feet)</label>
        <input
          type="number"
          id="earthingWireLengthFt"
          name="earthingWireLengthFt"
          min="0"
          onWheel={(e) => e.currentTarget.blur()}
          value={formData.earthingWireLengthFt}
          placeholder="e.g. 10"
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Required Number of GP Pipes</label>
        <input
          type="number"
          id="numberOfGpPipes"
          name="numberOfGpPipes"
          min="0"
          onWheel={(e) => e.currentTarget.blur()}
          value={formData.numberOfGpPipes}
          placeholder="e.g. 10"
          onChange={handleChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
        <input
          type="text"
          id="descriptionOfInstallation"
          name="descriptionOfInstallation"
          value={formData.descriptionOfInstallation}
          onChange={handleChange}
          placeholder="e.g. Designated area is on rooftop"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="sm:col-span-2 flex justify-center sm:justify-start mt-4">
        <button
          type="submit"
          className="w-full sm:w-auto py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Save Installation
        </button>
      </div>
    </form>

  </div>
);

  
};