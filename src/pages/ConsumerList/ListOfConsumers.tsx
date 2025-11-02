import React, { useState, useEffect, useMemo, useRef } from "react";
import { fetchConsumersWithConnections, searchCustomers } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { fetchOrganizations, getChildOrganizations, fetchUsersByOrgId, Organization } from "../../services/organizationService";
import { fetchClaims } from "../../services/jwtService";
import { obfuscateEmail } from "../../utils/emailUtils";
import { obfuscatePhoneNumber } from "../../utils/phoneUtils";
import { Eye, Mail, Phone, Lightbulb, Search, Users, RefreshCw, Zap, FileText, Plus } from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";
import { useUser } from "../../contexts/UserContext";

interface Consumer {
  id: number;
  customerId: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  connections?: { id: number; consumerId: string; customerId: number }[];
}


const ListOfConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Consumer[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);


  // refs to handle debounced searching and race conditions
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearchSeqRef = useRef<number>(0);

  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const userRoleFromLocalStorage = userInfo?.role;

  const handleViewConsumer = (consumer: Consumer) => {
    const customerId = consumer.customerId || consumer.id;
    console.log('Viewing consumer:', { consumer, customerId });

    if (!customerId) {
      console.error('No customer ID found for consumer:', consumer);
      return;
    }

    navigate(`/view-customer`, {
      state: { consumer, customerId }
    });
  };

  useEffect(() => {
    const loadRoleAndOrganizations = async () => {
      try {
        const claims = await fetchClaims();

        if (claims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
          setUserRole("ROLE_SUPER_ADMIN");

          // Only fetch organizations if SUPER ADMIN
          const orgs = await fetchOrganizations();
          setOrganizations(orgs.map((o) => ({ id: o.id as number, name: o.name })));
        } else {
          // For other roles, you can set role here
          setUserRole(claims.role || "");
        }
      } catch (error) {
        console.error("Error fetching claims or organizations:", error);
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
    if (userInfo?.role === "ROLE_ORG_ADMIN") {

      setSelectedOrgId(userInfo.orgId);


      getChildOrganizations(userInfo.orgId).then((res) => {
        if (res?.length) {
          setAgencies(res);
        } else {

          loadConsumers(0);
        }
      });
    }
  }, []);


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
    if (selectedUserId !== null) {
      loadConsumers(0);
    }
  }, [selectedUserId]);


  const loadConsumers = async (page: number) => {
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

      console.log("Fetching consumers with params:", params);

      const data = await fetchConsumersWithConnections(page, params);
      setConsumers(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  // Debounced remote search with race protection
  useEffect(() => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchQuery.trim();

    // If query is empty, clear results immediately
    if (trimmed === "") {
      setSearchResults([]);
      return;
    }

    // Avoid firing for very short inputs
    if (trimmed.length < 2) {
      return;
    }

    // Debounce actual API search
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
        const results = await searchCustomers(trimmed, params);

        // Only apply results if this is the latest search
        if (currentSeq === latestSearchSeqRef.current) {
          setSearchResults(results);
        }
      } catch (error) {
        console.error("Error searching customers:", error);
        if (currentSeq === latestSearchSeqRef.current) {
          setSearchResults([]);
        }
      }
    }, 100);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedOrgId, selectedAgencyId, selectedUserId, userRole]);

  const displayData = searchQuery.trim() !== "" ? searchResults : consumers;



  useEffect(() => {
    loadConsumers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!selectedOrgId && !selectedAgencyId && !userRole && !selectedUserId) return;

    loadConsumers(0);
  }, [selectedOrgId, selectedAgencyId, userRole, selectedUserId]);




  useEffect(() => {
    const handleOrgChange = () => {
      setCurrentPage(0);
      loadConsumers(0);
    };

    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
  }, []);

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

      // Ellipsis if needed
      if (currentPage < totalPages - 3) {
        pages.push(<span key="dots2" className="px-2">...</span>);
      }

      // Last page
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
    <Card key={consumer.customerId || consumer.id} className="group rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardBody className="p-6">
        {/* Header with status indicators */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-secondary-900 dark:text-secondary-100 truncate">
              {consumer.govIdName}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 px-2.5 py-1 text-xs">
                <Users className="w-3.5 h-3.5" />
                {consumer.connections?.length || 0} connections
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="px-1 py-1 text-xs gap-0.5 transition-all duration-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:scale-105 hover:shadow-md"
              onClick={() => handleViewConsumer(consumer)}
              leftIcon={<Eye className="w-3 h-3" />}
            >
              View
            </Button>


          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg ring-1 ring-secondary-100 dark:ring-secondary-700">
            <Mail className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {consumer.emailAddress ? obfuscateEmail(consumer.emailAddress) : "No email provided"}
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg ring-1 ring-secondary-100 dark:ring-secondary-700">
            <Phone className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              {consumer.mobileNumber ? obfuscatePhoneNumber(consumer.mobileNumber) : "No mobile number provided"}
            </span>
          </div>
        </div>

        {/* Connections Section  */}
        {consumer.connections && consumer.connections.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Active Connections
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/connection-form`, {
                    state: {
                      customerId: consumer.customerId || consumer.id,
                      govIdName: consumer.govIdName,
                    },
                  })
                }
                leftIcon={<Plus className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
               Add New Connection
              </Button>
            </div>
            {consumer.connections.map((connection, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-solar-50 dark:from-primary-900/10 dark:to-solar-900/10 rounded-lg border border-primary-100 dark:border-primary-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Connection {index + 1}
                  </div>
                  <div className="text-xs text-secondary-700 dark:text-secondary-300 font-mono">
                    {connection.consumerId}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/view-connection`, {
                        state: {
                          customerId: consumer.customerId || consumer.id,
                          connectionId: connection.id,
                          consumerId: connection.consumerId,
                        },
                      })
                    }
                    title="View Connection"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/system-specifications`, {
                        state: {
                          connectionId: connection.id,
                          consumerId: connection.consumerId,
                          customerId: consumer.customerId || consumer.id,
                        },
                      })
                    }
                    title="Get System Specs"
                    className="text-solar-600 hover:text-solar-700"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/generate-documents`, {
                        state: {
                          consumer: {
                            id: connection.id,
                            customerId: consumer.customerId || consumer.id,
                            govIdName: consumer.govIdName,
                            consumerId: connection.consumerId,
                            mobileNumber: consumer.mobileNumber,
                            emailAddress: consumer.emailAddress,
                          },
                        },
                      })
                    }
                    className="text-blue-600 hover:text-blue-700"
                    title="Manage Documents"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

          </div>
        )}

        {consumer.connections && consumer.connections.length === 0 && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/connection-form`, {
                  state: {
                    customerId: consumer.customerId || consumer.id,
                    govIdName: consumer.govIdName,
                  },
                })
              }
              leftIcon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              Add New Connection
            </Button>
          </div>
        )}

      </CardBody>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Heading + Subtitle */}
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              Customer Directory
            </h1>

          </div>

          {/* Organization + Agency Selects */}
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
                      loadConsumers(0);
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

                {/* Custom dropdown arrow (only when no org is selected) */}
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

                {/* X button to clear selection */}
                {selectedOrgId && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={async () => {
                      setSelectedOrgId(null);
                      setSelectedAgencyId(null);
                      setAgencies([]);
                      setSelectedUserId(null);
                      loadConsumers(0);
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

                    // reset user when agency changes
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



      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
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

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-secondary-700 dark:text-secondary-300">
          {loading || isLoadingAll ? (
            isLoadingAll ? "Loading all customers for search..." : "Loading customers..."
          ) : (
            `Showing ${displayData.length} customer${displayData.length !== 1 ? 's' : ''}`
          )}
        </div>

        {!loading && !isLoadingAll && displayData.length > 0 && (
          <div className="text-sm text-secondary-700 dark:text-secondary-300">
            {searchQuery.trim() !== "" && `Search results for "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-700 dark:text-secondary-300">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading customers...
          </div>
        </div>
      )}

      {/* Loading All Data for Search */}
      {isLoadingAll && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-700 dark:text-secondary-300">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading all customers for search...
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !isLoadingAll && (
        <>
          {displayData.length === 0 ? (
            <Card className="text-center py-12">
              <CardBody>
                <Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                  No customers found
                </h3>
                <p className="text-secondary-700 dark:text-secondary-300">
                  {searchQuery.trim() !== ""
                    ? `No customers match your search for "${searchQuery}"`
                    : "No customers available at the moment."
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
        </>
      )}
    </div>
  );
};

export default ListOfConsumers;