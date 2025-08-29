import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getConnectionByConsumerId, updateConsumerConnectionDetails } from "../../services/customerRequisitionService";
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages, fetchConnectionType, fetchPhaseType, fetchAddressType, fetchCorrectionType } from '../../services/customerRequisitionService';
import { fetchClaims } from "../../services/jwtService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import MapPreview from '../../components/MapPreview'; 
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
  
  // Validation utilities
  const validationRules = {
    consumerNumber: {
      pattern: /^[0-9]{12}$/,
      message: "Consumer number must be exactly 12 digits (0-9)"
    },
    gstin: {
      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      message: "GSTIN must be in format: 22AAAAA0000A1Z6"
    },
    billedTo: {
      pattern: /^[A-Za-z\s]{2,50}$/,
      message: "Billed To must be 2-50 characters, alphabets and spaces only"
    },
    addressLine: {
      pattern: /^[A-Za-z0-9\s,.\/#-]{5,100}$/,
      message: "Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
    },
    monthlyConsumption: {
      pattern: /^[1-9]\d*$/,
      message: "Monthly consumption must be a positive integer greater than 0"
    },
    latitude: {
      min: -90,
      max: 90,
      message: "Latitude must be between -90 and 90"
    },
    longitude: {
      min: -180,
      max: 180,
      message: "Longitude must be between -180 and 180"
    },
    discomId: {
      pattern: /^[1-9]\d*$/,
      message: "DISCOM ID must be a positive integer greater than 0"
    },
    pincode: {
      pattern: /^[0-9]{6}$/,
      message: "Pincode must be exactly 6 digits (0-9)"
    }
  };

  const validateField = (fieldName: string, value: string | number): { isValid: boolean; message: string } => {
    const rule = validationRules[fieldName as keyof typeof validationRules];
    if (!rule) return { isValid: true, message: "" };

    if (fieldName === 'consumerNumber') {
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'gstin') {
      if (!value) return { isValid: true, message: "" }; // Optional field
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString().toUpperCase());
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'billedTo') {
      if (!value) return { isValid: true, message: "" }; // Optional field
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'addressLine1' || fieldName === 'addressLine2') {
      if (!value) return { isValid: true, message: "" }; // Optional field
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'monthlyAvgConsumptionUnits') {
      if (!value || isNaN(Number(value))) return { isValid: false, message: rule.message };
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'latitude') {
      if (!value) return { isValid: true, message: "" }; // Optional field
      const numValue = Number(value);
      if (isNaN(numValue)) return { isValid: false, message: "Latitude must be a valid number" };
      const isValid = 'min' in rule && 'max' in rule && numValue >= rule.min && numValue <= rule.max;
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'longitude') {
      if (!value) return { isValid: true, message: "" }; // Optional field
      const numValue = Number(value);
      if (isNaN(numValue)) return { isValid: false, message: "Longitude must be a valid number" };
      const isValid = 'min' in rule && 'max' in rule && numValue >= rule.min && numValue <= rule.max;
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'discomId') {
      if (!value) return { isValid: false, message: "DISCOM ID is required" }; // Required field
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
      return { isValid, message: isValid ? "" : rule.message };
    }

    if (fieldName === 'pincode') {
      if (!value) return { isValid: false, message: "Pincode is required" }; // Required field
      const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
      return { isValid, message: isValid ? "" : rule.message };
    }

    return { isValid: true, message: "" };
  };
  
  // const correctionTypeMapping  = {
  //   'Spell Correction': 1,
  //   'Transfer Ownership': 2,
  // };

