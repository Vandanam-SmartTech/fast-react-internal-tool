import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Eye, Search, Shield } from 'lucide-react';
import { fetchRepresentativesPaginated, updateUser } from '../../services/jwtService';
import { fetchOrganizations, Organization } from '../../services/organizationService';
import { toast } from 'react-toastify';

const UserOrgRolesList: React.FC<{ userId: number; organizations: Organization[] }> = ({ userId, organizations }) => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const loadUserRoles = async () => {
      const roles: string[] = [];
      
      // Check parent organization roles
      for (const org of organizations) {
        try {
          const response = await fetch(`${import.meta.env.VITE_JWT_API}/api/users/${userId}/organizations/${org.id}/roles`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const orgRoles = await response.json();
            orgRoles.forEach((role: any) => {
              roles.push(`${role.name.replace('ROLE_', '')} (${org.name})`);
            });
          }
        } catch (error) {
          console.error('Error loading roles for org', org.id);
        }
        
        // Check agency roles for each organization
        try {
          const agenciesResponse = await fetch(`${import.meta.env.VITE_JWT_API}/api/organizations/${org.id}/children`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
              'Content-Type': 'application/json'
            }
          });
          if (agenciesResponse.ok) {
            const agenciesData = await agenciesResponse.json();
            for (const agency of agenciesData) {
              try {
                const agencyResponse = await fetch(`${import.meta.env.VITE_JWT_API}/api/users/${userId}/organizations/${agency.id}/roles`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (agencyResponse.ok) {
                  const agencyRoles = await agencyResponse.json();
                  agencyRoles.forEach((role: any) => {
                    roles.push(`${role.name.replace('ROLE_', '')} (${agency.name})`);
                  });
                }
              } catch (error) {
                console.error('Error loading roles for agency', agency.id);
              }
            }
          }
        } catch (error) {
          console.error('Error loading agencies for org', org.id);
        }
      }
      
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
          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {role}
          </span>
        ))
      ) : (
        <span className="text-xs text-gray-400">No roles assigned</span>
      )}
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to load organizations');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_JWT_API}/api/users/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(term.toLowerCase()) ||
      user.nameAsPerGovId?.toLowerCase().includes(term.toLowerCase()) ||
      user.emailAddress?.toLowerCase().includes(term.toLowerCase()) ||
      user.contactNumber?.includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await updateUser(userId, { isActive: false });
        toast.success('User deactivated successfully');
        loadUsers();
      } catch (error) {
        toast.error('Failed to deactivate user');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6" />
          User Management
        </h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => navigate('/user-form')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.nameAsPerGovId || user.preferredName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.emailAddress || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.contactNumber || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role: any, index: number) => (
                      <span key={`global-${index}`} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {role.name.replace('ROLE_', '')} (Global)
                      </span>
                    ))}
                    {user.organizationRoles?.map((orgRole: any, index: number) => (
                      <span key={`org-${index}`} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {orgRole.roleName.replace('ROLE_', '')} ({orgRole.organizationName})
                      </span>
                    ))}
                    {(!user.roles?.length && !user.organizationRoles?.length) && (
                      <span className="text-xs text-gray-400">No roles assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/user-view/${user.id}`)}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/user-form/${user.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/user-org-roles/${user.id}`)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Manage Organization Roles"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No users match your search' : 'No users found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;