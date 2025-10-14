import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createOrganization } from '../../services/organizationService';
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/jwtService';
import { uploadOrganizationImage } from '../../services/oneDriveService';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut, RotateCcw, Crop } from "lucide-react";
import { croppedImgForLogo } from '../../utils/croppedImageForLogo';
import { Button } from '../../components/ui';

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
      setFormData((prev) => ({
        ...prev,
        legalName: value,
        displayName: isDisplayNameManuallyEdited ? prev.displayName : value,
      }));
    } else if (name === 'displayName') {
      setIsDisplayNameManuallyEdited(true);
      setFormData((prev) => ({
        ...prev,
        displayName: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/organizations')}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
          Add New Organization
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. EcoVolt Renewable Energy Pvt. Ltd."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g. EcoVolt Solar Solutions"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (Short Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. SunTech, EcoVolt, SolarMax"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber || ''}
              onChange={handleChange}
              pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
              title="GSTIN must be in format: 22AAAAA0000A1Z6"
              placeholder="e.g. 22AAAAA0000A1Z6"
              maxLength={15}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Government Registration Number
            </label>
            <input
              type="text"
              name="govtRegNumber"
              value={formData.govtRegNumber || ''}
              onChange={handleChange}
              maxLength={50}
              placeholder="e.g. L01631KA2010PTC096843"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District <span className="text-red-500">*</span></label>
            <select
              name="distrct"
              id="district"
              value={districtCode}
              onChange={handleDistrictChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Taluka <span className="text-red-500">*</span></label>
            <select
              name="talukaCode"
              id="taluka"
              value={talukaCode}
              onChange={handleTalukaChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Village <span className="text-red-500">*</span></label>
            <select
              name="villageCode"
              id="village"
              value={villageCode}
              onChange={handleVillageChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="pinCode"
              name="pinCode"
              value={formData.pinCode}
              onChange={handlepinCodeChange}
              placeholder="e.g. 416000"
              inputMode='numeric'
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              placeholder="e.g. Flat No, House No, Street Name"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              placeholder="e.g. Apartment, Suite, Unit, Building"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


        </div>

        <div className="col-span-2 flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/organizations')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save'}
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

              <div className="flex justify-center gap-3">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
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
  );
};

export default OrganizationForm;