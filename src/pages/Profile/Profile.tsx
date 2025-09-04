import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, User, Mail, Phone, Shield, Building, Camera, Edit3, Save, Trash2, Crop, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { fetchClaims } from '../../services/jwtService';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Cropper, { Area } from 'react-easy-crop';
import { uploadUserSignature, getUserSignature } from '../../services/oneDriveService';

interface UserProfile {
  name_as_per_gov_id?: string;
  preferred_name?: string;
  email_address?: string;
  contact_number?: string;
  global_roles?: string[];
  org_roles?: Record<string, any>;
  signature?: string;
}

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
}

const CropModal: React.FC<CropModalProps> = ({ isOpen, onClose, imageUrl, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const handleZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation: number = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    // Resize to final dimensions (140x70)
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');

    if (!finalCtx) {
      throw new Error('No 2d context');
    }

    finalCanvas.width = 140;
    finalCanvas.height = 70;

    // Use high-quality image smoothing
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    finalCtx.drawImage(canvas, 0, 0, 140, 70);

    return finalCanvas.toDataURL('image/png', 0.95);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      toast.error('Please adjust the crop area first');
      return;
    }

    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Crop Signature</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Instructions */}
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Adjust the crop area to select your signature. The final output will be 140×70px.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Drag to move</span>
              <span>•</span>
              <span>Scroll to zoom</span>
              <span>•</span>
              <span>Rotate if needed</span>
            </div>
          </div>

          {/* Crop Container */}
          <div className="relative w-full h-96 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={2}
              onCropChange={handleCropChange}
              onZoomChange={handleZoomChange}
              onCropComplete={handleCropComplete}
              objectFit="contain"
              showGrid={true}
              cropSize={{ width: 200, height: 100 }}
              minZoom={0.5}
              maxZoom={3}
            />
          </div>

          {/* Zoom Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setRotation(rotation - 15)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {rotation}°
              </span>
              <button
                onClick={() => setRotation(rotation + 15)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-gray-600 transform scale-x-[-1]" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Footer for Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex gap-3 justify-center">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            leftIcon={<Crop className="w-4 h-4" />}
            loading={isProcessing}
            disabled={!croppedAreaPixels}
          >
            {isProcessing ? 'Processing...' : 'Save Cropped Image'}
          </Button>
        </div>
      </div>
    </div>
  );

};

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
  const [showCropModal, setShowCropModal] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    name_as_per_gov_id: '',
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
        name_as_per_gov_id: claims.name_as_per_gov_id || '',
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

      // Create preview URL and open crop modal
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropModal(true);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    // Update preview with cropped image
    setPreviewUrl(croppedImage);
    setShowCropModal(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // const handleUploadSignature = async () => {
  //   if (!previewUrl) {
  //     toast.error('Please select and crop a file first');
  //     return;
  //   }

  //   try {
  //     setUploading(true);

  //     await new Promise(resolve => setTimeout(resolve, 500));

  //     // Update profile with new signature
  //     setProfile(prev => prev ? { ...prev, signature: previewUrl } : null);

  //     toast.success('Signature uploaded successfully');
  //     setSelectedFile(null);
  //     setPreviewUrl(null);
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     toast.error('Failed to upload signature');
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleUploadSignature = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      await uploadUserSignature(selectedFile);
      toast.success('Signature uploaded successfully');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload signature');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchSignature = async () => {
      const url = await getUserSignature();
      setSignatureUrl(url);
    };
    fetchSignature();
  }, []);


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
      name_as_per_gov_id: profile?.name_as_per_gov_id || '',
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
              {/* <div className="flex items-center justify-between mb-6">
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
              </div> */}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.name_as_per_gov_id}
                        onChange={(e) => setEditData(prev => ({ ...prev, name_as_per_gov_id: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.name_as_per_gov_id || 'Not provided'}</p>
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
                      {signatureUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Signature</p>
            <div className="relative inline-block">
              <div className="w-[140px] h-[70px] border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img
                  src={signatureUrl}
                  alt="Digital Signature"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* <button
                onClick={handleRemoveSignature}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Remove signature"
              >
                <X className="w-3 h-3" />
              </button> */}
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

                    {!previewUrl ? (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          PNG, JPG, GIF, WebP up to 5MB
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
                              src={previewUrl}
                              alt="Signature Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{selectedFile?.name || 'Cropped Image'}</p>
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

        {/* Crop Modal */}
        {showCropModal && previewUrl && (
          <CropModal
            isOpen={showCropModal}
            onClose={() => setShowCropModal(false)}
            imageUrl={previewUrl}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
