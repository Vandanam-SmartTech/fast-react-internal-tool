import React, { useState, useEffect } from 'react';
import { UserPlus, Building, Users, Shield, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { fetchOrganizations, createAdminUser, Organization, getChildOrganizations } from '../../services/organizationService';
import { fetchAdmins, fetchRegularUsers, assignUserRole } from '../../services/jwtService';
import { getAllRoles, createRole, updateRole, deleteRole, RoleDto } from '../../services/roleService';
import { getDistrictNameByCode, fetchDistricts, fetchTalukas, fetchVillages } from '../../services/jwtService';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';


const AdminManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'promote' | 'list' | 'roles'>('roles');
  const [newRole, setNewRole] = useState({ name: '' });
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [loading, setLoading] = useState(false);
  const { userClaims } = useUser();
  const isSuperAdmin = userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN");

  const [confirmEmailAddress, setConfirmEmailAddress] = useState("");
  const [confirmContactNumber, setConfirmContactNumber] = useState("");

  const [showAlternateContact, setShowAlternateContact] = useState(false);
  const [alternateContactNumber, setAlternateContactNumber] = useState("");

  const [showMobile, setShowMobile] = useState(false);
  const handleToggleMobile = () => setShowMobile(!showMobile);

  const [showEmail, setShowEmail] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [pinCode, setPinCode] = useState<string>("");
  const [villageCode, setVillageCode] = useState<number>(0);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");


  if (!isSuperAdmin) return null;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nameAsPerGovId: '',
    emailAddress: '',
    userCode: '',
    contactNumber: '',
    alternateContactNumber: '',
    preferredName: '',
    villageCode: 0,
    pinCode: '',
    addressLine1: '',
    addressLine2: '',
    isActive: true,
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

  interface District {
    code: number;
    nameEnglish: string;
  }

  interface Taluka {
    code: number;
    nameEnglish: string;
  }

  interface Village {
    code: number;
    nameEnglish: string;
    pinCode: string;
  }

  useEffect(() => {
    const fetchDistrictsData = async () => {
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistrictsData();
  }, []);

  useEffect(() => {
    if (districtCode) {
      getDistrictNameByCode(districtCode)
        .then((name) => setDistrictName(name))
        .catch(() => setDistrictName("Unknown District"));
    }
  }, [districtCode]);

  useEffect(() => {
    const fetchTalukasData = async () => {
      if (districtCode) {
        try {
          const talukaData = await fetchTalukas(districtCode);
          setTalukas(talukaData);
        } catch (err) {
          console.error('Error fetching talukas:', err);
        }
      } else {
        setTalukas([]);
      }
    };
    fetchTalukasData();
  }, [districtCode]);

  useEffect(() => {
    const fetchVillagesData = async () => {
      if (talukaCode) {
        try {
          const villageData = await fetchVillages(talukaCode);
          setVillages(villageData);
        } catch (err) {
          console.error('Error fetching villages:', err);
        }
      } else {
        setVillages([]);
      }
    };
    fetchVillagesData();
  }, [talukaCode]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setTalukaCode(0);
    setVillageCode(0);
    setTalukaName("");
    setVillageName("");
    setPinCode("");
    setFormData((prev) => ({
      ...prev,
      districtCode: value,
      talukaCode: 0,
      villageCode: 0,
      pinCode: "",
    }));
  };

  const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setTalukaCode(value);

    setVillageCode(0);
    setVillageName("");
    setPinCode("");
    setFormData((prev) => ({
      ...prev,
      talukaCode: value,
      villageCode: 0,
      pinCode: "",
    }));
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const selectedVillage = villages.find((village) => village.code === value);

    if (selectedVillage) {
      setVillageCode(value);
      setPinCode(selectedVillage.pinCode || "");
      setFormData((prev) => ({
        ...prev,
        villageCode: value,
        pinCode: selectedVillage.pinCode,
      }));
    }
  };

  const handlepinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPinCode(value);
    setFormData((prev) => ({ ...prev, pinCode: value }));
    console.log("Current state PINcode:", value);
  };

  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmEmailAddress(value);
  };

  const handleConfirmContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmContactNumber(value);
  };



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
      toast.error('Failed to load users', {
        autoClose: 1000,
        hideProgressBar: true,
      });
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
        userCode: '',
        contactNumber: '',
        alternateContactNumber: '',
        preferredName: '',
        villageCode: 0,
        pinCode: '',
        addressLine1: '',
        addressLine2: '',
        isActive: true,
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
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    if (name === 'emailAddress' && value === '') {
      setConfirmEmailAddress('');
    }

    if (name === 'contactNumber' && value === '') {
      setConfirmContactNumber('');
    }

    if (name === 'contactNumber') {
      if (value !== confirmContactNumber) {
        setConfirmContactNumber('');

      }

    }

    if (name === 'emailAddress') {
      if (value !== confirmEmailAddress) {
        setConfirmEmailAddress('');

      }

    }

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

      toast.success('Role assigned successfully', {
        autoClose: 1000,
        hideProgressBar: true,
      });
      loadUsers();
      loadAdmins();
      setPromoteData({ userId: '', roleId: '', organizationId: '', agencyId: '' });
      setAgencies([]);
    } catch (error) {
      toast.error('Failed to assign role', {
        hideProgressBar: true,
        autoClose: 1000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          Role Management
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage user roles and assign them to organizations
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${activeTab === 'roles' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} flex items-center justify-center sm:justify-start`}
          >
            <Shield className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Manage Roles</span>
            <span className="sm:hidden">Manage Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} flex items-center justify-center sm:justify-start`}
          >
            <Users className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">List Admin Users</span>
            <span className="sm:hidden">List Admin Users</span>
          </button>
          <button
            onClick={() => setActiveTab('promote')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${activeTab === 'promote' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} flex items-center justify-center sm:justify-start`}
          >
            <Shield className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Assign Role</span>
            <span className="sm:hidden">Assign Role</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} flex items-center justify-center sm:justify-start`}
          >
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create User with Role</span>
            <span className="sm:hidden">Create User with Role</span>
          </button>
        </div>
      </div>

      {activeTab === 'roles' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Create New Role */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createRole(newRole);
                toast.success('Role created successfully', {
                  autoClose: 1000,
                  hideProgressBar: true,
                });
                setNewRole({ name: '' });
                await loadRoles();
              } catch (error) {
                toast.error('Failed to create role', {
                  autoClose: 1000,
                  hideProgressBar: true,
                });
              }
            }} className="flex flex-col sm:flex-row gap-4">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            </form>
          </div>

          {/* Roles List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th> */}
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
                          <span className={`px-2 py-1 text-xs rounded-full ${role.name === 'ROLE_SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                            role.name.includes('ADMIN') ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {role.name}
                          </span>
                        )}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {roles.map((role) => (
                <div key={role.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">ID: {role.id}</span>
                      </div>
                      <div className="mb-3">
                        {editingRole?.id === role.id ? (
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${role.name === 'ROLE_SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                            role.name.includes('ADMIN') ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {role.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* <div className="flex space-x-2 ml-4">
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
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="text-gray-600 hover:text-gray-900 text-sm"
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
                    </div> */}
                  </div>
                </div>
              ))}
            </div>

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
          {/* Desktop Table View */}
          <div className="hidden lg:block">
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
                      <span className={`px-2 py-1 text-xs rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
          </div>

          {/* Tablet View */}
          <div className="hidden md:block lg:hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div>{admin.nameAsPerGovId || admin.preferredName || '-'}</div>
                        <div className="text-xs text-gray-500">{admin.emailAddress || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.username}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {admins.map((admin) => (
              <div key={admin.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {admin.nameAsPerGovId || admin.preferredName || '-'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{admin.username}</p>
                    <p className="text-xs text-gray-500 truncate">{admin.emailAddress || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => window.open(`/user-view/${admin.id}`, '_blank')}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
              </div>
            ))}
          </div>

          {admins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No admin users found
            </div>
          )}
        </div>
      )}

      {activeTab === 'promote' && (
        <form onSubmit={handlePromoteUser} className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Role to User</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
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
              <div className="lg:col-span-2">
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

          <div className="flex justify-end gap-4 mt-6 sm:mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New User with Role</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name as per Gov ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameAsPerGovId"
                value={formData.nameAsPerGovId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z][A-Za-z\s]*$/.test(value) || value === "") {
                    handleChange(e);
                  }
                }}
                placeholder="Name as per Gov ID"
                required
                maxLength={50}
                title="Please enter only your first and last name (e.g., John Doe)"
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />

              {formData.nameAsPerGovId?.trim().length > 0 &&
                formData.nameAsPerGovId.trim().length < 2 && (
                  <p className="text-red-600 text-sm mt-1">
                    Name must be at least 2 characters long
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
              <input
                type="text"
                name="preferredName"
                value={formData.preferredName}
                placeholder="Preferred name"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[A-Za-z][A-Za-z\s]*$/.test(value) || value === "") {
                    handleChange(e);
                  }
                }}
                maxLength={50}
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />
              {formData.preferredName && !/^[A-Za-z\s]*$/.test(formData.preferredName) && (
                <p className="text-red-500 text-sm mt-1">Only letters and spaces are allowed.</p>
              )}

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                placeholder="Username"
                onChange={handleChange}
                required
                maxLength={30}
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userCode"
                value={formData.userCode}
                placeholder="User Code"
                onChange={handleChange}
                required
                maxLength={30}
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>

              <div className="relative flex mt-1">
                {/* Country Code Box */}
                <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-200 text-gray-700 text-sm">
                  +91
                </span>

                <input
                  type={showMobile ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[6-9]{1}[0-9]{9}"
                  maxLength={10}
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[6-9][0-9]*$/.test(value) || value === "") {
                      if (value.length <= 10) {
                        handleChange(e);
                      }
                    }
                  }}
                  placeholder="9567023456"
                  required
                  className="w-full px-3 py-2.5 border rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  title="Enter a valid 10-digit mobile number starting with 6-9"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
              </div>

              {formData.contactNumber?.length > 0 &&
                !/^[6-9]{1}[0-9]{0,9}$/.test(formData.contactNumber) && (
                  <p className="text-red-600 text-sm mt-1">
                    Enter a valid 10-digit mobile number starting with 6-9
                  </p>
                )}

              {/* {mobileExists && (
                  <p className="text-red-600 text-sm mt-1">Mobile number already exists</p>
                )} */}
            </div>


            {/* Confirm Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Contact Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="confirmContactNumber"
                value={confirmContactNumber}
                onChange={handleConfirmContactChange}
                placeholder="Confirm contact number"
                maxLength={10}
                pattern="[6-9]{1}[0-9]{9}"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                title="Re-enter the same 10-digit mobile number"
                disabled={!(
                  /^[6-9]{1}[0-9]{9}$/.test(formData.contactNumber)
                )}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}

              />
              {confirmContactNumber &&
                confirmContactNumber !== formData.contactNumber && (
                  <p className="text-red-600 text-sm mt-1">Contact numbers do not match</p>
                )}
            </div>

            {/* <div className="mt-3">
  {!showAlternateContact ? (
    <button
      type="button"
      onClick={() => setShowAlternateContact(true)}
      className="text-blue-600 text-sm hover:underline"
    >
      + Add Alternate Contact Number
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        setShowAlternateContact(false);
        setAlternateContactNumber("");
      }}
      className="text-red-600 text-sm hover:underline"
    >
      - Remove Alternate Contact Number
    </button>
  )}
</div>

{showAlternateContact && (
  <div className="mt-3">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Alternate Contact Number (Optional)
    </label>

    <div className="relative flex mt-1">
      <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-200 text-gray-700 text-sm">
        +91
      </span>

      <input
        type="text"
        inputMode="numeric"
        maxLength={10}
        value={formData.alternateContactNumber}
        onChange={(e) => {
          const value = e.target.value;
          if (/^[6-9][0-9]*$/.test(value) || value === "") {
            if (value.length <= 10) {
              setAlternateContactNumber(value);
            }
          }
        }}
        placeholder="Optional number"
        className="w-full px-3 py-2.5 border rounded-r-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
        title="Enter a valid 10-digit mobile number starting with 6-9"
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      />
    </div>

    {alternateContactNumber &&
      !/^[6-9]{1}[0-9]{0,9}$/.test(alternateContactNumber) && (
        <p className="text-red-600 text-sm mt-1">
          Enter a valid 10-digit mobile number starting with 6-9
        </p>
      )}
  </div>
)} */}



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>

              <input
                type={showEmail ? "text" : "password"}
                name="emailAddress"
                value={formData.emailAddress}
                onChange={(e) => {
                  const value = e.target.value;

                  if (
                    value === "" ||
                    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(
                      value
                    )
                  ) {
                    handleChange(e);
                  } else {
                    handleChange(e);
                  }
                }}
                placeholder="johndoe@example.com"
                maxLength={50}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />

              {/* Error messages */}
              {formData.emailAddress && !/^[a-zA-Z0-9]/.test(formData.emailAddress) && (
                <p className="text-red-600 text-sm mt-1">
                  Email must start with a letter or number
                </p>
              )}

              {formData.emailAddress && /\.\./.test(formData.emailAddress) && (
                <p className="text-red-600 text-sm mt-1">
                  Email cannot contain consecutive dots
                </p>
              )}

              {formData.emailAddress && /\.@/.test(formData.emailAddress) && (
                <p className="text-red-600 text-sm mt-1">
                  Email cannot end with a dot before @
                </p>
              )}

              {formData.emailAddress &&
                !/^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(
                  formData.emailAddress
                ) &&
                !/\.\./.test(formData.emailAddress) &&
                !/\.@/.test(formData.emailAddress) &&
                /^[a-zA-Z0-9]/.test(formData.emailAddress) && (
                  <p className="text-red-600 text-sm mt-1">Enter a valid email address</p>
                )}

            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="confirmEmailAddress"
                value={confirmEmailAddress}
                onChange={handleConfirmEmailChange}
                placeholder="Confirm email address"
                maxLength={50}
                pattern="^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                title="Re-enter the same email"
                disabled={!(
                  /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(formData.emailAddress)
                )}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
              {formData.emailAddress &&
                confirmEmailAddress &&
                confirmEmailAddress !== formData.emailAddress && (
                  <p className="text-red-600 text-sm mt-1">Email Address do not match</p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                value={districtCode}
                onChange={handleDistrictChange}
                required
                className="w-full px-2 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={0}>{districtName || "Select District"}</option>
                {districts.map((district) => (
                  <option key={district.nameEnglish} value={district.code}>
                    {district.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taluka <span className="text-red-500">*</span>
              </label>
              <select
                name="talukaCode"
                value={talukaCode}
                onChange={handleTalukaChange}
                required
                className="w-full px-2 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={0}>{talukaName || "Select Taluka"}</option>
                {talukas.map((taluka) => (
                  <option key={taluka.nameEnglish} value={taluka.code}>
                    {taluka.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village
              </label>
              <select
                name="villageCode"
                value={villageCode}
                onChange={handleVillageChange}
                className="w-full px-2 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={0}>{villageName || "Select Village"}</option>
                {villages.map((village) => (
                  <option key={village.code} value={village.code}>
                    {village.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handlepinCodeChange}
                placeholder="e.g. 416000"
                title="Pincode must be exactly 6 digits (0-9)"
                maxLength={6}
                inputMode="numeric"
                required
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="e.g. Flat No, House No, Street Name"
                pattern="^[A-Za-z0-9\s,.\/#-]{5,100}$"
                title="Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
                maxLength={100}
                required
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="e.g. Apartment, Suite, Unit, Building"
                pattern="^[A-Za-z0-9\s,.\/#-]{5,100}$"
                title="Address must be 5-100 characters, alphanumeric with spaces, commas, dots, slashes, and hyphens"
                maxLength={100}
                className="w-full px-3 py-2.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
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

          <div className="flex justify-end gap-4 mt-6 sm:mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      )}
      
{/* 
      {activeTab === 'create' && organizations.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Available Organizations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{org.name}</h3>
                {org.displayName && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{org.displayName}</p>
                )}
                {org.contactNumber && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{org.contactNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AdminManagement;