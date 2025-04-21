import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCustomerById, updateConsumerPersonalDetails,fetchClaims } from "../services/api";
import { Stepper, Step } from "react-form-stepper";

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
      alert("Mobile numbers do not match");
      return;
    }
  
    if (formData.emailAddress !== confirmEmailAddress) {
      alert("Email addresses do not match");
      return;
    }
  
    const confirmUpdate = window.confirm("Do you want to update the customer details?");
    if (!confirmUpdate) {

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
      return;
    }
  
    try {
      if (customerId) {
        await updateConsumerPersonalDetails(Number(customerId), formData);
        alert("Customer updated successfully!");
        navigate(`/view-customer/${customerId}`, { state: { customerId: customerId, selectedRepresentative:selectedRepresentative } }); 
      }
    } catch (error) {
      alert("Failed to update customer.");
    }
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
      <div className="mb-6 sm:mb-8 overflow-x-auto">
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
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 sm:mb-8">
        Customer Details
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Name</label>
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
          <label className="block text-sm font-medium text-gray-700">Preferred Name (optional)</label>
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
  <label className="block text-sm font-medium text-gray-700">Enter Mobile Number</label>
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
  <label className="block text-sm font-medium text-gray-700">Confirm Mobile Number</label>
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
        <label className="block text-sm font-medium text-gray-700">Enter Email Address</label>
        <input
          type="password"
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
          placeholder="johndoe@example.com"
          maxLength={35}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Enter a valid email address"
          className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Email Address</label>
        <input
          type="email"
          name="confirmEmailAddress"
          value={confirmEmailAddress}
          onChange={handleConfirmEmailChange}
          placeholder="Confirm email address"
          maxLength={35}
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
    </div>
  );
};
