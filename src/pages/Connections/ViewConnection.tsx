import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInstallationSpaceTypesNames, getConnectionByConnectionId, getCustomerById, getInstallationByConnectionId, updateConsumerConnectionDetails } from "../../services/customerRequisitionService";
import { useLocation } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { checkFinalQuotationExists } from "../../services/quotationService";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/UserContext";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";


export const ViewConnection = () => {
  const location = useLocation();
  const consumerId = location.state?.consumerId;
  const [connection, setConnection] = useState<any>(null);
  const customerId = location.state?.customerId;
  const connectionId = location.state?.connectionId;
  const navigate = useNavigate();
  const [, setGovIdName] = useState("");

  const [activeTab, setActiveTab] = useState("Connection Details");


  const [spaceTypes, setSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState('');
  const [messageBoxSeverity, setMessageBoxSeverity] = useState<'success' | 'error'>('success');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | "confirm">("confirm");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [installationsByConsumer, setInstallationsByConsumer] = useState({});

  const { userClaims } = useUser();
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");


  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  const fetchConnection = async () => {
    if (!connectionId) {
      console.error("Connection ID not found!");
      return;
    }

    try {
      const data = await getConnectionByConnectionId(Number(connectionId));

      if (data) {
        setConnection(data);
      } else {
        console.warn("No connection found for given connectionId.");
        setConnection(null);
      }
    } catch (error) {
      console.error("Error fetching connection:", error);
      setConnection(null);
    }
  };

  useEffect(() => {
    fetchConnection();
  }, [connectionId]);


  const handleMessageBoxClose = () => {
    setMessageBoxOpen(false);
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setGovIdName(data?.govIdName || "");
      }
    };
    fetchCustomer();

  }, [customerId]);


  useEffect(() => {
    const fetchInstallations = async () => {
      if (!connectionId) return;
      const installationsData = await getInstallationByConnectionId(Number(connectionId));
      if (installationsData) {
        setInstallationsByConsumer(prev => ({
          ...prev,
          [connectionId]: installationsData,
        }));
      }
    };

    fetchInstallations();
  }, [connectionId]);


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

  const getSpaceTypeName = (id: number) => {
    return spaceTypes.find((type) => type.id === id)?.nameEnglish || "Unknown";
  };

  // const handleOnboardClick = async () => {
  //   if (!connection?.id) return;

  //   try {
  //     setDialogType("confirm");
  //     setDialogMessage("Do you want to onboard the consumer?");
  //     setDialogAction(() => handleYes);
  //     setDialogOpen(true);
  //   } catch (error) {
  //     console.error("Error during onboarding:", error);
  //     setMessageBoxContent("Failed to start onboarding process.");
  //     setMessageBoxSeverity("error");
  //     setMessageBoxOpen(true);
  //   }
  // };

  const handleOnboardClick = async () => {
    if (!connection?.id) return;

    try {
      const exists = await checkFinalQuotationExists(connection.id);

      // if (!exists) {
      //   setDialogType("confirm");
      //   setDialogMessage(
      //     "Final Quotation is not given to this consumer. Do you want to give final quotation?"
      //   );

      //   setDialogAction(() => () => {
      //     navigate(`/system-specifications`, {
      //       state: {
      //         connectionId: connection.id,
      //         consumerId: connection.consumerId,
      //         customerId: connection.customerId,
      //       },
      //     });
      //   });

      //   setDialogOpen(true);
      //   return;
      // }

      setDialogType("confirm");
      setDialogMessage("Do you want to onboard the consumer?");
      setDialogAction(() => handleYes);
      setDialogOpen(true);

    } catch (error) {
      console.error("Error during onboarding:", error);
      setMessageBoxContent("Failed to start onboarding process.");
      setMessageBoxSeverity("error");
      setMessageBoxOpen(true);
    }
  };



  const handleSaveSpecs = () => {
    navigate(`/system-specifications`, {
      state: {
        connectionId: connectionId,
        consumerId: consumerId,
        customerId,
      },
    });
  };

  const handleYes = async () => {
    if (!connection?.id) return;

    try {
      const updatedConnection = {
        ...connection,
        isOnboardedCustomers: true,
      };

      const response = await updateConsumerConnectionDetails(
        connection.id,
        updatedConnection
      );
      toast.success("Consumer onboarded successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      console.log("Updated connection:", response);

      await fetchConnection();

    } catch (error) {
      toast.error("Failed to onboard consumer. Please try again.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      console.error("Onboarding failed:", error);
    }
  };

  const handleNo = async () => {
    if (!connection?.id) return;

    try {
      const updatedConnection = {
        ...connection,
        isOnboardedCustomers: false,
      };

      const response = await updateConsumerConnectionDetails(connection.id, updatedConnection);
      toast.info("Consumer NOT onboarded.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      console.log("Updated connection:", response);

      await fetchConnection();
    } catch (error) {
      toast.error(
        "Failed to update consumer onboarding status. Please try again.",
        {
          autoClose: 1000,
          hideProgressBar: true,
        }
      );
      console.error("Onboarding status update failed:", error);
    }
  };



  if (!connection) return <p>Loading...</p>;



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

          <h1 className="text-xl font-bold text-gray-700">View Connection Details</h1>
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


      <div className="col-span-1 md:col-span-2 flex items-center min-h-[20vh]">
        <div className="bg-white shadow-lg rounded-lg p-4 w-full mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-base font-semibold text-gray-800">
                Connection Details
              </h3>
            </div>

            {/* Right: Status */}
            <div className="text-center leading-tight">
  <p className="text-xs sm:text-sm text-green-700">
    {connection.isGharkulCustomer
      ? "Active Grid Gharkul Connection"
      : "Active Grid Connection"}
  </p>
</div>

          </div>

          <div className="border-b border-gray-200 mb-4" />

          {/* Consumer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Connection Information</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500">Consumer #</h5>
                <p className="text-sm text-gray-800 mt-1">{connection.consumerId || "NA"}</p>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500">Billed To</h5>
                <p className="text-sm text-gray-800 mt-1">{connection.billedTo || "NA"}</p>
              </div>

              {(connection.isGharkulCustomer && <div>
                <h5 className="text-sm font-medium text-gray-500">Gharkul Number</h5>
                <p className="text-sm text-gray-800 mt-1">{connection.gharkulNumber || "NA"}</p>
              </div>)}

              <div>
                <h5 className="text-sm font-medium text-gray-500">GST Number</h5>
                <p className="text-sm text-gray-800 mt-1">{connection.gstIn || "NA"}</p>
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
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-900">Name Correction Required</h4>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500">Correction Name</h5>
                <p className="text-sm text-gray-800 mt-1">{connection.correctionTypeName || "....."}</p>
              </div>
            </div>
          )}


          <div className="col-span-1 md:col-span-2 flex space-x-14">
            <div className="flex justify-start">

              <button
                onClick={() =>
                  navigate(`/edit-connection`, {
                    state: {
                      connectionId,
                      consumerId,
                      customerId
                    },
                  })
                }
                className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              >
                Edit Connection
              </button>

            </div>
          </div>
        </div>
      </div>


      <div className="col-span-1 md:col-span-2 flex flex-col items-center space-y-4 mt-4">
        {(installationsByConsumer[connection.id] || []).map((installation, idx) => (
          <details
            key={installation.id}
            className="group w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <summary className="cursor-pointer flex justify-between items-center px-6 py-4 text-base font-semibold text-gray-800">
              <span>
                Installation {idx + 1} - On {getSpaceTypeName(installation.installationSpaceTypeId)} (
                {installation.installationSpaceTitle || "....."})
              </span>
              <svg
                className="w-3 h-3 text-gray-500 transition-transform duration-300 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>



            {/* Installation Info Block */}
            <div className="px-4 pb-6 text-sm text-gray-700">
              <div className="border-b border-gray-200 mb-4" />
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-16">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
                  <p className="text-sm text-gray-800 mt-1">{getSpaceTypeName(installation.installationSpaceTypeId)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Installation Space Title</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.installationSpaceTitle || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">East-West Length (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.availableEastWestLengthFt || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">South-North Length (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.availableSouthNorthLengthFt || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Structure To Inverter Distance (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.structureInverterDistanceFt || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Inverter to GenMeter Distance (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.inverterMeterDistanceFt || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Earthing Pit to Inverter Distance (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.inverterEarthDistanceFt || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lightning Arrester to Ground Distance (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.arresterEarthDistanceFt || "NA"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Height of Structure (Ft)</h3>
                  <p className="text-sm text-gray-800 mt-1">{installation.minimumElevationFt || "NA"}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-800 whitespace-pre-line">{installation.descriptionOfInstallation || "NA"}</p>
                </div>
              </div>
              </div>

              {/* Edit Button */}
              <div className="flex justify-start mt-4">
                <button
                  onClick={() =>
                    navigate(`/edit-installation`, {
                      state: {
                        installationId: installation.id,
                        connectionId,
                        consumerId: connection.consumerId,
                        customerId,
                      },
                    })
                  }
                  className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Edit Installation
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Action Buttons Section */}
      <div className="col-span-1 md:col-span-2 flex flex-col items-center space-y-4 py-4">


        {/* Responsive Button Grid */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Add New Installation Button */}
            <button
              onClick={() => {
                console.log("Navigating with connectionId:", connectionId);
                console.log("Navigating with consumerId:", consumerId);
                console.log("Navigating with customerId:", customerId);
                if (!connectionId || !consumerId) {
                  alert("Connection ID and Consumer Id is missing!");
                  return;
                }
                navigate(`/installation-form`, {
                  state: {
                    connectionId: connectionId,
                    consumerId: consumerId,
                    customerId,
                  },
                });
              }}
              className="py-2 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <HomeModernIcon className="w-4 h-4" />
              <span>Add New Installation</span>
            </button>



            {/* Get Recommendation Button */}
            <button
              onClick={() =>
                navigate(`/system-specifications`, {
                  state: {
                    connectionId: connectionId,
                    consumerId: consumerId,
                    customerId,
                  },
                })
              }
              className="py-2 px-6 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Get System Specs</span>
            </button>
          </div>
        </div>
      </div>


      {(userInfo?.role === "ROLE_ORG_ADMIN" ||
        userInfo?.role === "ROLE_AGENCY_ADMIN" ||
        userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) &&
        connection && (
          <div className="col-span-1 md:col-span-2 flex flex-col items-center">
            <div className="w-full max-w-4xl flex justify-start">
              {connection.isOnboardedCustomers === true ? (
                <button
                  onClick={() => {
                    setDialogType("confirm");
                    setDialogMessage("Do you want to offboard the consumer?");
                    setDialogAction(() => handleNo);
                    setDialogOpen(true);
                  }}
                  className="py-2 px-6 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Do you want to Offboard the Consumer?
                </button>
              ) : (
                <button
                  onClick={handleOnboardClick}
                  className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Do you want to Onboard the Consumer?
                </button>
              )}
            </div>
          </div>
        )}





      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "success" && "Success"}
          {dialogType === "error" && "Error"}
          {dialogType === "confirm" && "Confirm"}
        </DialogTitle>

        <DialogContent dividers>
          <Alert
            severity={
              dialogType === "success"
                ? "success"
                : dialogType === "error"
                  ? "error"
                  : "info"
            }
          >
            {dialogMessage}
          </Alert>
        </DialogContent>

        <DialogActions>
          {dialogType === "confirm" ? (
            <>
              <Button onClick={() => setDialogOpen(false)}>No</Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogAction) dialogAction();
                }}
                autoFocus
              >
                Yes
              </Button>

            </>
          ) : (
            <Button
              onClick={() => {
                setDialogOpen(false);
                if (dialogAction) dialogAction();
              }}
              autoFocus
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={messageBoxOpen}
        onClose={handleMessageBoxClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {messageBoxSeverity === "success" ? "Success" : "Error"}
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity={messageBoxSeverity}>
            {messageBoxContent}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMessageBoxClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      </div>


    </div>

  );

};