import React, { useState, useEffect, useRef } from "react";
import { fetchOnboardedConsumers, searchOnboardedConsumers } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { obfuscateEmail } from "../../utils/emailUtils";
import { obfuscatePhoneNumber } from "../../utils/phoneUtils";
import { Mail, Phone, User, Zap, Search, Users, FileText, RefreshCw, Eye } from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";
import { fetchOrganizations, getChildOrganizations, fetchUsersByOrgId, Organization } from "../../services/organizationService";
import { fetchClaims } from "../../services/jwtService";

interface Consumer {
  id: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  customerId: number;
  consumerId: number;
  connectionType: string;
}

const OnboardedConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Consumer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // refs to handle debounced searching and race conditions
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearchSeqRef = useRef<number>(0);


  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const userRoleFromLocalStorage = userInfo?.role;

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedConsumer, ] = useState<Consumer | null>(null);
  const [selectedRole, ] = useState<"ELECTRICIAN" | "FABRICATOR" | null>(null);

  const [filteredUsers, ] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const visibleUsers = filteredUsers.filter(user =>
    user.nameAsPerGovId.toLowerCase().includes(search.toLowerCase()) ||
    user.contactNumber.includes(search)
  );


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");



  console.log("User org roles:", users.map(u => u.organizationRoles));


  const [isLoadingAll,] = useState<boolean>(false);

  const handleViewConsumer = (consumer: Consumer) => {
    console.log('Viewing onboarded consumer:', { consumer });
    navigate(`/view-connection`, {
      state: {
        customerId: consumer.customerId,
        connectionId: consumer.id,
        consumerId: consumer.consumerId,
      },
    });
  };

  const handleGenerateDocuments = (consumer: Consumer) => {
    navigate(`/generate-documents`, { state: { consumer } });
  };

  // const openAssignModule = async (consumer: Consumer) => {
  //   setSelectedConsumer(consumer);
  //   setIsAssignOpen(true);
  //   setSelectedRole(null);
  //   setFilteredUsers([]);

  //   const data = await fetchAllUsersByOrgId(userInfo.orgId);
  //   setUsers(data || []);
  // };

  // const ROLE_MAP = {
  //   ELECTRICIAN: "ROLE_ORG_ELECTRICIAN",
  //   FABRICATOR: "ROLE_ORG_FABRICATOR",
  // };

  // const handleRoleSelect = (role: "ELECTRICIAN" | "FABRICATOR") => {
  //   setSelectedRole(role);

  //   const filtered = users.filter(user =>
  //     user.organizationRoles?.some(r =>
  //       Number(r.organizationId) === Number(userInfo.orgId) &&
  //       r.roleName === ROLE_MAP[role]
  //     )
  //   );

  //   setFilteredUsers(filtered);
  // };


  const loadOnboardedConsumers = async (page: number) => {
    if (!isInitialized) {
      return;
    }

    try {
      setLoading(true);

      let orgId = selectedOrgId ?? null;
      let agencyId = selectedAgencyId ?? null;
      let userId = selectedUserId ?? null;

      if (userInfo?.role === "ROLE_ORG_ADMIN" && userInfo?.orgId) {
        orgId = userInfo.orgId;
      }

      if (userInfo?.role === "ROLE_AGENCY_ADMIN" && userInfo?.orgId) {
        agencyId = userInfo.orgId;
        orgId = null;
      }

      if (userInfo?.role === "ROLE_ORG_STAFF" && userInfo?.orgId) {
        orgId = userInfo.orgId;
      }

      if (userInfo?.role === "ROLE_AGENCY_STAFF" && userInfo?.orgId) {
        agencyId = userInfo.orgId;
        orgId = null;
      }

      if (userInfo?.role === "ROLE_ORG_REPRESENTATIVE" && userInfo?.orgId) {
        orgId = userInfo.orgId;
      }
      if (userInfo?.role === "ROLE_GRAMSEVAK" && userInfo?.orgId) {
        orgId = userInfo.orgId;
      }

      if (userInfo?.role === "ROLE_AGENCY_REPRESENTATIVE" && userInfo?.orgId) {
        agencyId = userInfo.orgId;
        orgId = null;
      }

      const params = {
        orgId,
        agencyId,
        userRole: userInfo?.role || userRole || null,
        userId,
      };

      console.log("Fetching consumers with params:", params);

      const data = await fetchOnboardedConsumers(page, params);
      setConsumers(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
      setTotalCustomers(data.totalElements);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };


  useEffect(() => {
    if (!isInitialized) return;

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchQuery.trim();


    if (trimmed === "") {
      setSearchResults([]);
      return;
    }


    if (trimmed.length < 2) {
      return;
    }


    searchTimeoutRef.current = setTimeout(async () => {
      const currentSeq = ++latestSearchSeqRef.current;

      try {
        let orgId = selectedOrgId ?? null;
        let agencyId = selectedAgencyId ?? null;
        let userId = selectedUserId ?? null;

        if (userInfo?.role === "ROLE_ORG_ADMIN" && userInfo?.orgId) {
          orgId = userInfo.orgId;
        }
        if (userInfo?.role === "ROLE_AGENCY_ADMIN" && userInfo?.orgId) {
          agencyId = userInfo.orgId;
          orgId = null;
        }
        if (userInfo?.role === "ROLE_ORG_STAFF" && userInfo?.orgId) {
          orgId = userInfo.orgId;
        }
        if (userInfo?.role === "ROLE_AGENCY_STAFF" && userInfo?.orgId) {
          agencyId = userInfo.orgId;
          orgId = null;
        }
        if (userInfo?.role === "ROLE_ORG_REPRESENTATIVE" && userInfo?.orgId) {
          orgId = userInfo.orgId;
        }
        if (userInfo?.role === "ROLE_GRAMSEVAK" && userInfo?.orgId) {
        orgId = userInfo.orgId;
      }
        if (userInfo?.role === "ROLE_AGENCY_REPRESENTATIVE" && userInfo?.orgId) {
          agencyId = userInfo.orgId;
          orgId = null;
        }

        const params = {
          orgId,
          agencyId,
          userRole: userRole || userInfo?.role || null,
          userId,
        };

        console.log("Sending search request with params:", { searchTerm: trimmed, ...params });
        const results = await searchOnboardedConsumers(trimmed, params);


        if (currentSeq === latestSearchSeqRef.current) {
          setSearchResults(results);
        }
      } catch (error) {
        console.error("Error searching customers:", error);
        if (currentSeq === latestSearchSeqRef.current) {
          setSearchResults([]);
        }
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedOrgId, selectedAgencyId, selectedUserId, userRole, isInitialized]);

  const displayData = searchQuery.trim() !== "" ? searchResults : consumers;


  useEffect(() => {
    const loadRoleAndOrganizations = async () => {
      try {
        const claims = await fetchClaims();

        if (claims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
          setUserRole("ROLE_SUPER_ADMIN");


          const orgs = await fetchOrganizations();
          setOrganizations(orgs.map((o) => ({ id: o.id as number, name: o.name })));
        } else {

          setUserRole(claims.role || "");
        }
      } catch (error) {
        console.error("Error fetching claims or organizations:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadRoleAndOrganizations();
  }, []);



  useEffect(() => {
    const loadAgencies = async () => {
      try {
        if (!selectedOrgId) return;

        const data = await getChildOrganizations(selectedOrgId);
        setAgencies(data);
      } catch (error) {
        console.error("Error loading agencies:", error);
      }
    };

    loadAgencies();
  }, [selectedOrgId]);

  useEffect(() => {
    if (!isInitialized) return;

    if (userInfo?.role === "ROLE_ORG_ADMIN") {

      setSelectedOrgId(userInfo.orgId);


      getChildOrganizations(userInfo.orgId).then((res) => {
        if (res?.length) {
          setAgencies(res);
        } else {

          loadOnboardedConsumers(0);
        }
      });
    }
  }, [isInitialized]);


  useEffect(() => {
    const loadUsers = async () => {
      try {
        let orgIdToFetch: number | null = null;


        if (selectedAgencyId) {
          orgIdToFetch = selectedAgencyId;
        } else if (selectedOrgId) {
          orgIdToFetch = selectedOrgId;
        } else if (userInfo?.role === "ROLE_ORG_STAFF") {
          orgIdToFetch = userInfo.orgId;
        } else if (userInfo?.role === "ROLE_AGENCY_STAFF") {
          orgIdToFetch = userInfo.orgId;
        }

        if (orgIdToFetch) {
          const data = await fetchUsersByOrgId(orgIdToFetch);
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    loadUsers();
  }, [selectedOrgId, selectedAgencyId, userInfo?.role, userInfo?.orgId]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!selectedOrgId && !selectedAgencyId && !userRole && !selectedUserId) return;

    loadOnboardedConsumers(0);
  }, [selectedOrgId, selectedAgencyId, userRole, selectedUserId, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    loadOnboardedConsumers(currentPage);
  }, [currentPage, isInitialized]);



  useEffect(() => {
    const handleOrgChange = () => {
      if (!isInitialized) return;
      setCurrentPage(0);
      loadOnboardedConsumers(0);
    };

    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
  }, [isInitialized]);



  const renderPagination = () => {
    if (searchQuery.trim() !== "") return null;

    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
            className="min-w-[40px]"
          >
            {i + 1}
          </Button>
        );
      }
    } else {
      // First page
      pages.push(
        <Button
          key="first"
          variant={currentPage === 0 ? "primary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(0)}
        >
          1
        </Button>
      );

      // Ellipsis if needed
      if (currentPage > 2) {
        pages.push(<span key="dots1" className="px-2">...</span>);
      }

      // Current page and neighbors
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        pages.push(
          <Button
            key={i}
            variant={i === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
          >
            {i + 1}
          </Button>
        );
      }


      if (currentPage < totalPages - 3) {
        pages.push(<span key="dots2" className="px-2">...</span>);
      }


      pages.push(
        <Button
          key="last"
          variant={currentPage === totalPages - 1 ? "primary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(totalPages - 1)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  const renderConsumerCard = (consumer: Consumer) => (
    <Card key={consumer.id} className="group rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardBody className="p-4">

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-secondary-900 dark:text-secondary-100 truncate">
              {consumer.govIdName}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg ring-1 ring-secondary-100 dark:ring-secondary-700">
            <Mail className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
           <span className="text-xs text-secondary-700 dark:text-secondary-300 truncate">
              {consumer.emailAddress ? obfuscateEmail(consumer.emailAddress) : "No email provided"}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg ring-1 ring-secondary-100 dark:ring-secondary-700">
            <Phone className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
           <span className="text-xs text-secondary-700 dark:text-secondary-300 truncate">
              {consumer.mobileNumber ? obfuscatePhoneNumber(consumer.mobileNumber) : "No phone number provided"}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg ring-1 ring-secondary-100 dark:ring-secondary-700">
            <User className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-xs text-secondary-700 dark:text-secondary-300">
              Consumer ID: {consumer.consumerId}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-primary-50 to-solar-50 dark:from-primary-900/20 dark:to-solar-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
            <Zap className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
              {consumer.connectionType}
            </span>
          </div>
        </div>


        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewConsumer(consumer)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              View Details
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateDocuments(consumer)}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Manage Documents
            </Button>

            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => openAssignModule(consumer)}
              className="col-span-2"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Assign Staff
            </Button> */}
          </div>

        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-2">

      <div className="mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Heading + Subtitle */}
          <div>
            <h1 className="font-bold text-secondary-900
                     text-xl sm:text-2xl lg:text-2xl
                     leading-tight">
              Onboarded Consumers
            </h1>



          </div>

          <div className="flex gap-4">


            {userRole === "ROLE_SUPER_ADMIN" && (
              <div className="relative w-60">
                <select
                  name="organization"
                  value={selectedOrgId ?? ""}
                  onChange={async (e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    setSelectedOrgId(value);

                    setSelectedUserId(null);

                    if (value) {
                      const childOrgs = await getChildOrganizations(value);
                      setAgencies(childOrgs);
                      setSelectedAgencyId(null);
                    } else {
                      setAgencies([]);
                      setSelectedAgencyId(null);
                      loadOnboardedConsumers(0);
                    }
                  }}
                  className="block w-full appearance-none p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500"
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>


                {!selectedOrgId && (
                  <div className="pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-900">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}


                {selectedOrgId && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={async () => {
                      setSelectedOrgId(null);
                      setSelectedAgencyId(null);
                      setAgencies([]);
                      setSelectedUserId(null);
                      loadOnboardedConsumers(0);
                    }}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-900 hover:text-red-500 transition"
                    title="Clear selection"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}


            {agencies.length > 0 && (
              <div className="relative w-60">
                <select
                  name="agency"
                  value={selectedAgencyId ?? ""}
                  onChange={(e) => {
                    const agencyId = e.target.value ? Number(e.target.value) : null;
                    setSelectedAgencyId(agencyId);

                    setSelectedUserId(null);
                  }}
                  disabled={agencies.length === 0}
                  className="block w-full appearance-none p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500"
                >
                  <option value="">All</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>


                {!selectedAgencyId && (
                  <div className={`pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2 
          ${agencies.length === 0 ? "text-gray-400" : "text-gray-900"}
        `}>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}

                {selectedAgencyId && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setSelectedAgencyId(null)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-900 hover:text-red-500 transition"
                    title="Clear selection"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {userRoleFromLocalStorage !== "ROLE_ORG_REPRESENTATIVE" &&
              userRoleFromLocalStorage !== "ROLE_AGENCY_REPRESENTATIVE" && users.length > 0 && (
                <div className="relative w-60">
                  <select
                    name="customer"
                    value={selectedUserId ?? ""}
                    onChange={(e) => {
                      const userId = e.target.value ? Number(e.target.value) : null;
                      setSelectedUserId(userId);
                    }}
                    disabled={users.length === 0}
                    className="block w-full appearance-none p-2 pr-10 border rounded-md shadow-sm focus:border-blue-500"
                  >
                    <option value="">All</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {`${user.nameAsPerGovId} (${user.username})`}
                      </option>
                    ))}
                  </select>


                  {!selectedUserId && (
                    <div className={`pointer-events-none absolute top-1/2 right-2 transform -translate-y-1/2 
          ${users.length === 0 ? "text-gray-400" : "text-gray-900"}
        `}>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}

                  {/* X button to clear selection */}
                  {selectedUserId && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setSelectedUserId(null)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-900 hover:text-red-500 transition"
                      title="Clear selection"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

          </div>
        </div>
      </div>


      <div className="mb-6 space-y-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-500 dark:text-secondary-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, mobile number, or consumer number..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>

      </div>


      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-secondary-700 dark:text-secondary-300">
          {loading || isLoadingAll ? (
            isLoadingAll ? "Loading all customers for search..." : "Loading customers..."
          ) : searchQuery.trim() === "" ? (
            `Showing ${displayData.length} of ${totalCustomers} customers`
          ) : (
            `Showing ${displayData.length} customer${displayData.length !== 1 ? "s" : ""}`
          )}

        </div>

        {!loading && !isLoadingAll && displayData.length > 0 && (
          <div className="text-sm text-secondary-700 dark:text-secondary-300">
            {searchQuery.trim() !== "" && `Search results for "${searchQuery}"`}
          </div>
        )}
      </div>


      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading onboarded customers...
          </div>
        </div>
      )}


      {isLoadingAll && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading all onboarded customers for search...
          </div>
        </div>
      )}


      {!loading && !isLoadingAll && (
        <>
          {displayData.length === 0 ? (
            <Card className="text-center py-12">
              <CardBody>
                <Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                  No onboarded customers found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {searchQuery.trim() !== ""
                    ? `No customers match your search for "${searchQuery}"`
                    : "No customers have completed the onboarding process yet."
                  }
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayData.map(renderConsumerCard)}
            </div>
          )}



          {/* Pagination */}
          {renderPagination() && (
            <div className="flex justify-center items-center mt-8 gap-2">
              {renderPagination()}
            </div>
          )}

          {isAssignOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

              {/* Modal */}
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-5 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">Assign Staff</h3>
                    <p className="text-sm text-gray-500">
                      Consumer: {selectedConsumer?.govIdName}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAssignOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Role Selection */}
                {/* <div className="flex gap-3 mb-3">
                  <Button
                    variant={selectedRole === "ELECTRICIAN" ? "primary" : "outline"}
                    onClick={() => handleRoleSelect("ELECTRICIAN")}
                    className="flex-1"
                  >
                    Electrician
                  </Button>

                  <Button
                    variant={selectedRole === "FABRICATOR" ? "primary" : "outline"}
                    onClick={() => handleRoleSelect("FABRICATOR")}
                    className="flex-1"
                  >
                    Fabricator
                  </Button>

                </div> */}

                {/* Assignment Duration */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-600">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border rounded-md px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search staff by name or mobile"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm mb-2"
                />

                {/* Count */}
                {selectedRole && (
                  <p className="text-xs text-gray-500 mb-2">
                    {visibleUsers.length} staff found
                  </p>
                )}

                {/* Staff List */}
                <div className="space-y-2 overflow-y-auto flex-1">
                  {!selectedRole ? (
                    <p className="text-sm text-gray-500 text-center mt-6">
                      Select role to continue
                    </p>
                  ) : visibleUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-6">
                      No {selectedRole.toLowerCase()} available
                    </p>
                  ) : (
                    visibleUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{user.nameAsPerGovId}</p>
                          <p className="text-xs text-gray-500">{user.contactNumber}</p>
                        </div>

                        <Button
                          size="sm"
                          disabled={!startDate || !endDate}
                          //onClick={() => assignUserToConsumer(user)}
                        >
                          Assign
                        </Button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default OnboardedConsumers;