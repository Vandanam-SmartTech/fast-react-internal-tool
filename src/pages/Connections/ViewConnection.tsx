import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInstallationSpaceTypesNames,  fetchConsumerNumber,  getCustomerById, getInstallationByConsumerId, updateConsumerConnectionDetails } from "../../services/customerRequisitionService"; // Import API functions
import { useLocation } from "react-router-dom";
import { fetchClaims } from "../../services/jwtService";
import { fetchUploadedFilesBySession, downloadDocumentById, uploadDocuments } from "../../services/oneDriveService";
import { ArrowLeft, X } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
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
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");
  const navigate = useNavigate();
  const [govIdName, setGovIdName] = useState("");
  const [claims, setClaims] =useState<any>(null);
  
  const state = "Maharashtra";
  const folderType = "Onboarding Documents";

  const [modalOpen, setModalOpen] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Connection Details");
  const [activeDocTab, setActiveDocTab] = useState<SessionKey>("Aadhar");


  const [spaceTypes, setSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState('');
  const [messageBoxSeverity, setMessageBoxSeverity] = useState<'success' | 'error'>('success');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | "confirm">("confirm");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [installationsByConsumer, setInstallationsByConsumer] = useState({});
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg")); 

const sessionMap = {
  Aadhar: "Aadhaar Card",
  Passbook: "Bank Passbook",
  Electricity: "Electricity Bill",
} as const;

type SessionKey = keyof typeof sessionMap;
type SessionName = (typeof sessionMap)[SessionKey];

const [sessionFiles, setSessionFiles] = useState<{
  [key in SessionKey]?: File[];
}>({});
const [uploadedFiles, setUploadedFiles] = useState<{
  [key in SessionKey]?: UploadedFile[];
}>({});

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  useEffect(() => {
  const fetchConnection = async () => {
    if (!customerId || !connectionId) {
      console.error("Customer ID or Connection ID not found!");
      return;
    }

    const data = await fetchConsumerNumber(customerId); 
    if (Array.isArray(data) && data.length > 0) {
      const selectedConnection = data.find(conn => conn.id === Number(connectionId));
      if (selectedConnection) {
        setConnection(selectedConnection);

        setDistrictName(selectedConnection.districtName || "");
        setTalukaName(selectedConnection.talukaName || "");
        setVillageName(selectedConnection.villageName || "");
      } else {
        console.warn("No matching connection found for given connectionId.");
        setConnection(null);
      }
    } else {
      console.warn("No connections found for customer.");
      setConnection(null);
    }
  };

  fetchConnection();
}, [customerId, connectionId]);



  useEffect(() => {
    if (modalOpen) {
      fetchAndSetUploadedFiles();
    }
  }, [modalOpen]);
  
  const handleMessageBoxClose = () => {
  setMessageBoxOpen(false);
  };

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const data = await fetchClaims();
        setClaims(data);
      } catch (error) {
        console.error("Failed to load claims", error);
      }
    };

    loadClaims();
  }, []);


const fetchAndSetUploadedFiles = async () => {
  const connectionId = location.state?.connectionId;

  const fileMap: { [key in SessionKey]?: UploadedFile[] } = {};

  // SessionKey to backend prefix
  const sessionIdentifierMap: Record<SessionKey, string> = {
    Aadhar: "AadhaarCard",
    Passbook: "BankPassbook",
    Electricity: "EBill",
  };

  await Promise.all(
    (Object.entries(sessionMap) as [SessionKey, SessionName][]).map(
      async ([key]) => {
        const backendSessionName = `${sessionIdentifierMap[key]}_${govIdName}`;
        const files = await fetchUploadedFilesBySession(connectionId, backendSessionName);
        fileMap[key] = files;
      }
    )
  );

  setUploadedFiles(fileMap);
};




