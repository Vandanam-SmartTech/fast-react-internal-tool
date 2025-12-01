import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createOrganization } from '../../services/organizationService';
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/jwtService';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import ReusableDropdown from '../../components/ReusableDropdown';

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

const AgencyForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = location.state?.orgId;

  const gstNumber = location.state?.gstNumber;

  //const isEdit = Boolean(agencyId);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    legalName: '',
    addressLine1: '',
    addressLine2: '',
    villageCode: 0,
    pinCode: '',
    contactNumber: '',
    logoUrl: '',
    parentId: parseInt(orgId!),
    emailAddress: '',
    gstNumber: '',
    govtRegNumber: '',
  });

  const [loading, setLoading] = useState(false);

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

  const [isDisplayNameManuallyEdited, setIsDisplayNameManuallyEdited] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (gstNumber) {
      setFormData((prev) => ({ ...prev, gstNumber: gstNumber }));
    }
  }, [gstNumber]);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = userClaims?.id || userClaims?.user_id || userClaims?.userId;

      const agencyData = {
        ...formData,
        parentId: parseInt(orgId!),
        createdBy: userId,
        pinCode: formData.pinCode ? parseInt(formData.pinCode, 10) : null,
      };

      await createOrganization(agencyData);
      toast.success('Agency created successfully', {
        autoClose: 1000,
        hideProgressBar: true
      });

      navigate("/agencies", {
        state: { orgId: orgId },
      });

    } catch (error) {
      toast.error('Failed to create agency', {
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

      validateFieldOnChange(name, value);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() =>
            navigate(-1)
          }

          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
          Add Agency
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
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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
              className={`w-full px-3 py-2.5 border rounded-md ${fieldErrors.gstNumber ? "border-red-500" : "border-gray-300"
                }`}
            />

            {fieldErrors.gstNumber && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.gstNumber}</p>
            )}

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Government Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="govtRegNumber"
              value={formData.govtRegNumber || ''}
              onChange={handleChange}
              maxLength={50}
              placeholder="e.g. L01631KA2010PTC096843"
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Taluka <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Village <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="pinCode"
              name="pinCode"
              value={formData.pinCode}
              onChange={handlepinCodeChange}
              placeholder="e.g. 416000"
              required
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1 || ''}
              onChange={handleChange}

              placeholder="e.g. Flat No, House No, Street Name"
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              placeholder="e.g. Apartment, Suite, Unit, Building"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
            />
          </div>



        </div>

        <div className="col-span-2 flex justify-center gap-6 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Agency'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgencyForm;