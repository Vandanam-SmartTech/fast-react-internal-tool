import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Eye, Search, Shield, Filter, Mail, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { deleteUser } from '../../services/jwtService';
import { fetchBootstrapData } from '../../services/bootstrapService';
import { toast } from 'react-toastify';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, Alert } from '@mui/material';
import { useUser } from '../../contexts/UserContext';


const UserManagement: React.FC = () => {
  const { userClaims } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  //const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [showFilters,] = useState(false);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");
  //const [userRole, setUserRole] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);



  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters - reload data from backend
  useEffect(() => {
    if (userRole) {
      loadBootstrapData(0); // Reset to page 0 when filters change
    }
  }, [debouncedSearchTerm, statusFilter, roleFilter]);

  useEffect(() => {
    if (!userClaims) return;

    const storedUserInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
    setUserInfo(storedUserInfo);

    // Determine user role
    if (userClaims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
      setUserRole("ROLE_SUPER_ADMIN");
      loadBootstrapData();
    } else if (
      storedUserInfo?.role === "ROLE_ORG_ADMIN" ||
      storedUserInfo?.role === "ROLE_AGENCY_ADMIN"
    ) {
      setUserRole(storedUserInfo.role);
      loadBootstrapData();
    }
  }, [userClaims]);

  const loadBootstrapData = async (page = 0) => {
    try {
      setFetching(true);
      const data = await fetchBootstrapData(
        page, 
        pageSize,
        statusFilter !== 'all' ? statusFilter : undefined,
        roleFilter !== 'all' ? roleFilter : undefined,
        debouncedSearchTerm || undefined
      );
      
      // Handle SUPER_ADMIN response
      if (data.users) {
        const usersData = Array.isArray(data.filteredUsers) ? data.filteredUsers : data.users;
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
      
      // Handle ORG_ADMIN/AGENCY_ADMIN response
      if (data.usersPaginated) {
        const usersData = Array.isArray(data.filteredUsers) ? data.filteredUsers : data.usersPaginated.content;
        setUsers(usersData);
        setFilteredUsers(usersData);
        setTotalPages(data.usersPaginated.totalPages);
        setCurrentPage(data.usersPaginated.number);
      }
      
      // Set stats from backend response
      setTotalElements(data.totalUsers || 0);
      setActiveCount(data.activeUsers || 0);
      setInactiveCount(data.inactiveUsers || 0);
      setFilteredCount(data.filteredUsers || data.filteredCount || data.totalUsers || 0);
      
      // Set roles from JWT
      if (data.roles) {
        console.log('Roles from backend:', data.roles);
        setRoles(data.roles.map((r: any, idx: number) => ({ id: idx, name: r.name })));
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  // Filter roles based on logged-in user
  const getFilteredRoles = () => {
    const allRoles = [...roles];
    console.log('All roles before filtering:', allRoles);
    console.log('Current userRole:', userRole);
    
    if (userRole === "ROLE_SUPER_ADMIN") {
      return allRoles; // show all roles
    } else if (userRole === "ROLE_ORG_ADMIN") {
      // ORG_ADMIN can see all roles except SUPER_ADMIN
      const filtered = allRoles.filter((r) => r.name !== "ROLE_SUPER_ADMIN");
      console.log('Filtered roles for ORG_ADMIN:', filtered);
      return filtered;
    } else if (userRole === "ROLE_AGENCY_ADMIN") {
      // AGENCY_ADMIN can only see agency roles
      return allRoles.filter(
        (r) =>
          ![
            "ROLE_SUPER_ADMIN",
            "ROLE_ORG_ADMIN",
            "ROLE_ORG_STAFF",
            "ROLE_ORG_REPRESENTATIVE",
            "ROLE_ORG_ELECTRICIAN",
            "ROLE_ORG_FABRICATOR"
          ].includes(r.name)
      );
    } else {
      return []; // if other roles shouldn't see anything
    }
  };






  const handleSearch = (term: string) => {
    setSearchTerm(term);
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

          await loadBootstrapData(currentPage);
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
    if (roleName.includes('ELECTRICIAN')) return 'badge-secondary';
    if (roleName.includes('FABRICATOR')) return 'badge-primary';
    return 'badge-ghost';
  };

  const UserCard: React.FC<{ user: any }> = React.memo(({ user }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border border-secondary-200 hover:border-primary-300" hover={true}>
      <CardBody className="p-5">
        {/* Header with Avatar and Status */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-md ring-2 ring-primary-100">
              <span className="text-white font-bold text-lg tracking-wide uppercase">
                {user.username?.slice(0, 2)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1">
              {user.isActive ? (
                <div className="bg-success-500 rounded-full p-1 ring-2 ring-white">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div className="bg-error-500 rounded-full p-1 ring-2 ring-white">
                  <XCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-secondary-900 truncate">
              {user.nameAsPerGovId || user.preferredName || 'Unnamed User'}
            </h3>
            <p className="text-sm text-secondary-500 font-medium">
              @{user.username}
            </p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${user.isActive ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4 bg-secondary-50 rounded-lg p-3">
          {user.emailAddress && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary-600" />
              </div>
              <span className="text-secondary-700 truncate flex-1" title={user.emailAddress}>
                {user.emailAddress}
              </span>
            </div>
          )}

          {user.contactNumber && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Phone className="h-4 w-4 text-success-600" />
              </div>
              <span className="text-secondary-700 font-medium">
                +91 {user.contactNumber}
              </span>
            </div>
          )}
        </div>

        {/* Roles Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-secondary-600" />
            <h4 className="text-sm font-semibold text-secondary-700">Roles</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.roles?.map((role: any, index: number) => (
              <span key={`global-${index}`} className={`badge ${getRoleBadgeColor(role.name)} text-xs font-medium px-2.5 py-1`}>
                {role.name.replace('ROLE_', '')} (Global)
              </span>
            ))}
            {user.organizationRoles?.map((orgRole: any, index: number) => (
              <span key={`org-${index}`} className={`badge ${getRoleBadgeColor(orgRole.roleName)} text-xs font-medium px-2.5 py-1`}>
                {orgRole.roleName.replace('ROLE_', '')} ({orgRole.organizationName})
              </span>
            ))}
            {(!user.roles?.length && !user.organizationRoles?.length) && (
              <span className="text-xs text-secondary-500 italic">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-secondary-200">
          <Button
            variant="outline"
            size="sm"
            title="View User"
            onClick={() => navigate("/user-view", { state: { userId: user.id } })}
            className="flex-1 h-9"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            title="Edit User"
            onClick={() => navigate("/edit-user", { state: { userId: user.id } })}
            className="flex-1 h-9"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            title="Manage Role"
            onClick={() => navigate("/user-org-roles", { state: { userId: user.id } })}
            className="flex-1 h-9"
          >
            <Shield className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            title="Delete User"
            onClick={() => handleDelete(user.id)}
            className="h-9 w-9 text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  ));

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
    <div className="p-4 max-w-7xl mx-auto space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-2">
        {/* Title */}
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-1 sm:gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>User Management</span>
        </h1>

        {/* Add User Button */}
        <Button
          variant="primary"
          onClick={() => navigate("/user-form")}
          leftIcon={<Plus className="h-4 w-4 sm:h-4 sm:w-4" />}
          className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base shrink-0"
        >
          {/* Mobile text */}
          <span className="sm:hidden">Add</span>

          {/* Desktop text */}
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </div>


      {/* Search and Filters */}
      <Card>
        <CardBody className="p-4">
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  onClick={() => setStatusFilter('all')}
                >
                  All ({totalElements})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active ({activeCount})
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive ({inactiveCount})
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardBody className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Total Users</p>
                <p className="text-2xl font-bold text-primary-900">{totalElements}</p>
              </div>
              <div className="p-2 bg-primary-200 rounded-lg">
                <Users className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-success-50 to-success-100 border-success-200">
          <CardBody className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600">Active Users</p>
                <p className="text-2xl font-bold text-success-900">{activeCount}</p>
              </div>
              <div className="p-2 bg-success-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200">
          <CardBody className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning-600">Inactive Users</p>
                <p className="text-2xl font-bold text-warning-900">{inactiveCount}</p>
              </div>
              <div className="p-2 bg-warning-200 rounded-lg">
                <XCircle className="h-6 w-6 text-warning-700" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200">
          <CardBody className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Filtered Results</p>
                <p className="text-2xl font-bold text-secondary-900">{filteredCount}</p>
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
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
            <span className="text-secondary-700">Loading users...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-secondary-600">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = 0;
                    setCurrentPage(newPage);
                    loadBootstrapData(newPage);
                  }}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    loadBootstrapData(newPage);
                  }}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-secondary-700 px-2">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    loadBootstrapData(newPage);
                  }}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = totalPages - 1;
                    setCurrentPage(newPage);
                    loadBootstrapData(newPage);
                  }}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardBody className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-2 bg-secondary-100 rounded-full">
                <Users className="h-8 w-8 text-secondary-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
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