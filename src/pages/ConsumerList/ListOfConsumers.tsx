import React, { useState, useEffect, useMemo } from "react";
import { fetchConsumersWithConnections } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { fetchOrganizations, getChildOrganizations, fetchUsersByOrgId } from "../../services/organizationService";
import { fetchClaims } from "../../services/jwtService";
import { obfuscateEmail } from "../../utils/emailUtils";
import { 
  Eye, 
  Mail, 
  Phone, 
  Lightbulb, 
  Search, 
  Users, 
  UserCheck, 
  RefreshCw,
  Zap,
  FileText
} from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";

interface Consumer {
  id: number;
  customerId: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  connections?: { id: number; consumerId: string; customerId: number }[];
}

interface FilterOptions {
  hasConnections: boolean | null;
  hasEmail: boolean | null;
  sortBy: 'name' | 'email' | 'connections' | 'date';
  sortOrder: 'asc' | 'desc';
}

interface Organization {
  id: number;
  name: string;
  displayName: string;
}

const ListOfConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Consumer[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [allConsumers, setAllConsumers] = useState<Consumer[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    hasConnections: null,
    hasEmail: null,
    sortBy: 'name',
    sortOrder: 'asc'
  });

const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

const [agencies,setAgencies] = useState<{ id: Number; name:string }[]>([]);
const[selectedAgencyId, setSelectedAgencyId] =useState<number | null>(null);
const [userRole, setUserRole] = useState<string>("");

const [users, setUsers] = useState<any[]>([]);
const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


const userInfo = JSON.parse(localStorage.getItem("selectedOrg")); 
const userRoleFromLocalStorage = userInfo?.role;

  const handleViewConsumer = (consumer: Consumer) => {
    const customerId = consumer.customerId || consumer.id;
    console.log('Viewing consumer:', { consumer, customerId });
    
    if (!customerId) {
      console.error('No customer ID found for consumer:', consumer);
      return;
    }
    
    navigate(`/view-customer/${customerId}`, { 
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
        setOrganizations(orgs);
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
      if (res.data?.length) {
        setAgencies(res.data);
      } else {
        
        loadConsumers(0); 
      }
    });
  }
}, []);

// useEffect(() => {
//   if (userInfo?.role === "ROLE_ORG_STAFF") {
//     setSelectedOrgId(userInfo.orgId);


//     loadConsumers(0);
//   }
// }, []);