export const EditConnection = () => {
  const location = useLocation();
  const [connection, setConnection] = useState<any>(null);

    const customerId = location.state?.customerId || null;
    const connectionId = location.state?.connectionId;
    const consumerId = location.state?.consumerId;

    const [consumerNumberExists, setConsumerNumberExists] = useState(false);
  
    const [districts, setDistricts] = useState<District[]>([]);
    const [talukas, setTalukas] = useState<Taluka[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    const [connectionTypes, setConnectionTypes] = useState<{ id: number; nameEn: string }[]>([]);
    const [phaseTypes, setPhaseTypes] = useState<{ id: number; nameEn: string }[]>([]);
    const [addressTypes, setAddressTypes] = useState<{ id: number; nameEn: string }[]>([]);

    const [correctionTypeMap, setCorrectionTypeMap] = useState<Record<string, number>>({});
    const [reverseCorrectionTypeMap, setReverseCorrectionTypeMap] = useState<Record<number, string>>({});

    const [districtCode, setDistrictCode] = useState<number>(0);
    const [talukaCode, setTalukaCode] = useState<number>(0);
    const [pincode, setPincode] = useState<string>("");
    const [villageCode, setVillageCode] = useState<number>(0);
    const [districtName, setDistrictName] = useState<string>("");
    const [talukaName, setTalukaName] = useState<string>("");
    const [villageName, setVillageName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Connection Details");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

    const [confirmConsumerNumber,setConfirmConsumerNumber] = useState("");
    const [showConsumerNumber, setShowConsumerNumber] = useState(false);
    const handleToggleConsumerNumber = () => setShowConsumerNumber(!showConsumerNumber);

    const [showMapPreview, setShowMapPreview] = useState(false);

    // Validation state
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];



  const [formData, setFormData] = useState<any>({
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

    isNameCorrection: "No",
    correctionType: "",
    monthlyAvgConsumptionUnits: NaN,
    isOnboardedCustomers:false,
    discomId: "",
    isActive:true,
  });


  const navigate = useNavigate();

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
      const reverseMap: Record<number, string> = {};

      types.forEach((type) => {
        map[type.correctionName] = type.id;
        reverseMap[type.id] = type.correctionName;
      });

      setCorrectionTypeMap(map);
      setReverseCorrectionTypeMap(reverseMap); // <-- You need to define this using useState

    } catch (err) {
      console.error('Failed to load correction types', err);
    }
  };

  loadCorrectionTypes();
}, []);

  // Validation function for form submission
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Required field validations
    if (!customerId) {
      errors.push("Customer ID is missing!");
    }

    if (formData.isMsebConnection === "Yes") {
      if (!formData.consumerId) {
        errors.push("Consumer number is required when MSEB connection is Yes");
      } else {
        const consumerValidation = validateField('consumerNumber', formData.consumerId);
        if (!consumerValidation.isValid) {
          errors.push(consumerValidation.message);
        }
      }

      if (formData.consumerId !== confirmConsumerNumber) {
        errors.push("Consumer number and Confirm Consumer number do not match.");
      }
    }

    if (formData.isNameCorrection === "Yes" && !formData.correctionType) {
      errors.push("Please select a correction type.");
    }

    if (!formData.billedTo) {
      errors.push("Billed To is required");
    } else {
      const billedToValidation = validateField('billedTo', formData.billedTo);
      if (!billedToValidation.isValid) {
        errors.push(billedToValidation.message);
      }
    }

    if (!formData.addressLine1) {
      errors.push("Address Line 1 is required");
    } else {
      const addressValidation = validateField('addressLine1', formData.addressLine1);
      if (!addressValidation.isValid) {
        errors.push(addressValidation.message);
      }
    }

    if (formData.addressLine2) {
      const addressValidation = validateField('addressLine2', formData.addressLine2);
      if (!addressValidation.isValid) {
        errors.push(addressValidation.message);
      }
    }

    if (!formData.monthlyAvgConsumptionUnits || isNaN(formData.monthlyAvgConsumptionUnits)) {
      errors.push("Monthly Average Consumption Units is required");
    } else {
      const consumptionValidation = validateField('monthlyAvgConsumptionUnits', formData.monthlyAvgConsumptionUnits);
      if (!consumptionValidation.isValid) {
        errors.push(consumptionValidation.message);
      }
    }

    if (formData.latitude) {
      const latValidation = validateField('latitude', formData.latitude);
      if (!latValidation.isValid) {
        errors.push(latValidation.message);
      }
    }

    if (formData.longitude) {
      const lngValidation = validateField('longitude', formData.longitude);
      if (!lngValidation.isValid) {
        errors.push(lngValidation.message);
      }
    }

    if (formData.gstIn) {
      const gstinValidation = validateField('gstin', formData.gstIn);
      if (!gstinValidation.isValid) {
        errors.push(gstinValidation.message);
      }
    }

    if (!formData.discomId) {
      errors.push("DISCOM ID is required");
    } else {
      const discomValidation = validateField('discomId', formData.discomId);
      if (!discomValidation.isValid) {
        errors.push(discomValidation.message);
      }
    }

    if (!formData.pincode) {
      errors.push("Pincode is required");
    } else {
      const pincodeValidation = validateField('pincode', formData.pincode);
      if (!pincodeValidation.isValid) {
        errors.push(pincodeValidation.message);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // Real-time field validation
  const validateFieldOnChange = (fieldName: string, value: string | number) => {
    const validation = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: validation.message
    }));
  };

    // const reverseCorrectionTypeMap: Record<number, string> = Object.entries(correctionTypeMap).reduce(
    //     (acc, [name, id]) => {
    //         acc[id] = name;
    //         return acc;
    //       },
    //     {} as Record<number, string>
    //     );

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setTalukaCode(0);
    setVillageCode(0);
    setTalukaName(""); 
    setVillageName(""); 
    setPincode("");
    setFormData((prev: any) => ({
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
    setFormData((prev: any) => ({
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
      setFormData((prev: any) => ({
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
          phaseTypeId: data.phaseTypeId,
          connectionTypeId: data.connectionTypeId,
          addressTypeId: data.addressTypeId,
          correctionType : reverseCorrectionTypeMap[data.correctionTypeId] || "",
          isNameCorrection: data.isNameCorrectionRequired ? "Yes" : "No",
          monthlyAvgConsumptionUnits: data.monthlyAvgConsumptionUnits,
          gstIn: data.gstIn,
          billedTo: data.billedTo,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,

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
        setConfirmConsumerNumber(data.consumerId || "");
        
        setLoading(false);
      }
    };
    fetchConnection();
  }, [consumerId, reverseCorrectionTypeMap]);
  
  if (loading) {
    return <div>Loading connection details...</div>;
  }


 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  // Real-time validation
  if (name === 'consumerId') {
    validateFieldOnChange('consumerNumber', value);
  } else if (name === 'gstIn') {
    validateFieldOnChange('gstin', value);
  } else if (name === 'billedTo') {
    validateFieldOnChange('billedTo', value);
  } else if (name === 'addressLine1') {
    validateFieldOnChange('addressLine1', value);
  } else if (name === 'addressLine2') {
    validateFieldOnChange('addressLine2', value);
  } else if (name === 'monthlyAvgConsumptionUnits') {
    validateFieldOnChange('monthlyAvgConsumptionUnits', value);
  } else if (name === 'latitude') {
    validateFieldOnChange('latitude', value);
  } else if (name === 'longitude') {
    validateFieldOnChange('longitude', value);
      } else if (name === 'discomId') {
      validateFieldOnChange('discomId', value);
    } else if (name === 'pincode') {
      validateFieldOnChange('pincode', value);
    }

  setFormData((prev: any) => {
    let updatedForm = { ...prev, [name]: value };

    // Clear confirmConsumerNumber if consumerId changes
    if (name === 'consumerId' && prev.consumerId !== value) {
      setConfirmConsumerNumber('');
    }

    // If MSEB Connection is "No", clear consumerId and confirmConsumerNumber
    if (name === 'isMsebConnection' && value === 'No') {
      updatedForm.consumerId = '';
      setConfirmConsumerNumber('');
    }

    return updatedForm;
  });
};


    const handleConfirmConsumerNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmConsumerNumber(e.target.value.trim());
      };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("Received connectionId:", connectionId);
    console.log("Received CustomerId:", customerId);

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast.error(error, {
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
      return;
    }
  
    const isMsebConnection = formData.isMsebConnection === "Yes";
const isNameCorrectionRequired =
  formData.isNameCorrection === "Yes" && correctionTypeMap[formData.correctionType]
    ? true
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
  </div>

<div className="w-full max-w-4xl mx-auto mb-6 overflow-x-auto">
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


        <h2 className="text-xl font-semibold text-gray-700 mb-4">Edit Connection Details</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* MSEB Connection Question */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <BoltIcon className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-base font-medium text-blue-900">Grid Connection Status</h4>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Does the customer currently have an active grid connection with the local electricity provider (e.g., MSEB or BESCOM)?
            </label>
            <div className="flex items-center space-x-6">
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

          {/* Consumer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Consumer Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">12-Digit Consumer Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showConsumerNumber ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={12}
                    pattern="^[0-9]{12}$"
                    title="Enter exactly 12 digits (0–9)"
                    name="consumerId"
                    value={formData.consumerId}
                    onChange={handleChange}
                    placeholder="e.g. 987654321000"
                    required={formData.isMsebConnection === "Yes"}
                    disabled={formData.isMsebConnection === "No"}
                    className={`mt-1 block w-full px-3 py-2.5 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 ${
                      fieldErrors.consumerNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
                {fieldErrors.consumerNumber && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.consumerNumber}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Consumer Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="confirmConsumerNumber"
                  value={confirmConsumerNumber}
                  onChange={handleConfirmConsumerNumberChange}
                  placeholder="Confirm consumer number"
                  maxLength={12}
                  pattern="^[0-9]{12}$"
                  required={formData.isMsebConnection === "Yes"}
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  disabled={!(
                    /^[0-9]{12}$/.test(formData.consumerId) && !consumerNumberExists
                  )}
                />
                {confirmConsumerNumber &&
                formData.consumerId &&
                String(confirmConsumerNumber).trim() !== String(formData.consumerId).trim() && (
                  <p className="text-red-600 text-sm mt-1">
                    Consumer numbers do not match
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="w-4 h-4 text-orange-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Business Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">GST Number</label>
                <input
                  type="text"
                  name="gstIn"
                  value={formData.gstIn}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    handleChange({ target: { name: "gstIn", value: target.value.toUpperCase() } } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                  title="GSTIN must be in format: 22AAAAA0000A1Z6"
                  placeholder="e.g. 22AAAAA0000A1Z6"
                  maxLength={15}
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.gstin ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.gstin && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.gstin}</p>
                )}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Billed To <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="billedTo"
                  value={formData.billedTo}
                  onChange={handleChange}
                  placeholder="Enter the name of the billed person or company"
                  pattern="^[A-Za-z\s]{2,50}$"
                  title="Billed To must be 2-50 characters, alphabets and spaces only"
                  maxLength={50}
                  required
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.billedTo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.billedTo && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.billedTo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Address Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">District <span className="text-red-500">*</span></label>
                <select
                  name="distrct"
                  id="district"
                  value={districtCode}
                  onChange={handleDistrictChange}
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  pattern="^[0-9]{6}$"
                  title="Pincode must be exactly 6 digits (0-9)"
                  maxLength={6}
                  inputMode="numeric"
                  required
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.pincode && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.pincode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. Flat No, House No, Street Name"
                  pattern="^[A-Za-z0-9\s,.\/#-]{5,100}$"
                  title="Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
                  maxLength={100}
                  required
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.addressLine1 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.addressLine1 && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.addressLine1}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="e.g. Apartment, Suite, Unit, Building"
                  pattern="^[A-Za-z0-9\s,.\/#-]{5,100}$"
                  title="Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
                  maxLength={100}
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.addressLine2 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.addressLine2 && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.addressLine2}</p>
                )}
              </div>
            </div>
          </div>

          {/* Connection Type and Phase Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Connection Type and Phase Type</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Type <span className="text-red-500">*</span></label>
                <select
                  name="addressTypeId"
                  value={formData.addressTypeId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {addressTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Connection Type <span className="text-red-500">*</span></label>
                <select
                  name="connectionTypeId"
                  value={formData.connectionTypeId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {phaseTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* System Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-4 h-4 text-yellow-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">System Specifications</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Average Consumption Units <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="monthlyAvgConsumptionUnits"
                  value={formData.monthlyAvgConsumptionUnits}
                  onChange={handleChange}
                  onBlur={(e) => {
                    if (e.target.value) {
                      validateFieldOnChange('monthlyAvgConsumptionUnits', e.target.value);
                    }
                  }}
                  min="1"
                  step="1"
                  placeholder="e.g. 1"
                  title="Enter a positive integer greater than 0"
                  onWheel={(e)=>e.currentTarget.blur()}
                  required
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.monthlyAvgConsumptionUnits ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.monthlyAvgConsumptionUnits && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.monthlyAvgConsumptionUnits}</p>
                )}
                {!fieldErrors.monthlyAvgConsumptionUnits && formData.monthlyAvgConsumptionUnits && (
                  <p className="text-green-600 text-sm mt-1">✓ Valid consumption value</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 16.7049873"
                  min="-90"
                  max="90"
                  step="any"
                  title="Latitude must be between -90 and 90"
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.latitude ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.latitude && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 74.2432527"
                  min="-180"
                  max="180"
                  step="any"
                  title="Longitude must be between -180 and 180"
                  className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    fieldErrors.longitude ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.longitude && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.longitude}</p>
                )}
              </div>
            </div>

            {/* Map Preview */}
            {formData.latitude &&
            formData.longitude &&
            !isNaN(Number(formData.latitude)) &&
            !isNaN(Number(formData.longitude)) && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowMapPreview((prev) => !prev)}
                  className="mb-3 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {showMapPreview ? 'Close Map' : 'View Location on Map'}
                </button>

                {showMapPreview && (
                  <div className="w-full h-[300px] rounded-lg overflow-hidden border shadow-sm">
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name Correction and Correction Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="w-4 h-4 text-red-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Name Correction and Correction Type</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {formData.isNameCorrection === "Yes" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Correction Type
                  </label>
                  <select
                    name="correctionType"
                    value={formData.correctionType || ""}
                    onChange={handleCorrectionTypeChange}
                    className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="Spell Correction">Spell Correction</option>
                    <option value="Transfer Ownership">Transfer Ownership</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* DISCOM ID */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-base font-medium text-gray-900">DISCOM ID</h4>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DISCOM ID <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="discomId"
                value={formData.discomId}
                onChange={handleChange}
                placeholder="e.g. 7137"
                min="1"
                step="1"
                title="DISCOM ID must be a positive integer greater than 0"
                required
                className={`mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  fieldErrors.discomId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fieldErrors.discomId && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.discomId}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-1">
            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Update Connection
            </button>
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
  phaseTypeId: connection.phaseTypeId,
  connectionTypeId:connection.connectionTypeId,
  addressTypeId: connection.addressTypeId,
  correctionType:reverseCorrectionTypeMap[connection.correctionTypeId] || "",
  isNameCorrection: connection.isNameCorrectionRequired ? "Yes" : "No",
  monthlyAvgConsumptionUnits: connection.monthlyAvgConsumptionUnits || "",
  gstIn: connection.gstIn || "",
  billedTo: connection.billedTo || "",
  addressLine1: connection.addressLine1 || "",
  addressLine2: connection.addressLine2 || "",
  
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