const handleSingleFileUpload = async (files: File[]) => {
  if (!files || files.length === 0) {
    toast.error("Please select files to upload.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
    return;
  }

  setIsLoading(true);
  try {
    const connectionId = location.state?.connectionId;
    // Map internal session key to session identifier
const sessionIdentifierMap: Record<SessionKey, string> = {
  Aadhar: "AadhaarCard",
  Passbook: "BankPassbook",
  Electricity: "EBill",
};

// Construct backend session name
const backendSessionName = `${sessionIdentifierMap[activeDocTab]}_${govIdName}`;

// Upload with modified session name
const result = await uploadDocuments(connectionId, backendSessionName, files);

    toast.success(`${sessionMap[activeDocTab]} uploaded successfully`, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    await fetchAndSetUploadedFiles();
    setSessionFiles((prev) => ({ ...prev, [activeDocTab]: [] }));
  } catch (error: any) {
    toast.error(`${sessionMap[activeDocTab]} upload failed: ${error.response?.data?.message || error.message}`, {
      autoClose: 1000,
      hideProgressBar: true,
    });
  } finally {
    setIsLoading(false);
  }
};

const handleDownload = async (fileId: string, fileName: string) => {
  try {
    const blob = await downloadDocumentById(fileId);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file.");
  }
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
    if (!consumerId) return;
    const installationsData = await getInstallationByConsumerId(Number(consumerId));
    if (installationsData) {
      setInstallationsByConsumer(prev => ({
        ...prev,
        [consumerId]: installationsData,
      }));
    }
  };

  fetchInstallations();
}, [consumerId]);


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

  const handleYes = async () => {
  if (!connection?.id) return;

  try {
    const updatedConnection = {
      ...connection,
      isOnboardedCustomers: true,
    };

    const response = await updateConsumerConnectionDetails(connection.id, updatedConnection);
    setMessageBoxContent("Consumer onboarded successfully!");
    setMessageBoxSeverity("success");
    setMessageBoxOpen(true);
    console.log("Updated connection:", response);
  } catch (error) {
    setMessageBoxContent("Failed to onboard consumer. Please try again.");
    setMessageBoxSeverity("error");
    setMessageBoxOpen(true);
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
    setMessageBoxContent("Consumer NOT onboarded.");
    setMessageBoxSeverity("error");
    setMessageBoxOpen(true);
    console.log("Updated connection:", response);
  } catch (error) {
    setMessageBoxContent("Failed to update consumer onboarding status. Please try again.");
    setMessageBoxSeverity("error");
    setMessageBoxOpen(true);
    console.error("Onboarding status update failed:", error);
  }
};


  

  if (!connection) return <p>Loading...</p>;

  

  return (
    
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-1 sm:pt-1 pr-4 pl-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:space-x-4 col-span-1 md:col-span-2 w-full">

  <div className="flex items-center w-full md:w-auto">
    <button
      onClick={() =>
        navigate(`/view-customer/${customerId}`, {
          state: { consumerId :consumerId, customerId, connectionId : connectionId },
        })
      }
      className="p-2 rounded-full hover:bg-gray-200 transition"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>


    <h2 className="text-xl md:text-2xl font-semibold text-gray-700 ml-2 md:ml-0">
      View Connection Details
    </h2>
  </div>

</div>


<div className="col-span-1 md:col-span-2 mb-2 w-full max-w-4xl mx-auto overflow-x-auto">
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
                      },
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
  

<div className="col-span-1 md:col-span-2 flex items-center min-h-[20vh] px-4">
  <div className="bg-white shadow-lg rounded-lg p-4 w-full mx-auto max-w-4xl">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Connection Details</h3>
    <div className="border-b border-gray-200 mb-4" />
    
    {/* Connection Status */}
    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <BoltIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-base font-medium text-blue-900">Connection Status</h4>
          <p className="text-sm text-blue-700">Active Grid Connection: Yes</p>
        </div>
      </div>
    </div>

    {/* Consumer Information */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <UserCircleIcon className="w-4 h-4 text-green-600" />
        </div>
        <h4 className="text-base font-medium text-gray-900">Consumer Information</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500">Consumer Number</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.consumerId || "....."}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500">Billed To</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.billedTo || "....."}</p>
        </div>
      </div>
    </div>

    {/* Connection Details */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
          <BoltIcon className="w-4 h-4 text-purple-600" />
        </div>
        <h4 className="text-base font-medium text-gray-900">Connection Details</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500">Monthly Avg Consumption Units</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.monthlyAvgConsumptionUnits || "....."}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500">Connection Type</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.connectionTypeName || "....."}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500">Phase Type</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.phaseTypeName || "....."}</p>
        </div>

      </div>
    </div>

    {/* Business Information */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
          <Cog6ToothIcon className="w-4 h-4 text-orange-600" />
        </div>
        <h4 className="text-base font-medium text-gray-900">Business Information</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500">GST Number</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.gstIn || "....."}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500">Address Type</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.addressTypeName || "....."}</p>
        </div>
      </div>
    </div>

    {/* Address Information */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <HomeModernIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h4 className="text-base font-medium text-gray-900">Address Information</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500">Address</h5>
          <p className="text-sm text-gray-800 mt-1">
            {connection.addressLine1}, {connection.villageName}, {connection.talukaName}, {connection.districtName}
          </p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500">Postal Code</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.postalCode || "....."}</p>
        </div>
      </div>
    </div>

    {/* Location Information */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 className="text-base font-medium text-gray-900">Location Information</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-gray-500">Latitude</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.latitude || "--"}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-500">Longitude</h5>
          <p className="text-sm text-gray-800 mt-1">{connection.longitude || "--"}</p>
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
          <p className="text-sm text-gray-800 mt-1">{connection.correctionName || "....."}</p>
        </div>
      </div>
    )}

    {/* Edit Connection Button */}
    <div className="mt-4 pt-4 border-t border-gray-200">
      <button
        onClick={() =>
          navigate(`/edit-connection/${connectionId}`, {
            state: {
              connectionId,
              consumerId,
              customerId,
            },
          })
        }
        className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
      >
        Edit Connection
      </button>
    </div>
  </div>
</div>


