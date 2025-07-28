import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { saveRepresentative, checkEmailAddressExists, checkMobileNumberExists, checkUsernameExists, getUserById } from '../../services/jwtService';
import { toast } from "react-toastify";


export const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;


  const [confirmMobileNumber, setConfirmMobileNumber] = useState("");
  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");

  const [mobileExists, setMobileExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);

  const [showMobile, setShowMobile] = useState(false);
  const handleToggleMobile = () => setShowMobile(!showMobile);

  const [showEmail, setShowEmail] = useState(false);
  const handleToggleEmail = () => setShowEmail(!showEmail);

  const [isSubmitting, setIsSubmitting] = useState(false);


  const [navigateAfterClose, setNavigateAfterClose] = useState(false);
  const [createdRepresentativeId, setCreatedRepresentativeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
  nameAsPerGovId: "",
  username: "",
  mobileNumber: "",
  emailAddress: "",
  representativeCode: "",
  preferredName: "",
  managerName: "",
  managerEmail: "",
  roles: [{ "name": "ROLE_REPRESENTATIVE" }],
});

const [isActive, setIsActive] = useState(false);


    // useEffect(() => {
    //   const checkExists = async () => {
    //     if (formData.mobileNumber.length === 10) {
    //       const exists = await checkMobileNumberExists(formData.mobileNumber);
    //       setMobileExists(exists);
    //     } else {
    //       setMobileExists(false);
    //     }
    //   };
    //   checkExists();
    // }, [formData.mobileNumber]);

    useEffect(() => {
  const checkExists = async () => {
    if (formData.mobileNumber === confirmMobileNumber) {
      setMobileExists(false);
      return;
    }

    if (formData.mobileNumber.length === 10) {
      const exists = await checkMobileNumberExists(formData.mobileNumber);
      setMobileExists(exists);
    } else {
      setMobileExists(false);
    }
  };
  checkExists();
}, [formData.mobileNumber, confirmMobileNumber]);

  
//   useEffect(() => {
//     const checkEmailExists = async () => {
//       const email = formData.emailAddress;
  
//       const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
//       if (emailPattern.test(email)) {
//         const exists = await checkEmailAddressExists(email);
//         setEmailExists(exists);
//       } else {
//         setEmailExists(false);
//       }
//     };
  
//     checkEmailExists();
//   }, [formData.emailAddress]);

useEffect(() => {
  const checkEmailExists = async () => {
    if (formData.emailAddress === confirmEmailAddress) {
      setEmailExists(false);
      return;
    }

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
}, [formData.emailAddress, confirmEmailAddress]);


  useEffect(() => {
  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const response = await getUserById(userId); // Your API function
      if (response.data) {
        const user = response.data;
        setFormData({
          nameAsPerGovId: user.nameAsPerGovId || "",
          username: user.username || "",
          mobileNumber: user.mobileNumber || "",
          emailAddress: user.emailAddress || "",
          representativeCode: user.representativeCode || "",
          preferredName: user.preferredName || "",
          managerName: user.managerName || "",
          managerEmail: user.managerEmail || "",
          roles: user.roles || [{ name: "ROLE_REPRESENTATIVE" }],
        });
        setConfirmMobileNumber(user.mobileNumber || "");
        setConfirmEmailAddress(user.emailAddress || "");
        setIsActive(user.isActive); // For status toggle
      }
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  fetchUserData();
}, [userId]);


  //const [submitted, setSubmitted] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;


  if (name === 'roles') return;

  const updatedFormData = { ...formData, [name]: value };

  if (name === 'mobileNumber' && value === '') {
    setConfirmMobileNumber('');
  }

  if (name === 'emailAddress' && value === '') {
    setConfirmEmailAddress('');
  }

  setFormData(updatedFormData);
  localStorage.setItem('myUserFormData', JSON.stringify(updatedFormData));
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
  setIsSubmitting(true); // Start submitting

  if (formData.mobileNumber !== confirmMobileNumber) {
    toast.error("Mobile number and Confirm Mobile number do not match.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
    setIsSubmitting(false);
    return;
  }

  if (formData.emailAddress !== confirmEmailAddress) {
    toast.error("Email and Confirm Email do not match.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
    setIsSubmitting(false);
    return;
  }

  try {
    const representativeData = { ...formData };
    const result = await saveRepresentative(representativeData);

    if (result.id) {
      toast.success(result.message || "Representative data saved successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      navigate(`/view-user/${result.id}`, {
        state: { userId: result.id },
      });
    } else {
      toast.error(result.message || "Failed to save representative data.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  } catch (error) {
    console.error("Error in saving representative:", error);
    toast.error("Failed to save representative. Please try again.", {
      autoClose: 1000,
      hideProgressBar: true,
    });
  } finally {
    setIsSubmitting(false); // Stop submitting
    localStorage.removeItem("myUserFormData");
    localStorage.removeItem("confirmMobileNumber");
    localStorage.removeItem("confirmEmailAddress");
  }
};

  
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">
<div className="flex items-center justify-between mb-6 sm:mb-8">
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Edit User Details</h2>

  <div className="flex items-center space-x-3">
    <label className="text-lg font-medium text-gray-700">User Status</label>
    <input
      type="checkbox"
      checked={isActive}
      onChange={(e) => setIsActive(e.target.checked)}
      className="scale-125 accent-blue-600 cursor-pointer"
    />
    <span className="text-lg font-semibold text-gray-800">
      {isActive ? "Active" : "Inactive"}
    </span>
  </div>
</div>




      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name as per Gov ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name as per Gov ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nameAsPerGovId"
            value={formData.nameAsPerGovId}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formData.nameAsPerGovId && !/^[A-Za-z\s]*$/.test(formData.nameAsPerGovId) && (
        <p className="text-red-500 text-sm mt-1">Only letters and spaces are allowed.</p>
      )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="johndoe123"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
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
  <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>

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
        <label className="block text-sm font-medium text-gray-700">Confirm Email Address <span className="text-red-500">*</span></label>
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
          {confirmEmailAddress &&
            confirmEmailAddress !== formData.emailAddress && (
          <p className="text-red-600 text-sm mt-1">Email Address do not match</p>)}
      </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                  <input
                    type="text"
                    name="roles"
                    value= "ROLE_REPRESENTATIVE" 
                    placeholder="Representative/Staff"
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>


        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">User Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="representativeCode"
            value={formData.representativeCode}
            onChange={handleChange}
            required
            placeholder="User Code"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        

        {/* Preferred Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="preferredName"
            value={formData.preferredName}
            onChange={handleChange}
            required
            placeholder="Johnny"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Manager Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Manager Name</label>
          <input
            type="text"
            name="managerName"
            value={formData.managerName}
            onChange={handleChange}
            placeholder="Manager's Name"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Manager Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Manager Email</label>
          <input
            type="email"
            name="managerEmail"
            value={formData.managerEmail}
            onChange={handleChange}
            placeholder="manager@email.com"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* <div className="mt-2">
  <label className="block text-sm font-medium text-gray-700">User Status</label>
  <div className="flex items-center mt-1">
    <input
      type="checkbox"
      checked={isActive}
      onChange={(e) => setIsActive(e.target.checked)}
      className="mr-2"
    />
    <span className="text-sm text-gray-800">{isActive ? "Active" : "Inactive"}</span>
  </div>
</div> */}


      {/* Save Button */}
      <div className="mt-6 text-left">
        <button
          type="submit"
          disabled={isSubmitting}
            className={`${
              isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-md shadow`}
        >
          {isSubmitting ? "Editing User..." : "Edit User"}
          </button>

      </div>
    </form>
  );
};

export default EditUser;
