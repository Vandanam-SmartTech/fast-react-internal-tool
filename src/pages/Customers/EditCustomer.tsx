import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, updateConsumerPersonalDetails, checkMobileNumberExists, checkEmailAddressExists } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

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
    isLoanCustomer: false,
  });
  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [, setExistingCustomer] = useState(false);
  const customerId = location.state?.customerId;
  const [activeTab] = useState("Customer Details");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [showMobile,] = useState(false);


  const [showEmail,] = useState(false);


  const [originalMobile, setOriginalMobile] = useState("");
  const [mobileExists, setMobileExists] = useState(false);

  const [originalEmail, setOriginalEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  const navigate = useNavigate();

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
          isLoanCustomer: !!data.isLoanCustomer,

        });

        setConfirmMobileNumber(data.mobileNumber || "");
        setConfirmEmailAddress(data.emailAddress || null);

        setOriginalMobile(data.mobileNumber || "");
        setOriginalEmail(data.emailAddress || null);
        setExistingCustomer(true);
      }
    };

    fetchCustomer();
  }, [customerId]);

  useEffect(() => {
    const checkExists = async () => {
      const current = (formData.mobileNumber ?? "").toString().trim();
      const original = (originalMobile ?? "").toString().trim();

      if (current.length !== 10) {
        setMobileExists(false);
        return;
      }

      if (current === original) {
        setMobileExists(false);
        return;
      }

      const exists = await checkMobileNumberExists(current);
      setMobileExists(exists);
    };

    checkExists();
  }, [formData.mobileNumber, originalMobile]);

  useEffect(() => {
    const checkEmailExists = async () => {
      const email = (formData.emailAddress ?? "").trim();
      const original = (originalEmail ?? "").trim();

      const emailPattern =
        /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

      if (!emailPattern.test(email)) {
        setEmailExists(false);
        return;
      }

      if (email === original) {
        setEmailExists(false);
        return;
      }

      const exists = await checkEmailAddressExists(email);
      setEmailExists(exists);
    };

    checkEmailExists();
  }, [formData.emailAddress, originalEmail]);


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
      toast.error("Email and Confirm Email do not match.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
      return;
    }

    if (formData.isLoanCustomer && !formData.emailAddress) {
      toast.error("Email is required when loan is required.", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    // Show confirm dialog
    setDialogType("confirm");
    setDialogMessage("Do you want to update the customer details?");
    setDialogAction(() => async () => {
      try {
        if (customerId) {
          formData.emailAddress = formData.emailAddress || null;
          await updateConsumerPersonalDetails(Number(customerId), formData);

          toast.success("Customer details updated successfully!", {
            autoClose: 1000,
            hideProgressBar: true,
          });


          navigate(`/view-customer`, {
            state: {
              customerId,
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
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Back Arrow */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>

              <h1 className="text-xl font-bold text-gray-700">Update Customer</h1>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mb-6 mt-2 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
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
                      className={`rounded-full p-2 transition-all duration-300 ${shouldHighlightIcon
                        ? "bg-blue-500 text-white border border-transparent"
                        : "bg-white border border-gray-300 text-gray-500"}

                        }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs md:text-sm font-semibold mt-1 ${isActive ? "text-gray-700" : "text-gray-700"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              {/* Left: Heading */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-1 sm:gap-2">
                <UserCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                Customer Details
              </h3>

              {/* Right: Checkbox */}
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  type="checkbox"
                  id="loanRequired"
                  name="isLoanCustomer"
                  checked={formData.isLoanCustomer} // boolean
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isLoanCustomer: e.target.checked, // true if checked, false if unchecked
                    })
                  }
                  className="w-4 sm:w-4 h-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="loanRequired" className="text-xs sm:text-sm text-gray-700">
                  Is Loan Required?
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />

                {formData.govIdName?.trim().length > 0 &&
                  formData.govIdName.trim().length < 2 && (
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
                    className="w-full px-3 py-1.5 border rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                    title="Enter a valid 10-digit mobile number starting with 6-9"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />

                </div>

                {formData.mobileNumber?.length > 0 && !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber) && (
                  <p className="text-red-600 text-sm mt-1">Enter a valid 10-digit mobile number starting with 6-9</p>
                )}

                {mobileExists && formData.mobileNumber !== originalMobile && (
                  <p className="text-red-600 text-sm mt-1">
                    Mobile number already exists
                  </p>
                )}
              </div>

              {/* Confirm Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="confirmMobileNumber"
                  value={confirmMobileNumber}
                  onChange={handleConfirmMobileChange}
                  placeholder="Confirm mobile number"
                  maxLength={10}
                  pattern="[6-9]{1}[0-9]{9}"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  title="Re-enter the same 10-digit mobile number"
                  disabled={!(
                    /^[6-9]{1}[0-9]{9}$/.test(formData.mobileNumber) &&
                    (!mobileExists || formData.mobileNumber === originalMobile)
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>

                <div className="relative">
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
                    className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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

                  {emailExists && formData.emailAddress !== originalEmail && (
                    <p className="text-red-600 text-sm mt-1">
                      Email address already exists
                    </p>
                  )}
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Email Address</label>
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

            </div>
          </div>

          <div className="flex justify-center sm:justify-center space-x-3 pt-1">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-2.5 px-8 sm:py-2.5 sm:px-5 w-auto inline-flex justify-center bg-gray-300 text-gray-800 font-semibold text-sm sm:text-base rounded-md hover:bg-gray-400 transition-colors shadow-sm hover:shadow-md"
            >
              Cancel
            </button>


            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center px-3 py-2.5 sm:px-5 sm:py-2.5 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md truncate"
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
    </div>
  );
};
