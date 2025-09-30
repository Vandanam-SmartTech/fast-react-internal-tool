import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Shield, Building, Crop, RotateCcw, ZoomIn, ZoomOut, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import Cropper, { Area } from 'react-easy-crop';
import { uploadUserSignature, getUserSignature, editUserSignature } from '../../services/oneDriveService';
import { useUser } from '../../contexts/UserContext';


const Profile: React.FC = () => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  //const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const { userClaims: user, loading} = useUser();
  

  // Cropping states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }


      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropModal(true);
    }
  };


  const handleCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const handleZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
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

    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');

    if (!finalCtx) {
      throw new Error('No 2d context');
    }

    finalCanvas.width = 140;
    finalCanvas.height = 70;


    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    finalCtx.drawImage(canvas, 0, 0, 140, 70);

    return finalCanvas.toDataURL('image/png', 0.95);
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !previewUrl) {
      toast.error('Please adjust the crop area first');
      return;
    }

    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(previewUrl, croppedAreaPixels, rotation);

      setPreviewUrl(croppedImage);
      setShowCropModal(false);


      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };



  const fetchSignature = async () => {
    const url = await getUserSignature();
    setSignatureUrl(url);
  };

  const handleUploadSignature = async () => {
    if (!previewUrl) return;

    try {
      setUploading(true);

      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'signature.png', { type: 'image/png' });

      await uploadUserSignature(file);

      toast.success("Signature uploaded successfully");


      await fetchSignature();


      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload signature");
    } finally {
      setUploading(false);
    }
  };

  const handleEditSignature = async () => {
    if (!previewUrl) return;

    try {
      setUploading(true);

      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      await editUserSignature(file);

      toast.success("Signature updated successfully");


      await fetchSignature();


      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error("Failed to update signature");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchSignature();
  }, []);



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
        {/* <div className="flex items-center gap-4 mb-8">
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
        </div> */}

        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user?.name_as_per_gov_id || 'Not provided'}</p>
                  <p className="text-sm text-gray-700">{user?.preferred_name || 'Not provided'}</p>
                  <p className="text-sm text-gray-600">
                    {user?.email_address || 'Not provided'}
                    {user?.email_address && user?.contact_number ? ' | ' : ''}
                    {user?.contact_number || ''}
                  </p>
                </div>
              </div>

              {/* <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900">{user?.name_as_per_gov_id || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Name
                    </label>
                    <p className="text-gray-900">{user?.preferred_name || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900">{user?.email_address || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <p className="text-gray-900">{user?.contact_number || 'Not provided'}</p>
                  </div>
                </div>
              </div> */}
            </CardBody>
          </Card>

          {/* Account Information Card */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Global Role (if any) */}
                {user?.global_roles?.includes('ROLE_SUPER_ADMIN') && (
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Global Role</p>
                      <p className="text-sm text-gray-600">Super Administrator</p>
                    </div>
                  </div>
                )}

                {/* All Organization Roles with Names */}
                {user?.org_roles &&
                  Object.entries(user.org_roles).map(([orgId, org]) => (
                    <div key={orgId} className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {org.org_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {org.role.replace('ROLE_', '').replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>



          {/* Digital Signature Card */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h3>

              {signatureUrl ? (
                <>
                  {/* Current Signature */}
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
                    </div>
                  </div>

                  {/* Edit Signature */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit Signature
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Show preview only when user selects new file */}
                  {previewUrl && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">New Signature Preview (140×70px format):</p>
                      <div className="w-[140px] h-[70px] border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center mx-auto">
                        <img
                          src={previewUrl}
                          alt="Signature Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{selectedFile?.name || 'Cropped Image'}</p>
                      <div className="flex gap-2 justify-center mt-2">
                        <Button
                          onClick={signatureUrl ? handleEditSignature : handleUploadSignature}
                          size="sm"
                          loading={uploading}
                        >
                          {signatureUrl ? "Update" : "Upload"}
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
                </>
              ) : (
                <>
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
                            <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mb-3">PNG, JPG, GIF, WebP up to 5MB</p>
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
                </>
              )}
            </CardBody>
          </Card>

        </div>

        {/* Crop Modal */}
        {showCropModal && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Crop Signature</h3>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content (no scroll for desktop) */}
              <div className="p-4 flex flex-col gap-4">
                {/* Instructions */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Adjust the crop area to select your signature. Final output will be 140×70px.
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                    <span>Drag</span>
                    <span>•</span>
                    <span>Zoom</span>
                    <span>•</span>
                    <span>Rotate</span>
                  </div>
                </div>

                {/* Crop Container (smaller height) */}
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Cropper
                    image={previewUrl}
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

                {/* Controls */}
                <div className="space-y-3">
                  {/* Zoom */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[50px] text-center">
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

                  {/* Rotation */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setRotation(rotation - 15)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[50px] text-center">
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

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 flex gap-3 justify-center">
                <Button
                  onClick={handleCropReset}
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleCropSave}
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
        )}



      </div>
    </div>
  );
};

export default Profile;
