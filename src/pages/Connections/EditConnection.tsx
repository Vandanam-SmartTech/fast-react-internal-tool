import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getConnectionByConnectionId, updateConsumerConnectionDetails, checkConsumerNumberExists } from "../../services/customerRequisitionService";
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages, fetchConnectionType, fetchPhaseType, fetchAddressType, fetchCorrectionType } from '../../services/customerRequisitionService';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import MapPreview from '../../components/MapPreview';
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import ReusableDropdown from "../../components/ReusableDropdown";

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
  pinCode: string;
}

interface FormData {
  consumerId: string;
  isDiscomConsumer: string;
  phaseTypeId: number;
  connectionTypeId: number;
  addressTypeId: number;
  latitude: string;
  longitude: string;
  gstIn: string;
  billedTo: string;
  addressLine1: string;
  addressLine2: string;
  villageCode: number;
  pinCode: string;
  isNameCorrection: string;
  correctionTypeId: number | null;
  avgMonthlyConsumption: string;
  isOnboardedCustomers: boolean;
  discomId: string;
  isActive: boolean;
  isGharkulCustomer: string;
  gharkulNumber: string;
  districtCode?: number;
  talukaCode?: number;
}

const validationRules = {
  consumerNumber: {
    pattern: /^[0-9]{12}$/,
    message: "Consumer number must be exactly 12 digits (0-9)"
  },
  gstIn: {
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
  avgMonthlyConsumption: {
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
  pinCode: {
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

  if (fieldName === 'gstIn') {
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

  if (fieldName === 'avgMonthlyConsumption') {
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

  if (fieldName === 'pinCode') {
    if (!value) return { isValid: false, message: "PIN Code is required" }; // Required field
    const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
    return { isValid, message: isValid ? "" : rule.message };
  }

  return { isValid: true, message: "" };
};


export const EditConnection = () => {
  const location = useLocation();
  const [connection, setConnection] = useState<any>(null);

  const customerId = location.state?.customerId || null;
  const connectionId = location.state?.connectionId;

  const [missingInfo, setMissingInfo] = useState(false);

  useEffect(() => {
    if (!connectionId) {
      setMissingInfo(true);
      setLoading(false);
    }
  }, [connectionId]);

  const [consumerNumberExists, setConsumerNumberExists] = useState(false);
  const [originalConsumerNumber, setOriginalConsumerNumber] = useState("");

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [connectionTypes, setConnectionTypes] = useState<{ id: number; nameEn: string }[]>([]);
  const [phaseTypes, setPhaseTypes] = useState<{ id: number; nameEn: string }[]>([]);
  const [addressTypes, setAddressTypes] = useState<{ id: number; nameEn: string }[]>([]);
  const [correctionTypes, setCorrectionTypes] = useState<{ id: number; nameEn: string; nameMr?: string }[]>([]);


  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [, setPinCode] = useState<string>("");
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

  const [confirmConsumerNumber, setConfirmConsumerNumber] = useState("");

  const [showMapPreview, setShowMapPreview] = useState(false);


  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];



  const [formData, setFormData] = useState<FormData>({
    consumerId: "",
    isDiscomConsumer: "Yes",
    phaseTypeId: 1,
    connectionTypeId: 1,
    addressTypeId: 1,
    latitude: "",
    longitude: "",
    gstIn: "",
    billedTo: "",
    addressLine1: "",
    addressLine2: "",
    villageCode: 0,
    pinCode: "",
    isNameCorrection: "No",
    correctionTypeId: null,
    avgMonthlyConsumption: "",
    isOnboardedCustomers: false,
    discomId: "",
    isActive: true,
    isGharkulCustomer: "No",
    gharkulNumber: ""
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
        setCorrectionTypes(types);
      } catch (err) {
        console.error("Failed to load correction types", err);
      }
    };

    loadCorrectionTypes();
  }, []);

  useEffect(() => {
    const checkExists = async () => {
      const current = (formData.consumerId ?? "").toString().trim();
      const original = (originalConsumerNumber ?? "").toString().trim();

      if (current.length !== 12) {
        setConsumerNumberExists(false);
        return;
      }

      if (current === original) {
        setConsumerNumberExists(false);
        return;
      }

      const exists = await checkConsumerNumberExists(current);
      setConsumerNumberExists(exists);
    };

    checkExists();
  }, [formData.consumerId, originalConsumerNumber]);


  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];


    if (!customerId) {
      errors.push("Customer ID is missing!");
    }

    if (formData.isDiscomConsumer === "Yes") {
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

    if (formData.isNameCorrection === "Yes" && !formData.correctionTypeId) {
      errors.push("Please select a correction type.");
    }

    if (formData.isGharkulCustomer === "Yes" && !formData.gharkulNumber) {
      errors.push("Please provide gharkul number.");
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

    if (!formData.avgMonthlyConsumption || isNaN(Number(formData.avgMonthlyConsumption))) {
      errors.push("Monthly Average Consumption Units is required");
    } else {
      const consumptionValidation = validateField('avgMonthlyConsumption', formData.avgMonthlyConsumption);
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
      const gstinValidation = validateField('gstIn', formData.gstIn);
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

    if (!formData.pinCode) {
      errors.push("PIN Code is required");
    } else {
      const pinCodeValidation = validateField('pinCode', formData.pinCode);
      if (!pinCodeValidation.isValid) {
        errors.push(pinCodeValidation.message);
      }
    }

    return { isValid: errors.length === 0, errors };
  };


  const validateFieldOnChange = (fieldName: string, value: string | number) => {
    const validation = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: validation.message
    }));
  };


  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setTalukaCode(0);
    setVillageCode(0);
    setTalukaName("");
    setVillageName("");
    setPinCode("");
    setFormData((prev: any) => ({
      ...prev,
      districtCode: value,
      talukaCode: 0,
      villageCode: 0,
      pinCode: "",
    }));
  };

  const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setTalukaCode(value);

    setVillageCode(0);
    setVillageName("");
    setPinCode("");
    setFormData((prev: any) => ({
      ...prev,
      talukaCode: value,
      villageCode: 0,
      pinCode: "",
    }));
  };

  const handlepinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPinCode(value);
    setFormData((prev) => ({ ...prev, pinCode: value }));
    console.log("Current state PINcode:", value);
  };

  const handleNameCorrection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      isNameCorrection: value,
      correctionTypeId: value === "No" ? null : prev.correctionTypeId,
    }));
  };

  useEffect(() => {
    const fetchConnection = async () => {
      if (connectionId) {
        const data = await getConnectionByConnectionId(Number(connectionId));
        setConnection(data);
        setFormData({
          ...formData,
          consumerId: data.consumerId,
          isDiscomConsumer: data.isDiscomConsumer ? "Yes" : "No",
          phaseTypeId: data.phaseTypeId,
          connectionTypeId: data.connectionTypeId,
          addressTypeId: data.addressTypeId,
          correctionTypeId: data.correctionTypeId,
          isNameCorrection: data.isNameCorrectionRequired ? "Yes" : "No",
          avgMonthlyConsumption: data.avgMonthlyConsumption,
          gstIn: data.gstIn,
          billedTo: data.billedTo,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          districtCode: data.districtCode,
          talukaCode: data.talukaCode,
          villageCode: data.villageCode,
          pinCode: data.pinCode,
          latitude: data.latitude,
          longitude: data.longitude,
          isOnboardedCustomers: data.isOnboardedCustomers ?? false,
          discomId: data.discomId,
          isGharkulCustomer: data.isGharkulCustomer ? "Yes" : "No",
          gharkulNumber: data.gharkulNumber,
        });
        setDistrictCode(data.districtCode);
        setTalukaCode(data.talukaCode);
        setVillageCode(data.villageCode);
        setPinCode(data.pinCode);
        setConfirmConsumerNumber(data.consumerId || "");

        setOriginalConsumerNumber(data.consumerId || "");

        setLoading(false);
      }
    };
    fetchConnection();
  }, [connectionId]);

  if (missingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Missing Information</h2>
          <p className="text-gray-600 mb-6">
            Connection ID or Customer Information is missing. Please navigate here from the View Customer page.
          </p>
          <button
            onClick={() => navigate('/list-of-consumers')}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Go to Customers List
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading connection details...</div>;
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Real-time validation
    if (name === 'consumerId') {
      if (value === '') {
        // Clear consumerNumber field error when input is empty
        setFieldErrors((prev) => ({ ...prev, consumerNumber: '' }));
      } else {
        validateFieldOnChange('consumerNumber', value);
      }
    }
    else if (name === 'gstIn') {
      validateFieldOnChange('gstIn', value);
    } else if (name === 'billedTo') {
      validateFieldOnChange('billedTo', value);
    } else if (name === 'addressLine1') {
      validateFieldOnChange('addressLine1', value);
    } else if (name === 'addressLine2') {
      validateFieldOnChange('addressLine2', value);
    } else if (name === 'avgMonthlyConsumption') {
      validateFieldOnChange('avgMonthlyConsumption', value);
    } else if (name === 'latitude') {
      validateFieldOnChange('latitude', value);
    } else if (name === 'longitude') {
      validateFieldOnChange('longitude', value);
    } else if (name === 'discomId') {
      validateFieldOnChange('discomId', value);
    } else if (name === 'pinCode') {
      validateFieldOnChange('pinCode', value);
    }

    setFormData((prev: any) => {
      let updatedForm = { ...prev, [name]: value };

      // Clear confirmConsumerNumber if consumerId changes
      if (name === 'consumerId' && prev.consumerId !== value) {
        setConfirmConsumerNumber('');
      }

      // If MSEB Connection is "No", clear consumerId and confirmConsumerNumber
      if (name === 'isDiscomConsumer' && value === 'No') {
        updatedForm.consumerId = '';
        setConfirmConsumerNumber('');
        updatedForm.discomId = '';
      }

      if (name === 'connectionTypeId') {
        const selectedType = connectionTypes.find(
          (type) => type.id === Number(value)
        );
        const isHT = selectedType?.nameEn?.toLowerCase().includes('ht');
        updatedForm.phaseTypeId = isHT ? 2 : 1;
      }

      return updatedForm;
    });
  };

  const handleGharkulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      isGharkulCustomer: value,
      gharkulNumber: value === "Yes" ? prev.gharkulNumber : "",
    }));
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

    const isDiscomConsumer = formData.isDiscomConsumer === "Yes";


    const connectionData = {
      customerId,
      consumerId: formData.consumerId,
      isDiscomConsumer,
      isNameCorrectionRequired: formData.isNameCorrection === "Yes",
      isGharkulCustomer: formData.isGharkulCustomer === "Yes",
      phaseTypeId: formData.phaseTypeId,
      addressTypeId: formData.addressTypeId,
      connectionTypeId: formData.connectionTypeId,
      correctionTypeId: formData.isNameCorrection === "Yes" ? formData.correctionTypeId : null,
      gharkulNumber: formData.isGharkulCustomer === "Yes" ? formData.gharkulNumber : null,
      avgMonthlyConsumption: formData.avgMonthlyConsumption,
      villageCode: formData.villageCode,
      pinCode: formData.pinCode ? parseInt(formData.pinCode, 10) : null,
      gstIn: formData.gstIn?.trim() || null,
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

          navigate(`/view-connection`, {
            state: {
              customerId,
              connectionId, consumerId: formData.consumerId,
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
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-18">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Back Arrow */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>

              <h1 className="text-xl font-bold text-gray-700">Update Connection</h1>
            </div>

          </div>
        </div>


        <div className="w-full max-w-4xl mx-auto mb-4 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
          <div className="relative flex justify-center min-w-[500px] md:min-w-0">

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

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* MSEB Connection Question */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-blue-500" />
              Connection Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Does the customer currently have an active grid connection?
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isDiscomConsumer"
                      value="Yes"
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={formData.isDiscomConsumer === "Yes"}
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isDiscomConsumer"
                      value="No"
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={formData.isDiscomConsumer === "No"}
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Consumer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-green-500" />
              Connection Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  12-Digit Consumer Number{" "}
                  {formData.isDiscomConsumer === "Yes" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  name="consumerId"
                  value={formData.consumerId}
                  onChange={handleChange}
                  onInput={(e) => {
                    (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
                  }}
                  maxLength={12}
                  pattern="^[0-9]{12}$"
                  title="Enter exactly 12 digits (0–9)"
                  required={formData.isDiscomConsumer === "Yes"}
                  disabled={formData.isDiscomConsumer === "No"}
                  placeholder="e.g. 987654321000"
                  className={`w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.consumerNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${formData.isDiscomConsumer === "No" ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                {fieldErrors.consumerNumber && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.consumerNumber}</p>
                )}
                {consumerNumberExists && formData.consumerId !== originalConsumerNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    Consumer number already exists
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Consumer Number{" "}
                  {formData.isDiscomConsumer === "Yes" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                <input
                  type="tel"
                  name="confirmConsumerNumber"
                  value={confirmConsumerNumber}
                  onChange={handleConfirmConsumerNumberChange}
                  onInput={(e) => {
                    (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
                  }}
                  placeholder="Confirm consumer number"
                  maxLength={12}
                  pattern="^[0-9]{12}$"
                  required={formData.isDiscomConsumer === "Yes"}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  title="Re-enter the same 12-digit consumer number"
                  disabled={
                    formData.isDiscomConsumer === "No" ||
                    !(/^[0-9]{12}$/.test(formData.consumerId) && (!consumerNumberExists || formData.consumerId === originalConsumerNumber))
                  }
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Type{" "}
                  {formData.isDiscomConsumer === "Yes" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <ReusableDropdown
                  name="connectionTypeId"
                  value={formData.connectionTypeId}
                  onChange={(val) =>
                    handleChange({ target: { name: "connectionTypeId", value: val.toString() } } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  options={connectionTypes.map((type) => ({
                    value: type.id,
                    label: type.nameEn,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phase Type <span className="text-red-500">*</span>
                </label>
                <ReusableDropdown
                  name="phaseTypeId"
                  value={formData.phaseTypeId}
                  onChange={(val) =>
                    handleChange({ target: { name: "phaseTypeId", value: val.toString() } } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  options={phaseTypes.map((type) => ({
                    value: type.id,
                    label: type.nameEn,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Average Consumption Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9][0-9]*"
                  name="avgMonthlyConsumption"
                  value={formData.avgMonthlyConsumption}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[1-9][0-9]*$/.test(val) || val === "") {
                      handleChange(e);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      validateFieldOnChange("avgMonthlyConsumption", e.target.value);
                    }
                  }}
                  required
                  placeholder="e.g. 1"
                  title="Enter a positive integer greater than 0"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />

                {/* {fieldErrors.monthlyAvgConsumptionUnits && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.monthlyAvgConsumptionUnits}</p>
                )}
                {!fieldErrors.monthlyAvgConsumptionUnits && formData.monthlyAvgConsumptionUnits && (
                  <p className="text-green-600 text-sm mt-1">✓ Valid consumption value</p>
                )} */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DISCOM ID{" "}
                  {formData.isDiscomConsumer === "Yes" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="discomId"
                  value={formData.discomId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[1-9][0-9]*$/.test(val) || val === "") {
                      handleChange(e);
                    }
                  }}
                  placeholder="e.g. 7137"
                  required={formData.isDiscomConsumer === "Yes"}
                  disabled={formData.isDiscomConsumer === "No"}
                  title="DISCOM ID must be a positive integer greater than 0"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
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
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.gstIn && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.gstIn}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billed To <span className="text-red-500">*</span>
                </label>
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
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.billedTo && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.billedTo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value="Maharashtra"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <ReusableDropdown
                  name="district"
                  value={districtCode}
                  onChange={(val) => handleDistrictChange({ target: { name: "district", value: val.toString() } } as React.ChangeEvent<HTMLSelectElement>)}
                  options={[
                    { value: 0, label: districtName || "Select District" },
                    ...districts.map((district) => ({
                      value: district.code,
                      label: district.nameEnglish,
                    })),
                  ]}
                  placeholder={districtName || "Select District"}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taluka <span className="text-red-500">*</span>
                </label>
                <ReusableDropdown
                  name="talukaCode"
                  value={talukaCode}
                  onChange={(val) => handleTalukaChange({ target: { name: "talukaCode", value: val.toString() } } as React.ChangeEvent<HTMLSelectElement>)}
                  options={[
                    { value: 0, label: talukaName || "Select Taluka" },
                    ...talukas.map((taluka) => ({
                      value: taluka.code,
                      label: taluka.nameEnglish,
                    })),
                  ]}
                  placeholder={talukaName || "Select Taluka"}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village <span className="text-red-500">*</span>
                </label>
                <ReusableDropdown
                  name="villageCode"
                  value={villageCode}
                  onChange={(val) => {
                    const numVal = typeof val === 'string' ? parseInt(val, 10) : val;
                    const selectedVillage = villages.find((village) => village.code === numVal);
                    if (selectedVillage) {
                      setVillageCode(numVal);
                      setPinCode(selectedVillage.pinCode || "");
                      setFormData((prev: any) => ({
                        ...prev,
                        villageCode: numVal,
                        pinCode: selectedVillage.pinCode,
                      }));
                    }
                  }}
                  options={[
                    { value: 0, label: villageName || "Select Village" },
                    ...villages.map((village) => ({
                      value: village.code,
                      label: village.nameEnglish,
                    })),
                  ]}
                  placeholder={villageName || "Select Village"}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode || ''}
                  onChange={handlepinCodeChange}
                  placeholder="e.g. 416000"
                  pattern="^[0-9]{6}$"
                  title="PIN Code must be exactly 6 digits (0-9)"
                  maxLength={6}
                  inputMode="numeric"
                  required
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.pinCode && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.pinCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <ReusableDropdown
                  name="addressTypeId"
                  value={formData.addressTypeId}
                  onChange={(val) =>
                    handleChange({ target: { name: "addressTypeId", value: val.toString() } } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  options={addressTypes.map((type) => ({
                    value: type.id,
                    label: type.nameEn,
                  }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
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
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.addressLine1 && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.addressLine1}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="e.g. Apartment, Suite, Unit, Building"
                  pattern="^[A-Za-z0-9\s,.\/#-]{5,100}$"
                  title="Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
                  maxLength={100}
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.addressLine2 && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.addressLine2}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="e.g. 16.7049873"
                  min="-90"
                  max="90"
                  step="any"
                  title="Latitude must be between -90 and 90"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.latitude && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="e.g. 74.2432527"
                  min="-180"
                  max="180"
                  step="any"
                  title="Longitude must be between -180 and 180"
                  className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {fieldErrors.longitude && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.longitude}</p>
                )}
              </div>

              <div className="md:col-span-2">
                {formData.latitude && formData.longitude && !isNaN(Number(formData.latitude)) && !isNaN(Number(formData.longitude)) && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowMapPreview((prev) => !prev)}
                      className="px-3 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {showMapPreview ? 'Close Map' : 'View Location on Map'}
                    </button>

                    {showMapPreview && (
                      <div className="mt-4 w-full h-[300px] rounded-md overflow-hidden border shadow-md">
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
            </div>
          </div>

          {/* Name Correction and Correction Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* LEFT SIDE – Gharkul Connection */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10"
                    />
                  </svg>
                  Gharkul Connection
                </h3>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is Gharkul Connection?
                </label>

                <div className="flex items-center space-x-5 mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isGharkulCustomer"
                      value="Yes"
                      onChange={handleGharkulChange}
                      checked={formData.isGharkulCustomer === "Yes"}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isGharkulCustomer"
                      value="No"
                      onChange={handleGharkulChange}
                      checked={formData.isGharkulCustomer === "No"}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>

                {formData.isGharkulCustomer === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gharkul Number
                    </label>
                    <input
                      type="text"
                      name="gharkulNumber"
                      value={formData.gharkulNumber || ""}
                      onChange={handleChange}
                      placeholder="Enter Gharkul Number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* RIGHT SIDE – Name Correction */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Name Correction
                </h3>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Does the connection require a name correction?
                </label>

                <div className="flex items-center space-x-5 mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="nameCorrection"
                      value="Yes"
                      onChange={handleNameCorrection}
                      checked={formData.isNameCorrection === "Yes"}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="nameCorrection"
                      value="No"
                      onChange={handleNameCorrection}
                      checked={formData.isNameCorrection === "No"}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>

                {formData.isNameCorrection === "Yes" && (
                  <ReusableDropdown
                    name="correctionTypeId"
                    value={formData.correctionTypeId || ""}
                    onChange={(val) =>
                      setFormData(prev => ({
                        ...prev,
                        correctionTypeId: val ? Number(val) : null,
                      }))
                    }
                    options={[
                      { value: "", label: "Select an option" },
                      ...correctionTypes.map(type => ({
                        value: type.id,
                        label: type.nameEn,
                      })),
                    ]}
                    placeholder="Select an option"
                    className="w-full"
                  />
                )}
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center sm:justify-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-2.5 px-8 sm:py-2.5 sm:px-5 w-auto inline-flex justify-center bg-gray-300 text-gray-800 font-semibold text-sm sm:text-base rounded-md hover:bg-gray-400 transition-colors shadow-sm hover:shadow-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center px-3 py-2.5 sm:px-5 sm:py-2.5 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md truncate"
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
                        isDiscomConsumer: connection.isDiscomConsumer ? "Yes" : "No",
                        phaseTypeId: connection.phaseTypeId,
                        connectionTypeId: connection.connectionTypeId,
                        addressTypeId: connection.addressTypeId,
                        correctionTypeId: connection.correctionTypeId,
                        isNameCorrection: connection.isNameCorrectionRequired ? "Yes" : "No",
                        isGharkulCustomer: connection.isGharkulCustomer ? "Yes" : "No",
                        gharkulNumber: connection.gharkulNumber || "",
                        avgMonthlyConsumption: connection.avgMonthlyConsumption || "",
                        gstIn: connection.gstIn || "",
                        billedTo: connection.billedTo || "",
                        addressLine1: connection.addressLine1 || "",
                        addressLine2: connection.addressLine2 || "",
                        districtCode: connection.districtCode || "",
                        talukaCode: connection.talukaCode || "",
                        villageCode: connection.villageCode || "",
                        pinCode: connection.pinCode || "",
                        latitude: connection.latitude || "",
                        longitude: connection.longitude || "",
                        isOnboardedCustomers: connection.isOnboardedCustomers ?? false,
                        discomId: connection.discomId || "",
                        isActive: connection.isActive ?? true,
                      });

                    }
                  }
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
    </div>
  );
};