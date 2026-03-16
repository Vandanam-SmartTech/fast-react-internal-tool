import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Crop, RotateCcw, ZoomIn, ZoomOut, User, Camera, Key, Pencil, Shield, Building } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import Cropper, { Area } from 'react-easy-crop';
import { uploadUserSignature, getUserSignature, editUserSignature, uploadUserProfilePhoto, getUserProfilePhoto, editUserProfilePhoto, deleteUserProfilePhoto, deleteUserSignaturePhoto } from '../../services/documentManagerService';
import { useUser } from '../../contexts/UserContext';
import { getUserById } from '../../services/jwtService';
import { croppedImg } from '../../utils/croppedImage';
import EditProfileModal from './EditProfileModal';

const Profile: React.FC = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);
  //const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const { userClaims: user } = useUser();
  const userId = user?.id;

  const [showCropModalForProfile, setShowCropModalForProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [previewUrlForProfile, setPreviewUrlForProfile] = useState<string | null>(null);

  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(false);
  const [loadingForProfile, setLoadingForProfile] = useState(false);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [removingPhoto, setRemovingPhoto] = useState(false);

  const navigate = useNavigate();
  // const [claims, setClaims] = useState<any>(null);
  // const [loadingClaims, setLoadingClaims] = useState(false);

  const [userDetails, setUserDetails] = useState<any>(null);




  // Cropping states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [croppedAreaPixelsForProfile, setCroppedAreaPixelsForProfile] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);



  const loadProfilePhoto = async () => {
    if (!user?.id) return; // safety check

    const photoUrl = await getUserProfilePhoto(user.id);

    if (photoUrl) {
      setProfilePhoto(photoUrl);
      setHasUploadedPhoto(true);
    } else {
      setProfilePhoto(null);
      setHasUploadedPhoto(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchUserDetails(userId);
  }, [userId]);

  const fetchUserDetails = async (id: number) => {
    try {
      const response = await getUserById(id);
      if (response.data) {
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
    }
  };




  useEffect(() => {
    if (!userId) return;
    loadProfilePhoto();

    const handlePhotoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const updatedPhoto = customEvent.detail;

      if (updatedPhoto) {
        // photo added or updated
        setProfilePhoto(updatedPhoto);
        setHasUploadedPhoto(true);
      } else {
        // photo removed
        setProfilePhoto(null);
        setHasUploadedPhoto(false);
      }
    };

    window.addEventListener("profilePhotoUpdated", handlePhotoUpdate);

    return () => {
      window.removeEventListener("profilePhotoUpdated", handlePhotoUpdate);
    };
  }, [userId]);

  const handleRemovePhoto = async () => {
    if (!user?.id) return;

    try {
      setRemovingPhoto(true);

      // Pass userId from context
      await deleteUserProfilePhoto(user.id);

      // Refresh UI state immediately
      await loadProfilePhoto();

      setShowCropModal(false); // Close modal

      // 🔥 Notify other components about removal
      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", { detail: "" })
      );
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Error while removing photo, please try again later.");
    } finally {
      setRemovingPhoto(false);
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewUrlForProfile(reader.result as string);
        setShowCropModalForProfile(true);
      };

      reader.readAsDataURL(file);

      e.target.value = "";
    }
  };


  const handleCropSaveForProfile = async () => {
    if (!previewUrlForProfile || !croppedAreaPixelsForProfile) return;

    if (!user?.id) {
      console.error("User ID not found in context");
      return;
    }

    setLoadingForProfile(true);

    try {
      const croppedImageForProfile = await croppedImg(
        previewUrlForProfile,
        croppedAreaPixelsForProfile,
        rotation,
        true
      );

      const byteString = atob(croppedImageForProfile.split(",")[1]);
      const mimeString = croppedImageForProfile.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const file = new File([ab], "profile-photo.png", { type: mimeString });


      if (hasUploadedPhoto) {
        await editUserProfilePhoto(user.id, file);
      } else {
        await uploadUserProfilePhoto(user.id, file);
        setHasUploadedPhoto(true);
      }

      setProfilePhoto(croppedImageForProfile);
      setShowCropModalForProfile(false);

      window.dispatchEvent(new CustomEvent("profilePhotoUpdated", { detail: croppedImageForProfile }));
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Error while uploading photo, please try again later.");
    } finally {
      setLoadingForProfile(false);
    }
  };

  const onCropComplete = useCallback(
    (_: any, croppedAreaPixelsForProfile: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixelsForProfile(croppedAreaPixelsForProfile);
    },
    []
  );


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file', {
          autoClose: 1000,
          hideProgressBar: true
        });
        return;
      }


      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB', {
          autoClose: 1000,
          hideProgressBar: true
        });
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
      toast.error('Please adjust the crop area first', {
        autoClose: 1000,
        hideProgressBar: true
      });
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
      toast.error('Failed to crop image', {
        autoClose: 1000,
        hideProgressBar: true
      });
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
    if (!user?.id) return;   // safety check

    const url = await getUserSignature(user.id);
    setSignatureUrl(url);
  };

  const handleUploadSignature = async () => {
    if (!previewUrl) return;
    if (!user?.id) {
      console.error("User ID not found in context");
      return;
    }

    try {
      setUploading(true);

      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'signature.png', { type: 'image/png' });

      await uploadUserSignature(user.id, file);

      toast.success("Signature uploaded successfully", {
        autoClose: 1000,
        hideProgressBar: true
      });


      await fetchSignature();


      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload signature", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditSignature = async () => {
    if (!previewUrl) return;

    if (!user?.id) {
      console.error("User ID not found in context");
      return;
    }

    try {
      setUploading(true);

      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      await editUserSignature(user.id, file);

      toast.success("Signature updated successfully", {
        autoClose: 1000,
        hideProgressBar: true
      });


      await fetchSignature();


      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error("Failed to update signature", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSignature = async () => {
    if (!signatureUrl) return; // nothing to remove
    if (!user?.id) {
      console.error("User ID not found in context");
      return;
    }

    try {
      setUploading(true); // show loader if needed

      // Call API to delete signature
      await deleteUserSignaturePhoto(user.id);

      toast.success("Signature removed successfully", {
        autoClose: 1000,
        hideProgressBar: true
      });

      // Refresh the signature from server
      await fetchSignature();

      // Reset preview and selected file (in case user had selected new file before removing)
      setSelectedFile(null);
      setPreviewUrl(null);

      // Reset file input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Failed to remove signature:", err);
      toast.error("Failed to remove signature", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchSignature();
  }, [userId]);


  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-4">
          {/* Personal Information Card */}
          <Card>
            <CardBody className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

                {/* Left Section - Profile Info */}
                <div className="flex items-center gap-4 group relative justify-start text-left w-full">


                  {/* Profile Photo Section */}
                  <div
                    className={`w-12 h-12 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden relative flex-shrink-0 ${!profilePhoto ? "bg-gray-200" : ""
                      }`}
                  >
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="User"
                        className="w-full h-full object-cover rounded-full block"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-600" />
                    )}
                    {/* Overlay for Edit / Upload */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition"
                      onClick={() => {
                        if (profilePhoto) {
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setRotation(0);
                          setCroppedAreaPixelsForProfile(null);
                          setPreviewUrlForProfile(profilePhoto);
                          setShowCropModalForProfile(true);
                        } else {
                          document.getElementById("profile-file-input")?.click();
                        }
                      }}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </div>

                    {/* Hidden File Input */}
                    <input
                      id="profile-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* User Info Section */}
                  <div className="flex flex-col">
                    {/* Full Name */}
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      {userDetails?.nameAsPerGovId || "NA"}
                    </p>

                    {/* Preferred Name */}
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-500">Preferred Name:</span>{" "}
                      <span className="text-gray-800">
                        {userDetails?.preferredName || "NA"}
                      </span>
                    </p>

                    {/* Email & Mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-1">
                      <p className="text-sm text-gray-700 flex items-center gap-1">
                        <span className="font-medium text-gray-500 shrink-0">Email:</span>

                        <span
                          className="text-gray-800 truncate max-w-[160px] sm:max-w-full"
                          title={userDetails?.emailAddress || "NA"}
                        >
                          {userDetails?.emailAddress || "NA"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-500">Mobile:</span>{" "}
                        <span className="text-gray-800">
                          {userDetails?.contactNumber || "NA"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Pencil className="w-4 h-4" />}
                    className="w-full sm:w-auto whitespace-nowrap"
                    onClick={() => setShowEditProfileModal(true)}
                  >
                    Edit Details
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Key className="w-4 h-4" />}
                    className="w-full sm:w-auto whitespace-nowrap"
                    onClick={() => navigate("/password-reset")}
                  >
                    Change Password
                  </Button>
                </div>



              </div>

              {/* Crop Modal (same as your code) */}
              {showCropModalForProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200">
                      {/* Left side - Title */}
                      <h3 className="text-base font-semibold text-gray-900">Profile Photo</h3>

                      <div className="flex items-center gap-2">
                        {hasUploadedPhoto && (
                          <button
                            onClick={handleRemovePhoto}
                            disabled={removingPhoto}
                            className={`px-3 py-1 text-sm font-medium text-white rounded-lg transition-colors ${removingPhoto
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                              }`}
                          >
                            {removingPhoto ? "Removing..." : "Remove Current Photo"}
                          </button>
                        )}
                        <button
                          onClick={() => setShowCropModalForProfile(false)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>


                    <div className="text-center text-sm text-gray-600 mt-2">
                      Adjust the crop area to select your photo.
                    </div>

                    {/* Crop Section */}
                    <div className="p-4 flex flex-col gap-4">
                      {previewUrlForProfile ? (
                        <div className="relative w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden">
                          <Cropper
                            image={previewUrlForProfile}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            cropShape="round"
                            aspect={1}
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                          />
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-600">
                          No image selected
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex flex-col gap-3 items-center">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                          >
                            <ZoomOut className="w-5 h-5 text-gray-600" />
                          </button>
                          <span className="text-sm text-gray-600 w-14 text-center">
                            {Math.round(zoom * 100)}%
                          </span>
                          <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                          >
                            <ZoomIn className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {/* Rotation Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setRotation(rotation - 15)}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                          >
                            <RotateCcw className="w-5 h-5 text-gray-600" />
                          </button>
                          <span className="text-sm text-gray-600 w-14 text-center">
                            {rotation}°
                          </span>
                          <button
                            onClick={() => setRotation(rotation + 15)}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                          >
                            <RotateCcw className="w-5 h-5 text-gray-600 transform scale-x-[-1]" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setZoom(1);
                            setRotation(0);
                            setCrop({ x: 0, y: 0 });
                          }}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 flex gap-3 justify-center">
                      {/* Choose Another Photo moved here */}
                      <label className="cursor-pointer bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-300">
                        Choose Another Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>

                      <Button
                        onClick={handleCropSaveForProfile}
                        size="sm"
                        className="justify-center"
                        loading={loadingForProfile}
                        leftIcon={!loadingForProfile && <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      >
                        {!loadingForProfile && (hasUploadedPhoto ? "Edit Photo" : "Upload Photo")}
                      </Button>

                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {user?.global_roles?.includes('ROLE_SUPER_ADMIN') && (
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Global Role</p>
                      <p className="text-sm text-gray-600">Super Administrator</p>
                    </div>
                  </div>
                )}

                {user?.org_roles &&
                  Object.entries(user.org_roles).map(([orgId, org]) => (
                    <div key={orgId} className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">{org.org_name}</p>
                      </div>
                      <div className="ml-8 flex flex-col gap-0.5">
                        {org.roles.map((role) => (
                          <p key={role} className="text-sm text-gray-600">
                            {role.replace('ROLE_', '').replace(/_/g, ' ')}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}

              </div>
            </CardBody>
          </Card>



          {/* Digital Signature Card */}
          <Card>
            <CardBody className="p-4">
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
                  <div className="flex gap-2">
                    {/* Edit / Upload Signature */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {signatureUrl ? "Edit Signature" : "Upload Signature"}
                    </Button>

                    {/* Remove Signature (only show if signature exists) */}
                    {signatureUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        color="red"
                        onClick={handleRemoveSignature}
                        className="focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        loading={uploading}
                      >
                        Remove Signature
                      </Button>
                    )}

                    {/* Hidden file input */}
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

        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          user={userDetails}
          onUpdate={() => {
            if (userId) fetchUserDetails(userId);
          }}
        />

      </div>
    </div>
  );
};

export default Profile;
