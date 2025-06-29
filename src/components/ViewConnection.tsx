import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClaims,fetchUploadedFilesBySession, fetchInstallationSpaceTypesNames, downloadDocumentById, fetchConsumerNumber, uploadDocuments, getCustomerById, getInstallationByConsumerId, updateConsumerConnectionDetails } from "../services/api"; // Import API functions
import { useLocation } from "react-router-dom";
import { ArrowLeft, FileUp, X } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
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
  const [installations, setInstallations] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [govIdName, setGovIdName] = useState("");
  
  const state = "Maharashtra";
  const folderType = "Onboarding Documents";

  const [modalOpen, setModalOpen] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  //const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("Connection Details");
  const [activeDocTab, setActiveDocTab] = useState<SessionKey>("Aadhar");
  //const [activeDocTab, setActiveDocTab] = useState<"Aadhar Card" | "Bank Passbook" | "Electricity Bill">("Aadhar Card");

  const [spaceTypes, setSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState('');
  const [messageBoxSeverity, setMessageBoxSeverity] = useState<'success' | 'error'>('success');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | "confirm">("confirm");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

const sessionMap = {
  Aadhar: "Aadhar Card",
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

  // const installationSpaceTypeMapping: { [key: number]: string } = {
  //   1: "Slab",
  //   2: "Metal Sheets",
  //   3: "Plastic Sheets",
  //   4: "Clay Tiles",
  //   5: "Bathroom Slab",
  //   6: "Cement Sheets",
  //   7: "On Ground",
  // };


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


const fetchAndSetUploadedFiles = async () => {
  const connectionId = location.state?.connectionId;

  const fileMap: { [key in SessionKey]?: UploadedFile[] } = {};

  await Promise.all(
    (Object.entries(sessionMap) as [SessionKey, SessionName][]).map(
      async ([key, sessionName]) => {
        const files = await fetchUploadedFilesBySession(connectionId, sessionName);
        fileMap[key] = files;
      }
    )
  );

  setUploadedFiles(fileMap);
};



const handleSingleFileUpload = async (files: File[]) => {
  if (!files || files.length === 0) {
    alert("Please select files to upload.");
    return;
  }

  setIsLoading(true);
  try {
    const connectionId = location.state?.connectionId;
    const result = await uploadDocuments(connectionId, sessionMap[activeDocTab], files);
    alert(`${sessionMap[activeDocTab]} uploaded successfully`);
    await fetchAndSetUploadedFiles();
    setSessionFiles((prev) => ({ ...prev, [activeDocTab]: [] }));
  } catch (error: any) {
    alert(`${sessionMap[activeDocTab]} upload failed: ${error.response?.data?.message || error.message}`);
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
    const fetchInstallations = async () => {
      if (!consumerId) return;
      const installationsData = await getInstallationByConsumerId(Number(consumerId));
      if (installationsData) {
        setInstallations(installationsData);
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
    setMessageBoxContent("Customer onboarded successfully!");
    setMessageBoxSeverity("success");
    setMessageBoxOpen(true);
    console.log("Updated connection:", response);
  } catch (error) {
    setMessageBoxContent("Failed to onboard customer. Please try again.");
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
    setMessageBoxContent("Customer NOT onboarded.");
    setMessageBoxSeverity("error");
    setMessageBoxOpen(true);
    console.log("Updated connection:", response);
  } catch (error) {
    setMessageBoxContent("Failed to update customer onboarding status. Please try again.");
    setMessageBoxSeverity("error");
    setMessageBoxOpen(true);
    console.error("Onboarding status update failed:", error);
  }
};


  

  if (!connection) return <p>Loading...</p>;

  

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:space-x-4 col-span-1 md:col-span-2 mb-4 w-full">

  <div className="flex items-center w-full md:w-auto">
    <button
      onClick={() =>
        navigate(`/view-customer/${customerId}`, {
          state: { consumerId :consumerId, customerId, connectionId : connectionId ,selectedRepresentative :selectedRepresentative},
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


  {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="text-sm text-gray-600 mt-2 md:mt-0">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}

<div className="mt-2 md:mt-0 md:ml-auto">
  <button
    onClick={() => setModalOpen(true)}
    className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200"
  >
    <FileUp className="w-6 h-6 text-gray-700" />
  </button>

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
</div>



</div>


<div className="col-span-1 md:col-span-2 mb-6 sm:mb-8 w-full max-w-4xl mx-auto overflow-x-auto">
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
  <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-28">
      <div>
          <h3 className="text-sm font-medium text-gray-500">Active Grid Connection</h3>
          <p className="mt-1 text-base text-gray-800">Yes</p>
      </div>
      
      <div>
          <h3 className="text-sm font-medium text-gray-500">Consumer Number</h3>
          <p className="mt-1 text-base text-gray-800">{connection.consumerId || "......"}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
          <p className="mt-1 text-base text-gray-800">{connection.gstIn || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Billed To</h3>
          <p className="mt-1 text-base text-gray-800">{connection.billedTo || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Address Line 1</h3>
          <p className="mt-1 text-base text-gray-800">{connection.addressLine1 || "....."}</p>
      </div>
      <div>
          <h3 className="text-sm font-medium text-gray-500">Address Line 2</h3>
          <p className="mt-1 text-base text-gray-800">{connection.addressLine2 || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Village Name</h3>
          <p className="mt-1 text-base text-gray-800">{connection.villageName || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Taluka Name</h3>
          <p className="mt-1 text-base text-gray-800">{connection.talukaName || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">District Name</h3>
          <p className="mt-1 text-base text-gray-800">{connection.districtName || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Postal Code</h3>
          <p className="mt-1 text-base text-gray-800">{connection.postalCode || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Address Type</h3>
          <p className="mt-1 text-base text-gray-800">{connection.addressTypeName || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Monthly Average Consumption Units</h3>
          <p className="mt-1 text-base text-gray-800">{connection.monthlyAvgConsumptionUnits || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Phase Type</h3>
          <p className="mt-1 text-base text-gray-800">{connection.phaseTypeName || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Connection Type</h3>
          <p className="mt-1 text-base text-gray-800">{connection.connectionTypeName || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Latitude</h3>
          <p className="mt-1 text-base text-gray-800">{connection.latitude || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">longitude</h3>
          <p className="mt-1 text-base text-gray-800">{connection.longitude || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">Section ID</h3>
          <p className="mt-1 text-base text-gray-800">{connection.sectionId || "....."}</p>
      </div>

      <div>
          <h3 className="text-sm font-medium text-gray-500">DISCOM ID</h3>
          <p className="mt-1 text-base text-gray-800">{connection.discomId || "....."}</p>
      </div>

      {connection.isNameCorrectionRequired && (
  <div>
    <h3 className="text-sm font-medium text-gray-500">Correction Required</h3>
    <p className="mt-1 text-base text-gray-800">{connection.correctionName || "....."}</p>
  </div>
)}
    </div>
  </div>
</div>


  
      {/* Edit Connection Button (Before Installations) */}
      <div className="col-span-1 md:col-span-2 flex justify-start mt-6">
        <button
          onClick={() => navigate(`/edit-connection/${connectionId}`, { state: { connectionId: connectionId, consumerId, customerId, selectedRepresentative:selectedRepresentative} })}
          className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
        >
          Edit Connection
        </button>
      </div>
  
      {/* Installation Cards */}
      {installations.length > 0 ? (
  <>
    <h2 className="text-2xl font-semibold text-gray-700 mt-6 col-span-1 md:col-span-2">Installations</h2>
    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      {installations.map((installation, index) => (
        <div key={installation.id} className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold">Installation {index + 1}</h3>
          <p className="text-lg text-gray-600 break-words">
  {installation.installationSpaceTitle && (
    <span>({installation.installationSpaceTitle})</span>
  )}
</p>

          <p className="text-sm text-gray-600">
      <strong>Space Type:</strong> {getSpaceTypeName(installation.installationSpaceTypeId)}
    </p>
          <p className="text-sm text-gray-600">
            <strong>East-West Length:</strong> {installation.availableEastWestLengthFt} ft
          </p>
          <p className="text-sm text-gray-600">
            <strong>South-North Length:</strong> {installation.availableSouthNorthLengthFt} ft
          </p>
          <button
            onClick={() =>
              navigate(`/view-installation/${installation.id}`, { state: { connectionId: connectionId, consumerId: consumerId, customerId,installationId: installation.id,selectedRepresentative:selectedRepresentative } })
            }
            className="mt-2 py-1 px-3 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600"
          >
            View
          </button>
        </div>
      ))}
    </div>
  </>
) : (
  <p className="text-gray-500">No installations found.</p>
)}



  
      {/* Add New Installation Button (After Installations) */}
      <div className="col-span-1 md:col-span-2 flex justify-center mt-6 space-x-14">
  <button
    onClick={() => {
      console.log("Navigating with connectionId:", connectionId);
      console.log("Navigating with consumerId:", consumerId);
      console.log("Navigating with customerId:",customerId);
      if (!connectionId || !consumerId) {
        alert("Connection ID and Consumer Id is missing!");
        return;
      }
      navigate(`/InstallationForm`, { state: { connectionId: connectionId, consumerId: consumerId, customerId, selectedRepresentative:selectedRepresentative } });
    }}
    className="py-3 px-4 sm:px-6 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
  >
    Add New Installation
  </button>
  <button
    onClick={() => navigate(`/SystemSpecifications`, { state: { connectionId: connectionId, consumerId: consumerId, customerId,selectedRepresentative:selectedRepresentative}})}
          className="py-3 px-4 sm:px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    Get Recommendation
  </button>
</div>

{roles.includes("ROLE_ADMIN") && connection && (
  <div className="col-span-1 md:col-span-2 flex justify-start mt-6">
    {connection.isOnboardedCustomers === true ? (
      <button
        onClick={() => {
          setDialogType("confirm");
          setDialogMessage("Do you want to offboard the customer?");
          setDialogAction(() => handleNo); 
          setDialogOpen(true);
        }}
        className="py-3 px-6 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 mx-2"
      >
        Do you want to Offboard the Customer?
      </button>
    ) : (
      <button
        onClick={() => {
          setDialogType("confirm");
          setDialogMessage("Do you want to onboard the customer?");
          setDialogAction(() => handleYes); 
          setDialogOpen(true);
        }}
        className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2"
      >
        Do you want to Onboard the Customer?
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
