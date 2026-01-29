import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, fetchConsumerNumber, getInstallationByConnectionId, fetchInstallationSpaceTypesNames, getCustomerConnectionInstallationById } from "../../services/customerRequisitionService";
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon } from "@heroicons/react/24/solid"
import { Eye, User, Phone, Mail, X, ArrowLeft } from 'lucide-react';
import { getUserById } from "../../services/jwtService";


export const ViewCustomer = () => {

  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;
  const [activeTab,] = useState("Customer Details");
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

  // useEffect(() => {
  //   const fetchAllInstallations = async () => {
  //     if (!connections || connections.length === 0) return;

  //     const newInstallationsMap: Record<string, any[]> = {};

  //     for (const connection of connections) {
  //       if (!connection.id) continue;

  //       try {
  //         const data = await getInstallationByConnectionId(Number(connection.id));
  //         newInstallationsMap[connection.id] = data || [];
  //       } catch (error) {
  //         console.log("No installations found for consumer:", connection.id);
  //         newInstallationsMap[connection.id] = [];
  //       }
  //     }

  //     setInstallationsByConsumer(newInstallationsMap);
  //   };

  //   fetchAllInstallations();
  // }, [connections]);

  // useEffect(() => {
  //   const loadSpaceTypes = async () => {
  //     try {
  //       const types = await fetchInstallationSpaceTypesNames();
  //       setSpaceTypes(types);
  //     } catch (error) {
  //       console.error("Failed to load space types", error);
  //     }
  //   };

  //   loadSpaceTypes();
  // }, []);


  // useEffect(() => {
  //   console.log("Fetch Consumer Number API is used");

  //   const fetchCustomer = async () => {
  //     if (customerId) {
  //       const data = await getCustomerById(Number(customerId));
  //       setCustomer(data);

  //       if (data?.referredByUserId) {
  //         const userResponse = await getUserById(data.referredByUserId);
  //         if (userResponse.data) {
  //           setReferredByUser(userResponse.data);
  //         } else {
  //           setReferredByUser(null);
  //         }
  //       }
  //     }
  //   };

  //   const fetchConnections = async () => {
  //     if (customerId) {
  //       try {
  //         const data = await fetchConsumerNumber(Number(customerId));
  //         setConnections(data || []);
  //       } catch (error) {
  //         console.log("No connections found for customer:", customerId);
  //         setConnections([]);
  //       }
  //     }
  //   };

  //   fetchCustomer();
  //   fetchConnections();
  // }, [customerId]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!customerId) return;

      try {
        const data = await getCustomerConnectionInstallationById(Number(customerId));

        if (!data) return;

        // Set Customer details
        setCustomer(data);

        // Set referred by user if exists
        if (data.referredByUserId) {
          const userResponse = await getUserById(data.referredByUserId);
          setReferredByUser(userResponse?.data || null);
        }

        // Set all connections directly from response
        setConnections(data.connections || []);

        // Prepare installation map
        const installationMap: Record<string, any[]> = {};

        data.connections?.forEach((conn: any) => {
          installationMap[conn.connectionId] = conn.installationSpaces || [];
        });

        setInstallationsByConsumer(installationMap);

      } catch (error) {
        console.error("Error loading customer + connections + installations", error);
      }
    };

    fetchAllData();
  }, [customerId]);





  if (!customer) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">


        <div className="flex items-center gap-2">
          {/* Back Arrow */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="text-xl font-bold text-gray-700">View Customer Details</h1>
        </div>



        <div className="w-full max-w-4xl mx-auto mb-4 mt-2 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
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

        {/* Customer Card */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-4xl mx-auto">
            <div className="mb-1">
              <div className="flex items-start sm:items-center">
                {/* Customer Details */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 whitespace-nowrap">
                    Customer Details
                  </h3>
                </div>

                {/* Ref User */}
                <div
                  className="
        ml-auto
        text-sm text-blue-600 hover:text-blue-900
        cursor-pointer transition-colors
        text-right
        max-w-[55%]
      "
                  onClick={() => setShowUserModal(true)}
                >
                  <span className="font-medium">
                    Ref:&nbsp;
                    <span className="sm:whitespace-nowrap break-words">
                      {referredByUser?.nameAsPerGovId || "User"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-4" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 ">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 text-gray-800">
                <div className="break-words">
                  <h3 className="text-sm font-medium text-gray-500">Gov ID Name</h3>
                  <p className="mt-1 text-sm text-gray-800">{customer.govIdName || "....."}</p>
                </div>
                <div className="break-words">
                  <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                  <p className="mt-1 text-sm text-gray-800">+91 {customer.mobileNumber || "....."}</p>
                </div>
                <div className="break-words">
                  <h3 className="text-sm font-medium text-gray-500">Preferred Name</h3>
                  <p className="mt-1 text-sm text-gray-800">{customer.preferredName || "....."}</p>
                </div>
                <div className="break-words">
                  <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                  <p className="mt-1 text-sm text-gray-800">{customer.emailAddress || "....."}</p>
                </div>
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




          <div className="flex flex-row flex-wrap gap-2 justify-start mt-4 max-w-4xl mx-auto">
  <button
    onClick={() =>
      navigate(`/edit-customer`, {
        state: { customerId },
      })
    }
    className="py-2 px-4 sm:px-5 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition text-sm sm:text-sm md:text-base"
  >
    Edit Customer
  </button>

  {connections.length === 0 && (
    <button
      onClick={() =>
        navigate(`/connection-form`, {
          state: { customerId, govIdName: customer.govIdName },
        })
      }
      className="py-2 px-4 sm:px-5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition text-sm sm:text-sm md:text-base"
    >
      Add New Connection
    </button>
  )}
</div>


        </div>


        {connections.length > 0 && (
          <div className="mt-4">
            <div className="max-w-4xl mx-auto space-y-6">

              <div className="space-y-6">
                {connections.map((connection, index) => (
                  <details
                    key={connection.connectionId}
                    className="group/connection rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <summary className="cursor-pointer flex justify-between items-center px-6 py-4 text-base font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <BoltIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-base font-semibold">Connection {index + 1}</span>
                      </div>


                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/view-connection`, {
                              state: {
                                consumerId: connection.consumerNumber,
                                customerId,
                                connectionId: connection.connectionId,
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


                    <div className="px-5 pb-5 space-y-4 text-sm text-gray-700">
                      <div className="border-b border-gray-200" />

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-2">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="text-base font-medium text-gray-900">Connection Information</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Consumer #</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.consumerNumber || "NA"}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Avg Units/Month</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.avgMonthlyConsumption || "NA"}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Connection Type</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.connectionTypeName || "NA"}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Phase Type</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.phaseTypeName || "NA"}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">DISCOM ID</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.discomId || "NA"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <Cog6ToothIcon className="w-4 h-4 text-orange-600" />
                          </div>
                          <h4 className="text-base font-medium text-gray-900">Business Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Billed To</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.billedTo || "NA"}</p>
                          </div>

                          {(connection.isGharkulCustomer &&<div>
                            <h5 className="text-sm font-medium text-gray-500">Gharkul Number</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.gharkulNumber || "NA"}</p>
                          </div>)}

                          <div>
                            <h5 className="text-sm font-medium text-gray-500">GST Number</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.gstNumber || "NA"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <HomeModernIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <h4 className="text-base font-medium text-gray-900">Address Information</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {/* Address - full width on mobile */}
                          <div className="col-span-2 md:col-span-1">
                            <h5 className="text-sm font-medium text-gray-500">Address</h5>
                            <p className="text-sm text-gray-800 mt-1">
                              {connection.addressLine1}, {connection.villageName}, {connection.talukaName},{" "}
                              {connection.districtName}, {connection.pinCode}
                            </p>
                          </div>

                          {/* Address Type */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Address Type</h5>
                            <p className="text-sm text-gray-800 mt-1">
                              {connection.addressTypeName || "NA"}
                            </p>
                          </div>

                          {/* Latitude, Longitude */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Lat, Long</h5>
                            <p className="text-sm text-gray-800 mt-1">
                              {connection.latitude || "NA"}, {connection.longitude || "NA"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Name Correction */}
                      {connection.isNameCorrectionRequired && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                            <h4 className="text-base font-medium text-gray-900">Name Correction Required</h4>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500">Correction Name</h5>
                            <p className="text-sm text-gray-800 mt-1">{connection.correctionTypeName || "NA"}</p>
                          </div>
                        </div>
                      )}


                      {/* View/Edit Buttons */}
                      <div className="w-full grid grid-cols-2 gap-2 md:flex md:justify-start md:gap-4">
                        <button
                          onClick={() =>
                            navigate(`/edit-connection`, {
                              state: {
                                consumerId: connection.consumerNumber,
                                connectionId: connection.connectionId,
                                customerId: customerId,
                              },
                            })
                          }
                          className="
      w-full md:w-auto 
      py-1.5 px-3.5 sm:py-2 sm:px-5 
      bg-blue-600 text-white font-semibold 
      rounded-md hover:bg-blue-700 
      flex items-center justify-center
      text-sm 
    "
                        >
                          Edit Connection
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/system-specifications`, {
                              state: {
                                connectionId: connection.connectionId,
                                consumerId: connection.consumerNumber,
                                customerId,
                              },
                            })
                          }
                          className="
      w-full md:w-auto 
      py-1.5 px-3.5 sm:py-2 sm:px-
      bg-green-600 text-white font-semibold 
      rounded-md hover:bg-green-700 
      flex items-center justify-center
      text-sm 
    "
                        >
                          Get Sys Specs
                        </button>
                      </div>




                      {/* Nested Installations */}
                      {(installationsByConsumer[connection.connectionId] || []).map((installation, idx) => (
                        <details key={installation.id} className="group/installation bg-white rounded-md px-4 py-2 border border-gray-200 mb-4">
                          <summary className="flex items-center justify-between cursor-pointer mt-2 mb-2 group">
                            {/* Left section */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <HomeModernIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                              </div>
                              <span className="text-sm sm:text-base font-semibold leading-snug">
                                Installation {idx + 1} - On {installation.installationSpaceTypeName}
                              </span>
                            </div>

                            {/* Chevron */}
                            <svg
                              className="w-4 h-4 text-gray-500 transform transition-transform duration-300 group-open/installation:rotate-180 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>


                          {/* Full Installation Info Block */}
                          <div className="mt-4">
                            <div className="border-b border-gray-200 mb-4 mt-2" />
                            <div className="w-full">
                              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-6 md:gap-x-20 mb-6">

                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.installationSpaceTypeName || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Installation Space Title</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.installationSpaceTitle || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">East-West-Length (Ft)</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.availableEastWestLengthFt || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">South-North-Length (Ft)</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.availableSouthNorthLengthFt || "NA"}
                                  </p>
                                </div>
                       

                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Structure To Inverter Distance (Ft)</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.structureInverterDistanceFt || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Inverter to GenMeter Distance (Ft)</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.inverterMeterDistanceFt || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Earthing Pit to Inverter Distance (Ft)</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.inverterEarthDistanceFt || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Lightning Arrester to Ground Distance (Ft)</h3>
                                  <p className="mt-1 text-sm text-gray-800 break-words whitespace-normal">
                                    {installation.arresterEarthDistanceFt || "NA"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Height of Structure (Ft)</h3>
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

                              {/* Optional Edit Button */}
                              <div className="flex mt-4">
                                <button
                                  onClick={() =>
                                    navigate(`/edit-installation`, {
                                      state: {
                                        installationId: installation.installationSpaceId,
                                        connectionId: connection.connectionId,
                                        consumerId: connection.consumerNumber,
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
                          navigate(`/installation-form`, { state: { connectionId: connection.connectionId, consumerId: connection.consumerNumber, customerId } });
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
                 className="py-2 px-4 sm:px-5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition text-sm sm:text-sm md:text-base"
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