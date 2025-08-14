import React, { useState, useEffect } from 'react';
import { UserPlus, Building, Users, Shield, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { fetchOrganizations, createAdminUser, Organization, getChildOrganizations, getUserRolesWithAgencies } from '../../services/organizationService';
import { fetchAdmins, fetchRegularUsers,assignUserRole } from '../../services/jwtService';
import { getAllRoles, createRole, updateRole, deleteRole, RoleDto } from '../../services/roleService';
import { toast } from 'react-toastify';


const AdminOrgRolesList: React.FC<{ userId: number; organizations: Organization[] }> = ({ userId, organizations }) => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
  const loadUserRoles = async () => {
    const roles = await getUserRolesWithAgencies(userId, organizations);
    setUserRoles(roles);
  };

  if (organizations.length > 0) {
    loadUserRoles();
  }
}, [userId, organizations]);

  return (
    <div className="flex flex-wrap gap-1">
      {userRoles.length > 0 ? (
        userRoles.map((role, index) => (
          <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            {role}
          </span>
        ))
      ) : (
        <span className="text-xs text-gray-400">No admin roles</span>
      )}
    </div>
  );
};

const AdminManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'promote' | 'list' | 'roles'>('list');
  const [newRole, setNewRole] = useState({ name: '' });
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nameAsPerGovId: '',
    emailAddress: '',
    contactNumber: '',
    organizationId: '',
    roleIds: [] // Will be set based on selected role
  });
  const [promoteData, setPromoteData] = useState({
    userId: '',
    roleId: '', // Will be set from dropdown
    organizationId: '',
    agencyId: ''
  });
  const [agencies, setAgencies] = useState<Organization[]>([]);

  useEffect(() => {
    loadOrganizations();
    loadUsers();
    loadRoles();
  }, []);

  useEffect(() => {
    if (organizations.length > 0) {
      loadAdmins();
    }
  }, [organizations]);

  const loadOrganizations = async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
    }
  };

const loadUsers = async () => {
  try {
    const regularUsers = await fetchRegularUsers();
    setUsers(regularUsers);
  } catch (error) {
    toast.error('Failed to load users');
  }
};


  const loadRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      toast.error('Failed to load roles');
    }
  };

