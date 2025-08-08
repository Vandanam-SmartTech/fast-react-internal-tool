import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInstallationSpaceTypesNames,  fetchConsumerNumber,  getCustomerById, getInstallationByConsumerId, updateConsumerConnectionDetails } from "../../services/customerRequisitionService";
import { useLocation } from "react-router-dom";
import { fetchClaims } from "../../services/jwtService";
import { fetchUploadedFilesBySession, downloadDocumentById, uploadDocuments } from "../../services/oneDriveService";
import { ArrowLeft, FileUp, X, Bolt, MapPin, Settings, CheckCircle, Plus, Edit, Eye, Upload, Download } from "lucide-react";
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

  const fetchAndSetUploadedFiles = async () => {
    const connectionId = location.state?.connectionId;

    const fileMap: { [key in SessionKey]?: UploadedFile[] } = {};

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
      const sessionIdentifierMap: Record<SessionKey, string> = {
        Aadhar: "AadhaarCard",
        Passbook: "BankPassbook",
        Electricity: "EBill",
      };

      const backendSessionName = `${sessionIdentifierMap[activeDocTab]}_${govIdName}`;

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(`/view-customer/${customerId}`, {
                    state: { consumerId: consumerId, customerId, connectionId: connectionId, selectedRepresentative: selectedRepresentative },
                  })
                }
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
                <Bolt className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">View Connection Details</h1>
                <p className="text-gray-600 mt-1">Connection information and specifications</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
                  </div>
                </div>
              )}

              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Upload className="h-5 w-5" />
                Upload Documents
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 rounded-full"></div>
            <div className="relative flex justify-between">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab;
                const Icon = tab === "Customer Details" ? UserCircleIcon : 
                           tab === "Connection Details" ? BoltIcon :
                           tab === "Installation Details" ? HomeModernIcon : Cog6ToothIcon;

                return (
                  <div key={tab} className="flex flex-col items-center">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg scale-110' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium mt-2 text-center ${
                      isActive ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {tab}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Connection Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Bolt className="h-5 w-5" />
              Connection Information
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Consumer Number
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.consumerId || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Connection Type
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.connectionTypeName || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phase Type
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.phaseTypeName || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Monthly Consumption
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.monthlyAvgConsumptionUnits || "Not provided"} units
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Section ID
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.sectionId || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  GST Number
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.gstIn || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Address Type
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.addressTypeName || "Not provided"}
                </p>
              </div>

              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Address
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.addressLine1}, {connection.villageName}, {connection.talukaName}, {connection.districtName}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Postal Code
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.postalCode || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Coordinates
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {connection.latitude || "--"}, {connection.longitude || "--"}
                </p>
              </div>

              {connection.isNameCorrectionRequired && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Correction Required
                  </label>
                  <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {connection.correctionName || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() =>
                  navigate(`/edit-connection/${connectionId}`, {
                    state: {
                      connectionId,
                      consumerId,
                      customerId,
                      selectedRepresentative,
                    },
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Edit className="h-5 w-5" />
                Edit Connection
              </button>

              <button
                onClick={() =>
                  navigate(`/SystemSpecifications`, {
                    state: {
                      connectionId: connectionId,
                      consumerId: consumerId,
                      customerId,
                      selectedRepresentative: selectedRepresentative,
                    },
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Settings className="h-5 w-5" />
                Get Recommendation
              </button>
            </div>
          </div>
        </div>

        {/* Installations Section */}
        {(installationsByConsumer[connection.consumerId] || []).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg">
                <HomeModernIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Installations</h2>
            </div>

            <div className="space-y-4">
              {(installationsByConsumer[connection.consumerId] || []).map((installation, idx) => (
                <div key={installation.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <HomeModernIcon className="h-5 w-5" />
                        Installation {idx + 1} - {getSpaceTypeName(installation.installationSpaceTypeId)}
                      </h3>
                      <span className="text-sm font-medium text-white bg-white/20 px-3 py-1 rounded-full">
                        {installation.installationSpaceTitle}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Installation Space Type
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {getSpaceTypeName(installation.installationSpaceTypeId)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Installation Space Title
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.installationSpaceTitle || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          East-West Length (Feet)
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.availableEastWestLengthFt || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          South-North Length (Feet)
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.availableSouthNorthLengthFt || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          AC Wire Length (Feet)
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.acWireLengthFt || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          DC Wire Length (Feet)
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.dcWireLengthFt || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Earthing Wire Length (Feet)
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.earthingWireLengthFt || "Not provided"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Number of GP Pipes
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {installation.numberOfGpPipes || "Not provided"}
                        </p>
                      </div>

                      {installation.descriptionOfInstallation && (
                        <div className="md:col-span-2 lg:col-span-3 space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Description
                          </label>
                          <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                            {installation.descriptionOfInstallation}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-start mt-6">
                      <button
                        onClick={() =>
                          navigate(`/edit-installation/${installation.id}`, {
                            state: {
                              installationId: installation.id,
                              connectionId,
                              consumerId: connection.consumerId,
                              customerId,
                              selectedRepresentative,
                            },
                          })
                        }
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Edit className="h-5 w-5" />
                        Edit Installation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Installation Button */}
        <div className="flex justify-start mt-6">
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
                  selectedRepresentative: selectedRepresentative,
                },
              });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Add New Installation
          </button>
        </div>

        {/* Onboarding Section for Admins */}
        {roles.includes("ROLE_ADMIN") && connection && (
          <div className="flex justify-start mt-6">
            {connection.isOnboardedCustomers === true ? (
              <button
                onClick={() => {
                  setDialogType("confirm");
                  setDialogMessage("Do you want to offboard the consumer?");
                  setDialogAction(() => handleNo); 
                  setDialogOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <CheckCircle className="h-5 w-5" />
                Offboard Consumer
              </button>
            ) : (
              <button
                onClick={() => {
                  setDialogType("confirm");
                  setDialogMessage("Do you want to onboard the consumer?");
                  setDialogAction(() => handleYes); 
                  setDialogOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <CheckCircle className="h-5 w-5" />
                Onboard Consumer
              </button>
            )}
          </div>
        )}

        {/* Document Upload Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-300">
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
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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
                    className="cursor-pointer text-sm py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700"
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
                          className="underline text-left text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
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
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 disabled:opacity-60"
                >
                  {isLoading ? "Uploading..." : `Upload ${sessionMap[activeDocTab]}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialogs */}
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
