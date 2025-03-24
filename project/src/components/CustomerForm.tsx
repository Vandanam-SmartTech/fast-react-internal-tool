import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveCustomer, updateConsumerPersonalDetails } from "../services/api";
import { Stepper, Step } from "react-form-stepper";

export const CustomerForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const existingCustomer = location.state || null;

  const [formData, setFormData] = useState({
    govIdName: "",
    emailAddress: "",
    mobileNumber: "",
    preferredName: "",
    
  });

  useEffect(() => {
    if (existingCustomer) {
      setFormData(existingCustomer);
    }
  }, [existingCustomer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (existingCustomer) {
        const shouldEdit = window.confirm("Do you want to edit the customer details?");
        
        if (shouldEdit) {
          console.log("Updating customer:", formData);
          const response = await updateConsumerPersonalDetails(existingCustomer.id, formData);
          console.log("Update response:", response);
          alert("Customer details updated successfully!");
          navigate(`/view-customer/${existingCustomer.id}`);
        } else {
          setFormData(existingCustomer); // Restore previous details
        }
      } else {
        console.log("Saving new customer...");
        const customerId = await saveCustomer(formData);
        alert("Customer details saved successfully!");


        if (customerId) {
          navigate(`/view-customer/${customerId}`, { state: { customerId } });
        }
      }
    } catch (error) {
      console.error("Error in updating/saving customer:", error);
      alert("Failed to update customer. Please try again.");
    }
    
    
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        {existingCustomer ? "Update Customer" : "Add New Customer"}
      </h2>
      <div className="mb-8">
        <Stepper activeStep={-1} styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }}>
          <Step label="Customer Details" />
          <Step label="Connection Details" />
          <Step label="Installation Space Details" />
          <Step label="System Specifications" />
        </Stepper>
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-8">Customer Details</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="block text-sm font-medium text-gray-700">Customer Mobile Number</label>
          <input
            type="tel"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Name (optional)</label>
          <input
            type="text"
            name="preferredName"
            value={formData.preferredName}
            onChange={handleChange}
            placeholder="Enter preferred name"
            maxLength={50}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
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

        <div className="flex justify-start mt-6">
          <button
            type="submit"
            className="py-3 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {existingCustomer ? "Update Customer" : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};