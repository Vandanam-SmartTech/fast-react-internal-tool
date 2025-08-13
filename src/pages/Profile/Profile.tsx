import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, User, Mail, Phone, Shield, Building, Camera, Edit3, Save, Trash2 } from 'lucide-react';
import { fetchClaims } from '../../services/jwtService';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

interface UserProfile {
  name?: string;
  preferred_name?: string;
  email?: string;
  contact_number?: string;
  global_roles?: string[];
  org_roles?: Record<string, any>;
  signature?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    preferred_name: '',
    email: '',
    contact_number: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const claims = await fetchClaims();
      
      // Set profile and edit data simultaneously
      setProfile(claims);
      setEditData({
        name: claims.name || '',
        preferred_name: claims.preferred_name || '',
        email: claims.email_address || '',
        contact_number: claims.contact_number || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadSignature = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      
      // Here you would typically upload to your backend
      // For now, we'll simulate a quick upload
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update profile with new signature
      setProfile(prev => prev ? { ...prev, signature: previewUrl } : null);
      
      toast.success('Signature uploaded successfully');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload signature');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Here you would typically save to your backend
      // For now, we'll simulate a quick save
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProfile(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: profile?.name || '',
      preferred_name: profile?.preferred_name || '',
      email: profile?.email_address || '',
      contact_number: profile?.contact_number || ''
    });
    setIsEditing(false);
  };

  const removeSignature = () => {
    setProfile(prev => prev ? { ...prev, signature: undefined } : null);
    toast.success('Signature removed');
  };

  const getRoleDisplay = () => {
    if (profile?.global_roles?.includes('ROLE_SUPER_ADMIN')) {
      return 'Super Administrator';
    }
    
    const selectedOrgStr = localStorage.getItem('selectedOrg');
    if (selectedOrgStr) {
      try {
        const selectedOrg = JSON.parse(selectedOrgStr);
        return selectedOrg.role?.replace('ROLE_', '').replace('_', ' ') || 'User';
      } catch {
        return 'User';
      }
    }
    
    return 'User';
  };

  const getOrganizationDisplay = () => {
    const selectedOrgStr = localStorage.getItem('selectedOrg');
    if (selectedOrgStr) {
      try {
        const selectedOrg = JSON.parse(selectedOrgStr);
        return selectedOrg.orgName || 'No Organization';
      } catch {
        return 'No Organization';
      }
    }
    return 'No Organization';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and signature</p>
          </div>
        </div>

                 <div className="space-y-6">
           {/* Personal Information Card */}
           <Card>
             <CardBody className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                 {!isEditing ? (
                   <Button
                     onClick={() => setIsEditing(true)}
                     leftIcon={<Edit3 className="w-4 h-4" />}
                     variant="outline"
                     size="sm"
                   >
                     Edit
                   </Button>
                 ) : (
                   <div className="flex gap-2">
                     <Button
                       onClick={handleCancelEdit}
                       variant="outline"
                       size="sm"
                     >
                       Cancel
                     </Button>
                     <Button
                       onClick={handleSaveProfile}
                       leftIcon={<Save className="w-4 h-4" />}
                       size="sm"
                       loading={saving}
                     >
                       Save
                     </Button>
                   </div>
                 )}
               </div>

               <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Full Name
                     </label>
                     {isEditing ? (
                       <Input
                         value={editData.name}
                         onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="Enter your full name"
                       />
                     ) : (
                       <p className="text-gray-900">{profile?.name || 'Not provided'}</p>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Preferred Name
                     </label>
                     {isEditing ? (
                       <Input
                         value={editData.preferred_name}
                         onChange={(e) => setEditData(prev => ({ ...prev, preferred_name: e.target.value }))}
                         placeholder="Enter your preferred name"
                       />
                     ) : (
                       <p className="text-gray-900">{profile?.preferred_name || 'Not provided'}</p>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Email Address
                     </label>
                     {isEditing ? (
                       <Input
                         type="email"
                         value={editData.email}
                         onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                         placeholder="Enter your email"
                       />
                     ) : (
                       <p className="text-gray-900">{profile?.email_address || 'Not provided'}</p>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Contact Number
                     </label>
                     {isEditing ? (
                       <Input
                         value={editData.contact_number}
                         onChange={(e) => setEditData(prev => ({ ...prev, contact_number: e.target.value }))}
                         placeholder="Enter your contact number"
                       />
                     ) : (
                       <p className="text-gray-900">{profile?.contact_number || 'Not provided'}</p>
                     )}
                   </div>
                 </div>
               </div>
             </CardBody>
           </Card>

           {/* Account Information Card */}
           <Card>
             <CardBody className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-3">
                   <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                   <div>
                     <p className="text-sm font-medium text-gray-900">Role</p>
                     <p className="text-sm text-gray-600">{getRoleDisplay()}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <Building className="w-5 h-5 text-green-600 flex-shrink-0" />
                   <div>
                     <p className="text-sm font-medium text-gray-900">Organization</p>
                     <p className="text-sm text-gray-600">{getOrganizationDisplay()}</p>
                   </div>
                 </div>
               </div>
             </CardBody>
           </Card>

           {/* Digital Signature Card */}
           <Card>
             <CardBody className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h3>
               
                               {/* Current Signature */}
                {profile?.signature && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Signature</p>
                    <div className="relative inline-block">
                      <div className="w-[140px] h-[70px] border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={profile.signature}
                          alt="Digital Signature"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        onClick={removeSignature}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Remove signature"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

               {/* Upload New Signature */}
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Upload New Signature
                   </label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors focus-within:border-blue-500">
                     <input
                       ref={fileInputRef}
                       type="file"
                       accept="image/*"
                       onChange={handleFileSelect}
                       className="hidden"
                       aria-describedby="file-upload-help"
                     />
                     
                     {!selectedFile ? (
                       <div>
                         <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                         <p className="text-sm text-gray-600 mb-1">
                           Click to upload or drag and drop
                         </p>
                         <p className="text-xs text-gray-500 mb-3">
                           PNG, JPG, GIF up to 5MB
                         </p>
                         <Button
                           onClick={() => fileInputRef.current?.click()}
                           variant="outline"
                           size="sm"
                           className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                         >
                           Choose File
                         </Button>
                       </div>
                                             ) : (
                          <div>
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-2">Preview (140×70px format):</p>
                              <div className="w-[140px] h-[70px] border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center mx-auto">
                                <img
                                  src={previewUrl || ''}
                                  alt="Signature Preview"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{selectedFile.name}</p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                onClick={handleUploadSignature}
                                size="sm"
                                loading={uploading}
                                className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                Upload
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedFile(null);
                                  setPreviewUrl(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                   </div>
                 </div>
                 
                                   <div className="text-xs text-gray-500" id="file-upload-help">
                    <p>• Supported formats: PNG, JPG, JPEG, GIF, WebP</p>
                    <p>• Maximum file size: 5MB</p>
                    <p>• Signature will be displayed at 140×70px format</p>
                    <p>• Recommended: Transparent background for best results</p>
                  </div>
               </div>
             </CardBody>
           </Card>
         </div>
      </div>
    </div>
  );
};

export default Profile;
