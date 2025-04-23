import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getInstallationByConsumerId, fetchClaims } from "../services/api";
import { Stepper, Step } from "react-form-stepper";
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export const ViewInstallation = () => {

  const [installation, setInstallation] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const consumerId = location.state?.consumerId; 
  const connectionId = location.state?.connectionId;
  const installationId = location.state?.installationId;
  const customerId = location.state?.customerId;
  //const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);
  const selectedRepresentative = location.state?.selectedRepresentative;


  const installationSpaceTypeMapping: { [key: number]: string } = {
    1: "Slab",
    2: "Clay Tiles",
    3: "Metal Sheets",
    4: "Plastic Sheets",
    5: "Bathroom Slab",
    6: "Cement Sheets",
    7: "On Ground",
  };
  const [activeTab, setActiveTab] = useState("Installation Details");

    const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

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

  // useEffect(() => {
  //   const storedRep = localStorage.getItem("selectedRepresentative");
  //   if (storedRep) {
  //     setSelectedRepresentative(JSON.parse(storedRep));
  //   }
  // }, []);

  useEffect(() => {
    const fetchInstallation = async () => {
      if (consumerId && installationId) {
        const data = await getInstallationByConsumerId(Number(consumerId));
        
        if (data && Array.isArray(data)) {
          // Find the specific installation based on installationId
          const selectedInstallation = data.find(inst => inst.id === Number(installationId));
          setInstallation(selectedInstallation || null);
        }
      }
    };
    fetchInstallation();
  }, [consumerId, installationId]);

  if (!installation) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-center justify-between md:space-x-4 col-span-1 md:col-span-2 mb-4">
  {/* Backward Arrow Button (Before Title on Mobile) */}
  <div className="flex items-center w-full md:w-auto">
    <button
      onClick={() =>
        navigate(`/view-connection/${connectionId}`, {
          state: { consumerId, customerId, connectionId ,selectedRepresentative:selectedRepresentative},
        })
      }
      className="p-2 rounded-full hover:bg-gray-200 transition"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>

    {/* Heading - Adjusts Position on Small Screens */}
    <h2 className="text-xl md:text-2xl font-semibold text-gray-700 ml-2 md:ml-0">
      View Installation Details
    </h2>
  </div>

  {/* Selected Representative - Adjusts for Desktop & Mobile */}
  {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}
</div>

{/* <div className="col-span-1 md:col-span-2 mb-6 sm:mb-8 overflow-x-auto">
        <Stepper activeStep={2} styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }} className="min-w-max sm:w-full">
          <Step label="Customer Details" />
          <Step label="Connection Details" />
          <Step label="Installation Space Details" />
          <Step label="System Specifications" />
        </Stepper>
      </div> */}

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

            const shouldHighlightIcon = tab === "Customer Details" || tab==="Connection Details" || tab==="Installation Details";


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


      <h2 className="text-2xl font-semibold text-gray-700 mb-8">Installation Space Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Installation Space Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installationSpaceTypeMapping[installation.installationSpaceTypeId] || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Installation Space Title</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.installationSpaceTitle || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.availableEastWestLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.availableSouthNorthLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">AC Wire Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.acWireLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">DC Wire Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.dcWireLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Earthing Wire Length (Feet)</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.earthingWireLengthFt || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Number of GP Pipes</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.numberOfGpPipes || ""}</p>
      </div>
      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10">{installation.descriptionOfInstallation || ""}</p>
      </div>
      </div>
      

      <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center items-center mt-6 space-y-4 sm:space-y-0 sm:space-x-6">
  <button
    onClick={() =>
      navigate(`/edit-installation/${installationId}`, {
        state: { installationId, connectionId, consumerId ,customerId,selectedRepresentative:selectedRepresentative},
      })
    }
    className="w-full sm:w-auto max-w-xs py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    Edit Installation
  </button>

  <button
    onClick={() =>
      navigate(`/view-connection/${connectionId}`, {
        state: { consumerId, customerId, connectionId ,selectedRepresentative:selectedRepresentative},
      })
    }
    className="w-full sm:w-auto max-w-xs py-3 px-6 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    Done
  </button>
</div>

    </div>

  );
};