const loadAdmins = async () => {
  try {
    const admins = await fetchAdmins();
    setAdmins(admins);
  } catch (error) {
    toast.error('Failed to load admins');
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        ...formData,
        isActive: true,
        organizationId: parseInt(formData.organizationId)
      };
      
      await createAdminUser(userData);
      toast.success('Admin user created successfully');
      loadAdmins();
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        nameAsPerGovId: '',
        emailAddress: '',
        contactNumber: '',
        organizationId: '',
        roleIds: []
      });
    } catch (error) {
      toast.error('Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePromoteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromoteData(prev => ({ ...prev, [name]: value }));
    
    // Load agencies when organization is selected and role is agency admin
    const selectedRole = roles.find(r => r.id?.toString() === promoteData.roleId);
    if (name === 'organizationId' && selectedRole?.name === 'ROLE_AGENCY_ADMIN' && value) {
      loadAgencies(parseInt(value));
    }
    
    // Load agencies when role changes to agency admin
    const newRole = roles.find(r => r.id?.toString() === value);
    if (name === 'roleId' && newRole?.name === 'ROLE_AGENCY_ADMIN' && promoteData.organizationId) {
      loadAgencies(parseInt(promoteData.organizationId));
    }
    
    // Clear agencies when organization changes
    if (name === 'organizationId') {
      setPromoteData(prev => ({ ...prev, agencyId: '' }));
      if (!value) {
        setAgencies([]);
      }
    }
    
    // Clear agency selection when role changes away from agency admin
    if (name === 'roleId' && newRole?.name !== 'ROLE_AGENCY_ADMIN') {
      setPromoteData(prev => ({ ...prev, agencyId: '' }));
      setAgencies([]);
    }
  };

  const loadAgencies = async (parentId: number) => {
    try {
      console.log('Loading agencies for parent org:', parentId);
      const data = await getChildOrganizations(parentId);
      console.log('Loaded agencies:', data);
      setAgencies(data);
    } catch (error) {
      console.error('Failed to load agencies:', error);
      setAgencies([]);
    }
  };

  const handlePromoteUser = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const selectedRole = roles.find(r => r.id?.toString() === promoteData.roleId);
    const isAgencyAdmin = selectedRole?.name === 'ROLE_AGENCY_ADMIN';

    const targetOrgId =
      isAgencyAdmin && promoteData.agencyId
        ? promoteData.agencyId
        : promoteData.organizationId;

    await assignUserRole(promoteData.userId, targetOrgId, promoteData.roleId);

    toast.success('Role assigned successfully');
    loadUsers();
    loadAdmins();
    setPromoteData({ userId: '', roleId: '', organizationId: '', agencyId: '' });
    setAgencies([]);
  } catch (error) {
    toast.error('Failed to assign role');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Role Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage user roles and assign them to organizations
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'roles' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Manage Roles
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            List Admin Users
          </button>
          <button
            onClick={() => setActiveTab('promote')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'promote' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Assign Role
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Create User with Role
          </button>
        </div>
      </div>

      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Create New Role */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createRole(newRole);
                toast.success('Role created successfully');
                setNewRole({ name: '' });
                loadRoles();
              } catch (error) {
                toast.error('Failed to create role');
              }
            }} className="flex gap-4">
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ name: e.target.value })}
                placeholder="Role name (e.g., ROLE_CUSTOM_ADMIN)"
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            </form>
          </div>

          {/* Roles List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingRole?.id === role.id ? (
                        <input
                          type="text"
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          role.name === 'ROLE_SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          role.name.includes('ADMIN') ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {role.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingRole?.id === role.id ? (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  await updateRole(role.id!, editingRole);
                                  toast.success('Role updated successfully');
                                  setEditingRole(null);
                                  loadRoles();
                                } catch (error) {
                                  toast.error('Failed to update role');
                                }
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRole(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingRole(role)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Role"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {role.name !== 'ROLE_SUPER_ADMIN' && (
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this role?')) {
                                    try {
                                      await deleteRole(role.id!);
                                      toast.success('Role deleted successfully');
                                      loadRoles();
                                    } catch (error) {
                                      toast.error('Failed to delete role');
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Role"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {roles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No roles found
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {admin.nameAsPerGovId || admin.preferredName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.emailAddress || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {admin.roles?.filter((role: any) => role.name === 'ROLE_SUPER_ADMIN').map((role: any, index: number) => (
                        <span key={`global-${index}`} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {role.name.replace('ROLE_', '')} (Global)
                        </span>
                      ))}
                      {admin.organizationRoles?.filter((orgRole: any) => 
                        ['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(orgRole.roleName)
                      ).map((orgRole: any, index: number) => (
                        <span key={`org-${index}`} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {orgRole.roleName.replace('ROLE_', '')} ({orgRole.organizationName})
                        </span>
                      ))}
                      {(!admin.roles?.some((role: any) => role.name === 'ROLE_SUPER_ADMIN') && 
                        !admin.organizationRoles?.some((orgRole: any) => ['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(orgRole.roleName))) && (
                        <span className="text-xs text-gray-400">No admin roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => window.open(`/user-view/${admin.id}`, '_blank')}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No admin users found
            </div>
          )}
        </div>
      )}

      {activeTab === 'promote' && (
        <form onSubmit={handlePromoteUser} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Role to User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User *
              </label>
              <select
                name="userId"
                value={promoteData.userId}
                onChange={handlePromoteChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nameAsPerGovId || user.username} ({user.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="roleId"
                value={promoteData.roleId}
                onChange={handlePromoteChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.filter(role => role.name !== 'ROLE_SUPER_ADMIN').map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name.replace('ROLE_', '').replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Organization *
              </label>
              <select
                name="organizationId"
                value={promoteData.organizationId}
                onChange={handlePromoteChange}
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
            </div>

            {roles.find(r => r.id?.toString() === promoteData.roleId)?.name === 'ROLE_AGENCY_ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Agency *
                </label>
                <select
                  name="agencyId"
                  value={promoteData.agencyId}
                  onChange={handlePromoteChange}
                  required
                  disabled={!promoteData.organizationId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Agency</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name} {agency.displayName && `(${agency.displayName})`}
                    </option>
                  ))}
                </select>
                {!promoteData.organizationId && (
                  <p className="text-sm text-gray-500 mt-1">Select organization first</p>
                )}
                {promoteData.organizationId && agencies.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">No agencies found for this organization</p>
                )}
                {promoteData.organizationId && agencies.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">{agencies.length} agencies available</p>
                )}
              </div>
            )}
          </div>
          
          {roles.find(r => r.id?.toString() === promoteData.roleId)?.name === 'ROLE_AGENCY_ADMIN' && !promoteData.agencyId && promoteData.organizationId && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> For Agency Admin role, you must select a specific agency.
              </p>
            </div>
          )}
          
          {roles.find(r => r.id?.toString() === promoteData.roleId)?.name && !['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(roles.find(r => r.id?.toString() === promoteData.roleId)?.name || '') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Info:</strong> This role will be assigned to the selected organization.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New User with Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="nameAsPerGovId"
              value={formData.nameAsPerGovId}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              name="roleIds"
              value={formData.roleIds[0] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, roleIds: e.target.value ? [parseInt(e.target.value)] : [] }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              {roles.filter(role => role.name !== 'ROLE_SUPER_ADMIN').map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.replace('ROLE_', '').replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Organization *
            </label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
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
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
        </form>
      )}

      {activeTab === 'create' && organizations.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Available Organizations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{org.name}</h3>
                {org.displayName && (
                  <p className="text-sm text-gray-600">{org.displayName}</p>
                )}
                {org.contactNumber && (
                  <p className="text-sm text-gray-500 mt-1">{org.contactNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;