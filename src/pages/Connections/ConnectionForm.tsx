import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveConnection, getDistrictNameByCode, checkConsumerNumberExists, fetchDistricts, fetchTalukas, fetchVillages, fetchConnectionType, fetchPhaseType, fetchAddressType, fetchCorrectionType } from '../../services/customerRequisitionService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { fetchClaims } from "../../services/jwtService";
import { toast } from "react-toastify";
import MapPreview from '../../components/MapPreview'; 

import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

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

export const ConnectionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const customerId = location.state?.customerId || null;

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
  const [isNameCorrecction, setIsNameCorrection] = useState("No");
  const govIdName = location.state?.govIdName || null;
  const [roles, setRoles] = useState<string[]>([]);
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [activeTab, setActiveTab ] = useState("Connection Details");
  
  const [connectionTypes, setConnectionTypes] = useState<{ id: number; nameEn: string }[]>([]);
  const [phaseTypes, setPhaseTypes] = useState<{ id: number; nameEn: string }[]>([]);
  const [addressTypes, setAddressTypes] = useState<{ id: number; nameEn: string }[]>([]);

  const [correctionTypeMap, setCorrectionTypeMap] = useState<Record<string, number>>({});

  const [confirmConsumerNumber, setConfirmConsumerNumber] = useState("");
  const [consumerNumberExists, setConsumerNumberExists] = useState(false);

  const [showConsumerNumber, setShowConsumerNumber] = useState(false);
  const handleToggleConsumerNumber = () => setShowConsumerNumber(!showConsumerNumber);

  const [navigateAfterClose, setNavigateAfterClose] = useState(false);
  const [createdConnectionId, setCreatedConnectionId] = useState<number | null>(null);

  const [showMapPreview, setShowMapPreview] = useState(false);




  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  const [formData, setFormData] = useState({
    consumerId: "",
    isMsebConnection: "Yes",
    phaseTypeId: 1,
    connectionTypeId: 1,
    addressTypeId: 1,
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
    discomId: "",
    isActive: true,
  });

///////////////////////////////////////////////////////////
  useEffect(() => {
    const savedForm = localStorage.getItem('connectionFormData');
    const savedConfirmConsumerNumber = localStorage.getItem("confirmConsumerNumber");
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }

    if (savedConfirmConsumerNumber) {
    setConfirmConsumerNumber(savedConfirmConsumerNumber);
  }
  }, []);
///////////////////////////////////////////////////////////

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
  if (govIdName) {
    setFormData((prev) => ({ ...prev, billedTo: govIdName }));
  }
}, [govIdName]);

useEffect(() => {
    const checkConsumerIdExists = async () => {
      if (formData.consumerId.length === 12) {
        const exists = await checkConsumerNumberExists(formData.consumerId);
        setConsumerNumberExists(exists);
      } else {
        setConsumerNumberExists(false);
      }
    };
    checkConsumerIdExists();
  }, [formData.consumerId]);


  useEffect(() => {
    const fetchDistrictsData = async () => {
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
      } catch (error) {
        console.error('Error fetching districts:', error);
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

  useEffect(() => {
    const getConnectionTypes = async () => {
      try {
        const data = await fetchConnectionType();
        setConnectionTypes(data);
      } catch (error) {
        console.error("Failed to fetch connection types", error);
      }
    };
  
    getConnectionTypes();
  }, []);

  useEffect(() => {
    const getPhaseTypes = async () => {
      try {
        const data = await fetchPhaseType();
        setPhaseTypes(data);
      } catch (error) {
        console.error("Failed to fetch phase types", error);
      }
    };
  
    getPhaseTypes();
  }, []);

  useEffect(() => {
    const getAddressTypes = async () => {
      try {
        const data = await fetchAddressType();
        setAddressTypes(data);
      } catch (error) {
        console.error("Failed to fetch address types", error);
      }
    };
  
    getAddressTypes();
  }, []);

  useEffect(() => {
  const loadCorrectionTypes = async () => {
    try {
      const types = await fetchCorrectionType();
      const map: Record<string, number> = {};
      types.forEach((type) => {
        map[type.correctionName] = type.id;
      });
      setCorrectionTypeMap(map);
    } catch (err) {
      console.error('Failed to load correction types', err);
    }
  };

  loadCorrectionTypes();
}, []);
  
  
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "isMsebConnection" && value === "No") {
    setConfirmConsumerNumber(""); 
  }

  if(name === 'consumerId' && value=== ''){
    setConfirmConsumerNumber('');
    //localStorage.removeItem("confirmConsumerNumber")
  }

  if (name === 'consumerId') {
      if (value !== confirmConsumerNumber) {
        setConfirmConsumerNumber('');
        //localStorage.removeItem("confirmConsumerNumber");
      }
  
      checkConsumerNumberExists(value).then((exists) => {
        setConsumerNumberExists(exists);
  
        if (exists) {
          setConfirmConsumerNumber('');
          //localStorage.removeItem("confirmConsumerNumber");
        }
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "isMsebConnection" && value === "No" ? { consumerId: "" } : {}),

    }));
        ///////////////
        setTimeout(() => {
    localStorage.setItem("connectionFormData", JSON.stringify({
      ...formData,
      [name]: value,
      ...(name === "isMsebConnection" && value === "No" ? { consumerId: "" } : {}),
    }));
  }, 0);
        //////////////
  };

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
      console.log("Current state pincode:", pincode);
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

    const handleConfirmConsumerNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmConsumerNumber(value);
    //localStorage.setItem('confirmConsumerNumber', value);
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("Received CustomerId:", customerId);
  
    if (!customerId) {
      toast.error("Customer ID is missing! ",{
        autoClose:1000,
        hideProgressBar:true,
      });
      return;
    }


    if (formData.isNameCorrection === "Yes" && !formData.correctionType) {
      toast.error("Please select a correctiontype. ",{
        autoClose:1000,
        hideProgressBar:true,
      });
      return;
    }

    if (formData.consumerId !== confirmConsumerNumber) {
      toast.error("Consumer number and Confirm Consumer number do not match.",{
        autoClose:1000,
        hideProgressBar:true,
      });
      return;
    }

    if (formData.isMsebConnection !== "Yes" && formData.isMsebConnection !== "No") {
  toast.error("Please select whether the customer has an active grid connection.");
  return;
}

  
  
    const isMsebConnection = formData.isMsebConnection === "Yes";
