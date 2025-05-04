import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchClaims,fetchUploadedDocuments, uploadDocuments, getCustomerById, getConnectionByConsumerId, getDistrictNameByCode, getTalukaNameByCode, getVillageNameByCode, getInstallationByConsumerId, updateConsumerConnectionDetails } from "../services/api"; // Import API functions
import { useLocation } from "react-router-dom";
import { ArrowLeft, Upload, FileUp } from "lucide-react";
import { Stepper, Step } from "react-form-stepper";
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
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
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");
  const customerId = location.state?.customerId;
  const connectionId = location.state?.connectionId; 
  const navigate = useNavigate();
  const [installations, setInstallations] = useState<any[]>([]);
  //const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
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
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("Connection Details");
  const [activeDocumentTab, setActiveDocumentTab] = useState("Aadhar");
  const [activeDocTab, setActiveDocTab] = useState<"Aadhar" | "Passbook" | "Electricity">("Aadhar");
  const [file, setFile] = useState<File | null>(null);
  

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  const phaseTypeMapping: { [key: number]: string } = {
    1: "Single-Phase",
    2: "Three-Phase",
  };


  const installationSpaceTypeMapping: { [key: number]: string } = {
    1: "Slab",
    2: "Metal Sheets",
    3: "Plastic Sheets",
    4: "Clay Tiles",
    5: "Bathroom Slab",
    6: "Cement Sheets",
    7: "On Ground",
  };

  const connectionTypeMapping: { [key: number]: string } = {
    1: "Residential",
    2: "Commercial",
    3: "Industrial",
    4: "PWW",
  };

  const correctionTypeMapping: { [key: number]: string } = {
    1: "Spell Correction",
    2: "Transfer Ownership",
  };

  const addressTypeMapping: { [key: number]: string } = {
    1: "Home",
    2: "Hotel",
    3: "Office",
    4: "Charitable",
    5: "Non_Commercial_Education",
    6: "Street_Light",
    7: "Construction",
    8: "Public_Water_Works",
  };

  const handleFileUpload = async () => {
    setIsLoading(true);
    
    try {
      const result = await uploadDocuments(
        consumerId,
        districtName,
        talukaName,
        villageName,
        govIdName,
        aadharFile,
        passbookFile,
        billFile
      );

      alert("" + result.message);
      setModalOpen(false);
    } catch (error: any) {
      alert("Upload failed: " + error.response?.data?.message || error.message);
    }
    finally {
      setIsLoading(false);
  }
  };





  useEffect(() => {
    const fetchConnection = async () => {
      if (!consumerId) {
        console.error("Consumer ID not found!");
        return;
      }


      const data = await getConnectionByConsumerId(Number(consumerId));
      setConnection(data);
    };

    fetchConnection();
  }, [consumerId]);

  const fetchAndSetUploadedFiles = async () => {
    const files = await fetchUploadedDocuments(
      consumerId,
      districtName,
      talukaName,
      villageName,
      govIdName
    );
  
    const fileMap: { [key: string]: string } = {};
    files.forEach((file: any) => {
      if (file.name.includes("Aadhar")) fileMap["Aadhar"] = file.downloadUrl;
      else if (file.name.includes("Passbook")) fileMap["Passbook"] = file.downloadUrl;
      else if (file.name.includes("Electricity")) fileMap["Electricity"] = file.downloadUrl;
    });
  
    setUploadedFiles(fileMap);
  };

  useEffect(() => {
    if (modalOpen) {
      fetchAndSetUploadedFiles();
    }
  }, [modalOpen]);
  
  

  const handleSingleFileUpload = async () => {
    setIsLoading(true);
    try {
      const result = await uploadDocuments(
        consumerId,
        districtName,
        talukaName,
        villageName,
        govIdName,
        activeDocTab === "Aadhar" ? file : null,
        activeDocTab === "Passbook" ? file : null,
        activeDocTab === "Electricity" ? file : null
      );
  
      alert(`${activeDocTab} uploaded successfully: ` + result.message);
      setFile(null); 
  
      await fetchAndSetUploadedFiles(); 
    } catch (error: any) {
      alert(`${activeDocTab} upload failed: ` + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
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

    // useEffect(() => {
    //   const storedRep = localStorage.getItem("selectedRepresentative");
    //   if (storedRep) {
    //     setSelectedRepresentative(JSON.parse(storedRep));
    //   }
    // }, []);

  useEffect(() => {
    const fetchLocationNames = async () => {
      if (connection) {
        if (connection.districtCode) {
          const name = await getDistrictNameByCode(connection.districtCode);
          setDistrictName(name);
        }
        if (connection.talukaCode) {
          const name = await getTalukaNameByCode(connection.talukaCode);
          setTalukaName(name);
        }
        if (connection.villageCode) {
          const name = await getVillageNameByCode(connection.villageCode);
          setVillageName(name);
        }
      }
    };

    fetchLocationNames();
  }, [connection]);

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

  const handleYes = async () => {
    setShowDialog(false);

    if (connection && connection.id) {
      try {
        const updatedConnection = {
          ...connection,
          isOnboardedCustomers: true,
        };

        const response = await updateConsumerConnectionDetails(connection.id, updatedConnection);
        alert('Customer onboarded successfully!');
        console.log('Updated connection:', response);
      } catch (error) {
        alert('Failed to onboard customer. Please try again.');
        console.error(error);
      }
    }
  };


  const handleNo = async () => {
    setShowDialog(false);
  
    if (connection && connection.id) {
      try {
        const updatedConnection = {
          ...connection,
          isOnboardedCustomers: false, 
        };
  
        const response = await updateConsumerConnectionDetails(connection.id, updatedConnection);
        alert('Customer NOT onboarded.');
        console.log('Updated connection:', response);
      } catch (error) {
        alert('Failed to update customer onboarding status. Please try again.');
        console.error(error);
      }
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


            <div className="flex justify-around mb-4">
              {["Aadhar Card", "Bank Passbook", "Electricity Bill"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveDocTab(tab as any);
                    setFile(null); 
                  }}
                  className={`px-4 py-2 rounded-t ${
                    activeDocTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            
            <div>
              <label className="block font-medium text-gray-700 mb-1">{activeTab} File</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="file"
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-600 file:text-white file:rounded-full hover:file:bg-blue-700"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && <span className="text-sm text-gray-600 truncate">{file.name}</span>}
              </div>
              {uploadedFiles[activeDocTab] && (
                <a
                  href={uploadedFiles[activeDocTab]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 underline mb-4 inline-block"
                >
                  View Uploaded {activeDocTab}
                </a>
              )}
            </div>


            <div className="flex justify-between mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSingleFileUpload}
                disabled={isLoading || !file}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {isLoading ? "Uploading..." : `Upload ${activeDocTab}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

</div>

    {/* <div className="col-span-1 md:col-span-2 mb-6 sm:mb-8 overflow-x-auto">
        <Stepper activeStep={1} styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }} className="min-w-max sm:w-full">
          <Step label="Customer Details" />
          <Step label="Connection Details" />
          <Step label="Installation Space Details" />
          <Step label="System Specifications" />
        </Stepper>
      </div> */}

<div className="col-span-1 md:col-span-2 mb-6 sm:mb-8 w-full max-w-4xl mx-auto overflow-x-auto">
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
  
      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Does the customer currently have an active grid connection with the local electricity provider (e.g., MSEB or BESCOM)?
        </label>
        <div className="mt-2 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="isMsebConnection"
              value="Yes"
              checked={connection.isMsebConnection === true}
              readOnly
              className="text-blue-600 border-gray-300"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="isMsebConnection"
              value="No"
              checked={connection.isMsebConnection === false}
              readOnly
              className="text-blue-600 border-gray-300"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>
  
      {connection.isMsebConnection && (
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
          <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">
            {connection.consumerId || ""}
          </p>
        </div>
      )}
  
      <div>
        <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.gstIn || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Billed To</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.billedTo || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">District</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{districtName || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Taluka</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{talukaName || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Village</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{villageName || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Pincode</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.postalCode || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.addressLine1 || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.addressLine2 || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{addressTypeMapping[connection.addressTypeId] || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Connection Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connectionTypeMapping[connection.connectionTypeId] || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phase Type</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">
            {phaseTypeMapping[connection.phaseTypeId] || ""}
        </p>
      </div>
      
    
      <div>
        <label className="block text-sm font-medium text-gray-700">Monthly Average Consumption Units</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.monthlyAvgConsumptionUnits || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Section ID</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.sectionId || ""}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Latitude</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.latitude || ""}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Longitude</label>
        <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">{connection.longitude || ""}</p>
      </div>
      <div>
  <label className="block text-sm font-medium text-gray-700">
    Does the connection require a name correction?
  </label>
  <div className="mt-2 flex items-center space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="nameCorrection"
        value="Yes"
        checked={connection.isNameCorrectionRequired === true}
        readOnly
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
      />
      <span className="text-sm text-gray-700">Yes</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="nameCorrection"
        value="No"
        checked={connection.isNameCorrectionRequired === false}
        readOnly
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
      />
      <span className="text-sm text-gray-700">No</span>
    </label>
  </div>

  {/* Show correction type only if isNameCorrectionRequired is true */}
  {connection.isNameCorrectionRequired && (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Correction Type</label>
      <p className="mt-1 block w-full p-2 border rounded-md shadow-sm h-10 min-h-[2.5rem]">
      {correctionTypeMapping[connection.correctionTypeId] || ""}
      </p>
    </div>
  )}
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
          <p className="text-sm text-gray-600">
            <strong>Space Type:</strong> {installationSpaceTypeMapping[installation.installationSpaceTypeId] || "Unknown"}
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

{roles.includes("ROLE_ADMIN") && (
        <div className="col-span-1 md:col-span-2 flex justify-start mt-6">
          <button onClick={() => setShowDialog(true)} className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-2">
            Do you want to Onboard the Customer?
          </button>
          {showDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full relative top-[-50px]">
                <h2 className="text-lg font-semibold mb-4">Do you want to onboard the customer?</h2>
                <div className="flex justify-end space-x-4">
                  <button onClick={handleNo} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">No</button>
                  <button onClick={handleYes} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Yes</button>
                </div>
              </div>
            </div>
          )}
    </div>)}

    </div>
  );
  
};
