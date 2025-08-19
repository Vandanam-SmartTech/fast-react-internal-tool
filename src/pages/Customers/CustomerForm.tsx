import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCustomer } from "../../services/customerRequisitionService";
import { checkMobileNumberExists, checkEmailAddressExists } from '../../services/customerRequisitionService';
import { fetchClaims, fetchRepresentatives } from '../../services/jwtService'
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
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState("");
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
  const savedRepresentative = localStorage.getItem("selectedRepresentative");

  if (savedFormData) {
    setFormData(JSON.parse(savedFormData));
  }

  if (savedConfirmMobile) {
    setConfirmMobileNumber(savedConfirmMobile);
  }

  if (savedConfirmEmail) {
    setConfirmEmailAddress(savedConfirmEmail);
  }

  if (savedRepresentative) {
    setSelectedRepresentative(JSON.parse(savedRepresentative));
  }
}, []);

///////////////////////////////////////////////////////////

// useEffect(() => {
//     const getClaims = async () => {
//       try {
//         const claims = await fetchClaims();
//         setRoles(claims.roles || []);
//       } catch (error) {
//         console.error("Failed to fetch user claims", error);
//       }
//     };

//     getClaims();
//   }, []);

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
    //localStorage.removeItem("confirmMobileNumber");
  }

  if (name === 'emailAddress' && value === '') {
    setConfirmEmailAddress('');
    //localStorage.removeItem("confirmEmailAddress");
  }

  if (name === 'mobileNumber') {
    if (value !== confirmMobileNumber) {
      setConfirmMobileNumber('');
      //localStorage.removeItem("confirmMobileNumber");
    }

    checkMobileNumberExists(value).then((exists) => {
      setMobileExists(exists);

      if (exists) {
        setConfirmMobileNumber('');
        //localStorage.removeItem("confirmMobileNumber");
      }
    });
  }

  if (name === 'emailAddress') {
    if (value !== confirmEmailAddress) {
      setConfirmEmailAddress('');
      //localStorage.removeItem("confirmEmailAddress");
    }

    checkEmailAddressExists(value).then((exists) => {
      setEmailExists(exists);

      if (exists) {
        setConfirmEmailAddress('');
        //localStorage.removeItem("confirmEmailAddress");
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
        //localStorage.removeItem("confirmMobileNumber");
      }
    });
  }

  if (name === 'emailAddress') {
    checkEmailAddressExists(value).then((exists) => {
      setEmailExists(exists);

      if (exists) {
        setConfirmEmailAddress('');
        //localStorage.removeItem("confirmEmailAddress");
      }
    });
  }
};



  useEffect(() => {
    const getRepresentatives = async () => {
      const reps = await fetchRepresentatives();
      setRepresentatives(reps);
    };

    getRepresentatives();
  }, []);

  

  
  const handleConfirmMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmMobileNumber(value);
    //localStorage.setItem('confirmMobileNumber', value);
  };
  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmEmailAddress(value);
    //localStorage.setItem('confirmEmailAddress', value);
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
          customerId: result.id,
          selectedRepresentative: selectedRepresentative || "",
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
  localStorage.removeItem("selectedRepresentative");
};




  return (
  <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
    Add New Customer
  </h2>
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

    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 sm:mb-8">
      Customer Details
    </h2>

    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">


{/* Representative Type Selection */}
<div className="col-span-2 w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
    Select User Type <span className="text-red-500">*</span>
  </label>
  <div className="grid grid-cols-2 gap-6 justify-items-center">
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
</div>

{/* Conditional Sections */}
{representativeType === "agency" && (
  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    
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
  <div className="col-span-2 mt-4 border rounded-md p-4 shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="govIdName"
          value={formData.govIdName}
          onChange={handleChange}
          placeholder="Name as per Gov ID"
          required
          title="Please enter only your first and last name (e.g., John Doe)"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
                {formData.govIdName && !/^[A-Za-z\s]*$/.test(formData.govIdName) && (
                    <p className="text-red-500 text-sm mt-1">Only letters and spaces are allowed.</p>
          )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Name</label>
        <input
          type="text"
          name="preferredName"
          value={formData.preferredName}
          placeholder="Enter preferred name"
          onChange={handleChange}
          maxLength={50}
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {formData.preferredName && !/^[A-Za-z\s]*$/.test(formData.preferredName) && (
  <p className="text-red-500 text-sm mt-1">Only letters and spaces are allowed.</p>
)}

      </div>

<div>
  <label className="block text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>

  <div className="relative">
    <input
      type={showMobile ? 'text' : 'password'}
      inputMode="numeric"
      pattern="[6-9]{1}[0-9]{9}"
      maxLength={10}
      name="mobileNumber"
      value={formData.mobileNumber}
      onChange={handleChange}
      placeholder="9567023456"
      required
      className="mt-1 block w-full p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      title="Enter a valid 10-digit mobile number starting with 6-9"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />
    
    <span
      onClick={handleToggleMobile}
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
    >
      {showMobile ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>

  {formData.mobileNumber?.length > 0 && !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber) && (
    <p className="text-red-600 text-sm mt-1">Enter a valid 10-digit mobile number starting with 6-9</p>
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
  <label className="block text-sm font-medium text-gray-700">Email Address</label>

  <div className="relative">
    <input
      type={showEmail ? 'text' : 'password'}
      name="emailAddress"
      value={formData.emailAddress}
      onChange={handleChange}
      placeholder="johndoe@example.com"
      maxLength={50}
      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
      title="Enter a valid email address"
      className="mt-1 block w-full p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />

    <span
      onClick={handleToggleEmail}
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
    >
      {showEmail ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>

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
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
          title="Re-enter the same email"
          disabled={!(
            /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.emailAddress) && !emailExists
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

      <div className="flex justify-center sm:justify-start mt-2">
        <button
          type="submit"
          className="py-2 px-6 w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Save Customer
        </button>
      </div>
    </form>

  </div>
);

};