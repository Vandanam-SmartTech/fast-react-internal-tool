import React, { useState, useEffect, useRef } from "react";
import { fetchOnboardedConsumers, getMaterialsByConnectionId, searchOnboardedConsumers } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { obfuscateEmail } from "../../utils/emailUtils";
import { obfuscatePhoneNumber } from "../../utils/phoneUtils";
import { Mail, Phone, User, Zap, Search, Users, FileText, Package, RefreshCw, Eye, Plus } from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";
import { fetchOrganizations, getChildOrganizations, fetchUsersByOrgId } from "../../services/organizationService";
import { fetchClaims } from "../../services/jwtService";

interface Consumer {
  id: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  customerId: number;
  consumerId: number;
  connectionType: string;
  materials?: { materialId: number; materialName: string; quantity: number; unitPrice: number }[];
}

const OnboardedConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Consumer[]>([]);
  const [materialsMap, setMaterialsMap] = useState<Record<number, boolean>>({});

  // refs to handle debounced searching and race conditions
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearchSeqRef = useRef<number>(0);


  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [agencies, setAgencies] = useState<{ id: Number; name: string }[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const userRoleFromLocalStorage = userInfo?.role;

  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);

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

  const handleMaterialDetails = (consumer: Consumer) => {
    navigate(`/material-form`, {
      state: { consumer, connectionId: consumer.id },
    });
  };

  const handleViewMaterialDetails = (consumer: Consumer) => {
    navigate(`/material-form`, {
      state: { consumer, connectionId: consumer.id },
    });
  };


  const loadOnboardedConsumers = async (page: number) => {
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

      const orgName = orgId
        ? organizations.find((o) => o.id === orgId)?.name || null
        : null;

      const agencyName = agencyId
        ? agencies.find((a) => a.id === agencyId)?.name || null
        : null;

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
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (query: string) => {
      setSearchQuery(query);
    };
  
    
    useEffect(() => {
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
  
          console.log("Sending search request with params:", { query: trimmed, ...params });
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
    }, [searchQuery, selectedOrgId, selectedAgencyId, selectedUserId, userRole]);


  useEffect(() => {
    const loadMaterialsForSearchResults = async () => {
      if (searchResults.length === 0) return;

      const materialsPromises = searchResults.map(async (consumer) => {
        try {
          const materials = await getMaterialsByConnectionId(consumer.id);
          return { consumerId: consumer.id, hasMaterials: materials.length > 0 };
        } catch (error) {
          console.error(`Error loading materials for consumer ${consumer.id}:`, error);
          return { consumerId: consumer.id, hasMaterials: false };
        }
      });

      try {
        const materialsResults = await Promise.all(materialsPromises);
        const newMaterialsMap = { ...materialsMap };
        
        materialsResults.forEach(({ consumerId, hasMaterials }) => {
          newMaterialsMap[consumerId] = hasMaterials;
        });
        
        setMaterialsMap(newMaterialsMap);
      } catch (error) {
        console.error("Error loading materials for search results:", error);
      }
    };

    loadMaterialsForSearchResults();
  }, [searchResults]);

  // Load materials for regular consumers list
  useEffect(() => {
    const loadMaterialsForConsumers = async () => {
      if (consumers.length === 0) return;

      const materialsPromises = consumers.map(async (consumer) => {
        try {
          const materials = await getMaterialsByConnectionId(consumer.id);
          return { consumerId: consumer.id, hasMaterials: materials.length > 0 };
        } catch (error) {
          console.error(`Error loading materials for consumer ${consumer.id}:`, error);
          return { consumerId: consumer.id, hasMaterials: false };
        }
      });

      try {
        const materialsResults = await Promise.all(materialsPromises);
        const newMaterialsMap = { ...materialsMap };
        
        materialsResults.forEach(({ consumerId, hasMaterials }) => {
          newMaterialsMap[consumerId] = hasMaterials;
        });
        
        setMaterialsMap(newMaterialsMap);
      } catch (error) {
        console.error("Error loading materials for consumers:", error);
      }
    };

    loadMaterialsForConsumers();
  }, [consumers]);

  const displayData = searchQuery.trim() !== "" ? searchResults : consumers;


  useEffect(() => {
    const loadRoleAndOrganizations = async () => {
      try {
        const claims = await fetchClaims();

        if (claims.global_roles?.includes("ROLE_SUPER_ADMIN")) {
          setUserRole("ROLE_SUPER_ADMIN");

          
          const orgs = await fetchOrganizations();
          setOrganizations(orgs);
        } else {

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
        if (res.data?.length) {
          setAgencies(res.data);
        } else {

          loadOnboardedConsumers(0);
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
    if (!selectedOrgId && !selectedAgencyId && !userRole && !selectedUserId) return;

    loadOnboardedConsumers(0);
  }, [selectedOrgId, selectedAgencyId, userRole, selectedUserId]);

  useEffect(() => {
    loadOnboardedConsumers(currentPage);
  }, [currentPage]);



  useEffect(() => {
    const handleOrgChange = () => {
      setCurrentPage(0);
      loadOnboardedConsumers(0);
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
    <Card key={consumer.id} className="group rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <CardBody className="p-6">

        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-secondary-900 dark:text-secondary-100 truncate">
              {consumer.govIdName}
            </h3>
            <div className="flex items-center gap-3 mt-2">

              {materialsMap[consumer.id] && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-solar-50 text-solar-700 dark:bg-solar-900/20 dark:text-solar-300 px-2.5 py-1 text-xs">
                  <Package className="w-3.5 h-3.5" />
                  Materials Added
                </span>
              )}
            </div>
          </div>
        </div>


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
              {consumer.mobileNumber ? obfuscatePhoneNumber(consumer.mobileNumber) : "No phone number provided"}
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg ring-1 ring-secondary-100 dark:ring-secondary-700">
            <User className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              Consumer ID: {consumer.consumerId}
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-solar-50 dark:from-primary-900/20 dark:to-solar-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
            <Zap className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {consumer.connectionType}
            </span>
          </div>
        </div>


        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewConsumer(consumer)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerateDocuments(consumer)}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Docs
            </Button>
          </div>

          <Button
            variant={materialsMap[consumer.id] ? "outline" : "primary"}
            size="sm"
            onClick={() =>
              materialsMap[consumer.id]
                ? handleViewMaterialDetails(consumer)
                : handleMaterialDetails(consumer)
            }
            className="w-full"
          >
            {materialsMap[consumer.id] ? (
              <>
                <Package className="w-4 h-4 mr-2" />
                View Materials
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Materials
              </>
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
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
                  <option value="">Self</option>
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
            isLoadingAll ? "Loading all onboarded customers for search..." : "Loading onboarded customers..."
          ) : (
            `Showing ${displayData.length} onboarded customer${displayData.length !== 1 ? 's' : ''}`
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
        </>
      )}
    </div>
  );
};

export default OnboardedConsumers;