const isNameCorrectionRequired =
  formData.isNameCorrection === "Yes" && correctionTypeMap[formData.correctionType]
    ? correctionTypeMap[formData.correctionType]
    : false;
  
    const connectionData = {
      customerId,
      consumerId: formData.consumerId,
      isMsebConnection,
      isNameCorrectionRequired,
      phaseTypeId: formData.phaseTypeId,
      addressTypeId: formData.addressTypeId,
      connectionTypeId: formData.connectionTypeId,
      correctionTypeId:
  formData.isNameCorrection === "Yes"
    ? correctionTypeMap[formData.correctionType] || null
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
      billedTo: formData.billedTo,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      discomId:formData.discomId,
      isActive:formData.isActive,
    };
  
    try {
      console.log("Saving new connection...");
      
      const result = await saveConnection(connectionData);
      console.log("Received result:", result);

      if (result.id) {

        setCreatedConnectionId(result.id);
        setNavigateAfterClose(true);
        
        toast.success(result.message || "Connection data saved successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      navigate(`/view-connection/${result.id}`, {
          state: {
                    consumerId: formData.consumerId, customerId, connectionId: result.id, selectedRepresentative,
      },
    });
    setNavigateAfterClose(false);
    setCreatedConnectionId(null);

      }
      else{
        toast.error(result.message || "Failed to save connection data.",{
          autoClose:1000,
          hideProgressBar:true,
        });
      }
    } catch (error) {
      console.error("Error in saving connection:", error);
      toast.error("Failed to save connection. Please try again.",{
      autoClose:1000,
      hideProgressBar: true,
    });
  }

  /////////////
    localStorage.removeItem('connectionFormData');
    //localStorage.removeItem('confirmConsumerNumber');
  ////////////
  };
  



  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">Add Connection Details</h2>

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

            const shouldHighlightIcon = tab === "Customer Details";


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

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 sm:mb-8">Connection Details</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
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
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
          <input
            type="text"
            inputMode="numeric"
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
        </div> */}

        <div>
  <label className="block text-sm font-medium text-gray-700">Enter Consumer Number <span className="text-red-500">*</span></label>

  <div className="relative">
    <input
      type={showConsumerNumber ? 'text' : 'password'}
      inputMode="numeric"
      maxLength={12}
      name="consumerId"
      value={formData.consumerId}
      pattern="[0-9]{12}"
      onChange={handleChange}
      placeholder="e.g. 987654321000"
      required
      disabled={formData.isMsebConnection === "No"}
      className="mt-1 block w-full p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
      title="Enter a valid 12-digit consumer number"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />
    
    <span
      onClick={handleToggleConsumerNumber}
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
    >
      {showConsumerNumber ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>

{formData.consumerId?.length === 12 && !/^[0-9]{12}$/.test(formData.consumerId) && (
  <p className="text-red-600 text-sm mt-1">Enter a valid 12-digit consumer number</p>
)}


  {consumerNumberExists && (
    <p className="text-red-600 text-sm mt-1">Consumer number already exists</p>
  )}
</div>

{/* Confirm Consumer Number */}
<div>
  <label className="block text-sm font-medium text-gray-700">Confirm Consumer Number <span className="text-red-500">*</span></label>
  <input
  type="text"
  name="confirmConsumerNumber"
  value={confirmConsumerNumber}
  onChange={handleConfirmConsumerNumberChange}
  placeholder="Confirm consumer number"
  maxLength={12}
  required
  //disabled={formData.isMsebConnection === "No"}
  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
  title="Re-enter the same 12-digit consumer number"
  disabled={!(
     /^[0-9]{12}$/.test(formData.consumerId) && !consumerNumberExists
  )}
  onCopy={(e) => e.preventDefault()}
  onCut={(e) => e.preventDefault()}
  onPaste={(e) => e.preventDefault()}

/>
  {confirmConsumerNumber &&
    confirmConsumerNumber !== formData.consumerId && (
      <p className="text-red-600 text-sm mt-1">Consumer numbers do not match</p>
  )}
</div>

        <div>
  <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
  <input
    type="text"
    name="gstIn"
    value={formData.gstIn}
    onChange={(e) =>
      handleChange({ target: { name: "gstIn", value: e.target.value.toUpperCase() } })
    }
    pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    title="GSTIN must be in format: 22AAAAA0000A1Z6"
    placeholder="e.g. 22AAAAA0000A1Z6"
    className="mt-1 block w-full p-2 border rounded-md shadow-sm"
    maxLength={15}
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
              required
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
              required
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
              required
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
              required
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
            name="addressTypeId"
            value={formData.addressTypeId}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          >
            {addressTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nameEn}
              </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Average Consumption Units <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="0"
            onWheel={(e) => e.currentTarget.blur()}
            name="monthlyAvgConsumptionUnits"
            value={formData.monthlyAvgConsumptionUnits}
            onChange={handleChange}
            required
            placeholder="e.g. 1"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Connection Type <span className="text-red-500">*</span></label>
            <select
                name="connectionTypeId"
                value={formData.connectionTypeId}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              {connectionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nameEn}
              </option>
              ))}
             </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700">Phase Type <span className="text-red-500">*</span></label>
          <select
            name="phaseTypeId"
            value={formData.phaseTypeId}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          >
            {phaseTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nameEn}
              </option>
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

        {formData.latitude &&
  formData.longitude &&
  !isNaN(Number(formData.latitude)) &&
  !isNaN(Number(formData.longitude)) && (
    <div className="col-span-2">
      <button
        type="button"
        onClick={() => setShowMapPreview((prev) => !prev)}
        className="mb-3 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
      >
        {showMapPreview ? 'Close Map' : 'View Location on Map'}
      </button>

{showMapPreview && (
  <>
    {/* <h3 className="text-md font-semibold text-gray-700 mb-2">Preview Location on Map</h3> */}
    <MapPreview
  latitude={parseFloat(formData.latitude)}
  longitude={parseFloat(formData.longitude)}
  onLocationChange={(newLat, newLng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: newLat.toFixed(6),
      longitude: newLng.toFixed(6),
    }));
  }}
/>
  </>
)}
    </div>
)}


        <div>
          <label className="block text-sm font-medium text-gray-700">Section ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="sectionId"
            value={formData.sectionId}
            onChange={handleChange}
            placeholder="e.g. 7137"
            required
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700">DISCOM ID</label>
          <input
            type="text"
            name="discomId"
            value={formData.discomId}
            onChange={handleChange}
            placeholder="e.g. 64797718"
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
      <option value="" disabled>Select an option</option>
      <option value="Spell Correction">Spell Correction</option>
      <option value="Transfer Ownership">Transfer Ownership</option>
    </select>
  </div>
)}


  {/* Submit Button - Always at the bottom */}
  <div className="self-start mt-6">
    <button
      type="submit"
      className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
    >
      Save Connection
    </button>
  </div>
</div>

        
      </form>

    </div>
  );
  
};
