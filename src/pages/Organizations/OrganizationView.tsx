import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Building, Building2, Users, CheckCircle, XCircle, MoreVertical, Eye } from 'lucide-react';
import { getOrganizationById, fetchAllUsersByOrgId } from '../../services/organizationService';
import { fetchOrganizationImage } from '../../services/documentManagerService';
import { toast } from 'react-toastify';
import { ZoomIn, ZoomOut, RotateCcw, Crop } from "lucide-react";
import { Button } from '../../components/ui';
import Cropper from "react-easy-crop";
import { X, Camera } from "lucide-react";
import { croppedImgForLogo } from '../../utils/croppedImageForLogo';
import { uploadOrganizationImage } from '../../services/documentManagerService';

interface OrganizationUser {
  id: number;
  username: string;
  nameAsPerGovId: string;
  emailAddress: string;
  contactNumber: string;
  isActive: boolean;
  organizationRoles: Array<{
    organizationId: number;
    organizationName: string;
    roleId: number;
    roleName: string;
  }>;
}

const OrganizationView: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const orgId = location.state?.orgId;

  const [organization, setOrganization] = useState<any>(null);
  const [orgUsers, setOrgUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [, setSelectedFile] = useState<File | null>(null);
  const [, setCreatedOrgId] = useState<number | null>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef(null);



  useEffect(() => {
    if (orgId) {
      loadOrganization(parseInt(orgId));
      loadUsersByOrg(orgId);
      fetchLogo(parseInt(orgId));
    }
  }, [orgId]);

  const fetchLogo = async (orgId: number) => {
    try {
      const imageUrl = await fetchOrganizationImage(orgId);
      setOrganizationLogo(imageUrl);
    } catch (error) {
      console.error("Failed to fetch organization logo:", error);
      setOrganizationLogo(null);
    }
  };

  const loadOrganization = async (orgId: number) => {
    try {
      const org = await getOrganizationById(orgId);
      setOrganization(org);
    } catch (error) {
      toast.error('Failed to load organization');
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };


  const loadUsersByOrg = async (organizationId: string | number) => {
    try {
      setUsersLoading(true);
      const data = await fetchAllUsersByOrgId(organizationId);

      if (data?.success === false && data?.message?.includes("Users not found")) {
        setOrgUsers([]);
        return;
      }


      setOrgUsers(data);
    } catch (error: any) {

      if (!error.response?.data?.message?.includes("Users not found")) {
        toast.error("Failed to load organization users");
      } else {
        setOrgUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowImageModal(false);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // reset crop
  const handleCropReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };


  // crop and upload combined
  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !orgId) return;

    setIsProcessing(true);

    try {
      const croppedBlob = await croppedImgForLogo(imageSrc, croppedAreaPixels, rotation, 768, 325);
      const croppedFile = new File([croppedBlob], "logo.png", { type: "image/png" });
      setSelectedFile(croppedFile);

      await uploadOrganizationImage(orgId, croppedFile);

      toast.success("Logo uploaded successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      // ✅ Close crop modal
      setShowCropModal(false);

      await loadOrganization(orgId);
      await fetchLogo(orgId);


    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleChooseAnotherImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
      }
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);





  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!organization) return <div className="flex justify-center p-8">Organization not found</div>;

  const isAgency = organization.parentId !== null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-3">
        <div className="flex items-center gap-2 flex-nowrap">
          {/* Left Section */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo Upload UI */}
            <div
              className="relative group h-12 w-12 shrink-0 cursor-pointer"
              onClick={() => {
                setCreatedOrgId(orgId);
                setShowImageModal(true);
              }}
            >
              {organizationLogo ? (
                <img
                  src={organizationLogo}
                  alt="Organization Logo"
                  className="h-12 w-12 object-contain rounded-full border border-gray-200 p-1 bg-white"
                />
              ) : (
                <div className="h-12 w-12 rounded-full border border-gray-200 bg-white p-2 flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              )}

              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white"/>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-bold text-gray-900 truncate">
              <span className="text-lg sm:text-2xl">
                <span className="sm:hidden">Org Details</span>
                <span className="hidden sm:inline">Organization Details</span>
              </span>
            </h1>
          </div>

          {/* Edit Button */}
          <button
            onClick={() =>
              navigate("/edit-organization", {
                state: { organizationId: orgId }
              })
            }
            className="
        bg-blue-600 text-white px-3 py-2 rounded-lg
        flex items-center gap-1 hover:bg-blue-700
        ml-auto shrink-0
      "
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>



      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Legal Name</label>
            <p className="text-sm text-gray-800">{organization.legalName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
            <p className="text-sm text-gray-800">{organization.displayName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name (Short Name)</label>
            <p className="text-sm text-gray-800">{organization.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
            <p className="text-sm text-gray-800">{organization.contactNumber || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <p className="text-sm text-gray-800">
              {`${organization.addressLine1}, ${organization.villageName}, ${organization.talukaName}, ${organization.districtName}, ${organization.pinCode}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">GST Number</label>
            <p className="text-sm text-gray-800">{organization.gstNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Government Registration Number</label>
            <p className="text-sm text-gray-800">{organization.govtRegNumber || '-'}</p>
          </div>

          {organization.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">{new Date(organization.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {!isAgency && (
          <div className="pt-6 ">
            <div className="border-b border-gray-200 mb-4" />
            <button
              onClick={() =>
                navigate("/agencies", {
                  state: { orgId, gstNumber: organization.gstNumber }
                })
              }

              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Building2 className="h-4 w-4" />
              View Agencies
            </button>
          </div>
        )}
      </div>

      {/* Organization Users Section */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-1 sm:gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />

            {/* Mobile text */}
            <span className="sm:hidden">
              Org Members ({orgUsers.length})
            </span>

            {/* Desktop text */}
            <span className="hidden sm:inline">
              Organization Members ({orgUsers.length})
            </span>
          </h2>

          <button
            onClick={() => navigate("/user-form")}
            className="
      px-2.5 py-1.5 sm:px-4 sm:py-2
      bg-blue-600 text-white rounded-md sm:rounded-lg
      hover:bg-blue-700 transition-colors
      text-xs sm:text-sm font-medium
    "
          >
            {/* Mobile text */}
            <span className="sm:hidden">+ Add User</span>

            {/* Desktop text */}
            <span className="hidden sm:inline">+ Add New User</span>
          </button>
        </div>



        {usersLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-6">
            {orgUsers.length > 0 ? (
              <div>
                {/* <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          Organization Users ({orgUsers.length})
        </h3> */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {orgUsers.map(user => (
                    <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50 relative">

                      {/* Header row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{user.nameAsPerGovId}</h3>

                          {user.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>

                        {/* Menu Button */}
                        <div className="relative" ref={menuRef}>
                          <button
                            onClick={() => setOpenMenu(prev => (prev === user.id ? null : user.id))}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenu === user.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
                              <button
                                onClick={() => {
                                  navigate("/user-view", { state: { userId: user.id } });
                                  setOpenMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>

                              <button
                                onClick={() => {
                                  navigate("/edit-user", { state: { userId: user.id } });
                                  setOpenMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="text-xs text-gray-600 mb-2">
                        <div>{user.emailAddress}</div>
                        <div>{user.contactNumber}</div>
                      </div>

                      {/* Roles */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.organizationRoles?.map((role, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-[11px] rounded-full bg-blue-100 text-blue-800"
                          >
                            {role.roleName.replace("ROLE_", "")} — {role.organizationName}
                          </span>
                        ))}
                      </div>
                    </div>

                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No users assigned to this organization
              </div>
            )}
          </div>
        )}
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">

            {/* Close (X) Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-center">
              Upload Organization Logo
            </h2>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full mb-4 border border-gray-300 p-2 rounded-md"
            />
          </div>
        </div>
      )}



      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Crop Logo</h3>

              {/* Close Button */}
              <button
                onClick={() => setShowCropModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>


            <div className="p-4 flex flex-col gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  Adjust the crop area. Final output will be <b>768×325px</b>.
                </p>
              </div>

              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={768 / 325}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={handleCropComplete}
                  objectFit="contain"
                  showGrid={true}
                  cropSize={{ width: 300, height: 127 }}
                />
              </div>

              {/* ✅ Choose another image option */}
              <div className="flex justify-center">
                <label className="cursor-pointer text-blue-600 text-sm font-medium hover:underline">
                  Choose Another Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChooseAnotherImage}
                  />
                </label>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.05))}>
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(3, zoom + 0.05))}>
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

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
                onClick={handleCropAndUpload}
                size="sm"
                leftIcon={!loading && <Crop className="w-4 h-4" />}
                loading={isProcessing}
                disabled={!croppedAreaPixels}
              >
                {isProcessing ? "Uploading..." : "Save & Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationView;