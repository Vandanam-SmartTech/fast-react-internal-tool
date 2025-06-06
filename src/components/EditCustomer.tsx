import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, updateConsumerPersonalDetails,fetchClaims } from "../services/api";
import { Stepper, Step } from "react-form-stepper";
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
import { Dialog, DialogTitle, DialogContent,DialogContentText, DialogActions, Button, Alert } from '@mui/material';

import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid"

export const EditCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    govIdName: "",
    preferredName: "",
    mobileNumber: "",
    emailAddress: "",
  });
  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [existingCustomer, setExistingCustomer] = useState(false);
  //const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);
  const customerId = location.state?.customerId;
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [activeTab, setActiveTab] = useState("Customer Details");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);


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

    // useEffect(() => {
    //   const storedRep = localStorage.getItem("selectedRepresentative");
    //   if (storedRep) {
    //     setSelectedRepresentative(JSON.parse(storedRep));
    //   }
    // }, []);



  useEffect(() => {
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setCustomer(data);
        setFormData({
          govIdName: data.govIdName || "",
          preferredName: data.preferredName || "",
          mobileNumber: data.mobileNumber || "",
          emailAddress: data.emailAddress || "",

        });

        setConfirmMobileNumber(data.mobileNumber || "");
        setConfirmEmailAddress(data.emailAddress || "");

        setExistingCustomer(true);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
      
  };

  const handleConfirmMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmMobileNumber(e.target.value);
  };

  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEmailAddress(e.target.value);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.mobileNumber !== confirmMobileNumber) {
    setDialogType("error");
    setDialogMessage("Mobile number and Confirm Mobile number do not match.");
    setDialogAction(null);
    setDialogOpen(true);
    return;
  }

  if (formData.emailAddress !== confirmEmailAddress) {
    setDialogType("error");
    setDialogMessage("Email and Confirm Email do not match.");
    setDialogAction(null);
    setDialogOpen(true);
    return;
  }

  // Show confirm dialog
  setDialogType("confirm");
  setDialogMessage("Do you want to update the customer details?");
  setDialogAction(() => async () => {
    try {
      if (customerId) {
        await updateConsumerPersonalDetails(Number(customerId), formData);
        setDialogType("success");
        setDialogMessage("Customer updated successfully!");
        setDialogAction(() => () => {
          navigate(`/view-customer/${customerId}`, {
            state: {
              customerId,
              selectedRepresentative,
            },
          });
        });
        setDialogOpen(true);
      }
    } catch (error) {
      setDialogType("error");
      setDialogMessage("Failed to update customer.");
      setDialogAction(null);
      setDialogOpen(true);
    }
  });
  setDialogOpen(true);
};

  

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Update Customer</h2>

      {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Name <span className="text-red-500">*</span></label>
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
  <label className="block text-sm font-medium text-gray-700">Enter Mobile Number <span className="text-red-500">*</span></label>
  <input
    type="password"
    name="mobileNumber"
    value={formData.mobileNumber}
    onChange={handleChange}
    placeholder="1234567890"
    maxLength={10}
    pattern="[6-9]{1}[0-9]{9}"
    required
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    title="Enter a valid 10-digit mobile number starting with 6-9"
  />
  {formData.mobileNumber.length > 0 && !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber) && (
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
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    title="Re-enter the same 10-digit mobile number"
  />
  {confirmMobileNumber &&
    confirmMobileNumber !== formData.mobileNumber && (
      <p className="text-red-600 text-sm mt-1">Mobile numbers do not match</p>
  )}
</div>


      <div>
        <label className="block text-sm font-medium text-gray-700">Enter Email Address <span className="text-red-500">*</span></label>
        <input
          type="password"
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
          placeholder="johndoe@example.com"
          maxLength={50}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Enter a valid email address"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Email Address <span className="text-red-500">*</span></label>
        <input
          type="email"
          name="confirmEmailAddress"
          value={confirmEmailAddress}
          onChange={handleConfirmEmailChange}
          placeholder="Confirm email address"
          maxLength={50}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          title="Re-enter the same email"
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
                emailAddress: customer.emailAddress || "",
              });
              setConfirmMobileNumber(customer.mobileNumber || "");
              setConfirmEmailAddress(customer.emailAddress || "");
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