useEffect(() => {
  const loadUsers = async () => {
    try {
      let orgIdToFetch: number | null = null;

      // Priority: if dropdown selections exist, use them
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
    let representativeId = selectedUserId ?? null;

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
      representativeId,
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

  const loadAllConsumers = async () => {
    if (allConsumers.length > 0) return; 
    
    try {
      setIsLoadingAll(true);
      const allData: Consumer[] = [];
      let currentPage = 0;
      let hasMorePages = true;

      while (hasMorePages) {
        const data = await fetchConsumersWithConnections(currentPage);
        allData.push(...data.content);
        
        if (currentPage >= data.totalPages - 1) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      setAllConsumers(allData);
    } catch (error) {
      console.error("Error loading all consumers:", error);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }


    if (allConsumers.length === 0) {
      await loadAllConsumers();
    }


    const searchTerm = query.toLowerCase().trim();
    const results = allConsumers.filter(consumer => {

      if (consumer.govIdName?.toLowerCase().includes(searchTerm)) return true;
      

      if (consumer.emailAddress?.toLowerCase().includes(searchTerm)) return true;
      

      if (consumer.mobileNumber?.toString().includes(searchTerm)) return true;
      

      if (consumer.connections) {
        return consumer.connections.some(connection => 
          connection.consumerId?.toString().includes(searchTerm)
        );
      }
      
      return false;
    });
    
    console.log('Search results:', results);
    setSearchResults(results);
  };


  const filteredAndSortedData = useMemo(() => {
    const data = searchQuery.trim() !== "" ? searchResults : consumers;
    
    let filtered = data.filter(consumer => {
      
      if (filters.hasConnections !== null) {
        const hasConnections = consumer.connections && consumer.connections.length > 0;
        if (filters.hasConnections !== hasConnections) return false;
      }
      
     
      if (filters.hasEmail !== null) {
        const hasEmail = consumer.emailAddress && consumer.emailAddress !== "NA";
        if (filters.hasEmail !== hasEmail) return false;
      }
      
      return true;
    });


    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.govIdName?.toLowerCase() || '';
          bValue = b.govIdName?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.emailAddress?.toLowerCase() || '';
          bValue = b.emailAddress?.toLowerCase() || '';
          break;
        case 'connections':
          aValue = a.connections?.length || 0;
          bValue = b.connections?.length || 0;
          break;
        case 'date':
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [consumers, searchResults, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      hasConnections: null,
      hasEmail: null,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.hasConnections !== null) count++;
    if (filters.hasEmail !== null) count++;
    return count;
  };

  useEffect(() => {
    loadConsumers(currentPage);
  }, [currentPage]);

useEffect(() => {
  
  if (!selectedOrgId) return;

  
  loadConsumers(0);
}, [selectedOrgId, selectedAgencyId, userRole]);



  useEffect(() => {
    const handleOrgChange = () => {
      setCurrentPage(0);
      loadConsumers(0);
    };
    
    window.addEventListener('organizationChanged', handleOrgChange);
    return () => window.removeEventListener('organizationChanged', handleOrgChange);
  }, []);

  const renderPagination = () => {
    if (searchQuery.trim() !== "" || getActiveFiltersCount() > 0) return null;
    
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
    <Card key={consumer.customerId || consumer.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardBody className="p-6">
        {/* Header with status indicators */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 truncate">
              {consumer.govIdName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-secondary-700 dark:text-secondary-300">
                  {consumer.connections?.length || 0} connections
                </span>
              </div>
              {consumer.emailAddress && consumer.emailAddress !== "NA" && (
                <div className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600 dark:text-success-400">Active</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewConsumer(consumer)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <Mail className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {consumer.emailAddress ? obfuscateEmail(consumer.emailAddress) : "No email provided"}
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                            <Phone className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              {consumer.mobileNumber}
            </span>
          </div>
        </div>

        {/* Connections Section */}
        {consumer.connections && consumer.connections.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Active Connections
            </h4>
            {consumer.connections.map((connection, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-solar-50 dark:from-primary-900/20 dark:to-solar-900/20 rounded-lg border border-primary-100 dark:border-primary-800"
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
                      navigate(`/view-connection/${connection.id}`, {
                        state: {
                          customerId: consumer.customerId || consumer.id,
                          connectionId: connection.id,
                          consumerId: connection.consumerId,
                        },
                      })
                    }
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/SystemSpecifications`, {
                        state: {
                          connectionId: connection.id,
                          consumerId: connection.consumerId,
                          customerId: consumer.customerId || consumer.id,
                        },
                      })
                    }
                    className="text-solar-600 hover:text-solar-700"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/generatedocuments`, {
                        state: {
                          consumer: {
                            id: connection.id,
                            customerId: consumer.customerId || consumer.id,
                            govIdName: consumer.govIdName,
                            consumerId: connection.consumerId,
                            connectionType: "Solar Connection",
                            mobileNumber: consumer.mobileNumber,
                            emailAddress: consumer.emailAddress,
                          },
                        },
                      })
                    }
                    className="text-blue-600 hover:text-blue-700"
                    title="Generate Documents"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}


      <div className="mb-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    
    {/* Heading + Subtitle */}
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
        Customer Directory
      </h1>
      <p className="text-secondary-700 dark:text-secondary-300 mt-1">
        Manage and view all your customers and their connections
      </p>
    </div>

    {/* Organization + Agency Selects */}
    <div className="flex gap-4">
      
      
      {userRole ==="ROLE_SUPER_ADMIN" && (<div className="w-60"> 
        <label className="sr-only">Select Organization</label>
        <select
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
          className="w-full border border-secondary-300 dark:border-secondary-600 rounded-lg px-4 py-2 text-secondary-900 dark:text-secondary-100 bg-white dark:bg-secondary-800"
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>)}

      {/* Agency Dropdown */}
      {agencies.length > 0 && (<div className="w-60"> 
        <label className="sr-only">Select Agency</label>
        <select
          value={selectedAgencyId ?? ""}
          onChange={(e) => {
    const agencyId = e.target.value || null;
    setSelectedAgencyId(agencyId);
    setSelectedAgencyName(agencyId ? e.target.options[e.target.selectedIndex].text : null);


    setSelectedUserId(null);
    
    // Clear org selection if agency is chosen
    if (agencyId) {
      setSelectedOrgId(null);
      setSelectedOrgName(null);
    }
  }}
          disabled={agencies.length === 0}
          className="w-full border border-secondary-300 dark:border-secondary-600 rounded-lg px-4 py-2 text-secondary-900 dark:text-secondary-100 bg-white dark:bg-secondary-800"
        >
          <option value="">Self</option>
          {agencies.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.name}
            </option>
          ))}
        </select>
      </div>)}

      {userRoleFromLocalStorage !== "ROLE_ORG_REPRESENTATIVE" && userRoleFromLocalStorage !== "ROLE_AGENCY_REPRESENTATIVE" && (
  <div className="w-60">
    <label className="sr-only">Select User</label>
    <select
      value={selectedUserId ?? ""}
      onChange={(e) => {
        const userId = e.target.value ? Number(e.target.value) : null;
        setSelectedUserId(userId);
      }}
      disabled={users.length === 0}
      className="w-full border border-secondary-300 dark:border-secondary-600 rounded-lg px-4 py-2 text-secondary-900 dark:text-secondary-100 bg-white dark:bg-secondary-800"
    >
      <option value="">Select User</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {`${user.nameAsPerGovId} (${user.username})`}
        </option>
      ))}
    </select>
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
            placeholder="Search customers by name, email, mobile number, or connection ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>

      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-secondary-700 dark:text-secondary-300">
          {loading || isLoadingAll ? (
            isLoadingAll ? "Loading all customers for search..." : "Loading customers..."
          ) : (
            `Showing ${filteredAndSortedData.length} customer${filteredAndSortedData.length !== 1 ? 's' : ''}`
          )}
        </div>
        
        {!loading && !isLoadingAll && filteredAndSortedData.length > 0 && (
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
          {filteredAndSortedData.length === 0 ? (
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
              {filteredAndSortedData.map(renderConsumerCard)}
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