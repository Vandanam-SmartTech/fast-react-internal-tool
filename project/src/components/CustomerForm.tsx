import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveCustomer } from "../services/api";
import { Stepper, Step } from "react-form-stepper";
import { fetchClaims, fetchRepresentatives } from '../services/api';

export const CustomerForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[]>([]);

  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState("");


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
    const savedForm = localStorage.getItem('myFormData');
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    ///////////////
    localStorage.setItem('myFormData', JSON.stringify(formData));
    //////////////
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
    setConfirmMobileNumber(e.target.value);
  };

  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEmailAddress(e.target.value);
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
      // Determine referredByRepresentativeId
      const referredByRepresentativeId = selectedRepresentative 
        ? selectedRepresentative.userId 
        : getUserIdFromToken(); 
  
      // Prepare the final customer data
      const customerData = {
        ...formData,
        referredByRepresentativeId,
      };
  
      // Save customer
      const customerId = await saveCustomer(customerData);
  
      if (customerId) {
        navigate(`/view-customer/${customerId}`, { state: { customerId } });
      }
    } catch (error) {
      console.error("Error in saving customer:", error);
      alert("Failed to save customer. Please try again.");
    }
  
    localStorage.removeItem("myFormData");
  };
  
  
  

  return (
  <div className="max-w-4xl mx-auto p-4 sm:p-6">

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-18">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
    Add New Customer
  </h2>

  {roles.includes("ROLE_ADMIN") && (
    <div className="sm:ml-auto">
    <select
      name="representative"
      value={selectedRepresentative?.userId || ""}
      onChange={handleSelectChange}
      className="block w-full sm:w-64 p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">Select Representative</option>
      {representatives.map(rep => (
        <option key={rep.userId} value={rep.userId}>
          {rep.name}
        </option>
      ))}
    </select>

    {/* {selectedRepresentative && (
      <p className="mt-2 text-sm text-gray-600">
        Selected User ID: {selectedRepresentative.userId}
      </p>
    )} */}
  </div> )}
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
            name="confirmMobileNumber"
            value={confirmMobileNumber}
            onChange={handleConfirmMobileChange}
            placeholder="1234567890"
            maxLength={10}
            pattern="[6-9]{1}[0-9]{9}"
            required
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            title="Enter a valid 10-digit mobile number starting with 6-9"
          />
        </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Mobile Number</label>
        <input
          type="tel"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
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
          name="confirmEmailAddress"
          value={confirmEmailAddress}
          onChange={handleConfirmEmailChange}
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
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
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
          Save Customer
        </button>
      </div>
    </form>
  </div>
);

};