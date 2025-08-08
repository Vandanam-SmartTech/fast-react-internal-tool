import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, updateConsumerPersonalDetails, checkMobileNumberExists, checkEmailAddressExists } from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from "react-toastify";
import { User, Phone, Mail, CheckCircle, AlertCircle } from "lucide-react";

import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid"

export const EditCustomer = () => {
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    govIdName: "",
    preferredName: "",
    mobileNumber: "",
    emailAddress: null,
  });
  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [existingCustomer, setExistingCustomer] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const customerId = location.state?.customerId;
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [activeTab] = useState("Customer Details");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [mobileExists, setMobileExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [showMobile, setShowMobile] = useState(false);
  const handleToggleMobile = () => setShowMobile(!showMobile);

  const [showEmail, setShowEmail] = useState(false);
  const handleToggleEmail = () => setShowEmail(!showEmail);

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];
  
  const navigate = useNavigate();

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
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setCustomer(data);
        setFormData({
          govIdName: data.govIdName || "",
          preferredName: data.preferredName || "",
          mobileNumber: data.mobileNumber || "",
          emailAddress: data.emailAddress || null,
        });

        setConfirmMobileNumber(data.mobileNumber || "");
        setConfirmEmailAddress(data.emailAddress || null);

        setExistingCustomer(true);
      }
    };

    fetchCustomer();
  }, [customerId]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData((prev: any) => {
    if (name === 'mobileNumber' && prev.mobileNumber !== value) {
      setConfirmMobileNumber('');
    }

    if (name === 'emailAddress' && prev.emailAddress !== value) {
      setConfirmEmailAddress('');
    }

    return {
      ...prev,
      [name]: value,
    };
  });
};

const handleConfirmMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setConfirmMobileNumber(e.target.value.trim());
};

const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setConfirmEmailAddress(e.target.value.trim());
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    String(formData.mobileNumber).trim() !== String(confirmMobileNumber).trim()
  ) {
    toast.error("Mobile number and Confirm Mobile number do not match.", {
      autoClose: 1000,
      hideProgressBar: true,
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

  // Show confirm dialog
  setDialogType("confirm");
  setDialogMessage("Do you want to update the customer details?");
  setDialogAction(() => async () => {
  try {
    if (customerId) {
      formData.emailAddress= formData.emailAddress || null;
      await updateConsumerPersonalDetails(Number(customerId), formData);

      toast.success("Customer details updated successfully!", { 
        autoClose: 1000,
        hideProgressBar: true,
      });

      navigate(`/view-customer/${customerId}`, {
        state: {
          customerId,
          selectedRepresentative,
        },
      });
    }
  } catch (error) {
    toast.error("Failed to update customer details.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
  } finally {
    setDialogOpen(false); 
  }
});
setDialogOpen(true);
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
                <p className="text-gray-600 mt-1">Update customer information and details</p>
              </div>
            </div>

            {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
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
                    title="Enter a valid 10-digit mobile number starting with 6-9"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
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
              </div>

              {/* Confirm Mobile Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-200"
                  title="Re-enter the same 10-digit mobile number"
                  disabled={!(
                    /^[6-9]{1}[0-9]{9}$/.test(formData.mobileNumber) && !mobileExists
                  )}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                {confirmMobileNumber &&
                  formData.mobileNumber &&
                  String(confirmMobileNumber).trim() !== String(formData.mobileNumber).trim() && (
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
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-200"
                  title="Re-enter the same email"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  disabled={!(
                    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.emailAddress) && !emailExists
                  )}
                />
                {formData.emailAddress && confirmEmailAddress &&
                  confirmEmailAddress !== formData.emailAddress && (
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
                Update Customer
              </button>
            </div>
          </form>
        </div>
      </div>

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
                  if (customer) {
                    setFormData({
                      govIdName: customer.govIdName || "",
                      preferredName: customer.preferredName || "",
                      mobileNumber: customer.mobileNumber || "",
                      emailAddress: customer.emailAddress || null,
                    });
                    setConfirmMobileNumber(customer.mobileNumber || "");
                    setConfirmEmailAddress(customer.emailAddress || null);
                  }
                }}
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
  );
};