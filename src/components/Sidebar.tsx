import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./ui";
import { UserPlus, Users, UserRoundCheck, Building, Shield, UserCheck, LayoutDashboard, ChevronDown, ChevronRight, Package, Layers } from "lucide-react";
import Button from "./ui/Button";
import { fetchClaims } from "../services/jwtService";
import { useUser } from "../contexts/UserContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [roles, setRoles] = useState<string[]>([]);
  const [customersExpanded, setCustomersExpanded] = useState(true);
  const { userClaims } = useUser();

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const authPages = ['/login', '/password-reset', '/verification', '/change-password', '/page-not-found'];
  const isAuthPage = authPages.includes(location.pathname);

  useEffect(() => {
    const customersState = localStorage.getItem("customersExpanded");
    setCustomersExpanded(customersState === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("customersExpanded", customersExpanded.toString());
  }, [customersExpanded]);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      onToggle(); // sidebar close
    }
  };

  const navigateWithSidebarClose = (path: string) => {
    navigate(path);
    closeSidebarOnMobile();
  };

  const goToListOfConsumers = () =>
    navigateWithSidebarClose("/list-of-consumers");

  const goToOnboardedConsumers = () =>
    navigateWithSidebarClose("/onboarded-consumers");

  const goToCustomerForm = () =>
    navigateWithSidebarClose("/customer-form");

  const goToOrganizations = () =>
    navigateWithSidebarClose("/organizations");

  const goToAdminManagement = () =>
    navigateWithSidebarClose("/admin-management");

  const goToUserManagement = () =>
    navigateWithSidebarClose("/user-management");

  const goToProductManagement = () =>
    navigateWithSidebarClose("/product-management");

    const goToPackageManagement = () =>
    navigateWithSidebarClose("/package-management");



  const handleHomeClick = async () => {
    try {
      if (!userClaims) {
        navigate("/login");
        closeSidebarOnMobile();
      return;

      }

      // Super Admin shortcut
      if (userClaims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
        navigate("/super-admin-dashboard");
        closeSidebarOnMobile();
        return;
      }

      const selectedOrgStr = localStorage.getItem("selectedOrg");
      if (!selectedOrgStr) {
        navigate("/login");
        closeSidebarOnMobile();
        return;
      }

      let selectedOrg;
      try {
        selectedOrg = JSON.parse(selectedOrgStr);
      } catch {
        console.error("Invalid selectedOrg format in localStorage");
        localStorage.removeItem("selectedOrg");
        navigate("/login");
        closeSidebarOnMobile();
        return;
      }

      const orgData = userClaims.org_roles?.[selectedOrg.orgId];
      if (!orgData) {
        alert("Invalid organization selection.");
        localStorage.removeItem("selectedOrg");
        navigate("/login");
        closeSidebarOnMobile();
        return;
      }

      // Validate role
      let role = selectedOrg.role;
      if (!role || !orgData.roles.includes(role)) {
        // If multiple roles, pick the first or show selection
        role = orgData.roles[0];
        localStorage.setItem(
          "selectedOrg",
          JSON.stringify({ orgId: selectedOrg.orgId, orgName: orgData.org_name, role })
        );
      }

      // Navigate based on role
      switch (role) {
        case "ROLE_ORG_ADMIN":
          navigate("/org-admin-dashboard");
          break;
        case "ROLE_GRAMSEVAK":
          navigate("/grampanchayat-dashboard");
          break;
        case "ROLE_BDO":
          navigate("/bdo-dashboard");
          break;
        case "ROLE_AGENCY_ADMIN":
          navigate("/agency-admin-dashboard");
          break;
        case "ROLE_ORG_STAFF":
        case "ROLE_AGENCY_STAFF":
          navigate("/staff-dashboard");
          break;
        case "ROLE_ORG_REPRESENTATIVE":
        case "ROLE_AGENCY_REPRESENTATIVE":
          navigate("/representative-dashboard");
          break;
        default:
          alert("Unauthorized role.");
          localStorage.removeItem("selectedOrg");
          navigate("/login");
      }
      closeSidebarOnMobile();
    } catch (error) {
      console.error("Error fetching claims:", error);
      alert("Error determining user role.");
      navigate("/login");
      closeSidebarOnMobile();
    }
  };



  useEffect(() => {

    const fetchRole = async (checkPageAccess = false) => {
      try {
        const claims = await fetchClaims();
        const allRoles: string[] = [];

        if (Array.isArray(claims.global_roles)) {
          allRoles.push(...claims.global_roles);
        }

        const selectedOrgStr = localStorage.getItem("selectedOrg");
        if (selectedOrgStr) {
          try {
            const selectedOrg = JSON.parse(selectedOrgStr);
            if (selectedOrg.role) {
              allRoles.push(selectedOrg.role);
            } else if (claims.org_roles?.[selectedOrg.orgId]?.roles?.length) {
              allRoles.push(claims.org_roles[selectedOrg.orgId].roles[0]);
            }
          } catch {
            console.error("Invalid selectedOrg format in localStorage");
          }
        }

        setRoles(allRoles);

        if (checkPageAccess) {
          const currentPath = location.pathname;

          const restrictedPages = [
            "/admin-management",
            "/user-management",
            "/product-management"
          ];
          const dashboardPages = [
            "/org-admin-dashboard",
            "/super-admin-dashboard",
            "/representative-dashboard",
            "/agency-admin-dashboard",
            "/staff-dashboard",
            "/grampanchayat-dashboard",
            "/bdo-dashboard",
          ];

          if (restrictedPages.includes(currentPath)) {
            if (
              currentPath === "/admin-management" &&
              !(allRoles.includes("ROLE_SUPER_ADMIN") || allRoles.includes("ROLE_ORG_ADMIN"))
            ) {
              redirectToDashboard(allRoles);
            }
            if (
              currentPath === "/user-management" &&
              !(allRoles.includes("ROLE_SUPER_ADMIN") || allRoles.includes("ROLE_ORG_ADMIN") || allRoles.includes("ROLE_AGENCY_ADMIN"))
            ) {
              redirectToDashboard(allRoles);
            }
          } else if (dashboardPages.includes(currentPath)) {

            redirectToDashboard(allRoles);
          }

        }
      } catch (err) {
        console.error("Error fetching claims:", err);
      }
    };

    const redirectToDashboard = (allRoles: string[]) => {
      if (allRoles.includes("ROLE_SUPER_ADMIN")) {
        navigate("/super-admin-dashboard");
      } else if (allRoles.includes("ROLE_ORG_ADMIN")) {
        navigate("/org-admin-dashboard");
      } else if (allRoles.includes("ROLE_ORG_REPRESENTATIVE")) {
        navigate("/representative-dashboard");
      } else if (allRoles.includes("ROLE_AGENCY_REPRESENTATIVE")) {
        navigate("/representative-dashboard");
      } else if (allRoles.includes("ROLE_AGENCY_ADMIN")) {
        navigate("/agency-admin-dashboard");
      } else if (allRoles.includes("ROLE_ORG_STAFF")) {
        navigate("/staff-dashboard");
      } else if (allRoles.includes("ROLE_AGENCY_STAFF")) {
        navigate("/staff-dashboard");
      }else if (allRoles.includes("ROLE_GRAMSEVAK")) {
        navigate("/grampanchayat-dashboard");
      }else if (allRoles.includes("ROLE_BDO")) {
        navigate("/bdo-dashboard");
      } else {
        navigate("/login");
      }
    };

    fetchRole();

    const handleOrgChange = () => {
      fetchRole(true);
    };

    window.addEventListener("organizationChanged", handleOrgChange);
    return () => {
      window.removeEventListener("organizationChanged", handleOrgChange);
    };
  }, [navigate, location.pathname]);



  const isActive = (paths: string | string[]) =>
    Array.isArray(paths)
      ? paths.some((path) => location.pathname.startsWith(path))
      : location.pathname.startsWith(paths);


  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="fixed top-3 left-2 z-50 p-2 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </Button>
      )}

      {isOpen && (
        <div
          ref={sidebarRef}
          className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-secondary-800 shadow-large border-r border-secondary-200 dark:border-secondary-700 z-40 transition-transform duration-300 ease-in-out"
        >

          <div className="flex items-center justify-between px-4 py-4 border-b border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-primary-50 to-solar-50 dark:from-primary-900/20 dark:to-solar-900/20">
            <div className="flex items-center justify-center w-full">
              <Logo size="xl" className="mx-auto" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="absolute top-4 right-4 p-1 h-8 w-8 text-secondary-700 dark:text-secondary-300 hover:text-error-600 dark:hover:text-error-400"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {/* Dashboard */}
              <button
                onClick={handleHomeClick}
                className={`nav-link w-full justify-start ${isActive([
                  "/org-admin-dashboard",
                  "/representative-dashboard",
                  "/super-admin-dashboard",
                  "/agency-admin-dashboard",
                  "/staff-dashboard",
                  "/grampanchayat-dashboard",
                  "/bdo-dashboard"
                ])
                  ? "nav-link-active"
                  : "nav-link-inactive"
                  }`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>



              <div className="space-y-1">

                <button
                  onClick={() => setCustomersExpanded(!customersExpanded)}
                  className={`nav-link w-full justify-between ${[
                    "/customer-form",
                    "/list-of-consumers",
                    "/onboarded-consumers",
                  ].includes(location.pathname)
                    ? "nav-link-active"
                    : "nav-link-inactive"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={20} />
                    <span>Manage Customers</span>
                  </div>
                  {customersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {customersExpanded && (
                  <div className="ml-6 space-y-1 mt-2">

                    <button
                      onClick={goToCustomerForm}
                      className={`nav-link w-full justify-start ${location.pathname === "/customer-form"
                        ? "nav-link-active"
                        : "nav-link-inactive"
                        }`}
                    >
                      <UserPlus size={18} />
                      <span>Add Customer</span>
                    </button>


                    <button
                      onClick={goToListOfConsumers}
                      className={`nav-link w-full justify-start ${location.pathname === "/list-of-consumers"
                        ? "nav-link-active"
                        : "nav-link-inactive"
                        }`}
                    >
                      <Users size={18} />
                      <span>All Customers</span>
                    </button>


                    <button
                      onClick={goToOnboardedConsumers}
                      className={`nav-link w-full justify-start ${location.pathname === "/onboarded-consumers"
                        ? "nav-link-active"
                        : "nav-link-inactive"
                        }`}
                    >
                      <UserRoundCheck size={18} />
                      <span>Onboarded</span>
                    </button>
                  </div>
                )}
              </div>


              {roles.includes("ROLE_SUPER_ADMIN") && (
                <button
                  onClick={goToOrganizations}
                  className={`nav-link w-full justify-start ${isActive("/organizations") ? "nav-link-active" : "nav-link-inactive"
                    }`}
                >
                  <Building size={20} />
                  <span>Organizations</span>
                </button>
              )}


              {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN")) && (
                <button
                  onClick={goToAdminManagement}
                  className={`nav-link w-full justify-start ${isActive("/admin-management") ? "nav-link-active" : "nav-link-inactive"
                    }`}
                >
                  <Shield size={20} />
                  <span>Role Management</span>
                </button>
              )}


              {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN") || roles.includes("ROLE_AGENCY_ADMIN")) && (
                <button
                  onClick={goToUserManagement}
                  className={`nav-link w-full justify-start ${isActive("/user-management") ? "nav-link-active" : "nav-link-inactive"
                    }`}
                >
                  <UserCheck size={20} />
                  <span>User Management</span>
                </button>
              )}

              {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN") || roles.includes("ROLE_AGENCY_ADMIN")) && (
                <button
                  onClick={goToProductManagement}
                  className={`nav-link w-full justify-start ${isActive("/product-management") ? "nav-link-active" : "nav-link-inactive"
                    }`}
                >
                  <Package size={20} />
                  <span>Product Management</span>
                </button>
              )}

              {/* {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN")) && (
                <button
                  onClick={goToPackageManagement}
                  className={`nav-link w-full justify-start ${isActive("/product-management") ? "nav-link-active" : "nav-link-inactive"
                    }`}
                >
                  <Layers size={20} />
                  <span>Package Management</span>
                </button>
              )} */}

            </nav>

          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
