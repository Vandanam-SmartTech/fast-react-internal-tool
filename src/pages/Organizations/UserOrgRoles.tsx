import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getUserById, getAllRoles, getUserOrgRolesById } from '../../services/jwtService';
import { fetchOrganizations, Organization, UserOrgRole, assignUserOrgRole, removeUserOrgRole, getChildOrganizations } from '../../services/organizationService';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { useUser } from '../../contexts/UserContext';

const UserOrgRoles: React.FC = () => {
  const { userClaims } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const [user, setUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userOrgRoles, setUserOrgRoles] = useState<UserOrgRole[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    organizationId: '',
    roleId: ''
  });
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error" | "confirm">("confirm");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

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
    if (userId) {
      if (userRole === "ROLE_SUPER_ADMIN") {
        loadUser(parseInt(userId));
        loadOrganizations();
      } else if (
        userRole === "ROLE_ORG_ADMIN" ||
        userRole === "ROLE_AGENCY_ADMIN"
      ) {
        loadUserOrgRole(parseInt(userId), userInfo?.orgId);
      }
    }
  }, [userId, userRole]);


  const loadUser = async (userId: number) => {
    try {
      const { data } = await getUserById(userId);
      setUser(data);

      if (data.organizationRoles && data.organizationRoles.length > 0) {
        setUserOrgRoles(groupByOrganization(data.organizationRoles));
      } else {
        setUserOrgRoles([]);
      }
    } catch (error) {
      toast.error("Failed to load user");
      navigate("/user-management");
    }
  };

  const loadUserOrgRole = async (userId: number, organizationId?: number) => {
    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    try {
      const { data, message } = await getUserOrgRolesById(userId, organizationId);
      if (data) {
        setUser(data);
        setUserOrgRoles(groupByOrganization(data.organizationRoles || []));
      } else {
        toast.error(message || "Failed to load user data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching user data");
    }
  };


  const groupByOrganization = (organizationRoles) => {
    const grouped = {};

    organizationRoles.forEach((role) => {
      if (!grouped[role.organizationId]) {
        grouped[role.organizationId] = {
          organizationId: role.organizationId,
          organizationName: role.organizationName,
          roles: []
        };
      }
      grouped[role.organizationId].roles.push({
        id: role.roleId,
        name: role.roleName
      });
    });

    return Object.values(grouped);
  };



  const loadOrganizations = async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
    }
  };


  const loadAllRoles = async () => {
    try {
      const rolesResponse = await getAllRoles();
      setAllRoles(rolesResponse);
    } catch (error) {
      console.error('Failed to load roles', error);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getAllRoles();
        setRoles(data);
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    loadAllRoles();
  }, []);



  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let organizationIdToSend: string | undefined;

      if (userRole === "ROLE_SUPER_ADMIN") {
        // Super admin assigning — check if org role or agency role
        if (["ROLE_ORG_ADMIN", "ROLE_ORG_REPRESENTATIVE", "ROLE_ORG_STAFF"].includes(selectedRoleName)) {
          organizationIdToSend = newAssignment.organizationId;
        } else {
          organizationIdToSend = newAssignment.agencyId || newAssignment.organizationId;
        }
      }
      else if (userRole === "ROLE_ORG_ADMIN") {
        // Org admin can assign to their org or agency under it
        organizationIdToSend = newAssignment.agencyId || userInfo?.orgId;
      }
      else if (userRole === "ROLE_AGENCY_ADMIN") {
        // Agency admin can assign only inside their agency
        organizationIdToSend = userInfo?.orgId;
      }

      if (!organizationIdToSend) {
        toast.error("Please select a valid organization or agency");
        setLoading(false);
        return;
      }

      // Check for duplicate role in that org/agency
      const orgRoles = userOrgRoles.find(
        (orgRole) => orgRole.organizationId === parseInt(organizationIdToSend!)
      );
      const roleExists = orgRoles?.roles.some(
        (role) => role.id === parseInt(newAssignment.roleId)
      );

      if (roleExists) {
        toast.error("This role is already assigned to the selected organization/agency", {
          hideProgressBar: true,
          autoClose: 3000,
        });
        setLoading(false);
        return;
      }

      await assignUserOrgRole(
        parseInt(userId!),
        parseInt(organizationIdToSend!),
        parseInt(newAssignment.roleId),
        null
      );

      // Reload data based on user role
      if (userRole === "ROLE_SUPER_ADMIN") {
        await loadUser(parseInt(userId));
      } else {
        await loadUserOrgRole(parseInt(userId), userInfo?.orgId);
      }

      toast.success("Role assigned successfully", {
        hideProgressBar: true,
        autoClose: 2000,
      });

      setNewAssignment({ organizationId: "", roleId: "", agencyId: "" });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to assign role", {
        hideProgressBar: true,
        autoClose: 1000,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const roleName = roles.find((r) => r.id.toString() === roleId)?.name || "";
    setSelectedRoleName(roleName);


    setNewAssignment({ roleId, organizationId: "", agencyId: "" });
    setAgencies([]);

    if (userRole === "ROLE_ORG_ADMIN" && userInfo?.orgId) {
      getChildOrganizations(parseInt(userInfo.orgId))
        .then((res) => setAgencies(res))
        .catch((err) => {
          console.error("Failed to fetch agencies for ORG_ADMIN role", err);
          setAgencies([]);
        });
    }
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    setNewAssignment((prev) => ({
      ...prev,
      organizationId: orgId,
      agencyId: "",
    }));


    if (userRole === "ROLE_ORG_ADMIN" && userInfo?.orgId) {

      getChildOrganizations(parseInt(userInfo.orgId))
        .then((res) => setAgencies(res))
        .catch((err) => {
          console.error("Failed to fetch agencies for ORG_ADMIN role", err);
          setAgencies([]);
        });
    } else if (
      !["ROLE_ORG_ADMIN", "ROLE_ORG_REPRESENTATIVE", "ROLE_ORG_STAFF"].includes(selectedRoleName)
    ) {

      getChildOrganizations(parseInt(orgId))
        .then((res) => setAgencies(res))
        .catch((err) => {
          console.error("Failed to fetch agencies", err);
          setAgencies([]);
        });
    }
  };


  const handleRemoveRole = (orgId: number, roleId: number) => {
    setDialogType("confirm");
    setDialogMessage("Do you want to remove the assigned role for this user?");
    setDialogAction(() => async () => {
      try {
        await removeUserOrgRole(parseInt(userId!), orgId, roleId);

        // Reload based on user role
        if (userRole === "ROLE_SUPER_ADMIN") {
          await loadUser(parseInt(userId!));
        } else {
          await loadUserOrgRole(parseInt(userId!), userInfo?.orgId);
        }

        toast.success("Role removed successfully", {
          hideProgressBar: true,
          autoClose: 1000,
        });
      } catch (error) {
        toast.error("Failed to remove role");
      }
    });
    setDialogOpen(true);
  };



  if (!user) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-3 mb-6">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate("/user-management")}
            className="p-1 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </button>

          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 min-w-0">
            {/* <Shield className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" /> */}
            <span className="truncate">
              Roles - {user.nameAsPerGovId || user.username}
            </span>
          </h1>
        </div>

        {/* RIGHT */}
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shrink-0 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Add Role</span>
        </button>
      </div>



      {/* Add Role Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Assign Role to Organization
          </h2>
          <form onSubmit={handleAddRole}>
            {/* Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newAssignment.roleId}
                  onChange={handleRoleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  {roles
                    .filter((role) => {
                      if (role.name === "ROLE_SUPER_ADMIN") return false;

                      if (userRole === "ROLE_ORG_ADMIN") {
                        return role.name !== "ROLE_ORG_ADMIN";
                      }

                      if (userRole === "ROLE_AGENCY_ADMIN") {
                        return !["ROLE_ORG_ADMIN", "ROLE_ORG_STAFF", "ROLE_ORG_REPRESENTATIVE"].includes(role.name);
                      }

                      return true; // for SUPER_ADMIN
                    })
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>

              </div>

              {/* Organization Dropdown */}
              {userRole === "ROLE_SUPER_ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <select
                    value={newAssignment.organizationId}
                    onChange={handleOrganizationChange}
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
              )}


              {userRole !== "ROLE_AGENCY_ADMIN" &&
                !["ROLE_ORG_ADMIN", "ROLE_ORG_REPRESENTATIVE", "ROLE_ORG_STAFF", "ROLE_ORG_FABRICATOR", "ROLE_ORG_ELECTRICIAN","ROLE_BDO","ROLE_GRAMSEVAK"].includes(selectedRoleName) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency
                    </label>
                    <select
                      value={newAssignment.agencyId}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          agencyId: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Agency</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>

            {/* Buttons - always below */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
<div className="hidden md:grid grid-cols-2 items-center bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
  <div className="px-6 py-3 flex items-center gap-2">
    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
      Organization
    </span>
  </div>

  <div className="px-6 py-3 flex items-center gap-2">
    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
      Roles
    </span>
  </div>
</div>


        {/* Body */}
        <div className="divide-y divide-gray-100">
          {/* Global Roles */}
          {user?.roles?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-4 md:px-6 py-4">
              <div className="font-medium text-gray-900">
                Global Roles
              </div>

              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => {
                  const label =
                    allRoles.find((r) => r.name === role.name)?.label || role.name;

                  const disableDelete =
                    role.name === "ROLE_SUPER_ADMIN" ||
                    (userInfo?.role === "ROLE_ORG_ADMIN" &&
                      role.name === "ROLE_ORG_ADMIN") ||
                    (userInfo?.role === "ROLE_AGENCY_ADMIN" &&
                      role.name === "ROLE_AGENCY_ADMIN");

                  return (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                    >
                      {label.replace("ROLE_", "")}
                      {!disableDelete && (
                        <button
                          onClick={() => handleRemoveRole(0, role.id)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Organization Roles */}
          {userOrgRoles.map((orgRole) => (
            <div
              key={orgRole.organizationId}
              className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-6 py-4"
            >
              <div className="font-medium text-gray-900">
                {orgRole.organizationName}
              </div>

              <div className="flex flex-wrap gap-2">
                {orgRole.roles.map((role) => {
                  const label =
                    allRoles.find((r) => r.name === role.name)?.label || role.name;

                  const disableDelete =
                    (userInfo?.role === "ROLE_ORG_ADMIN" &&
                      role.name === "ROLE_ORG_ADMIN") ||
                    (userInfo?.role === "ROLE_AGENCY_ADMIN" &&
                      role.name === "ROLE_AGENCY_ADMIN");

                  return (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                    >
                      {label.replace("ROLE_", "")}
                      {!disableDelete && (
                        <button
                          onClick={() =>
                            handleRemoveRole(orgRole.organizationId, role.id)
                          }
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}

          {user?.roles?.length === 0 && userOrgRoles.length === 0 && (
            <div className="px-6 py-8 text-sm text-gray-500 text-center">
              No roles assigned
            </div>
          )}
        </div>
      </div>


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
              <Button onClick={() => setDialogOpen(false)}>No</Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogAction) dialogAction();
                }}
                autoFocus
              >
                Yes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setDialogOpen(false);
                if (dialogAction) dialogAction();
              }}
              autoFocus
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>


    </div>


  );


};

export default UserOrgRoles;