<div className="col-span-1 md:col-span-2 flex flex-col items-center px-4 space-y-6">
  {(installationsByConsumer[connection.consumerId] || []).map((installation, idx) => (
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
      <div className="px-6 pb-6 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Installation Space Type</h3>
            <p className="mt-1">{getSpaceTypeName(installation.installationSpaceTypeId)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Installation Space Title</h3>
            <p className="mt-1">{installation.installationSpaceTitle || "....."}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">East-West Length (Feet)</h3>
            <p className="mt-1">{installation.availableEastWestLengthFt || "....."}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">South-North Length (Feet)</h3>
            <p className="mt-1">{installation.availableSouthNorthLengthFt || "....."}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">AC Wire Length (Feet)</h3>
            <p className="mt-1">{installation.acWireLengthFt || "....."}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">DC Wire Length (Feet)</h3>
            <p className="mt-1">{installation.dcWireLengthFt || "....."}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Earthing Wire Length (Feet)</h3>
            <p className="mt-1">{installation.earthingWireLengthFt || "....."}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Number of GP Pipes</h3>
            <p className="mt-1">{installation.numberOfGpPipes || "....."}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 whitespace-pre-line">{installation.descriptionOfInstallation || "....."}</p>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-start mt-6">
          <button
            onClick={() =>
              navigate(`/edit-installation/${installation.id}`, {
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
<div className="col-span-1 md:col-span-2 px-4 py-4">
  {/* Responsive Button Grid */}
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
        navigate(`/InstallationForm`, {
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

    {/* Upload/View Documents Button */}
    {/* <button
      onClick={() => setModalOpen(true)}
      className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
    >
      <FileUp className="w-4 h-4" />
      <span>Upload/View Documents</span>
    </button> */}

    {/* Get Recommendation Button */}
    <button
      onClick={() =>
        navigate(`/SystemSpecifications`, {
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
      <span>Get Recommendation</span>
    </button>
  </div>
</div>




{/* Document Upload Modal */}
{modalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Upload Required Documents
      </h3>

      {/* Tabs */}
      <div className="flex justify-around mb-4">
        {(Object.keys(sessionMap) as SessionKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveDocTab(key)}
            className={`px-4 py-2 rounded-t ${
              activeDocTab === key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {sessionMap[key]}
          </button>
        ))}
      </div>

      {/* File Upload */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Upload {sessionMap[activeDocTab]} File(s)
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            multiple
            onChange={(e) => {
              const newFiles = Array.from(e.target.files || []);
              setSessionFiles((prev) => {
                const existing = prev[activeDocTab] || [];
                const updated = [...existing];
                newFiles.forEach((file) => {
                  if (!existing.find((f) => f.name === file.name)) {
                    updated.push(file);
                  }
                });
                return { ...prev, [activeDocTab]: updated };
              });
              e.target.value = "";
            }}
          />

          <label
            htmlFor="fileUpload"
            className="cursor-pointer text-sm py-2 px-4 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Choose Files
          </label>
        </div>

        {/* Selected Files */}
        {sessionFiles[activeDocTab]?.length > 0 && (
          <ul className="text-sm text-gray-700 mb-4">
            {sessionFiles[activeDocTab].map((file, idx) => (
              <li
                key={file.name + idx}
                className="flex justify-between items-center border px-2 py-1 rounded mb-1 bg-gray-50"
              >
                <span className="truncate max-w-[80%]">{file.name}</span>
                <button
                  onClick={() => {
                    setSessionFiles((prev) => {
                      const updated = (prev[activeDocTab] || []).filter(
                        (_, index) => index !== idx
                      );
                      return { ...prev, [activeDocTab]: updated };
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Uploaded Files */}
        {uploadedFiles[activeDocTab]?.length > 0 && (
          <div className="text-sm text-green-600 mb-4 space-y-1">
            {uploadedFiles[activeDocTab].map((file) => (
              <div key={file.fileId} className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(file.fileId, file.fileName)}
                  className="underline text-left text-green-600 hover:text-green-900"
                >
                  {file.fileName}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setModalOpen(false)}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSingleFileUpload(sessionFiles[activeDocTab] || [])}
          disabled={isLoading || !(sessionFiles[activeDocTab]?.length > 0)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? "Uploading..." : `Upload ${sessionMap[activeDocTab]}`}
        </button>
      </div>
    </div>
  </div>
)}



  
{(userInfo?.role === "ROLE_ORG_ADMIN" || userInfo?.role === "ROLE_AGENCY_ADMIN"  
  || claims?.global_roles?.includes("ROLE_SUPER_ADMIN")
)&& connection && (
  <div className="col-span-1 md:col-span-2 flex justify-start px-4 mt-6">
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
        onClick={() => {
          setDialogType("confirm");
          setDialogMessage("Do you want to onboard the consumer?");
          setDialogAction(() => handleYes); 
          setDialogOpen(true);
        }}
        className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Do you want to Onboard the Consumer?
      </button>
    )}
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
            if (dialogAction) dialogAction(); // run action like `handleYes`
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

  );
  
};