import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveCustomer } from "../services/api";
import { Stepper, Step } from "react-form-stepper";
import { fetchClaims, fetchRepresentatives, checkMobileNumberExists, checkEmailAddressExists } from '../services/api';
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { X } from "lucide-react";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export const CustomerForm = () => {
  const location = useLocation();
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
  });

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken"); // Assuming token is stored here
    if (!token) return null;
  
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      return decodedToken.userId || null;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  };
  

///////////////////////////////////////////////////////////
useEffect(() => {
  const savedFormData = localStorage.getItem("myFormData");
  const savedConfirmMobile = localStorage.getItem("confirmMobileNumber");
  const savedConfirmEmail = localStorage.getItem("confirmEmailAddress");
  //const savedRepresentative = localStorage.getItem("selectedRepresentative");

  if (savedFormData) {
    setFormData(JSON.parse(savedFormData));
  }

  if (savedConfirmMobile) {
    setConfirmMobileNumber(savedConfirmMobile);
  }

  if (savedConfirmEmail) {
    setConfirmEmailAddress(savedConfirmEmail);
  }

  // if (savedRepresentative) {
  //   setSelectedRepresentative(JSON.parse(savedRepresentative));
  // }
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
  const updatedFormData = { ...formData, [e.target.name]: e.target.value };
  setFormData(updatedFormData);
  localStorage.setItem('myFormData', JSON.stringify(updatedFormData));
};


  useEffect(() => {
    const getRepresentatives = async () => {
      const reps = await fetchRepresentatives();
      setRepresentatives(reps);
    };

    getRepresentatives();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = e.target.value;
  
    if (!selectedUserId) {
      setSelectedRepresentative(null); 
      localStorage.removeItem("selectedRepresentative");
      return;
    }
  
    const selectedRep = representatives.find(rep => rep.userId === Number(selectedUserId)) || null;
    setSelectedRepresentative(selectedRep);

    if (selectedRep) {
      localStorage.setItem("selectedRepresentative", JSON.stringify(selectedRep)); // Save to localStorage
    }
  };
  

  
  const handleConfirmMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmMobileNumber(value);
    localStorage.setItem('confirmMobileNumber', value);
  };
  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmEmailAddress(value);
    localStorage.setItem('confirmEmailAddress', value);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (formData.mobileNumber !== confirmMobileNumber) {
      alert("Mobile number and Confirm Mobile number do not match.");
      return;
    }
  
    if (formData.emailAddress !== confirmEmailAddress) {
      alert("Email and Confirm Email do not match.");
      return;
    }
  
    try {
      const referredByRepresentativeId = selectedRepresentative 
        ? selectedRepresentative.userId 
        : getUserIdFromToken(); 

      const customerData = {
        ...formData,
        referredByRepresentativeId,
      };
  
      // Save customer
      const customerId = await saveCustomer(customerData);
  
      if (customerId) {
        navigate(`/view-customer/${customerId}`, { state: { customerId, selectedRepresentative:selectedRepresentative || ""} });
      }
    } catch (error) {
      console.error("Error in saving customer:", error);
      alert("Failed to save customer. Please try again.");
    }
  
    localStorage.removeItem("myFormData");
    localStorage.removeItem("confirmMobileNumber");
    localStorage.removeItem("confirmEmailAddress");
    //localStorage.removeItem("selectedRepresentative");

  };
  
  
  

  return (
  <div className="max-w-4xl mx-auto p-4 sm:p-6">

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
    Add New Customer
  </h2>

{roles.includes("ROLE_ADMIN") && (
  <div className="flex items-center gap-2 sm:ml-auto">
    <div className="relative w-full sm:w-64">
      <select
        name="representative"
        value={selectedRepresentative?.userId || ""}
        onChange={handleSelectChange}
        className="block w-full appearance-none p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500"
      >
        <option value="" disabled hidden>
          Select Representative
        </option>
        {representatives.map(rep => (
          <option key={rep.userId} value={rep.userId}>
            {rep.name}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500">
        {!selectedRepresentative && (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* X button to clear selection */}
      {selectedRepresentative && (
        <button
          type="button"
          onClick={() => setSelectedRepresentative(null)}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-red-500 transition"
          title="Clear selection"
        >
          <X size={18} />
        </button>
      )}
    </div>
  </div>
)}

</div>

    
    {/* <div className="mb-6 sm:mb-8 overflow-x-auto">
      <Stepper 
        activeStep={-1} 
        styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }}
        className="min-w-max sm:w-full"
      >
        <Step label="Customer Details" />
        <Step label="Connection Details" />
        <Step label="Installation Space Details" />
        <Step label="System Specifications" />
      </Stepper>
    </div> */}

<div className="w-full max-w-4xl mx-auto mb-14 mt-10 overflow-x-auto">
  <div className="relative flex justify-center min-w-[500px] md:min-w-0">
    
    {/* Connector Line: between the first and last icon only */}
    <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

    <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
      {tabs.map((tab, index) => {
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer Name*</label>
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
      </div>

<div>
  <label className="block text-sm font-medium text-gray-700">Enter Mobile Number*</label>

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
  <label className="block text-sm font-medium text-gray-700">Confirm Mobile Number*</label>
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

/>
  {confirmMobileNumber &&
    confirmMobileNumber !== formData.mobileNumber && (
      <p className="text-red-600 text-sm mt-1">Mobile numbers do not match</p>
  )}
</div>


      <div>
  <label className="block text-sm font-medium text-gray-700">Enter Email Address*</label>

  <div className="relative">
    <input
      type={showEmail ? 'text' : 'password'}
      name="emailAddress"
      value={formData.emailAddress}
      onChange={handleChange}
      placeholder="johndoe@example.com"
      maxLength={35}
      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
      title="Enter a valid email address"
      className="mt-1 block w-full p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700">Confirm Email Address*</label>
        <input
          type="email"
          name="confirmEmailAddress"
          value={confirmEmailAddress}
          onChange={handleConfirmEmailChange}
          placeholder="Confirm email address"
          maxLength={35}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
          title="Re-enter the same email"
          disabled={!(
            /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.emailAddress) && !emailExists
          )}
        />
        {confirmEmailAddress &&
    confirmEmailAddress !== formData.emailAddress && (
      <p className="text-red-600 text-sm mt-1">Email Address do not match</p>)}
      </div>

      <div className="flex justify-center sm:justify-start mt-4 sm:mt-6">
        <button
          type="submit"
          className="py-3 px-6 w-full sm:w-auto bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Save Customer
        </button>
      </div>
    </form>
  </div>
);

};
