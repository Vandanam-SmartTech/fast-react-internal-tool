import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, updateConsumerPersonalDetails, checkMobileNumberExists, checkEmailAddressExists } from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from "react-toastify";

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
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">Update Customer</h2>

      {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}

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

            const shouldHighlightIcon = tab === "Customer Details";


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
    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-200 text-gray-700 text-sm">   
      +91
    </span>

    <input
      type={showMobile ? 'text' : 'password'}
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
    
    {/* <span
      onClick={handleToggleMobile}
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
    >
      {showMobile ? <FaEyeSlash /> : <FaEye />}
    </span> */}
  </div>

  {formData.mobileNumber?.length > 0 && !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber) && (
    <p className="text-red-600 text-sm mt-1">Enter a valid 10-digit mobile number starting with 6-9</p>
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
  formData.mobileNumber &&
  String(confirmMobileNumber).trim() !== String(formData.mobileNumber).trim() && (
    <p className="text-red-600 text-sm mt-1">
      Mobile numbers do not match
    </p>
)}

</div>



      <div>
  <label className="block text-sm font-medium text-gray-700">Email Address</label>

  <div className="relative">
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
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />

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

    {/* <span
      onClick={handleToggleEmail}
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
    >
      {showEmail ? <FaEyeSlash /> : <FaEye />}
    </span> */}
  </div>
  
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
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          disabled={!(
            /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(formData.emailAddress) && !emailExists
          )}
        />
        {formData.emailAddress && confirmEmailAddress &&
    confirmEmailAddress !== formData.emailAddress && (
      <p className="text-red-600 text-sm mt-1">Email Address do not match</p>)}
      </div>

        <div className="flex justify-center sm:justify-start mt-4 sm:mt-6">
          <button
            type="submit"
            className="py-2 px-6 w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Update Customer
          </button>
        </div>
      </form>

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