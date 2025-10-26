import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { updateOrganization, getOrganizationById } from '../../services/organizationService';
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/jwtService';

import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';

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

const EditAgency: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orgId = location.state?.orgId;
  const agencyId = location.state?.agencyId

  const [isDisplayNameManuallyEdited, setIsDisplayNameManuallyEdited] = useState(false);


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
    gstNumber: '',
    govtRegNumber:'',
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

  const { userClaims } = useUser();


  useEffect(() => {
    if (agencyId) {
      loadAgency(parseInt(agencyId));
    }
  }, [agencyId]);

  const loadAgency = async (agencyId: number) => {
    try {
      const agency = await getOrganizationById(agencyId);
      setFormData({
        ...agency,
      pinCode: agency.pinCode || "",
    });

    setDistrictCode(agency.districtCode);
    setTalukaCode(agency.talukaCode);
    setVillageCode(agency.villageCode);
    setPinCode(agency.pinCode || "");
    } catch (error) {
      toast.error('Failed to load agency');
      navigate("/agencies", {
              state: {
                orgId: orgId,
              },
            });
    }
  };

  // const loadOrganization = async (organizationId: number) => {
  //   try {
  //     const org = await getOrganizationById(organizationId);
  
  //     setFormData({
  //       ...org,
  //       pinCode: org.pinCode || "", 
  //     });
  
  //     setDistrictCode(org.districtCode);
  //     setTalukaCode(org.talukaCode);
  //     setVillageCode(org.villageCode);
  //     setPinCode(org.pinCode || "");
  
  //   } catch (error) {
  //     toast.error('Failed to load organization');
  //     navigate('/organizations');
  //   }
  // };

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


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const userId = userClaims?.id || userClaims?.user_id || userClaims?.userId;

    if (!agencyId) {
      toast.error("Agency ID not available for update");
      setLoading(false);
      return;
    }

    const agencyData = {
      ...formData,
      parentId: parseInt(orgId!),
      createdBy: userId,
      pinCode: formData.pinCode ? parseInt(formData.pinCode, 10) : null,
    };

    await updateOrganization(parseInt(agencyId), agencyData);
    toast.success("Agency updated successfully",{
      autoClose: 1000,
      hideProgressBar: true,
    });

    navigate("/agency-view", {
      state: { agencyId: agencyId, orgId: orgId }, 
    });

  } catch (error) {
    toast.error("Failed to update agency");
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() =>
            navigate("/agencies", {
              state: { orgId: orgId },
            })
          }
          className="rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-700">
          Edit Agency
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
              value={formData.addressLine1 || ''}
              onChange={handleChange}

              placeholder="e.g. Flat No, House No, Street Name"
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
              placeholder="e.g. Apartment, Suite, Unit, Building"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          

        </div>

        <div className="col-span-2 flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() =>
              navigate("/agencies", {
                state: { orgId: orgId },
              })
            }

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
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAgency;