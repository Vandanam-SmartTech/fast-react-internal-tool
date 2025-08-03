import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, User } from 'lucide-react';
import { getUserById } from '../../services/jwtService';
import { fetchOrganizations, Organization } from '../../services/organizationService';
import { toast } from 'react-toastify';

const UserOrgRolesDisplay: React.FC<{ userId: number }> = ({ userId }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRoles, setUserRoles] = useState<{ org: string; roles: string[] }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const orgs = await fetchOrganizations();
        setOrganizations(orgs);
        
        const rolesByOrg: { org: string; roles: string[] }[] = [];
        for (const org of orgs) {
          try {
            const response = await fetch(`${import.meta.env.VITE_JWT_API}/api/users/${userId}/organizations/${org.id}/roles`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
              }
            });
            if (response.ok) {
              const orgRoles = await response.json();
              if (orgRoles.length > 0) {
                rolesByOrg.push({
                  org: org.name,
                  roles: orgRoles.map((role: any) => role.name.replace('ROLE_', ''))
                });
              }
            }
          } catch (error) {
            console.error('Error loading roles for org', org.id);
          }
        }
        setUserRoles(rolesByOrg);
      } catch (error) {
        console.error('Failed to load organizations');
      }
    };

    loadData();
  }, [userId]);

  return (
    <div className="space-y-2">
      {userRoles.length > 0 ? (
        userRoles.map((orgRole, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{orgRole.org}:</span>
            <div className="flex flex-wrap gap-1">
              {orgRole.roles.map((role, roleIndex) => (
                <span key={roleIndex} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {role}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <span className="text-gray-500">No organization roles assigned</span>
      )}
    </div>
  );
};

const UserView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUser(parseInt(id));
    }
  }, [id]);

  const loadUser = async (userId: number) => {
    try {
      const { data } = await getUserById(userId);
      setUser(data);
    } catch (error) {
      toast.error('Failed to load user');
      navigate('/user-management');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!user) return <div className="flex justify-center p-8">User not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/user-management')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6" />
          User Details
        </h1>
        <button
          onClick={() => navigate(`/user-form/${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <p className="text-gray-900">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900">{user.nameAsPerGovId || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
            <p className="text-gray-900">{user.preferredName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <p className="text-gray-900">{user.emailAddress || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <p className="text-gray-900">{user.contactNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact</label>
            <p className="text-gray-900">{user.alternateContactNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Code</label>
            <p className="text-gray-900">{user.userCode || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-2 py-1 text-xs rounded-full ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Roles</label>
            <UserOrgRolesDisplay userId={parseInt(id!)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <p className="text-gray-900">{user.addressLine1 || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <p className="text-gray-900">{user.addressLine2 || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <p className="text-gray-900">{user.postalCode || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
            <p className="text-gray-900">{user.managerName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Email</label>
            <p className="text-gray-900">{user.managerEmail || '-'}</p>
          </div>

          {user.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;