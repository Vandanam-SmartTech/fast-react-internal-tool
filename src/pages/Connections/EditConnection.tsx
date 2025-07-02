import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getConnectionByConsumerId, updateConsumerConnectionDetails } from "../../services/customerRequisitionService";
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/customerRequisitionService';
import { fetchClaims } from "../../services/jwtService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

interface District {
    code: number;
    nameEnglish: string;
  }
  
  interface Taluka {
    code: number;
    nameEnglish: string;
  }
  
  interface Village {
    code: number;
    nameEnglish: string;
    pincode: string;
  }
  
  const phaseTypeMapping = {
    "Single-Phase": 1,
    "Three-Phase": 2,
  };
  
  const connectionTypeMapping = {
    Residential: 1,
    Commercial: 2,
    Industrial: 3,
    PWW: 4,
  };
  
  const addressTypeMapping = {
    Home: 1,
    Hotel: 2,
    Office: 3,
    Charitable: 4,
    Non_Commercial_Education: 5,
    Street_Light: 6,
    Construction: 7,
    Public_Water_Works: 8,
  };
  
  const correctionTypeMapping = {
    'Spell Correction': 1,
    'Transfer Ownership': 2,
  };

export const EditConnection = () => {
  const location = useLocation();
  const [connection, setConnection] = useState<any>(null);

    const customerId = location.state?.customerId || null;
    const connectionId = location.state?.connectionId;
    const consumerId = location.state?.consumerId;
  
    const [districts, setDistricts] = useState<District[]>([]);
    const [talukas, setTalukas] = useState<Taluka[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
  
    const [districtCode, setDistrictCode] = useState<number>(0);
    const [talukaCode, setTalukaCode] = useState<number>(0);
    const [pincode, setPincode] = useState<string>("");
    const [villageCode, setVillageCode] = useState<number>(0);
    const [districtName, setDistrictName] = useState<string>("");
    const [talukaName, setTalukaName] = useState<string>("");
    const [villageName, setVillageName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<string[]>([]);
    const selectedRepresentative = location.state?.selectedRepresentative;
    const [activeTab, setActiveTab] = useState("Connection Details");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

    const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];



  const [formData, setFormData] = useState<any>({
    consumerId: "",
    isMsebConnection: "Yes",
    phase: "Single-Phase",
    connectionType: "Residential",
    addressType: "Home",
    latitude: "",
    longitude: "",
    gstIn: "",
    billedTo: "",
    addressLine1: "",
    addressLine2: "",
    districtCode: 0,
    talukaCode: 0,
    villageCode: 0,
    pincode: "",
    sectionId: "",
    isNameCorrection: "No",
    correctionType: "",
    monthlyAvgConsumptionUnits: NaN,
    isOnboardedCustomers:false,
    discomId: "",
    isActive:true,
  });

  

  const navigate = useNavigate();

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
    const fetchDistrictsData = async () => {
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
      } catch (error) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistrictsData();
  }, []);

  useEffect(() => {
    if (districtCode) {
        getDistrictNameByCode(districtCode)
            .then((name) => setDistrictName(name))
            .catch(() => setDistrictName("Unknown District"));
    }
}, [districtCode]);

  useEffect(() => {
    const fetchTalukasData = async () => {
      if (districtCode) {
        try {
          const talukaData = await fetchTalukas(districtCode);
          setTalukas(talukaData);
        } catch (err) {
          console.error('Error fetching talukas:', err);
        }
      } else {
        setTalukas([]);
      }
    };
    fetchTalukasData();
  }, [districtCode]);

  useEffect(() => {
    const fetchVillagesData = async () => {
      if (talukaCode) {
        try {
          const villageData = await fetchVillages(talukaCode);
          setVillages(villageData);
        } catch (err) {
          console.error('Error fetching villages:', err);
        }
      } else {
        setVillages([]);
      }
    };
    fetchVillagesData();
  }, [talukaCode]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setTalukaCode(0);
    setVillageCode(0);
    setTalukaName(""); 
    setVillageName(""); 
    setPincode("");
    setFormData((prev) => ({
      ...prev,
      districtCode: value,
      talukaCode: 0,
      villageCode: 0,
      pincode: "",
    }));
  };

  const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setTalukaCode(value);

    setVillageCode(0);
    setVillageName("");
    setPincode("");
    setFormData((prev) => ({
      ...prev,
      talukaCode: value,
      villageCode: 0,
      pincode: "",
    }));
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const selectedVillage = villages.find((village) => village.code === value);

    if (selectedVillage) {
      setVillageCode(value);
      setPincode(selectedVillage.pincode || "");
      setFormData((prev) => ({
        ...prev,
        villageCode: value,
        pincode: selectedVillage.pincode,
      }));
    }
  };

  const handlepincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setPincode(value);
      setFormData((prev) => ({ ...prev, pincode: value }));
    };

    const handleNameCorrection = (e) => {
      const { value } = e.target;
      setFormData((prev) => ({
        ...prev,
        isNameCorrection: value,
        correctionType: value === "No" ? "" : prev.correctionType,
      }));
    };
  
    // Handle Correction Type Change
    const handleCorrectionTypeChange = (e) => {
      setFormData((prev) => ({ ...prev, correctionType: e.target.value }));
    };

  useEffect(() => {
    const fetchConnection = async () => {
      if (consumerId) {
        const data = await getConnectionByConsumerId(Number(consumerId));
        setConnection(data);
        setFormData({
          ...formData,
          consumerId: data.consumerId,
          isMsebConnection: data.isMsebConnection ? "Yes" : "No",
          phase: Object.keys(phaseTypeMapping).find(key => phaseTypeMapping[key] === data.phaseTypeId) || "Single-Phase",
          connectionType: Object.keys(connectionTypeMapping).find(key => connectionTypeMapping[key] === data.connectionTypeId) || "Residential",
          addressType: Object.keys(addressTypeMapping).find(key => addressTypeMapping[key] === data.addressTypeId) || "Home",
          correctionType: Object.keys(correctionTypeMapping).find(key => correctionTypeMapping[key] === data.correctionTypeId) || "",
          isNameCorrection: data.isNameCorrectionRequired ? "Yes" : "No",
          monthlyAvgConsumptionUnits: data.monthlyAvgConsumptionUnits,
          gstIn: data.gstIn,
          billedTo: data.billedTo,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          sectionId: data.sectionId,
          districtCode: data.districtCode,
          talukaCode: data.talukaCode,
          villageCode: data.villageCode,
          pincode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          isOnboardedCustomers: data.isOnboardedCustomers ?? false,
          discomId: data.discomId,
        });
        setDistrictCode(data.districtCode);
        setTalukaCode(data.talukaCode);
        setVillageCode(data.villageCode);
        setPincode(data.postalCode);
        
        setLoading(false);
      }
    };
    fetchConnection();
  }, [consumerId]);
  
  if (loading) {
    return <div>Loading connection details...</div>;
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
      
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("Received connectionId:", connectionId);
    console.log("Received CustomerId:", customerId);
  
    if (!customerId) {
    toast.error("Customer Id is missing",{
      autoClose:1000,
      hideProgressBar:true,
    });
    return;
    }
  
    const isMsebConnection = formData.isMsebConnection === "Yes";
    const isNameCorrectionRequired =
      formData.isNameCorrection === "Yes"
        ? correctionTypeMapping[formData.correctionType] // 1 or 2
        : false;
  
    const connectionData = {
      customerId,
      consumerId: formData.consumerId,
      isMsebConnection,
      isNameCorrectionRequired,
      phaseTypeId: phaseTypeMapping[formData.phase],
      addressTypeId: addressTypeMapping[formData.addressType],
      connectionTypeId: connectionTypeMapping[formData.connectionType],
      correctionTypeId:
        formData.isNameCorrection === "Yes"
          ? correctionTypeMapping[formData.correctionType]
          : null,
      monthlyAvgConsumptionUnits: formData.monthlyAvgConsumptionUnits,
      districtCode: formData.districtCode,
      talukaCode: formData.talukaCode,
      villageCode: formData.villageCode,
      postalCode: formData.pincode,
      gstIn: formData.gstIn,
      latitude: formData.latitude,
      longitude: formData.longitude,
      sectionId: formData.sectionId,
      discomId: formData.discomId,
      billedTo: formData.billedTo,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      isOnboardedCustomers: formData.isOnboardedCustomers,
      isActive: formData.isActive,
    };
  
    setDialogType("confirm");
      setDialogMessage("Do you want to update the connection details?");
      setDialogAction(() => async () => {
        try {
          if (connectionId) {
            await updateConsumerConnectionDetails(Number(connectionId), connectionData);
            toast.success("Connection details updated successfully!", { 
        autoClose: 1000,
        hideProgressBar: true,
      });

              navigate(`/view-connection/${connectionId}`, {
                state: {
                  customerId,
                  connectionId,consumerId:formData.consumerId,
                  selectedRepresentative:selectedRepresentative,
                },
              });

            
          }
        } catch (error) {
          toast.error("Failed to update connection details.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
        }
      });
      setDialogOpen(true);
  };
  
  

  return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Update Connection</h2>

      {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}
  </div>

<div className="w-full max-w-4xl mx-auto mb-14 mt-10 overflow-x-auto">
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


        <h2 className="text-2xl font-semibold text-gray-700 mb-8">Connection Details</h2>

    
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MSEB Connection Question - Full Width */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Does the customer currently have an active grid connection with the local electricity provider (e.g., MSEB or BESCOM)?
            </label>
            <div className="mt-2 flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="isMsebConnection"
                  value="Yes"
                  onChange={handleChange}
                  className="focus:ring-blue-500 text-blue-600 border-gray-300"
                  checked={formData.isMsebConnection === "Yes"}
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="isMsebConnection"
                  value="No"
                  onChange={handleChange}
                  className="focus:ring-blue-500 text-blue-600 border-gray-300"
                  checked={formData.isMsebConnection === "No"}
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
    
          {/* Two-Column Layout for Other Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Consumer Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="consumerId"
              name="consumerId"
              value={formData.consumerId}
              onChange={handleChange}
              placeholder="e.g. 987654321000"
              maxLength={12}
              required
              disabled={formData.isMsebConnection === "No"}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm disabled:bg-gray-200"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
            <input
              type="text"
              name="gstIn"
              value={formData.gstIn}
              onChange={handleChange}
              placeholder="e.g. 22AAAAA0000A1Z6"
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Billed To</label>
            <input
              type="text"
              name="billedTo"
              value={formData.billedTo}
              onChange={handleChange}
              placeholder="Enter the name of the billed person or company"
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>
  
    
  
          <div>
              <label className="block text-sm font-medium text-gray-700">District <span className="text-red-500">*</span></label>
              <select
                name="distrct"
                id="district"
                value={districtCode}
                onChange={handleDistrictChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              >
                <option value={0}>{districtName || "Select District"}</option>
                {districts.map((district) => (
                  <option key={district.nameEnglish} value={district.code}>
                    {district.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Taluka <span className="text-red-500">*</span></label>
              <select
                name="talukaCode"
                id="taluka"
                value={talukaCode}
                onChange={handleTalukaChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              >
                <option value={0}>{talukaName || "Select Taluka"}</option>
                {talukas.map((taluka) => (
                  <option key={taluka.nameEnglish} value={taluka.code}>
                    {taluka.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Village <span className="text-red-500">*</span></label>
              <select
                name="villageCode"
                id="village"
                value={villageCode}
                onChange={handleVillageChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              >
                <option value={0}>{villageName || "Select Village"}</option>
                {villages.map((village) => (
                  <option key={village.code} value={village.code}>
                    {village.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode || ''}  // Ensure it uses formData.pincode
                onChange={handlepincodeChange}
                placeholder="e.g. 416000"
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              />
            </div>
  
            <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 1 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="e.g. Flat No, House No, Street Name"
              required
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="e.g. Apartment, Suite, Unit, Building"
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Type <span className="text-red-500">*</span></label>
            <select
              name="addressType"
              value={formData.addressType}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              {Object.keys(addressTypeMapping).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Connection Type <span className="text-red-500">*</span></label>
            <select
              name="connectionType"
              value={formData.connectionType}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              {Object.keys(connectionTypeMapping).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Average Consumption Units <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="monthlyAvgConsumptionUnits"
              value={formData.monthlyAvgConsumptionUnits}
              onChange={handleChange}
              min="0"
              placeholder="e.g. 1"
              onWheel={(e)=>e.currentTarget.blur()}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>
  
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Phase Type <span className="text-red-500">*</span></label>
            <select
              name="phase"
              value={formData.phase}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              {Object.keys(phaseTypeMapping).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
    
  
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 16.7049873"
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 74.2432527"
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Section ID</label>
            <input
              type="text"
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              placeholder="e.g. 7137"
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            />
          </div>

  
          <div className="flex flex-col space-y-4">
    {/* Name Correction Question */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        Does the connection require a name correction?
      </label>
      <div className="mt-2 flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="nameCorrection"
            value="Yes"
            onChange={handleNameCorrection}
            className="focus:ring-blue-500 text-blue-600 border-gray-300"
            checked={formData.isNameCorrection === "Yes"}
          />
          <span className="text-sm text-gray-700">Yes</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="nameCorrection"
            value="No"
            onChange={handleNameCorrection}
            className="focus:ring-blue-500 text-blue-600 border-gray-300"
            checked={formData.isNameCorrection === "No"}
          />
          <span className="text-sm text-gray-700">No</span>
        </label>
      </div>
    </div>
  
    {/* Correction Type (keeps spacing properly) */}
    {formData.isNameCorrection === "Yes" && (
      <div className="col-span-1">
        <label className="block text-sm font-medium text-gray-700">
          Select Correction Type
        </label>
        <select
          name="correctionType"
          value={formData.correctionType || ""}
          onChange={handleCorrectionTypeChange}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="Spell Correction">Spell Correction</option>
          <option value="Transfer Ownership">Transfer Ownership</option>
        </select>
      </div>
    )}
  
    {/* Submit Button - Always at the bottom */}
    <div className="self-start mt-6">
      <button
        type="submit"
        className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Update Connection
      </button>
    </div>
  </div>
  
          
        </form>

        <Dialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
  maxWidth="xs"
  fullWidth
>
  <DialogTitle id="alert-dialog-title">
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
        <Button
          onClick={() => {
            setDialogOpen(false);
            // Cancel = reset data
             if (connection) {
               setFormData({
  consumerId: connection.consumerId || "",
  isMsebConnection: connection.isMsebConnection ? "Yes" : "No",
  phase:
    Object.keys(phaseTypeMapping).find(
      key => phaseTypeMapping[key] === connection.phaseTypeId
    ) || "Single-Phase",
  connectionType:
    Object.keys(connectionTypeMapping).find(
      key => connectionTypeMapping[key] === connection.connectionTypeId
    ) || "Residential",
  addressType:
    Object.keys(addressTypeMapping).find(
      key => addressTypeMapping[key] === connection.addressTypeId
    ) || "Home",
  correctionType:
    Object.keys(correctionTypeMapping).find(
      key => correctionTypeMapping[key] === connection.correctionTypeId
    ) || "",
  isNameCorrection: connection.isNameCorrectionRequired ? "Yes" : "No",
  monthlyAvgConsumptionUnits: connection.monthlyAvgConsumptionUnits || "",
  gstIn: connection.gstIn || "",
  billedTo: connection.billedTo || "",
  addressLine1: connection.addressLine1 || "",
  addressLine2: connection.addressLine2 || "",
  sectionId: connection.sectionId || "",
  districtCode: connection.districtCode || "",
  talukaCode: connection.talukaCode || "",
  villageCode: connection.villageCode || "",
  pincode: connection.postalCode || "",
  latitude: connection.latitude || "",
  longitude: connection.longitude || "",
  isOnboardedCustomers: connection.isOnboardedCustomers ?? false,
  discomId: connection.discomId || "",
});

          }}
        }
        >
          No
        </Button>
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

      </div>
    );
};
