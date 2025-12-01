import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Eye, Search, Shield, Filter, Mail, Phone, User, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { fetchAllUsers, deleteUser, getAllRoles } from '../../services/jwtService';
import { fetchOrganizations, Organization, fetchAllUsersByOrgId } from '../../services/organizationService';
import { toast } from 'react-toastify';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, Alert } from '@mui/material';
import { useUser } from '../../contexts/UserContext';


const UserManagement: React.FC = () => {
  const { userClaims } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  //const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");
  //const [userRole, setUserRole] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);



  useEffect(() => {
    if (!userClaims) return;

    const storedUserInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
    setUserInfo(storedUserInfo);

    // Determine user role
    if (userClaims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
      setUserRole("ROLE_SUPER_ADMIN");
      loadOrganizations();
      loadAllUsers();
    } else if (
      storedUserInfo?.role === "ROLE_ORG_ADMIN" ||
      storedUserInfo?.role === "ROLE_AGENCY_ADMIN"
    ) {
      setUserRole(storedUserInfo.role);
      loadUsersByOrg(storedUserInfo.orgId);
    }

    
    loadRoles();
  }, [userClaims]);

  const loadRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles", error);
    }
  };

  // Filter roles based on logged-in user
  const getFilteredRoles = () => {
    if (userRole === "ROLE_SUPER_ADMIN") {
      return roles; // show all roles
    } else if (userRole === "ROLE_ORG_ADMIN") {
      return roles.filter((r) => r.name !== "ROLE_SUPER_ADMIN");
    } else if (userRole === "ROLE_AGENCY_ADMIN") {
      return roles.filter(
        (r) =>
          ![
            "ROLE_SUPER_ADMIN",
            "ROLE_ORG_ADMIN",
            "ROLE_ORG_STAFF",
            "ROLE_ORG_REPRESENTATIVE",
          ].includes(r.name)
      );
    } else {
      return []; // if other roles shouldn't see anything
    }
  };



  const loadOrganizations = async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error("Failed to load organizations");
    }
  };

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

