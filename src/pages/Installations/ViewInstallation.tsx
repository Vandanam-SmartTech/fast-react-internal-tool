import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInstallationByConnectionId, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";

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
  const [spaceTypes, setSpaceTypes] = useState([]);

  console.log("installationId", installationId);
  console.log("connectionId", connectionId);
  console.log("customerId", customerId);
  console.log("consumerId", consumerId);


  const [activeTab, setActiveTab] = useState("Installation Details");

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  useEffect(() => {
    const fetchInstallation = async () => {
      if (connectionId && installationId) {
        try {
          const [installations, spaceTypeList] = await Promise.all([
            getInstallationByConnectionId(Number(connectionId)),
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
  }, [connectionId, installationId]);


  if (!installation) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate(`/view-connection`, {
                  state: { consumerId: consumerId, customerId: customerId, connectionId: connectionId },
                })
              }
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Heading - Adjusts Position on Small Screens */}
            <h1 className="text-xl font-bold text-gray-700">View Installation Details</h1>
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

                const shouldHighlightIcon = tab === "Customer Details" || tab === "Connection Details" || tab === "Installation Details";


                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === "Customer Details") {
                        navigate(`/view-customer`, {
                          state: {
                            customerId: customerId,
                          },
                        });
                      } else if (tab === "Connection Details") {
                        navigate(`/view-connection`, {
                          state: { consumerId: consumerId, customerId: customerId, connectionId: connectionId },
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

        <div className="flex items-center min-h-[20vh]">
          <div className="bg-white shadow-md rounded-lg p-4 w-full mx-auto max-w-4xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Installation Details</h3>
            </div>

            <div className="border-b border-gray-200 mb-4 mt-2" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-6 md:gap-x-20 mb-10">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {spaceTypes.find(type => type.id === installation?.installationSpaceTypeId)?.nameEnglish || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Installation Space Title</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.installationSpaceTitle || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">East-West-Length (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.availableEastWestLengthFt || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">South-North-Length (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.availableSouthNorthLengthFt || "NA"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Structure To Inverter Distance (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.structureInverterDistanceFt || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Inverter to GenMeter Distance (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.inverterMeterDistanceFt || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Earthing Pit to Inverter Distance (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.inverterEarthDistanceFt || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Lightning Arrester to Ground Distance (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.arresterEarthDistanceFt || "NA"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Height of Structure (Feet)</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.minimumElevationFt || "NA"}
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Description about Installation</h3>
                <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                  {installation.descriptionOfInstallation || "NA"}
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center items-center mt-4 space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={() =>
              navigate(`/edit-installation`, {
                state: { installationId, connectionId: connectionId, consumerId: consumerId, customerId: customerId },
              })
            }
            className="w-full sm:w-auto max-w-xs py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Edit Installation
          </button>

          <button
            onClick={() =>
              navigate(`/view-connection`, {
                state: { consumerId: consumerId, customerId: customerId, connectionId: connectionId },
              })
            }
            className="w-full sm:w-auto max-w-xs py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Done
          </button>
        </div>

      </div>
    </div>

  );
};