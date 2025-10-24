import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, User } from 'lucide-react';
import { getUserById, getUserOrgRolesById } from '../../services/jwtService';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';


const UserView: React.FC = () => {
  const { userClaims } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
  if (userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) {
    setUserRole("ROLE_SUPER_ADMIN");
  } else if (userInfo?.role === "ROLE_ORG_ADMIN") {
    setUserRole("ROLE_ORG_ADMIN");
  } else if (userInfo?.role === "ROLE_AGENCY_ADMIN") {
    setUserRole("ROLE_AGENCY_ADMIN");
  }
}, [userClaims, userInfo]);


  useEffect(() => {
  if (userId && userRole) {
    loadUserData(parseInt(userId));
  }
}, [userId, userRole]);

const loadUserData = async (userId: number) => {
  setLoading(true);
  try {
    let response;

    if (userRole === "ROLE_SUPER_ADMIN") {
      // Super Admin can view any user directly
      response = await getUserById(userId);
    } else {
      // Org Admin or Agency Admin — view within their organization only
      response = await getUserOrgRolesById(userId, userInfo?.orgId);
    }

    if (response?.data) {
      setUser(response.data);
    } else {
      toast.error(response?.message || "User not found");
      navigate("/user-management");
    }
  } catch (error) {
    console.error("Error loading user:", error);
    toast.error("Failed to load user");
    navigate("/user-management");
  } finally {
    setLoading(false);
  }
};


  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!user) return <div className="flex justify-center p-8">User not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6" />
          User Details
        </h1>

        <button
          onClick={() => navigate("/edit-user", { state: { userId: user.id } })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>


      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
            <p className="text-gray-900">{user.nameAsPerGovId || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Name</label>
            <p className="text-gray-900">{user.preferredName || '-'}</p>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
            <p className="text-gray-900">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
            <p className="text-gray-900">{user.emailAddress || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
            <p className="text-gray-900">{user.contactNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Alternate Contact</label>
            <p className="text-gray-900">{user.alternateContactNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">User Code</label>
            <p className="text-gray-900">{user.userCode || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
            <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Organization Roles
            </label>

            {user?.organizationRoles?.length > 0 ? (
              <div className="space-y-2">
                {Object.values(
                  user.organizationRoles.reduce((acc: any, orgRole: any) => {
                    if (!acc[orgRole.organizationName]) {
                      acc[orgRole.organizationName] = {
                        org: orgRole.organizationName,
                        roles: [],
                      };
                    }
                    acc[orgRole.organizationName].roles.push(orgRole.roleName.replace("ROLE_", ""));
                    return acc;
                  }, {})
                ).map((org: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{org.org}:</span>
                    <div className="flex flex-wrap gap-1">
                      {org.roles.map((role: string, roleIndex: number) => (
                        <span
                          key={roleIndex}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No organization roles assigned</span>
            )}
          </div>


          <div className='md:col-span-2'>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <p className="text-gray-900">{`${user.addressLine1}, ${user.villageName}, ${user.talukaName}, ${user.districtName}, ${user.pinCode}`}</p>
          </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Manager Name</label>
            <p className="text-gray-900">{user.managerName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Manager Email</label>
            <p className="text-gray-900">{user.managerEmail || '-'}</p>
          </div>

          {user.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;