const loadUsersByOrg = async (organizationId: string | number) => {
  try {
    setLoading(true);
    const data = await fetchAllUsersByOrgId(organizationId);

    if (data?.success === false && data?.message?.includes("Users not found")) {
      setUsers([]);
      setFilteredUsers([]);
      return;
    }

    setUsers(data);
    setFilteredUsers(data);
  } catch (error: any) {
    if (!error.response?.data?.message?.includes("Users not found")) {
      toast.error("Failed to load organization users",{
        autoClose:1000,
        hideProgressBar:true
      });
    } else {
      setUsers([]);
      setFilteredUsers([]);
    }
  } finally {
    setLoading(false);
  }
};


  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter, roleFilter);
  };

  const applyFilters = (search: string, status: string, role: string) => {
    let filtered = users.filter(user => {
      const matchesSearch =
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.nameAsPerGovId?.toLowerCase().includes(search.toLowerCase()) ||
        user.emailAddress?.toLowerCase().includes(search.toLowerCase()) ||
        user.contactNumber?.includes(search);

      const matchesStatus = status === 'all' ||
        (status === 'active' && user.isActive) ||
        (status === 'inactive' && !user.isActive);

      const matchesRole = role === 'all' ||
        user.roles?.some((r: any) => r.name.includes(role)) ||
        user.organizationRoles?.some((r: any) => r.roleName.includes(role));

      return matchesSearch && matchesStatus && matchesRole;
    });

    setFilteredUsers(filtered);
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    applyFilters(searchTerm, status, roleFilter);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    applyFilters(searchTerm, statusFilter, role);
  };

  const handleDelete = (userId: number) => {
    setDialogType("confirm");
    setDialogMessage("Do you really want to delete this user?");
    setDialogAction(() => async () => {
      setLoading(true);
      try {
        const result = await deleteUser(userId);

        if (result.success) {
          toast.success("User deactivated successfully", {
            autoClose: 1000,
            hideProgressBar: true,
          });

          if (userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) {
            await loadAllUsers();
          } else if (
            userInfo?.role === "ROLE_ORG_ADMIN" ||
            userInfo?.role === "ROLE_AGENCY_ADMIN"
          ) {
            await loadUsersByOrg(userInfo?.orgId);
          }
        } else {
          toast.error("Failed to deactivate user");
        }
      } catch (error) {
        toast.error("An error occurred while deactivating the user");
      } finally {
        setLoading(false);
      }
    });
    setDialogOpen(true);
  };



  const getRoleBadgeColor = (roleName: string) => {
    if (roleName.includes('SUPER_ADMIN')) return 'badge-error';
    if (roleName.includes('ORG_ADMIN')) return 'badge-warning';
    if (roleName.includes('AGENCY_ADMIN')) return 'badge-success';
    if (roleName.includes('STAFF')) return 'badge-primary';
    if (roleName.includes('REPRESENTATIVE')) return 'badge-secondary';
    return 'badge-ghost';
  };

  const UserCard: React.FC<{ user: any }> = ({ user }) => (
    <Card className="hover:shadow-medium transition-all duration-200" hover={true}>
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">
                {user.nameAsPerGovId || user.preferredName || 'Unnamed User'}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">@{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.isActive ? (
              <CheckCircle className="h-5 w-5 text-success-600" />
            ) : (
              <XCircle className="h-5 w-5 text-error-600" />
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {user.emailAddress && (
            <div className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
              <Mail className="h-4 w-4" />
              <span>{user.emailAddress}</span>
            </div>
          )}
          {user.contactNumber && (
            <div className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
              <Phone className="h-4 w-4" />
              <span>+91 {user.contactNumber}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-secondary-700 mb-2">Roles</h4>
          <div className="flex flex-wrap gap-1">
            {user.roles?.map((role: any, index: number) => (
              <span key={`global-${index}`} className={`badge ${getRoleBadgeColor(role.name)} text-xs`}>
                {role.name.replace('ROLE_', '')} (Global)
              </span>
            ))}
            {user.organizationRoles?.map((orgRole: any, index: number) => (
              <span key={`org-${index}`} className={`badge ${getRoleBadgeColor(orgRole.roleName)} text-xs`}>
                {orgRole.roleName.replace('ROLE_', '')} ({orgRole.organizationName})
              </span>
            ))}
            {(!user.roles?.length && !user.organizationRoles?.length) && (
              <span className="text-xs text-secondary-600 dark:text-secondary-300">No roles assigned</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              title="View User"
              onClick={() => navigate("/user-view", { state: { userId: user.id } })}
              className="p-1 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Edit User"
              onClick={() => navigate("/edit-user", { state: { userId: user.id } })}
              className="p-1 h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Manage Role"
              onClick={() => navigate("/user-org-roles", { state: { userId: user.id } })}
              className="p-1 h-8 w-8"
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Delete User"
              onClick={() => handleDelete(user.id)}
              className="p-1 h-8 w-8 text-error-600 hover:text-error-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
            <span className="text-secondary-700 dark:text-secondary-300">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-secondary-700 dark:text-secondary-300 mt-1">Manage system users, roles, and permissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            leftIcon={viewMode === 'table' ? <Users className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button> */}


          <Button
            variant="primary"
            onClick={() => navigate('/user-form')}
            leftIcon={<Plus className="h-5 w-5" />}
            className="px-6 py-3 text-base"
          >
            Add User
          </Button>

        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search users by name, username, email, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="form-select w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="form-select w-full border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All Roles</option>
                {getFilteredRoles().map((role) => (
                  <option key={role.id} value={role.name.replace("ROLE_", "")}>
                    {role.name.replace("ROLE_", "").replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('all')}
                >
                  All ({users.length})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('active')}
                >
                  Active ({users.filter(u => u.isActive).length})
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('inactive')}
                >
                  Inactive ({users.filter(u => !u.isActive).length})
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Total Users</p>
                <p className="text-2xl font-bold text-primary-900">{users.length}</p>
              </div>
              <div className="p-2 bg-primary-200 rounded-lg">
                <Users className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-success-50 to-success-100 border-success-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600">Active Users</p>
                <p className="text-2xl font-bold text-success-900">{users.filter(u => u.isActive).length}</p>
              </div>
              <div className="p-2 bg-success-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning-600">Inactive Users</p>
                <p className="text-2xl font-bold text-warning-900">{users.filter(u => !u.isActive).length}</p>
              </div>
              <div className="p-2 bg-warning-200 rounded-lg">
                <XCircle className="h-6 w-6 text-warning-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Filtered Results</p>
                <p className="text-2xl font-bold text-secondary-900">{filteredUsers.length}</p>
              </div>
              <div className="p-2 bg-secondary-200 rounded-lg">
                <Filter className="h-6 w-6 text-secondary-700" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Content */}
      {/* {viewMode === 'table' ? (
        <Card>
          <CardHeader className="px-6 py-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">Users List</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary-50">
                    <td className="font-medium text-secondary-900">
                      {user.nameAsPerGovId || user.preferredName || '-'}
                    </td>
                    <td className="text-secondary-600">@{user.username}</td>
                    <td className="text-secondary-600">
                      {user.emailAddress ? (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.emailAddress}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="text-secondary-600">
                      {user.contactNumber ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          +91 {user.contactNumber}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role: any, index: number) => (
                          <span key={`global-${index}`} className={`badge ${getRoleBadgeColor(role.name)} text-xs`}>
                            {role.name.replace('ROLE_', '')} (Global)
                          </span>
                        ))}
                        {user.organizationRoles?.map((orgRole: any, index: number) => (
                          <span key={`org-${index}`} className={`badge ${getRoleBadgeColor(orgRole.roleName)} text-xs`}>
                            {orgRole.roleName.replace('ROLE_', '')} ({orgRole.organizationName})
                          </span>
                        ))}
                        {(!user.roles?.length && !user.organizationRoles?.length) && (
                          <span className="text-xs text-secondary-600 dark:text-secondary-300">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title='View User'
                          onClick={() => navigate("/user-view", { state: { userId: user.id } })}
                          className="p-1 h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit User"
                          onClick={() => navigate("/edit-user", { state: { userId: user.id } })}
                          className="p-1 h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/user-org-roles", { state: { userId: user.id } })}
                          className="p-1 h-8 w-8"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="p-1 h-8 w-8 text-error-600 hover:text-error-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )} */}

      {/*-------Showing users in card view only---------*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-secondary-100 rounded-full">
                <Users className="h-8 w-8 text-secondary-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first user'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/user-form')}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add First User
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          {dialogType === "success" && "Success"}
          {dialogType === "error" && "Error"}
          {dialogType === "confirm" && "Confirm"}
        </DialogTitle>
        <DialogContent dividers>
          <Alert
            severity={
              dialogType === "success"
                ? "success"
                : dialogType === "error"
                  ? "error"
                  : "info"
            }
          >
            {dialogMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          {dialogType === "confirm" ? (
            <>
              <MuiButton
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                No
              </MuiButton>
              <MuiButton
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogAction) dialogAction();
                }}
                autoFocus
              >
                Yes
              </MuiButton>
            </>
          ) : (
            <MuiButton
              onClick={() => {
                setDialogOpen(false);
                if (dialogAction) dialogAction();
              }}
              autoFocus
            >
              OK
            </MuiButton>
          )}
        </DialogActions>
      </Dialog>

    </div>


  );
};

export default UserManagement;