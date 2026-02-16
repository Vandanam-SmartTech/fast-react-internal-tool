import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Building, User, Shield, Check, Camera, X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import Button from './ui/Button';
import { Logo } from './ui';
import { croppedImg } from '../utils/croppedImage';
import Cropper from 'react-easy-crop';
import { uploadUserProfilePhoto, getUserProfilePhoto, editUserProfilePhoto, deleteUserProfilePhoto } from '../services/documentManagerService';
import { loadCropperCSS } from '../utils/cssLoader';
import { getTalukaNameByCode, getVillageNameByCode } from '../services/jwtService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDeptCode, setSelectedDeptCode] = useState<number | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { userClaims, setSelectedOrg, clearUserClaims } = useUser();


  const [showCropModal, setShowCropModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(false);
  const [loading, setLoading] = useState(false);


  const authPages = ['/login', '/password-reset', '/verification', '/change-password', '/page-not-found'];
  const isAuthPage = authPages.includes(location.pathname);
  const [removingPhoto, setRemovingPhoto] = useState(false);


  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);


  useEffect(() => {
  const fetchOrgName = async () => {
    const selectedOrgStr = localStorage.getItem("selectedOrg");

    if (!selectedOrgStr) return;

    try {
      const selectedOrg = JSON.parse(selectedOrgStr);

      setSelectedRole(selectedOrg.role || "");

      // 🔹 ROLE_BDO → fetch Taluka Name
      if (selectedOrg.role === "ROLE_BDO" && selectedOrg.deptCode) {
        const talukaName = await getTalukaNameByCode(Number(selectedOrg.deptCode));
        setSelectedOrgName(talukaName);
      }

      // 🔹 ROLE_GRAMSEVAK → fetch Village Name
      else if (selectedOrg.role === "ROLE_GRAMSEVAK" && selectedOrg.deptCode) {
        const villageName = await getVillageNameByCode(Number(selectedOrg.deptCode));
        setSelectedOrgName(villageName);
      }

      // 🔹 Other Roles → use orgName directly
      else {
        setSelectedOrgName(selectedOrg.orgName || "");
      }

    } catch (error) {
      console.error("Error parsing selectedOrg from localStorage:", error);
    }
  };

  fetchOrgName();
}, [userClaims]);


  useEffect(() => {
    const storedState = localStorage.getItem('sidebarOpen');
    setSidebarOpen(storedState === 'true');

    const handleStorageChange = () => {
      const newState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(newState === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const handleOrgChange = (orgId: string, orgName: string, role: string, deptCode: number | null) => {
    const newOrg = { orgId, orgName, role, deptCode };

    setSelectedOrg(newOrg);
    localStorage.setItem('selectedOrg', JSON.stringify(newOrg));

    setSelectedOrgName(orgName);
    setSelectedRole(role);
    setShowOrgDropdown(false);


    window.dispatchEvent(new CustomEvent('organizationChanged', { detail: newOrg }));


    if (role === 'ROLE_AGENCY_REPRESENTATIVE' || role === 'ROLE_ORG_REPRESENTATIVE') {
      navigate('/representative-dashboard');
    } else if (role === 'ROLE_ORG_ADMIN') {
      navigate('/org-admin-dashboard');
    } else if (role === 'ROLE_AGENCY_ADMIN') {
      navigate('/agency-admin-dashboard');
    } else if (role === 'ROLE_ORG_STAFF' || role === 'ROLE_AGENCY_STAFF') {
      navigate('/staff-dashboard');
    } else if (role === 'ROLE_SUPER_ADMIN') {
      navigate('/super-admin-dashboard');
    } else if (role === 'ROLE_BDO') {
      navigate('/bdo-dashboard');
    } else if (role === 'ROLE_GRAMSEVAK') {
      navigate('/grampanchayat-dashboard');
    }

  };



  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("selectedOrg");
    clearUserClaims();
    navigate("/login");
  };

  const loadProfilePhoto = async () => {
    if (!userClaims?.id) return; // safety check

    const photoUrl = await getUserProfilePhoto(userClaims.id);

    if (photoUrl) {
      setProfilePhoto(photoUrl);
      setHasUploadedPhoto(true);
    } else {
      setProfilePhoto(null);
      setHasUploadedPhoto(false);
    }
  };



  useEffect(() => {

    if (!userClaims?.id) return;

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
  }, [userClaims?.id]);


const handleRemovePhoto = async () => {
  if (!userClaims?.id) return;

  try {
    setRemovingPhoto(true);

    // Pass userId from context
    await deleteUserProfilePhoto(userClaims.id);

    // Refresh UI state immediately
    await loadProfilePhoto();

    setShowCropModal(false); // Close modal

    // 🔥 Notify other components about removal
    window.dispatchEvent(
      new CustomEvent("profilePhotoUpdated", { detail: "" })
    );
  } catch (error) {
    console.error("Error removing photo:", error);
  } finally {
    setRemovingPhoto(false);
  }
};


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadCropperCSS();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setShowCropModal(true);
      };

      reader.readAsDataURL(file);
    }
  };

 const handleCropSave = async () => {
    if (!previewUrl || !croppedAreaPixels) return;

    if (!userClaims?.id) {
      console.error("User ID not available");
      return;
    }

    setLoading(true);

    try {
      const croppedImage = await croppedImg(
        previewUrl,
        croppedAreaPixels,
        rotation,
        true
      );

      const byteString = atob(croppedImage.split(",")[1]);
      const mimeString = croppedImage.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const file = new File([ab], "profile-photo.png", { type: mimeString });


      if (hasUploadedPhoto) {
        await editUserProfilePhoto(userClaims.id, file);
      } else {
        await uploadUserProfilePhoto(userClaims.id, file);
        setHasUploadedPhoto(true);
      }

      setProfilePhoto(croppedImage);
      setShowCropModal(false);

      window.dispatchEvent(new CustomEvent("profilePhotoUpdated", { detail: croppedImage }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const onCropComplete = useCallback(
    (_: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const isSuperAdmin = userClaims?.global_roles?.includes('ROLE_SUPER_ADMIN');

  if (isAuthPage) {
    return null;
  }

  return (
    <header className={`bg-white dark:bg-secondary-800 shadow-soft border-b border-secondary-200 dark:border-secondary-700 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarOpen
      ? 'md:left-64 left-0'
      : 'left-0 md:left-0'
      }`}>
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 w-full">

        <div className="flex items-center gap-2 sm:gap-4">

          {!sidebarOpen && (
            <div className="hidden md:block pl-10">
              <Logo className="w-20 h-20" />
            </div>
          )}


          <div className="flex items-center gap-3">
            {/* Super Admin Display */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 text-secondary-700 dark:text-secondary-200 ml-[40px] sm:ml-0">
                <Shield className="h-4 w-4 text-primary-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Super Admin</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">System Administrator</span>
                </div>
              </div>
            )}

            {/* Organization and Role Display */}
            {selectedOrgName && selectedRole && !isSuperAdmin && (
              <div className="flex items-center gap-3 text-secondary-700 dark:text-secondary-200">
                <Building className="h-4 w-4 text-primary-600 hidden sm:block" />
                <div className="flex flex-col ml-[40px] md:ml-[0px] lg:ml-[0px]">
                  <span className="font-semibold text-sm">{selectedOrgName}</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    {{
                      ROLE_BDO: "Panchayat Samiti Adhikari",
                      ROLE_GRAMSEVAK: "Gram Adhikari",
                    }[selectedRole] || selectedRole.replace("ROLE_", "").replace("_", " ")}
                  </span>

                </div>
              </div>
            )}
          </div>

        </div>


        {/* Right side - User controls */}
        <div className="flex items-center gap-1 sm:gap-3">

          {/* Theme toggle removed */}

          {/* Notifications - Hide on very small screens 
          <Button
            variant="ghost"
            size="sm"
            className="p-1 sm:p-2"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>*/}

          {/* Organization Selector (only for non-super admins with multiple orgs) */}
          {!isSuperAdmin && userClaims?.org_roles && Object.keys(userClaims.org_roles).length > 1 && (
            <div className="relative" ref={orgDropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                leftIcon={<Building className="h-4 w-4" />}
                rightIcon={<ChevronDown className="h-4 w-4" />}
                className="flex"
              >
                <span className="hidden sm:inline">Switch Org</span>
              </Button>
              {showOrgDropdown && (
                <div
                  className="
      fixed sm:absolute
      inset-x-3 sm:inset-x-auto
      top-16 sm:top-full
      sm:right-0
      mt-2
      w-auto sm:w-72
      max-h-[80vh]
      bg-white dark:bg-secondary-800
      rounded-xl
      shadow-large
      border border-secondary-200 dark:border-secondary-700
      z-50
      animate-slide-down
      overflow-hidden
    "
                >
                  <div className="py-2">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                      <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                        Select Organization
                      </h3>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                        Choose your organization and role
                      </p>
                    </div>

                    {/* List */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {Object.entries(userClaims.org_roles).map(([orgId, orgData]) =>
                        orgData.roles.map(role => {
                          const isSelected =
                            orgData.org_name === selectedOrgName &&
                            role === selectedRole;

                          return (
                            <button
                              key={`${orgId}-${role}`}
                              onClick={() =>
                                handleOrgChange(orgId, orgData.org_name, role, orgData.dept_code)
                              }
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors border-l-4 ${isSelected
                                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-primary-600"
                                : "text-secondary-700 dark:text-secondary-300 border-l-transparent"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {orgData.org_name}
                                  </div>
                                  <div className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                                    {role.replace("ROLE_", "").replace("_", " ")}
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              leftIcon={
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="User"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  )}
                </div>
              }
              rightIcon={<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-600 dark:text-secondary-300" />}
              className="px-2 sm:px-3"
            >
              <span className="hidden lg:inline font-medium text-secondary-700 dark:text-secondary-300">
                {userClaims?.name_as_per_gov_id || userClaims?.preferred_name || 'User'}
              </span>
            </Button>


            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white dark:bg-secondary-800 rounded-xl shadow-large border border-secondary-200 dark:border-secondary-700 z-50 animate-slide-down">
                <div className="py-2">
                  {/* Header */}
                  <div className="px-3 sm:px-4 py-3 border-b border-secondary-100 dark:border-secondary-700 flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative group w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">

                      {/* Avatar */}
                      <div className="w-full h-full bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="User"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>

                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition"
                          onClick={() => {
                            loadCropperCSS();
                            if (profilePhoto) {

                              setCrop({ x: 0, y: 0 });
                              setZoom(1);
                              setRotation(0);
                              setCroppedAreaPixels(null);


                              setPreviewUrl(profilePhoto);
                              setShowCropModal(true);
                            } else {

                              document.getElementById("profile-file-input")?.click();
                            }
                          }}
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </div>

                      <input
                        id="profile-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                    </div>

                    {showCropModal && (
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
                                onClick={() => setShowCropModal(false)}
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
                            {previewUrl ? (
                              <div className="relative w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden">
                                <Cropper
                                  image={previewUrl}
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
                              onClick={handleCropSave}
                              size="sm"
                              className="justify-center"
                              loading={loading}
                              leftIcon={!loading && <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                            >
                              {!loading && (hasUploadedPhoto ? "Edit Photo" : "Upload Photo")}
                            </Button>

                          </div>
                        </div>
                      </div>
                    )}


                    {/* User Info */}
                    {/* User Info */}
                    <div className="min-w-0">
                      <div
                        className="font-medium text-secondary-900 dark:text-secondary-100 text-sm truncate"
                        title={userClaims?.name_as_per_gov_id}
                      >
                        {userClaims?.name_as_per_gov_id || "NA"}
                      </div>

                      <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 truncate">
                        {isSuperAdmin ? "Super Admin" : selectedOrgName}
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;