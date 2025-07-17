import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInstallationByConsumerId, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";

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
  const [roles, setRoles] = useState<string[]>([]);
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [spaceTypes, setSpaceTypes] = useState([]);


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

  useEffect(() => {
    const fetchInstallation = async () => {
      if (consumerId && installationId) {
        try {
          const [installations, spaceTypeList] = await Promise.all([
            getInstallationByConsumerId(Number(consumerId)),
            fetchInstallationSpaceTypesNames(), 
          ]);
  
          if (Array.isArray(installations)) {
            const selectedInstallation = installations.find(
              inst => inst.id === Number(installationId)
            );
            setInstallation(selectedInstallation || null);
          }
  
          if (Array.isArray(spaceTypeList)) {
            setSpaceTypes(spaceTypeList); 
          }
        } catch (error) {
          console.error("Error fetching installation or space types", error);
        }
      }
    };
  
    fetchInstallation();
  }, [consumerId, installationId]);
  

  if (!installation) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">
      <div className="flex flex-col md:flex-row items-center justify-between md:space-x-4 col-span-1 md:col-span-2 mb-2">
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

<div className="flex items-center min-h-[20vh] px-4">
  <div className="bg-white shadow-md rounded-lg p-6 w-full mx-auto max-w-4xl">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">Installation Details</h3>
    <div className="border-b border-gray-200 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20 mb-10">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {spaceTypes.find(type => type.id === installation?.installationSpaceTypeId)?.nameEnglish || "....."}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Installation Space Title</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.installationSpaceTitle || "....."}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">East-West-Length (Feet)</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.availableEastWestLengthFt || "....."}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">South-North-Length (Feet)</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.availableSouthNorthLengthFt || "....."}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20">
      <div>
        <h3 className="text-sm font-medium text-gray-500">AC Wire Length (Feet)</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.acWireLengthFt || "....."}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">DC Wire Length (Feet)</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.dcWireLengthFt || "....."}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Earthing Wire Length (Feet)</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.earthingWireLengthFt || "....."}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Number of GP Pipes</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.numberOfGpPipes || "....."}
        </p>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-sm font-medium text-gray-500">Description about Installation</h3>
        <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
          {installation.descriptionOfInstallation || "....."}
        </p>
      </div>
    </div>
  </div>
</div>


      

      <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center items-center mt-6 space-y-4 sm:space-y-0 sm:space-x-6">
  <button
    onClick={() =>
      navigate(`/edit-installation/${installationId}`, {
        state: { installationId, connectionId, consumerId ,customerId,selectedRepresentative:selectedRepresentative},
      })
    }
    className="w-full sm:w-auto max-w-xs py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    Edit Installation
  </button>

  <button
    onClick={() =>
      navigate(`/view-connection/${connectionId}`, {
        state: { consumerId, customerId, connectionId ,selectedRepresentative:selectedRepresentative},
      })
    }
    className="w-full sm:w-auto max-w-xs py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    Done
  </button>
</div>

    </div>

  );
};
