import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Plus, Trash2 } from 'lucide-react';
import { getUserById } from '../../services/jwtService';
import { fetchOrganizations, Organization, fetchUserOrgRoles, UserOrgRole } from '../../services/organizationService';
import { toast } from 'react-toastify';

// interface UserOrgRole {
//   organizationId: number;
//   organizationName: string;
//   roles: { id: number; name: string }[];
// }

const UserOrgRoles: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userOrgRoles, setUserOrgRoles] = useState<UserOrgRole[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    organizationId: '',
    roleId: ''
  });
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

const loadUserOrgRoles = async () => {
  try {
    const orgRoles: UserOrgRole[] = await fetchUserOrgRoles(id, organizations);
    setUserOrgRoles(orgRoles);
  } catch (error) {
    console.error('Failed to load user organization roles', error);
  }
};

  useEffect(() => {
    if (organizations.length > 0 && id) {
      loadUserOrgRoles();
    }
  }, [organizations, id]);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`${import.meta.env.VITE_JWT_API}/api/users/${id}/organizations/${newAssignment.organizationId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parseInt(newAssignment.roleId))
      });
      
      toast.success('Role assigned successfully');
      setNewAssignment({ organizationId: '', roleId: '' });
      setShowAddForm(false);
      loadUserOrgRoles();
    } catch (error) {
      toast.error('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (orgId: number, roleId: number) => {
    if (window.confirm('Are you sure you want to remove this role?')) {
      try {
        await fetch(`${import.meta.env.VITE_JWT_API}/api/users/${id}/organizations/${orgId}/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success('Role removed successfully');
        loadUserOrgRoles();
      } catch (error) {
        toast.error('Failed to remove role');
      }
    }
  };

  if (!user) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/user-management')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Organization Roles - {user.nameAsPerGovId || user.username}
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Role to Organization</h2>
          <form onSubmit={handleAddRole} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
              <select
                value={newAssignment.organizationId}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, organizationId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={newAssignment.roleId}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, roleId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userOrgRoles.map((orgRole) => (
              <tr key={orgRole.organizationId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {orgRole.organizationName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {orgRole.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {roles.find(r => r.name === role.name)?.label || role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {orgRole.roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRemoveRole(orgRole.organizationId, role.id)}
                        className="text-red-600 hover:text-red-900"
                        title={`Remove ${role.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {userOrgRoles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No organization roles assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrgRoles;