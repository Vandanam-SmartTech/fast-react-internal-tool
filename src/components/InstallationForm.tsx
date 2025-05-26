import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveInstallation, fetchClaims, fetchInstallationSpaceTypesNames} from "../services/api";
import { Stepper, Step } from "react-form-stepper";
import { ArrowLeft } from "lucide-react";
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
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
  //const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [installationSpaceTypes, setInstallationSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  // const installationSpaceTypeMapping = {
  //   'Slab': 1,
  //   'Metal Sheets': 2,
  //   'Plastic Sheets': 3,
  //   'Clay Tiles': 4,
  //   'Bathroom Slab': 5,
  //   'Cement Sheets': 6,
  //   'On Ground': 7,
  // };

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
  });

  ///////////////////////////////////////////////////////////
  useEffect(() => {
    const savedForm = localStorage.getItem('myFormData');
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

  // useEffect(() => {
  //   const storedRep = localStorage.getItem("selectedRepresentative");
  //   if (storedRep) {
  //     setSelectedRepresentative(JSON.parse(storedRep));
  //   }
  // }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    ///////////////
    localStorage.setItem('myFormData', JSON.stringify(formData));
    //////////////
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Received connectionId:", connectionId);
    console.log("Received consumerId:", consumerId);
    console.log("Received customerId:", customerId);

    if (!connectionId || !consumerId) {
        alert("Connection ID and Consumer ID are required!");
        return;
    }

    // Ensure space type ID mapping is correct
    //const installationSpaceTypeId = installationSpaceTypeMapping[formData.spaceType] || null;
    // if (!installationSpaceTypeId) {
    //     alert("Invalid installation space type.");
    //     return;
    // }

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
        installationSpaceTitle: formData.installationSpaceTitle,
    };

    try {
        console.log("Saving new installation...");
        const installationId = await saveInstallation(installationData);
        if (installationId) {
            console.log("New Installation saved with ID:", installationId);
            navigate(`/view-installation/${installationId}`, {
                state: { consumerId, connectionId, installationId, customerId ,selectedRepresentative:selectedRepresentative},
            });
        }
    } catch (error) {
        console.error("Error in installation process:", error);
        alert("Failed to process installation. Please try again.");
    }
    /////////////
    localStorage.removeItem('myFormData');
    ////////////
};




return (
  <div className="max-w-4xl mx-auto p-4 sm:p-6">
    <div className="flex flex-col md:flex-row items-center justify-between md:space-x-4 col-span-1 md:col-span-2 mb-4">
  {/* Backward Arrow Button (Before Title on Mobile) */}
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
    <h2 className="text-xl md:text-2xl font-semibold text-gray-700 ml-2 md:ml-0">
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

<div className="w-full max-w-4xl mx-auto mb-14 mt-10 overflow-x-auto">
  <div className="relative flex justify-center min-w-[500px] md:min-w-0">
    
    {/* Connector Line: between the first and last icon only */}
    <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

    <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
      {tabs.map((tab, index) => {
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
      Installation Space Details
    </h2>

    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Input Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Installation Space Type</label>
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
        <label className="block text-sm font-medium text-gray-700">Installation Space Title</label>
        <input
          type="text"
          name="installationSpaceTitle"
          value={formData.installationSpaceTitle}
          onChange={handleChange}
          placeholder="e.g. South-West side of space type"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet)</label>
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
        <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet)</label>
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
        <label className="block text-sm font-medium text-gray-700">AC Wire Length (Feet)</label>
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
        <label className="block text-sm font-medium text-gray-700">DC Wire Length (Feet)</label>
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
        <label className="block text-sm font-medium text-gray-700">Earthing Wire Length (Feet)</label>
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
        <label className="block text-sm font-medium text-gray-700">Number of GP Pipes</label>
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
          className="w-full sm:w-auto py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
        >
          Save Installation
        </button>
      </div>
    </form>
  </div>
);

  
};
