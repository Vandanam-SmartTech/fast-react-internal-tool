import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Shield } from 'lucide-react';
import { getUserById } from '../../services/jwtService';
import { fetchOrganizations, Organization, assignMultipleUserOrgRoles } from '../../services/organizationService';
import { toast } from 'react-toastify';

const RoleManagement: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 2, name: 'ROLE_ORG_ADMIN', label: 'Organization Admin' },
    { id: 3, name: 'ROLE_AGENCY_ADMIN', label: 'Agency Admin' },
    { id: 4, name: 'ROLE_REPRESENTATIVE', label: 'Representative' },
    { id: 5, name: 'ROLE_CUSTOMER', label: 'Customer' },
    { id: 6, name: 'ROLE_STAFF', label: 'Staff' }
  ];

  useEffect(() => {
    if (id) {
      loadUser(parseInt(id));
      loadOrganizations();
    }
  }, [id]);

  const loadUser = async (userId: number) => {
    try {
      const { data } = await getUserById(userId);
      setUser(data);
      setSelectedRoles(data.roles?.map((role: any) => role.id) || []);
    } catch (error) {
      toast.error('Failed to load user');
      navigate('/user-management');
    }
  };

  const loadOrganizations = async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (selectedOrg && selectedRoles.length > 0) {
      await assignMultipleUserOrgRoles(parseInt(id!), parseInt(selectedOrg), selectedRoles.map(Number));
    }
    toast.success('User roles updated successfully');
    navigate('/user-management');
  } catch (error) {
    toast.error('Failed to update user roles');
  } finally {
    setLoading(false);
  }
};

  if (!user) return <div className="flex justify-center p-8">Loading...</div>;

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
          <Shield className="h-6 w-6" />
          Manage Roles - {user.nameAsPerGovId || user.username}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">{user.nameAsPerGovId || '-'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Roles</h2>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                  className="mr-3"
                />
                <label htmlFor={`role-${role.id}`} className="text-sm font-medium text-gray-700">
                  {role.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Organization *
          </label>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} {org.displayName && `(${org.displayName})`}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Users can have different roles in different organizations
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/user-management')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Update Roles'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleManagement;