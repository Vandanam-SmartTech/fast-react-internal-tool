import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCustomer } from "../../services/customerRequisitionService";
import { checkMobileNumberExists, checkEmailAddressExists } from '../../services/customerRequisitionService';
import { fetchClaims } from '../../services/jwtService'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { FaExclamationTriangle } from "react-icons/fa";
import { fetchOrganizations, fetchUsersByOrgId, fetchAgenciesForOrg } from "../../services/organizationService";

interface Organization {
  id: string;
  name: string;
}


import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon, } from "@heroicons/react/24/solid";

export const CustomerForm = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[]>([]);

  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [mobileExists, setMobileExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [showMobile, setShowMobile] = useState(false);
  const handleToggleMobile = () => setShowMobile(!showMobile);

  const [showEmail, setShowEmail] = useState(false);
  const handleToggleEmail = () => setShowEmail(!showEmail);

  const [activeTab, setActiveTab] = useState("Customer Details");
  const envLabel = import.meta.env.VITE_ENV_LABEL;

  const [navigateAfterClose, setNavigateAfterClose] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState<number | null>(null);

  const [organizationName, setOrganizationName] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
 
  const [userRole, setUserRole] =useState("");

  const [representativeType, setRepresentativeType] = useState(""); // Track selection
  const [agencyName, setAgencyName] = useState("");


  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const [organizationUser, setOrganizationUser] = useState<number | "">("");

  const [agencyId, setAgencyId] = useState<number | "">("");
  const [agencyList, setAgencyList] = useState<any[]>([]);
  const [agencyUsers, setAgencyUsers] = useState<any[]>([]);
  const [agencyUser, setAgencyUser] = useState<number | "">("");

  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  




  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  const [formData, setFormData] = useState({
    govIdName: "",
    emailAddress: "",
    mobileNumber: "",
    preferredName: "", 
    isActive: true,
    referredByRepresentativeId: null,
  });

  

///////////////////////////////////////////////////////////
useEffect(() => {
  const savedFormData = localStorage.getItem("customerFormData");
  const savedConfirmMobile = localStorage.getItem("confirmMobileNumber");
  const savedConfirmEmail = localStorage.getItem("confirmEmailAddress");

  if (savedFormData) {
    setFormData(JSON.parse(savedFormData));
  }

  if (savedConfirmMobile) {
    setConfirmMobileNumber(savedConfirmMobile);
  }

  if (savedConfirmEmail) {
    setConfirmEmailAddress(savedConfirmEmail);
  }

}, []);

///////////////////////////////////////////////////////////


  useEffect(() => {
    const checkExists = async () => {
      if (formData.mobileNumber.length === 10) {
        const exists = await checkMobileNumberExists(formData.mobileNumber);
        setMobileExists(exists);
      } else {
        setMobileExists(false);
      }
    };
    checkExists();
  }, [formData.mobileNumber]);

useEffect(() => {
  const loadData = async () => {
    try {
      const claims = await fetchClaims();

      if (claims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
        setUserRole("ROLE_SUPER_ADMIN");

        
        const data = await fetchOrganizations();
        setOrganizations(data);
      } else {
        setUserRole("USER"); // or whatever default role
      }
    } catch (error) {
      console.error("Failed to fetch claims or organizations:", error);
    }
  };

  loadData();
}, []);

useEffect(() => {
  if (!organizationId) return;

  const loadUsers = async () => {
    try {
      const data = await fetchUsersByOrgId(organizationId);
      setOrganizationUsers(data);
    } catch (error) {
      console.error("Error fetching organization users:", error);
    }
  };

  loadUsers();
}, [organizationId]);

useEffect(() => {
  if (!organizationId) {
    setAgencyList([]);
    setAgencyId("");
    return;
  }

  const loadAgencies = async () => {
    try {
      const data = await fetchAgenciesForOrg(Number(organizationId));
      setAgencyList(data);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      setAgencyList([]);
    }
  };

  loadAgencies();
}, [organizationId]);

useEffect(() => {
  if (!agencyId) {
    setAgencyUsers([]);
    setAgencyUser("");
    return;
  }

  const loadAgencyUsers = async () => {
    try {
      const data = await fetchUsersByOrgId(Number(agencyId));
      setAgencyUsers(data);
    } catch (error) {
      console.error("Error fetching agency users:", error);
      setAgencyUsers([]);
    }
  };

  loadAgencyUsers();
}, [agencyId]);

useEffect(() => {
  const storedOrg = localStorage.getItem("selectedOrg");
  if (storedOrg) {
    setSelectedOrg(JSON.parse(storedOrg));
  }
}, []);

useEffect(() => {
  if (selectedOrg?.orgId) {
    setOrganizationId(Number(selectedOrg.orgId));
  }
}, [selectedOrg]);

useEffect(() => {
  if (selectedOrg?.role === "ROLE_ORG_STAFF") {
    setRepresentativeType("organization");
  }
}, [selectedOrg]);


useEffect(() => {
  const checkEmailExists = async () => {
    const email = formData.emailAddress;

    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (emailPattern.test(email)) {
      const exists = await checkEmailAddressExists(email);
      setEmailExists(exists);
    } else {
      setEmailExists(false);
    }
  };

  checkEmailExists();
}, [formData.emailAddress]);



const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  const updatedFormData = { ...formData, [name]: value };

  if (name === 'mobileNumber' && value === '') {
    setConfirmMobileNumber('');
    
  }

  if (name === 'emailAddress' && value === '') {
    setConfirmEmailAddress('');
    
  }

  if (name === 'mobileNumber') {
    if (value !== confirmMobileNumber) {
      setConfirmMobileNumber('');
      
    }

    checkMobileNumberExists(value).then((exists) => {
      setMobileExists(exists);

      if (exists) {
        setConfirmMobileNumber('');
        
      }
    });
  }

  if (name === 'emailAddress') {
    if (value !== confirmEmailAddress) {
      setConfirmEmailAddress('');
      
    }

    checkEmailAddressExists(value).then((exists) => {
      setEmailExists(exists);

      if (exists) {
        setConfirmEmailAddress('');
        
      }
    });
  }

  setFormData(updatedFormData);
  localStorage.setItem('customerFormData', JSON.stringify(updatedFormData));


  if (name === 'mobileNumber') {

    checkMobileNumberExists(value).then((exists) => {
      setMobileExists(exists);

      if (exists) {
        setConfirmMobileNumber('');
        
      }
    });
  }

  if (name === 'emailAddress') {
    checkEmailAddressExists(value).then((exists) => {
      setEmailExists(exists);

      if (exists) {
        setConfirmEmailAddress('');
        
      }
    });
  }
};
  
  const handleConfirmMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmMobileNumber(value);
    
  };
  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmEmailAddress(value);
    
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.mobileNumber !== confirmMobileNumber) {
    toast.error("Mobile number and Confirm Mobile number do not match.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
    return;
  }

  if (formData.emailAddress && formData.emailAddress !== confirmEmailAddress) {
    toast.error("Email and Confirm Email do not match.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
    return;
  }


  if (userRole === "ROLE_SUPER_ADMIN") {
    if (!representativeType) {
      toast.error("Please select a user type (Organization or Agency).", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      return;
    }

    if (representativeType === "organization" && !organizationId) {
      toast.error("Please select an organization.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      return;
    }

    if (representativeType === "agency") {
      if (!organizationId) {
        toast.error("Please select an organization for the agency.", {
          autoClose: 1000,
          hideProgressBar: true,
        });
        return;
      }
      if (!agencyId) {
        toast.error("Please select an agency.", {
          autoClose: 1000,
          hideProgressBar: true,
        });
        return;
      }
    }
  }

  try {
    const customerData: any = {
      ...formData,
      organizationId: organizationId || null,
      agencyId: agencyId || null,
    };


    if (organizationUser) {
      customerData.referredByRepresentativeId = organizationUser;
    } else if (agencyUser) {
      customerData.referredByRepresentativeId = agencyUser;
    }

    customerData.emailAddress = formData.emailAddress || null;

    const result = await saveCustomer(customerData);

    if (result.id) {
      setCreatedCustomerId(result.id);
      setNavigateAfterClose(true);

      toast.success(result.message || "Customer data saved successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      navigate(`/view-customer/${result.id}`, {
        state: {
          customerId: result.id
        },
      });

      setNavigateAfterClose(false);
      setCreatedCustomerId(null);
    } else {
      toast.error(result.message || "Failed to save customer data.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  } catch (error) {
    console.error("Error in saving customer:", error);
    toast.error("Failed to save customer. Please try again.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
  }

  localStorage.removeItem("customerFormData");
  localStorage.removeItem("confirmMobileNumber");
  localStorage.removeItem("confirmEmailAddress");
};




  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Customer</h1>
              <p className="text-gray-600 mt-0.5 text-xs sm:text-sm">Enter the customer details to get started</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
<div className="w-full max-w-4xl mx-auto mb-6 mt-2 overflow-x-auto">
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

            const shouldHighlightIcon = false;


        return (
          <button
      key={tab}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">


{/* Representative Type Selection */}
{selectedOrg?.role !== "ROLE_ORG_REPRESENTATIVE" &&
 selectedOrg?.role !== "ROLE_AGENCY_REPRESENTATIVE" && selectedOrg?.role !== "ROLE_ORG_STAFF" && (<div className="col-span-2 w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
    Select User Type <span className="text-red-500">*</span>
  </label>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 justify-items-center">
    {[
      { value: "organization", label: "Organization Level User" },
      { value: "agency", label: "Agency Level User" }
    ].map((option) => (
      <label
        key={option.value}
        className="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          name="repType"
          value={option.value}
          checked={representativeType === option.value}
          onChange={(e) =>
            setRepresentativeType(
              representativeType === e.target.value ? "" : e.target.value
            )
          }
          className="text-blue-600 focus:ring-blue-500"
        />
        {option.label}
      </label>
    ))}
  </div>
</div>)}

{/* Conditional Sections */}
{representativeType === "agency" && (
  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
    
    {/* Organization */}
    {!selectedOrg && (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Select Organization
    </label>
    <select
      value={organizationId}
      onChange={(e) => {
        setOrganizationId(Number(e.target.value));
        setAgencyId("");
        setAgencyUser("");
      }}
      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">-- Select Organization --</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  </div>
)}

    {/* Agency */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Select Agency
      </label>
      <select
        value={agencyId}
        onChange={(e) => {
          setAgencyId(Number(e.target.value));
          setAgencyUser("");
        }}
        className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">-- Select Agency --</option>
        {agencyList.map((agency) => (
          <option key={agency.id} value={agency.id}>
            {agency.name}
          </option>
        ))}
      </select>
    </div>

    {/* Agency User */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Select Agency User
      </label>
      <select
        value={agencyUser}
        onChange={(e) => setAgencyUser(Number(e.target.value))}
        className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">-- Select User --</option>
        {agencyUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {`${user.nameAsPerGovId} (${user.username})`}
          </option>
        ))}
      </select>
    </div>
  </div>
)}


{representativeType === "organization" && (
  <div className="col-span-2 mt-3 sm:mt-4 border rounded-md p-3 sm:p-4 shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Select Organization Name */}
      {!selectedOrg && (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Select Organization Name
    </label>
    <select
      value={organizationId}
      onChange={(e) => {
        setOrganizationId(Number(e.target.value));
        setOrganizationUser(""); 
      }}
      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">-- Select Organization --</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  </div>
)}

      {/* Select Organization User */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Organization User
        </label>
        <select
            value={organizationUser ?? ""}
            onChange={(e) => setOrganizationUser(Number(e.target.value))}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
           <option value="">-- Select User --</option>
                {organizationUsers.map((user) => (
                <option key={user.id} value={user.id}>
                {`${user.nameAsPerGovId} (${user.username})`}
               </option>
                ))}
        </select>
      </div>
    </div>
  </div>
)}


      <div>
  <label className="block text-sm font-medium text-gray-700">
    Customer Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="govIdName"
    value={formData.govIdName}
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
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />

  {formData.govIdName?.trim().length > 0 &&
    formData.govIdName.trim().length < 2 && (
      <p className="text-red-600 text-sm mt-1">
        Name must be at least 2 characters long
      </p>
    )}
</div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Name</label>
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
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {formData.preferredName && !/^[A-Za-z\s]*$/.test(formData.preferredName) && (
  <p className="text-red-500 text-sm mt-1">Only letters and spaces are allowed.</p>
)}

      </div>

<div>
  <label className="block text-sm font-medium text-gray-700">
    Mobile Number <span className="text-red-500">*</span>
  </label>

  <div className="relative flex mt-1">
    {/* Country Code Box */}
    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-200 text-gray-700 text-sm">   
      +91
    </span>

    {/* Mobile Input */}
    <input
      type={showMobile ? "text" : "password"}
      inputMode="numeric"
      pattern="[6-9]{1}[0-9]{9}"
      maxLength={10}
      name="mobileNumber"
      value={formData.mobileNumber}
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
      className="block w-full p-2 border border-l-0 rounded-r-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      title="Enter a valid 10-digit mobile number starting with 6-9"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />
  </div>

  {/* Error Messages */}
  {formData.mobileNumber?.length > 0 &&
    !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber) && (
      <p className="text-red-600 text-sm mt-1">
        Enter a valid 10-digit mobile number starting with 6-9
      </p>
    )}

  {mobileExists && (
    <p className="text-red-600 text-sm mt-1">Mobile number already exists</p>
  )}
</div>


{/* Confirm Mobile Number */}
<div>
  <label className="block text-sm font-medium text-gray-700">Confirm Mobile Number <span className="text-red-500">*</span></label>
  <input
      type="tel"
      name="confirmMobileNumber"
      value={confirmMobileNumber}
      onChange={handleConfirmMobileChange}
      placeholder="Confirm mobile number"
      maxLength={10}
      pattern="[6-9]{1}[0-9]{9}"
      required
      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
      title="Re-enter the same 10-digit mobile number"
      disabled={!(
    /^[6-9]{1}[0-9]{9}$/.test(formData.mobileNumber) && !mobileExists
  )}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}

/>
  {confirmMobileNumber &&
    confirmMobileNumber !== formData.mobileNumber && (
      <p className="text-red-600 text-sm mt-1">Mobile numbers do not match</p>
  )}
</div>


      <div>
  <label className="block text-sm font-medium text-gray-700">
    Email Address
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
    placeholder="johndoe@example.com"
    maxLength={50}
    onCopy={(e) => e.preventDefault()}
    onCut={(e) => e.preventDefault()}
    onPaste={(e) => e.preventDefault()}
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

  {emailExists && (
    <p className="text-red-600 text-sm mt-1">Email address already exists</p>
  )}
</div>


      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Email Address</label>
        <input
          type="email"
          name="confirmEmailAddress"
          value={confirmEmailAddress}
          onChange={handleConfirmEmailChange}
          placeholder="Confirm email address"
          maxLength={50}
          pattern="^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
          title="Re-enter the same email"
          disabled={!(
            /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(formData.emailAddress) && !emailExists
          )}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
        />
{formData.emailAddress &&
  confirmEmailAddress &&
  confirmEmailAddress !== formData.emailAddress && (
    <p className="text-red-600 text-sm mt-1">Email Address do not match</p>
)}
      </div>

            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};