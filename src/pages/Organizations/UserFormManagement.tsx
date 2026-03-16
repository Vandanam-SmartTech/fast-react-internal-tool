import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { saveUser, getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages, getAllRoles } from '../../services/jwtService';
import { fetchOrganizations, Organization, getChildOrganizations, assignUserOrgRole } from '../../services/organizationService';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import ReusableDropdown from '../../components/ReusableDropdown';

const UserFormManagement: React.FC = () => {
  const navigate = useNavigate();
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [confirmContactNumber, setConfirmContactNumber] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nameAsPerGovId: '',
    emailAddress: '',
    userCode: '',
    contactNumber: '',
    alternateContactNumber: '',
    preferredName: '',
    villageCode: 0,
    pinCode: '',
    addressLine1: '',
    addressLine2: '',
    isActive: true,
  });

  const { userClaims } = useUser();
  const [userRole, setUserRole] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [newAssignment, setNewAssignment] = useState({
    organizationId: '',
    roleId: '',
    agencyId: ''
  });

  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");

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

  const [loading, setLoading] = useState(false);

  const [showMobile,] = useState(false);

  const [showEmail,] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [, setPinCode] = useState<string>("");
  const [villageCode, setVillageCode] = useState<number>(0);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");

  useEffect(() => {
    if (userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) {
      setUserRole("ROLE_SUPER_ADMIN");
    } else if (userInfo?.role === "ROLE_ORG_ADMIN") {
      setUserRole("ROLE_ORG_ADMIN");
    } else if (userInfo?.role === "ROLE_AGENCY_ADMIN") {
      setUserRole("ROLE_AGENCY_ADMIN");
    }
  }, [userClaims, userInfo]);

  useEffect(() => {
    const isSuperAdmin = userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN");

    if (isSuperAdmin) {
      const loadOrganizations = async () => {
        try {
          const data = await fetchOrganizations();
          setOrganizations(data);
        } catch (error) {
          toast.error('Failed to load organizations');
        }
      };
      loadOrganizations();
    }

    const loadRoles = async () => {
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Failed to load roles", error);
      }
    };

    loadRoles();
  }, [userClaims]);


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


  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmEmailAddress(value);
  };

  const handleConfirmContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmContactNumber(value);
  };

    const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmNewPassword(value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const roleName = roles.find(r => r.id.toString() === roleId)?.name || "";

    setSelectedRoleName(roleName);
    setNewAssignment({ roleId, organizationId: "", agencyId: "" });
    setAgencies([]);

    if (userRole === "ROLE_ORG_ADMIN" && userInfo?.orgId) {
      getChildOrganizations(parseInt(userInfo.orgId))
        .then((res) => setAgencies(res))
        .catch((err) => {
          console.error("Failed to fetch agencies for ORG_ADMIN role", err);
          setAgencies([]);
        });
    }
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    setNewAssignment((prev) => ({
      ...prev,
      organizationId: orgId,
      agencyId: "",
    }));

    if (orgId && !["ROLE_ORG_ADMIN", "ROLE_ORG_REPRESENTATIVE", "ROLE_ORG_STAFF", "ROLE_ORG_ELECTRICIAN", "ROLE_ORG_FABRICATOR", "ROLE_BDO", "ROLE_GRAMSEVAK"].includes(selectedRoleName)) {
      getChildOrganizations(parseInt(orgId))
        .then((res) => setAgencies(res))
        .catch((err) => {
          console.error("Failed to fetch agencies", err);
          setAgencies([]);
        });
    } else {
      setAgencies([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!districtCode || !talukaCode || !villageCode) {
      toast.error("Please select District, Taluka, and Village");
      setLoading(false);
      return;
    }

       if (formData.password !== confirmNewPassword) {
      toast.error('Passwords do not match', { autoClose: 2000, hideProgressBar: true });
      return;
    }

    if (formData.emailAddress && formData.emailAddress !== confirmEmailAddress) {
      toast.error('Email Addresses do not match', { autoClose: 2000, hideProgressBar: true });
      return;
    }

    if (formData.contactNumber && formData.contactNumber !== confirmContactNumber) {
      toast.error('Contact Numbers do not match', { autoClose: 2000, hideProgressBar: true });
      return;
    }

    try {
      // Step 1: Save the user
      const userData = { ...formData };
      const response = await saveUser(userData);

      const userId = response?.id;

      if (!userId) {
        toast.error("Error while saving user details");
        setLoading(false);
        return;
      }

      if (userRole === "ROLE_SUPER_ADMIN") {
        toast.success("User added successfully", {
          autoClose: 1000,
          hideProgressBar: true
        });
        navigate("/user-management");
        return;
      }

      // Step 2: Determine organizationIdToSend
      let organizationIdToSend: string | undefined;

      if (userRole === "ROLE_ORG_ADMIN") {
        organizationIdToSend = newAssignment.agencyId || userInfo?.orgId;
      } else if (userRole === "ROLE_AGENCY_ADMIN") {
        organizationIdToSend = userInfo?.orgId;
      }

      if (!organizationIdToSend) {
        toast.error("Please select a valid organization or agency before adding user");
        setLoading(false);
        return;
      }

      // Step 3: Assign role
      await assignUserOrgRole(
        Number(userId),
        Number(organizationIdToSend),
        Number(newAssignment.roleId),
        null
      );

      toast.success("User added and role assigned successfully", {
        autoClose: 1000,
        hideProgressBar: true
      });
      navigate("/user-management");

    } catch (error) {
      console.error("Error adding user and assigning role:", error);
      toast.error("Failed to add user or assign role");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    if (name === 'emailAddress' && value === '') {
      setConfirmEmailAddress('');
    }

    if (name === 'contactNumber' && value === '') {
      setConfirmContactNumber('');
    }

    if (name === 'contactNumber') {
      if (value !== confirmContactNumber) {
        setConfirmContactNumber('');

      }

    }

    if (name === 'password' && value === '') {
      setConfirmNewPassword('');
    }

    if (name === 'password') {
      if (value !== confirmNewPassword) {
        setConfirmNewPassword('');
      }
    }

    if (name === 'emailAddress') {
      if (value !== confirmEmailAddress) {
        setConfirmEmailAddress('');

      }

    }

  };


  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            {/* Back Arrow */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            <h1 className="text-xl font-bold text-gray-700">Add New User</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name as per Gov ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameAsPerGovId"
                  value={formData.nameAsPerGovId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z][A-Za-z\s]*$/.test(value) || value === "") {
                      handleChange(e);
                    }
                  }}
                  placeholder="Name as per Gov ID"
                  required
                  maxLength={50}
                  title="Please enter only your first and last name (e.g., John Doe)"
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />

                {formData.nameAsPerGovId?.trim().length > 0 &&
                  formData.nameAsPerGovId.trim().length < 2 && (
                    <p className="text-red-600 text-sm mt-1">
                      Name must be at least 2 characters long
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
                <input
                  type="text"
                  name="preferredName"
                  value={formData.preferredName}
                  placeholder="Preferred name"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z][A-Za-z\s]*$/.test(value) || value === "") {
                      handleChange(e);
                    }
                  }}
                  maxLength={50}
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {formData.preferredName && !/^[A-Za-z\s]*$/.test(formData.preferredName) && (
                  <p className="text-red-500 text-sm mt-1">Only letters and spaces are allowed.</p>
                )}

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Username"
                  onChange={handleChange}
                  required
                  maxLength={30}
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="userCode"
                  value={formData.userCode}
                  placeholder="User Code"
                  onChange={handleChange}
                  required
                  maxLength={30}
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>

                <div className="relative flex mt-1">
                  {/* Country Code Box */}
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-200 text-gray-700 text-sm">
                    +91
                  </span>

                  <input
                    type={showMobile ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[6-9]{1}[0-9]{9}"
                    maxLength={10}
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
                    placeholder="9567023456"
                    required
                    className="w-full px-3 py-1.5 border rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                    title="Enter a valid 10-digit mobile number starting with 6-9"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>

                {formData.contactNumber?.length > 0 &&
                  !/^[6-9]{1}[0-9]{0,9}$/.test(formData.contactNumber) && (
                    <p className="text-red-600 text-sm mt-1">
                      Enter a valid 10-digit mobile number starting with 6-9
                    </p>
                  )}

                {/* {mobileExists && (
                  <p className="text-red-600 text-sm mt-1">Mobile number already exists</p>
                )} */}
              </div>


              {/* Confirm Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Contact Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="confirmContactNumber"
                  value={confirmContactNumber}
                  onChange={handleConfirmContactChange}
                  placeholder="Confirm contact number"
                  maxLength={10}
                  pattern="[6-9]{1}[0-9]{9}"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  title="Re-enter the same 10-digit mobile number"
                  disabled={!(
                    /^[6-9]{1}[0-9]{9}$/.test(formData.contactNumber)
                  )}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}

                />
                {confirmContactNumber &&
                  confirmContactNumber !== formData.contactNumber && (
                    <p className="text-red-600 text-sm mt-1">Contact numbers do not match</p>
                  )}
              </div>

              {/* <div className="mt-3">
  {!showAlternateContact ? (
    <button
      type="button"
      onClick={() => setShowAlternateContact(true)}
      className="text-blue-600 text-sm hover:underline"
    >
      + Add Alternate Contact Number
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        setShowAlternateContact(false);
        setAlternateContactNumber("");
      }}
      className="text-red-600 text-sm hover:underline"
    >
      - Remove Alternate Contact Number
    </button>
  )}
</div>

{showAlternateContact && (
  <div className="mt-3">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Alternate Contact Number (Optional)
    </label>

    <div className="relative flex mt-1">
      <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-200 text-gray-700 text-sm">
        +91
      </span>

      <input
        type="text"
        inputMode="numeric"
        maxLength={10}
        value={formData.alternateContactNumber}
        onChange={(e) => {
          const value = e.target.value;
          if (/^[6-9][0-9]*$/.test(value) || value === "") {
            if (value.length <= 10) {
              setAlternateContactNumber(value);
            }
          }
        }}
        placeholder="Optional number"
        className="w-full px-3 py-2.5 border rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
        title="Enter a valid 10-digit mobile number starting with 6-9"
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      />
    </div>

    {alternateContactNumber &&
      !/^[6-9]{1}[0-9]{0,9}$/.test(alternateContactNumber) && (
        <p className="text-red-600 text-sm mt-1">
          Enter a valid 10-digit mobile number starting with 6-9
        </p>
      )}
  </div>
)} */}



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>

                <input
                  type={showEmail ? "text" : "password"}
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
                  placeholder="johndoe@example.com"
                  maxLength={50}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="confirmEmailAddress"
                  value={confirmEmailAddress}
                  onChange={handleConfirmEmailChange}
                  placeholder="Confirm email address"
                  maxLength={50}
                  pattern="^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  title="Re-enter the same email"
                  disabled={!(
                    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(formData.emailAddress)
                  )}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  required
                />
                {formData.emailAddress &&
                  confirmEmailAddress &&
                  confirmEmailAddress !== formData.emailAddress && (
                    <p className="text-red-600 text-sm mt-1">Email Address do not match</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
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
                  required={true}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taluka <span className="text-red-500">*</span>
                </label>
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
                  required={true}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village <span className="text-red-500">*</span>
                </label>
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
                  required={true}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handlepinCodeChange}
                  placeholder="e.g. 416000"
                  title="Pincode must be exactly 6 digits (0-9)"
                  maxLength={6}
                  inputMode="numeric"
                  required
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  maxLength={30}
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                  title="Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
                {formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password) && (
                  <p className="text-red-600 text-sm mt-1">
                    Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordChange}
                  placeholder="Confirm Password"
                  required
                  maxLength={30}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  disabled={!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password))}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                {confirmNewPassword && confirmNewPassword !== formData.password && (
                  <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {userRole !== "ROLE_SUPER_ADMIN" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Role</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Role Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAssignment.roleId}
                    onChange={handleRoleChange}
                    required
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    {roles
                      .filter((role) => {
                        if (role.name === "ROLE_SUPER_ADMIN") return false;

                        if (userRole === "ROLE_ORG_ADMIN") {
                          return role.name !== "ROLE_ORG_ADMIN";
                        }

                        if (userRole === "ROLE_AGENCY_ADMIN") {
                          return !["ROLE_ORG_ADMIN", "ROLE_ORG_STAFF", "ROLE_ORG_REPRESENTATIVE", "ROLE_ORG_ELECTRICIAN", "ROLE_ORG_FABRICATOR", "ROLE_BDO", "ROLE_GRAMSEVAK","ROLE_AGENCY_ADMIN","ROLE_ORG_VIEWER","ROLE_HIRING_MANAGER"].includes(role.name);
                        }

                        return true;
                      })
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Organization Dropdown */}
                {userRole === "ROLE_SUPER_ADMIN" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAssignment.organizationId}
                      onChange={handleOrganizationChange}
                      required
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Agency Dropdown */}
                {userRole !== "ROLE_AGENCY_ADMIN" &&
                  ["ROLE_AGENCY_REPRESENTATIVE", "ROLE_AGENCY_STAFF", "ROLE_AGENCY_ELECTRICIAN", "ROLE_AGENCY_FABRICATOR"].includes(selectedRoleName) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agency <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newAssignment.agencyId}
                        onChange={(e) =>
                          setNewAssignment((prev) => ({
                            ...prev,
                            agencyId: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Agency</option>
                        {agencies.map((agency) => (
                          <option key={agency.id} value={agency.id}>
                            {agency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/user-management')}
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
              {loading ? 'Saving User' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormManagement;