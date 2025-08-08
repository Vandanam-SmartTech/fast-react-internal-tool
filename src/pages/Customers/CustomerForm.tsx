import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCustomer } from "../../services/customerRequisitionService";
import { checkMobileNumberExists, checkEmailAddressExists } from '../../services/customerRequisitionService';
import { fetchClaims, fetchRepresentatives } from '../../services/jwtService'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { X, User, Phone, Mail, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { FaExclamationTriangle } from "react-icons/fa";

import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

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
  });

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken"); 
    if (!token) return null;
  
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); 
      return decodedToken.userId || null;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  };

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
      toast.error("Mobile number and Confirm Mobile number do not match.",{
        autoClose:1000,
        hideProgressBar:true,
      });
      return;
    }

    if (formData.emailAddress && formData.emailAddress !== confirmEmailAddress) {
      toast.error("Email and Confirm Email do not match.",{
        autoClose: 1000,
        hideProgressBar:true,
      });
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
        toast.error(result.message || "Failed to save customer data.",{
          autoClose: 1000,
          hideProgressBar:true,
        });
      }

    } catch (error) {
      console.error("Error in saving customer:", error);
      toast.error("Failed to save customer. Please try again.",{
        autoClose:1000,
        hideProgressBar: true,
      });
    }

    localStorage.removeItem("customerFormData");
    localStorage.removeItem("confirmMobileNumber");
    localStorage.removeItem("confirmEmailAddress");
    localStorage.removeItem("selectedRepresentative");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
                <p className="text-gray-600 mt-1">Enter customer information to create a new profile</p>
              </div>
            </div>

            {roles.includes("ROLE_ADMIN") && (
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <select
                    name="representative"
                    value={selectedRepresentative?.userId || ""}
                    onChange={handleSelectChange}
                    className="w-full sm:w-80 appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:outline-none transition-all duration-200 shadow-sm"
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

                  <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                    {!selectedRepresentative && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>

                  {selectedRepresentative && (
                    <button
                      type="button"
                      onClick={() => setSelectedRepresentative(null)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear selection"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 rounded-full"></div>
            <div className="relative flex justify-between">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab;
                const Icon = tab === "Customer Details" ? UserCircleIcon : 
                           tab === "Connection Details" ? BoltIcon :
                           tab === "Installation Details" ? HomeModernIcon : Cog6ToothIcon;

                return (
                  <div key={tab} className="flex flex-col items-center">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium mt-2 text-center ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {tab}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="govIdName"
                  value={formData.govIdName}
                  onChange={handleChange}
                  placeholder="Name as per Government ID"
                  required
                  title="Please enter only your first and last name (e.g., John Doe)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                {formData.govIdName && !/^[A-Za-z\s]*$/.test(formData.govIdName) && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Only letters and spaces are allowed.
                  </div>
                )}
              </div>

              {/* Preferred Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Preferred Name
                </label>
                <input
                  type="text"
                  name="preferredName"
                  value={formData.preferredName}
                  placeholder="Enter preferred name"
                  onChange={handleChange}
                  maxLength={50}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                {formData.preferredName && !/^[A-Za-z\s]*$/.test(formData.preferredName) && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Only letters and spaces are allowed.
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Mobile Number <span className="text-red-500">*</span>
                </label>
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
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    title="Enter a valid 10-digit mobile number starting with 6-9"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    onClick={handleToggleMobile}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showMobile ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.mobileNumber?.length > 0 && !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber) && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Enter a valid 10-digit mobile number starting with 6-9
                  </div>
                )}
                {mobileExists && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Mobile number already exists
                  </div>
                )}
              </div>

              {/* Confirm Mobile Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="confirmMobileNumber"
                  value={confirmMobileNumber}
                  onChange={handleConfirmMobileChange}
                  placeholder="Confirm mobile number"
                  maxLength={10}
                  pattern="[6-9]{1}[0-9]{9}"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  title="Re-enter the same 10-digit mobile number"
                  disabled={!(/^[6-9]{1}[0-9]{9}$/.test(formData.mobileNumber) && !mobileExists)}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                {confirmMobileNumber && confirmMobileNumber !== formData.mobileNumber && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Mobile numbers do not match
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Address
                </label>
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
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    onClick={handleToggleEmail}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showEmail ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {emailExists && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Email address already exists
                  </div>
                )}
              </div>

              {/* Confirm Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm Email Address
                </label>
                <input
                  type="email"
                  name="confirmEmailAddress"
                  value={confirmEmailAddress}
                  onChange={handleConfirmEmailChange}
                  placeholder="Confirm email address"
                  maxLength={50}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  title="Re-enter the same email"
                  disabled={!(
                    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.emailAddress) && !emailExists
                  )}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                {formData.emailAddress && confirmEmailAddress && confirmEmailAddress !== formData.emailAddress && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Email addresses do not match
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Save Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
