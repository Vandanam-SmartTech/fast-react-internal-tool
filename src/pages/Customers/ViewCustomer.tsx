import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, fetchConsumerNumber, getInstallationByConnectionId, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon } from "@heroicons/react/24/solid"
import { Eye, User, Phone, Mail, X, ArrowLeft } from 'lucide-react';
import { getUserById } from "../../services/jwtService";


export const ViewCustomer = () => {

  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;
  const [activeTab, setActiveTab] = useState("Customer Details");
  const [installationsByConsumer, setInstallationsByConsumer] = useState<Record<string, any[]>>({});
  const [spaceTypes, setSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  const [showUserModal, setShowUserModal] = useState(false);

  const [referredByUser, setReferredByUser] = useState<any | null>(null);


  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  useEffect(() => {
    const fetchAllInstallations = async () => {
      if (!connections || connections.length === 0) return;

      const newInstallationsMap: Record<string, any[]> = {};

      for (const connection of connections) {
        if (!connection.id) continue;

        try {
          const data = await getInstallationByConnectionId(Number(connection.id));
          newInstallationsMap[connection.id] = data || [];
        } catch (error) {
          console.log("No installations found for consumer:", connection.id);
          newInstallationsMap[connection.id] = [];
        }
      }

      setInstallationsByConsumer(newInstallationsMap);
    };

    fetchAllInstallations();
  }, [connections]);

  useEffect(() => {
    const loadSpaceTypes = async () => {
      try {
        const types = await fetchInstallationSpaceTypesNames();
        setSpaceTypes(types);
      } catch (error) {
        console.error("Failed to load space types", error);
      }
    };

    loadSpaceTypes();
  }, []);


  useEffect(() => {
    console.log("Fetch Consumer Number API is used");

    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setCustomer(data);

        if (data?.referredByUserId) {
          const userResponse = await getUserById(data.referredByUserId);
          if (userResponse.data) {
            setReferredByUser(userResponse.data);
          } else {
            setReferredByUser(null);
          }
        }
      }
    };

    const fetchConnections = async () => {
      if (customerId) {
        try {
          const data = await fetchConsumerNumber(Number(customerId));
          setConnections(data || []);
        } catch (error) {
          console.log("No connections found for customer:", customerId);
          setConnections([]);
        }
      }
    };

    fetchCustomer();
    fetchConnections();
  }, [customerId]);




  if (!customer) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
          {/* Back Arrow */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

            <h1 className="text-2xl font-bold text-gray-700">View Customer Details</h1>
          </div>

        </div>


        <div className="w-full max-w-4xl mx-auto mb-6 mt-2 overflow-x-auto">
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

                const shouldHighlightIcon = tab === "Customer Details";


                return (
                  <button
                    key={tab}
                    className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
                  >
                    <div
                      className={`rounded-full p-2 transition-all duration-300 ${shouldHighlightIcon
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-300 text-gray-500"
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




        {/* Customer Card */}
        <div className="px-2 mt-4">

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Customer Details</h3>
              </div>

              <div
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-900 cursor-pointer transition-colors"
                onClick={() => setShowUserModal(true)}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Referrer: {referredByUser?.nameAsPerGovId || 'User'}</span>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-gray-800">
              <div className="break-words">
                <h3 className="text-sm font-medium text-gray-500">Name as per Gov ID</h3>
                <p className="mt-1 text-base text-gray-800">{customer.govIdName || "....."}</p>
              </div>
              <div className="break-words">
                <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                <p className="mt-1 text-base text-gray-800">+91 {customer.mobileNumber || "....."}</p>
              </div>
              <div className="break-words">
                <h3 className="text-sm font-medium text-gray-500">Preferred Name</h3>
                <p className="mt-1 text-base text-gray-800">{customer.preferredName || "....."}</p>
              </div>
              <div className="break-words">
                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                <p className="mt-1 text-base text-gray-800">{customer.emailAddress || "....."}</p>
              </div>
            </div>
          </div>

          {showUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md mx-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    User Details
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                      <p className="text-base font-medium text-gray-800 mt-1">{referredByUser.nameAsPerGovId}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                      <p className="text-base text-gray-800 mt-1 break-all">{referredByUser.emailAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mobile Number</p>
                      <p className="text-base text-gray-800 mt-1">{referredByUser.contactNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}




          <div className="flex gap-3 justify-start mt-6 max-w-4xl mx-auto">
            <button
              onClick={() =>
                navigate(`/edit-customer`, {
                  state: {
                    customerId,
                  },
                })
              }
              className="py-2 px-5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition"
            >
              Edit Customer
            </button>

            {connections.length === 0 && (
              <button
                onClick={() =>
                  navigate(`/connection-form`, {
                    state: {
                      customerId,
                      govIdName: customer.govIdName,
                    },
                  })
                }
                className="py-2 px-5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition"
              >
                Add New Connection
              </button>
            )}
          </div>
        </div>



        {connections.length > 0 && (
          <div className="mt-6 px-2">
            <div className="max-w-4xl mx-auto space-y-6">

              <div className="space-y-6">
                {connections.map((connection, index) => (
                  <details
                    key={connection.id}
                    className="group/connection rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <summary className="cursor-pointer flex justify-between items-center px-6 py-4 text-base font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <BoltIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-base font-semibold">Connection {index + 1}</span>
                      </div>


                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/view-connection`, {
                              state: {
                                consumerId: connection.consumerId,
                                customerId,
                                connectionId: connection.id,
                              },
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200"
                        >
                          <Eye size={16} className="text-gray-700" />
                          <span className="text-gray-700 text-sm font-medium">View</span>
                        </button>

                        <svg
                          className="w-3 h-3 text-gray-500 transition-transform duration-300 group-open/connection:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </summary>


                    <div className="px-5 pb-5 space-y-6 text-sm text-gray-700">
                      <div className="border-b border-gray-200 mb-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Active Grid Connection</h3>
                          <p className="mt-1 text-base text-gray-800">Yes</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Consumer Number</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.consumerId || "....."}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Billed To</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.billedTo || "....."}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Monthly Avg Consumption Units</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.avgMonthlyConsumption || "....."}</p>
                        </div>


                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Connection Type</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.connectionTypeName || "....."}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phase Type</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.phaseTypeName || "....."}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">DISCOM ID</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.discomId || "....."}</p>
                        </div>


                        <div>
                          <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.gstIn || "....."}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Address Type</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.addressTypeName || "....."}</p>
                        </div>



                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Address</h3>
                          <p className="mt-1 text-base text-gray-800">
                            {connection.addressLine1}, {connection.villageName}, {connection.talukaName}, {connection.districtName}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Postal Code</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.pinCode || "....."}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Latitude , Longitude</h3>
                          <p className="mt-1 text-base text-gray-800">{connection.latitude || "--"}, {connection.longitude || "--"}</p>
                        </div>

                        {connection.isNameCorrectionRequired && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Correction Required</h3>
                            <p className="mt-1 text-base text-gray-800">{connection.correctionTypeName || "....."}</p>
                          </div>
                        )}
                      </div>

                      {/* View/Edit Buttons */}
                      <div className="w-full grid grid-cols-2 gap-4 md:flex md:justify-start md:gap-4">
                        <button
                          onClick={() =>
                            navigate(`/edit-connection`, {
                              state: {
                                consumerId: connection.consumerId,
                                connectionId: connection.id,
                                customerId: customerId,
                              },
                            })
                          }
                          className="w-full md:w-auto py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center justify-center"
                        >
                          Edit Connection
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/system-specifications`, {
                              state: {
                                connectionId: connection.id,
                                consumerId: connection.consumerId,
                                customerId,
                              },
                            })
                          }
                          className="w-full md:w-auto py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center"
                        >
                          Get System Specs
                        </button>
                      </div>



                      {/* Nested Installations */}
                      {(installationsByConsumer[connection.id] || []).map((installation, idx) => (
                        <details key={installation.id} className="group/installation bg-white rounded-md px-4 py-2 border border-gray-200 mb-4">
                          <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-gray-800 group mt-2 mb-2">

                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                <HomeModernIcon className="w-4 h-4 text-yellow-600" />
                              </div>
                              <span className="text-base font-semibold">Installation {idx + 1} - On {spaceTypes.find(type => type.id === installation.installationSpaceTypeId)?.nameEnglish || "....."} ({installation.installationSpaceTitle})</span>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-500 transform transition-transform duration-300 group-open/installation:rotate-180"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>


                          {/* Full Installation Info Block */}
                          <div className="mt-4">
                            <div className="border-b border-gray-200 mb-2 mt-2" />
                            <div className="p-4 w-full">

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20 mb-6">

                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {spaceTypes.find(type => type.id === installation.installationSpaceTypeId)?.nameEnglish || "....."}
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

                              {/* Row 2 */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-20">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Structure To Inverter Distance (Feet)</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {installation.structureInverterDistanceFt || "....."}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Inverter to GenMeter Distance (Feet)</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {installation.inverterMeterDistanceFt || "....."}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Earthing Pit to Inverter Distance (Feet)</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {installation.inverterEarthDistanceFt || "....."}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Lightning Arrester to Ground Distance (Feet)</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {installation.arresterEarthDistanceFt || "....."}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Height of Structure (Feet)</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {installation.minimumElevationFt || "....."}
                                  </p>
                                </div>
                                <div className="md:col-span-2">
                                  <h3 className="text-sm font-medium text-gray-500">Description about Installation</h3>
                                  <p className="mt-1 text-base text-gray-800 break-words whitespace-normal">
                                    {installation.descriptionOfInstallation || "....."}
                                  </p>
                                </div>
                              </div>

                              {/* Optional Edit Button */}
                              <div className="flex mt-6">
                                <button
                                  onClick={() =>
                                    navigate(`/edit-installation`, {
                                      state: {
                                        installationId: installation.id,
                                        connectionId: connection.id,
                                        consumerId: connection.consumerId,
                                        customerId,
                                      }
                                    })
                                  }
                                  className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                  Edit Installation
                                </button>
                              </div>
                            </div>
                          </div>
                        </details>
                      ))}

                      <button
                        onClick={() => {
                          navigate(`/installation-form`, { state: { connectionId: connection.id, consumerId: connection.consumerId, customerId } });
                        }}
                        className="py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Add New Installation
                      </button>



                    </div>

                  </details>
                ))}
              </div>

              {/* Add New Connection button below the collapsibles */}
              <div className="flex justify-start mt-6">
                <button
                  onClick={() =>
                    navigate(`/connection-form`, {
                      state: {
                        customerId: customerId,
                        govIdName: customer.govIdName,
                      },
                    })
                  }
                  className="py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Add New Connection
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );

};