import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, Shield, Save, ArrowLeft } from 'lucide-react';
import { saveRepresentative, checkEmailAddressExists, checkMobileNumberExists, checkUsernameExists } from '../../services/jwtService';
import { toast } from "react-toastify";
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  FormField,
  Badge
} from '../../components/ui';

export const UserForm = () => {
  const navigate = useNavigate();

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

  const [selectedRole, setSelectedRole] = useState("");

  const [navigateAfterClose, setNavigateAfterClose] = useState(false);
  const [createdRepresentativeId, setCreatedRepresentativeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nameAsPerGovId: '',
    roles: "",
    emailAddress: '',
    mobileNumber: '',
    representativeCode: '',
    username: '',
    preferredName: '',
    managerName: '',
    managerEmail: '',
  });

  const roleOptions = [
    { value: 'ROLE_REPRESENTATIVE', label: 'Representative' },
    { value: 'ROLE_STAFF', label: 'Staff' },
    { value: 'ROLE_AGENCY_ADMIN', label: 'Agency Admin' },
    { value: 'ROLE_ORG_ADMIN', label: 'Organization Admin' },
  ];

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

    if (name === 'roles') return;

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
      });
    }

    if (name === 'emailAddress') {
      if (value !== confirmEmailAddress) {
        setConfirmEmailAddress('');
      }

      const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (emailPattern.test(value)) {
        checkEmailAddressExists(value).then((exists) => {
          setEmailExists(exists);
        });
      } else {
        setEmailExists(false);
      }
    }

    if (name === 'username') {
      checkUsernameExists(value).then((exists) => {
        setUsernameExists(exists);
      });
    }

    setFormData(updatedFormData);
    localStorage.setItem("myUserFormData", JSON.stringify(updatedFormData));
  };

  const handleConfirmMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmMobileNumber(e.target.value);
  };

  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmEmailAddress(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await saveRepresentative(formData);
      if (result.id) {
        toast.success("User saved successfully!", {
          autoClose: 1000,
          hideProgressBar: true,
        });
        setCreatedRepresentativeId(result.id);
        setNavigateAfterClose(true);
        setTimeout(() => {
          navigate('/list-of-users');
        }, 1000);
      } else {
        toast.error(result.message || "Failed to save user data.", {
          autoClose: 1000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error in saving user:", error);
      toast.error("Failed to save user. Please try again.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem("myUserFormData");
      localStorage.removeItem("confirmMobileNumber");
      localStorage.removeItem("confirmEmailAddress");
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/list-of-users')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="mb-4"
          >
            Back to Users
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Add New User</h1>
              <p className="text-secondary-600 mt-1">Create a new user account with appropriate roles and permissions</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">User Information</h2>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Name as per Government ID"
                  required
                  error={formData.nameAsPerGovId && !/^[A-Za-z\s]*$/.test(formData.nameAsPerGovId) ? "Only letters and spaces are allowed" : undefined}
                >
                  <Input
                    type="text"
                    name="nameAsPerGovId"
                    value={formData.nameAsPerGovId}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    leftIcon={<User className="h-4 w-4" />}
                  />
                </FormField>

                <FormField
                  label="Username"
                  required
                  error={usernameExists ? "Username already exists" : undefined}
                >
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="johndoe123"
                  />
                </FormField>

                <FormField
                  label="Preferred Name"
                >
                  <Input
                    type="text"
                    name="preferredName"
                    value={formData.preferredName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </FormField>

                <FormField
                  label="Representative Code"
                >
                  <Input
                    type="text"
                    name="representativeCode"
                    value={formData.representativeCode}
                    onChange={handleChange}
                    placeholder="REP001"
                  />
                </FormField>
              </div>

              {/* Contact Information */}
              <div className="border-t border-secondary-200 pt-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Mobile Number"
                    required
                    error={
                      formData.mobileNumber?.length > 0 && !/^[6-9]{1}[0-9]{0,9}$/.test(formData.mobileNumber)
                        ? "Enter a valid 10-digit mobile number starting with 6-9"
                        : mobileExists
                        ? "Mobile number already exists"
                        : undefined
                    }
                  >
                    <Input
                      type={showMobile ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[6-9]{1}[0-9]{9}"
                      maxLength={10}
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="9567023456"
                      required
                      leftIcon={<Phone className="h-4 w-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={handleToggleMobile}
                          className="hover:text-secondary-600 transition-colors"
                        >
                          {showMobile ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      title="Enter a valid 10-digit mobile number starting with 6-9"
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                    />
                  </FormField>

                  <FormField
                    label="Confirm Mobile Number"
                    required
                    error={
                      confirmMobileNumber && formData.mobileNumber !== confirmMobileNumber
                        ? "Mobile numbers do not match"
                        : undefined
                    }
                  >
                    <Input
                      type={showMobile ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[6-9]{1}[0-9]{9}"
                      maxLength={10}
                      value={confirmMobileNumber}
                      onChange={handleConfirmMobileChange}
                      placeholder="9567023456"
                      required
                      leftIcon={<Phone className="h-4 w-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={handleToggleMobile}
                          className="hover:text-secondary-600 transition-colors"
                        >
                          {showMobile ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    required
                    error={
                      formData.emailAddress && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.emailAddress)
                        ? "Enter a valid email address"
                        : emailExists
                        ? "Email address already exists"
                        : undefined
                    }
                  >
                    <Input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      required
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                  </FormField>

                  <FormField
                    label="Confirm Email Address"
                    required
                    error={
                      confirmEmailAddress && formData.emailAddress !== confirmEmailAddress
                        ? "Email addresses do not match"
                        : undefined
                    }
                  >
                    <Input
                      type="email"
                      value={confirmEmailAddress}
                      onChange={handleConfirmEmailChange}
                      placeholder="john.doe@example.com"
                      required
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                  </FormField>
                </div>
              </div>

              {/* Role and Manager Information */}
              <div className="border-t border-secondary-200 pt-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                  Role & Management
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Role"
                    required
                  >
                    <Select
                      options={roleOptions}
                      value={selectedRole}
                      onChange={(value) => {
                        setSelectedRole(value);
                        setFormData({ ...formData, roles: value });
                      }}
                      leftIcon={<Shield className="h-4 w-4" />}
                      required
                    />
                  </FormField>

                  <FormField
                    label="Manager Name"
                  >
                    <Input
                      type="text"
                      name="managerName"
                      value={formData.managerName}
                      onChange={handleChange}
                      placeholder="Manager Name"
                      leftIcon={<User className="h-4 w-4" />}
                    />
                  </FormField>

                  <FormField
                    label="Manager Email"
                  >
                    <Input
                      type="email"
                      name="managerEmail"
                      value={formData.managerEmail}
                      onChange={handleChange}
                      placeholder="manager@example.com"
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                  </FormField>
                </div>
              </div>
            </CardBody>

            <CardFooter className="flex justify-end gap-3 border-t border-secondary-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/list-of-users')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                leftIcon={<Save className="h-4 w-4" />}
              >
                {isSubmitting ? 'Saving...' : 'Save User'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserForm;
