import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Building, Users, CheckCircle, XCircle, MoreVertical, Eye } from 'lucide-react';
import { getOrganizationById, fetchAllUsersByOrgId } from '../../services/organizationService';
import { fetchOrganizationImage } from '../../services/documentManagerService';
import { toast } from 'react-toastify';

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

const AgencyView: React.FC = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<any>(null);
  const [orgUsers, setOrgUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef(null);

  const location = useLocation();
  const orgId = location.state?.orgId;
  const agencyId = location.state?.agencyId

  useEffect(() => {
    if (agencyId) {
      loadOrganization(parseInt(agencyId));
      loadUsersByOrg(agencyId);
      fetchLogo(parseInt(orgId));
    }
  }, [agencyId]);

  const fetchLogo = async (orgId: number) => {
    try {
      const imageUrl = await fetchOrganizationImage(orgId);
      setOrganizationLogo(imageUrl);
    } catch (error) {
      console.error("Failed to fetch organization logo:", error);
      setOrganizationLogo(null);
    }
  };

  const loadOrganization = async (agencyId: number) => {
    try {
      const agency = await getOrganizationById(agencyId);
      setOrganization(agency);
    } catch (error) {
      toast.error('Failed to load agency');
      navigate('/agencies');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersByOrg = async (agencyId: string | number) => {
    try {
      setUsersLoading(true);
      const data = await fetchAllUsersByOrgId(agencyId);

      if (data?.success === false && data?.message?.includes("Users not found")) {
        setOrgUsers([]);
        return;
      }


      setOrgUsers(data);
    } catch (error: any) {

      if (!error.response?.data?.message?.includes("Users not found")) {
        toast.error("Failed to load agency users");
      } else {
        setOrgUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
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

  //const isAgency = organization.parentId !== null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-3">
        <div className="flex items-center justify-between flex-nowrap">

          {/* Left Section */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>

            {organizationLogo ? (
              <img
                src={organizationLogo}
                alt="Organization Logo"
                className="h-12 w-12 object-contain rounded-full border border-gray-200 p-1 bg-white"
              />
            ) : (
              <Building className="h-6 w-6 text-blue-600" />
            )}

            <h1 className="font-bold text-gray-900 truncate">
              <span className="text-lg sm:text-2xl">
                <span className="sm:hidden">Agency Details</span>
                <span className="hidden sm:inline">Agency Details</span>
              </span>
            </h1>
          </div>

          {/* Right Section (Edit Button) */}
          <button
            onClick={() =>
              navigate("/edit-agency", {
                state: {
                  orgId: orgId,
                  agencyId: agencyId,
                },
              })
            }
            className="
        bg-blue-600 text-white px-3 py-2 rounded-lg
        flex items-center gap-1 hover:bg-blue-700
        shrink-0
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <p className="text-sm text-gray-800">
              {`${organization.addressLine1}, ${organization.villageName}, ${organization.talukaName}, ${organization.districtName}, ${organization.pinCode}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
            <p className="text-sm text-gray-800">{organization.contactNumber || '-'}</p>
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
              <p className="text-sm text-gray-800">{new Date(organization.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

      </div>

      {/* Organization Users Section */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-1 sm:gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />

            {/* Mobile */}
            <span className="sm:hidden">
              Agency Members ({orgUsers.length})
            </span>

            {/* Desktop */}
            <span className="hidden sm:inline">
              Agency Members ({orgUsers.length})
            </span>
          </h2>

          <button
            onClick={() => navigate("/user-form")}
            className="
      px-2.5 py-1.5 sm:px-4 sm:py-2
      bg-blue-600 text-white
      rounded-md sm:rounded-lg
      hover:bg-blue-700 transition-colors
      text-xs sm:text-sm font-medium
    "
          >
            {/* Mobile */}
            <span className="sm:hidden">+ Add User</span>

            {/* Desktop */}
            <span className="hidden sm:inline">+ Add New User</span>
          </button>
        </div>


        {usersLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-6">
            {orgUsers.length > 0 ? (
              <div>

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
                No users assigned to this agency
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyView;