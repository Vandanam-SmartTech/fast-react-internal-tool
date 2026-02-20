import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createOrganization } from '../../services/organizationService';
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/jwtService';
import { uploadOrganizationImage } from '../../services/documentManagerService';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCcw, Crop } from "lucide-react";
import { croppedImgForLogo } from '../../utils/croppedImageForLogo';
import { Button } from '../../components/ui';
import ReusableDropdown from '../../components/ReusableDropdown';
import { removeBackground } from "@imgly/background-removal";

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

const validationRules = {
  gstNumber: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    message: "GSTIN must be in format: 22AAAAA0000A1Z6"
  },

  addressLine: {
    pattern: /^[A-Za-z0-9\s,.\/#-]{5,100}$/,
    message: "Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
  },
  pinCode: {
    pattern: /^[0-9]{6}$/,
    message: "Pincode must be exactly 6 digits (0-9)"
  }
};

const validateField = (fieldName: string, value: string | number): { isValid: boolean; message: string } => {
  const rule = validationRules[fieldName as keyof typeof validationRules];
  if (!rule) return { isValid: true, message: "" };

  if (fieldName === 'gstNumber') {
    if (!value) return { isValid: true, message: "" }; // Optional field
    const isValid = 'pattern' in rule && rule.pattern.test(value.toString().toUpperCase());
    return { isValid, message: isValid ? "" : rule.message };
  }


  if (fieldName === 'addressLine1' || fieldName === 'addressLine2') {
    if (!value) return { isValid: true, message: "" }; // Optional field
    const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
    return { isValid, message: isValid ? "" : rule.message };
  }


  if (fieldName === 'pinCode') {
    if (!value) return { isValid: false, message: "pinCode is required" }; // Required field
    const isValid = 'pattern' in rule && rule.pattern.test(value.toString());
    return { isValid, message: isValid ? "" : rule.message };
  }

  return { isValid: true, message: "" };
};

const OrganizationForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    legalName: '',
    addressLine1: '',
    addressLine2: '',
    villageCode: 0,
    pinCode: '',
    contactNumber: '',
    gstNumber: '',
    govtRegNumber: '',
    emailAddress: '',
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [pinCode, setPinCode] = useState<string>("");
  const [villageCode, setVillageCode] = useState<number>(0);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [createdOrgId, setCreatedOrgId] = useState<number | null>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isDisplayNameManuallyEdited, setIsDisplayNameManuallyEdited] = useState(false);

  const [loading, setLoading] = useState(false);
  const { userClaims } = useUser();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


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

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setTalukaCode(0);
    setVillageCode(0);
    setTalukaName("");
    setVillageName("");
    setPinCode("");
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      talukaCode: value,
      villageCode: 0,
      pinCode: "",
    }));
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const selectedVillage = villages.find((village) => village.code === value);

    if (selectedVillage) {
      setVillageCode(value);
      setPinCode(selectedVillage.pinCode || "");
      setFormData((prev) => ({
        ...prev,
        villageCode: value,
        pinCode: selectedVillage.pinCode,
      }));
    }
  };

  const handlepinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPinCode(value);
    setFormData((prev) => ({ ...prev, pinCode: value }));
    console.log("Current state PINcode:", value);
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];


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


    if (formData.gstNumber) {
      const gstNumberValidation = validateField('gstNumber', formData.gstNumber);
      if (!gstNumberValidation.isValid) {
        errors.push(gstNumberValidation.message);
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


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowImageModal(false);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // reset crop
  const handleCropReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };


  // crop and upload combined
  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !createdOrgId) return;

    setIsProcessing(true);
    try {

      const croppedBlob = await croppedImgForLogo(imageSrc, croppedAreaPixels, rotation, 768, 325);
      const croppedFile = new File([croppedBlob], "logo.png", { type: "image/png" });
      setSelectedFile(croppedFile);


      await uploadOrganizationImage(createdOrgId, croppedFile);

      toast.success("Logo uploaded successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      setShowCropModal(false);
      navigate("/organizations");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };


  // final upload
  const handleImageUpload = async () => {
    if (!selectedFile || !createdOrgId) return;
    setUploadLoading(true);
    try {
      await uploadOrganizationImage(createdOrgId, selectedFile);
      toast.success("Logo uploaded successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      navigate("/organizations");
    } catch (error) {
      toast.error("Failed to upload logo", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleChooseAnotherImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = userClaims?.id || userClaims?.user_id || userClaims?.userId;
      const orgData = {
        ...formData,
        pinCode: formData.pinCode ? parseInt(formData.pinCode, 10) : null,
        emailAddress: formData.emailAddress || null,
      };

      console.log('User ID:', userId);
      console.log('Creating organization with data:', orgData);

      const response = await createOrganization(orgData);

      if (response?.id) {
        setCreatedOrgId(response.id);
        toast.success('Organization created successfully', {
          autoClose: 1000,
          hideProgressBar: true,
        });
        setShowImageModal(true);
      } else {
        toast.error('Organization created, but no ID returned', {
          autoClose: 1000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      toast.error('Failed to create organization', {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };




  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'legalName') {
      setFormData(prev => ({
        ...prev,
        legalName: value,
        displayName: isDisplayNameManuallyEdited ? prev.displayName : value,
      }));
    }
    else if (name === 'displayName') {
      setIsDisplayNameManuallyEdited(true);
      setFormData(prev => ({
        ...prev,
        displayName: value,
      }));
    }
    else {
      // update form data first
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // validate on change
      validateFieldOnChange(name, value);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
         <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-700">
          Add New Organization
        </h1>
      </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. EcoVolt Renewable Energy Pvt. Ltd."
              required
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g. EcoVolt Solar Solutions"
              required
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Short Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. SunTech, EcoVolt, SolarMax"
              required
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[6-9][0-9]*$/.test(value) || value === "") {
                  if (value.length <= 10) {
                    handleChange(e);
                  }
                }
              }}
              placeholder="e.g. 9567023456"
              maxLength={10}
              required
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              title="Enter a valid 10-digit mobile number starting with 6-9"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            />
            {formData.contactNumber?.length > 0 &&
              !/^[6-9]{1}[0-9]{0,9}$/.test(formData.contactNumber) && (
                <p className="text-red-600 text-sm mt-1">
                  Enter a valid 10-digit mobile number starting with 6-9
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={(e) => {
                const value = e.target.value;

                if (
                  value === "" ||
                  /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(
                    value
                  )
                ) {
                  handleChange(e);
                } else {
                  handleChange(e);
                }
              }}
              placeholder="e.g. johndoe@example.com"
              maxLength={50}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />

            {/* Error messages */}
            {formData.emailAddress && !/^[a-zA-Z0-9]/.test(formData.emailAddress) && (
              <p className="text-red-600 text-sm mt-1">
                Email must start with a letter or number
              </p>
            )}

            {formData.emailAddress && /\.\./.test(formData.emailAddress) && (
              <p className="text-red-600 text-sm mt-1">
                Email cannot contain consecutive dots
              </p>
            )}

            {formData.emailAddress && /\.@/.test(formData.emailAddress) && (
              <p className="text-red-600 text-sm mt-1">
                Email cannot end with a dot before @
              </p>
            )}

            {formData.emailAddress &&
              !/^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(
                formData.emailAddress
              ) &&
              !/\.\./.test(formData.emailAddress) &&
              !/\.@/.test(formData.emailAddress) &&
              /^[a-zA-Z0-9]/.test(formData.emailAddress) && (
                <p className="text-red-600 text-sm mt-1">Enter a valid email address</p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "gstNumber",
                    value: e.target.value.toUpperCase()
                  }
                } as React.ChangeEvent<HTMLInputElement>)
              }
              maxLength={15}
              placeholder="e.g. 22AAAAA0000A1Z6"
              className={`w-full px-3 py-1.5 border rounded-md ${fieldErrors.gstNumber ? "border-red-500" : "border-gray-300"
                }`}
            />

            {fieldErrors.gstNumber && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.gstNumber}</p>
            )}

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Government Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="govtRegNumber"
              value={formData.govtRegNumber || ''}
              onChange={handleChange}
              maxLength={50}
              placeholder="e.g. L01631KA2010PTC096843"
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
            <ReusableDropdown
              name="district"
              value={districtCode}
              onChange={(val) => handleDistrictChange({ target: { name: "district", value: val } })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Taluka <span className="text-red-500">*</span></label>
            <ReusableDropdown
              name="talukaCode"
              value={talukaCode}
              onChange={(val) => handleTalukaChange({ target: { name: "talukaCode", value: val } })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Village <span className="text-red-500">*</span></label>
            <ReusableDropdown
              name="villageCode"
              value={villageCode}
              onChange={(val) => handleVillageChange({ target: { name: "villageCode", value: val } })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="pinCode"
              name="pinCode"
              value={formData.pinCode}
              onChange={handlepinCodeChange}
              placeholder="e.g. 416000"
              inputMode='numeric'
              required
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              placeholder="e.g. Flat No, House No, Street Name"
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              placeholder="e.g. Apartment, Suite, Unit, Building"
              className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

        </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="py-2.5 px-8 sm:py-2.5 sm:px-5 w-auto inline-flex justify-center bg-gray-300 text-gray-800 font-semibold text-sm sm:text-base rounded-md hover:bg-gray-400 transition-colors shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="
      w-full sm:w-auto inline-flex items-center justify-center gap-2
      px-3 py-2.5 sm:px-5 sm:py-2.5
      bg-blue-600 text-white font-semibold
      text-sm sm:text-base
      rounded-md hover:bg-blue-700
      transition-colors shadow-sm hover:shadow-md
      disabled:opacity-50">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Organization'}
          </button>
        </div>



      </form>

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-center">Upload Organization Logo</h2>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full mb-4 border border-gray-300 p-2 rounded-md"
            />

            <button
              onClick={handleImageUpload}
              disabled={!selectedFile || uploadLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadLoading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* --- Crop Modal --- */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Crop Logo</h3>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  Adjust the crop area. Final output will be <b>768×325px</b>.
                </p>
              </div>

              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={768 / 325}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={handleCropComplete}
                  objectFit="contain"
                  showGrid={true}
                  cropSize={{ width: 300, height: 127 }}
                />
              </div>

              {/* ✅ Choose another image option */}
              <div className="flex justify-center">
                <label className="cursor-pointer text-blue-600 text-sm font-medium hover:underline">
                  Choose Another Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChooseAnotherImage}
                  />
                </label>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.05))}>
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(3, zoom + 0.05))}>
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-3 border-t border-gray-200 flex gap-3 justify-center">
              <Button
                onClick={handleCropReset}
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>

              <Button
                onClick={handleCropAndUpload}
                size="sm"
                leftIcon={!loading && <Crop className="w-4 h-4" />}
                loading={isProcessing}
                disabled={!croppedAreaPixels}
              >
                {isProcessing ? "Uploading..." : "Save & Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
    
  );
};

export default OrganizationForm;