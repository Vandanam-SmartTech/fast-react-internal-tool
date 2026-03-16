import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fetchConsumersWithConnectionsOptimized, searchCustomers, fetchVillages, getConnectionByConnectionId } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { fetchOrganizations, getChildOrganizations, fetchUsersByOrgId, Organization } from "../../services/organizationService";
import { fetchClaims } from "../../services/jwtService";
import { obfuscateEmail } from "../../utils/emailUtils";
import { obfuscatePhoneNumber } from "../../utils/phoneUtils";
import { Eye, Mail, Phone, Lightbulb, Search, Users, RefreshCw, Zap, FileText, Plus, Filter, MoreVertical } from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";
import ReusableDropdown from "../../components/ReusableDropdown";

interface Consumer {

  customerId: number;
  govIdName: string;
  emailAddress: string;
  mobileNumber: string;
  connectionData?: { id: number; consumerId: string; customerId: number; gharkulNumber: string; currentStage: "Installation" }[];
  status: string;
}


const ConsumerCard = memo(({ consumer, userRole, onView, onNavigate }: any) => (
  <Card className="group rounded-xl border border-secondary-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardBody className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-secondary-900 truncate">{consumer.govIdName}</h3>
        <Button variant="outline" size="sm" className="px-1 py-1" onClick={() => onView(consumer)} title="View Customer">
          <Eye className="w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 p-2 bg-secondary-50 rounded-lg">
          <Mail className="w-4 h-4 text-secondary-600 flex-shrink-0" />
          <span className="text-xs text-secondary-700 truncate">{consumer.emailAddress ? obfuscateEmail(consumer.emailAddress) : "Email not provided"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-secondary-50 rounded-lg">
          <Phone className="w-4 h-4 text-secondary-600 flex-shrink-0" />
          <span className="text-sm text-secondary-700">{consumer.mobileNumber ? obfuscatePhoneNumber(consumer.mobileNumber) : "Mobile not provided"}</span>
        </div>
      </div>
      {consumer.connectionData?.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-sm font-medium text-secondary-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />{consumer.connectionData.length} {consumer.connectionData.length === 1 ? "Connection" : "Connections"}
            </h4>
            {!(userRole === "ROLE_BDO" || userRole === "ROLE_GRAMSEVAK" || userRole === "ROLE_ORG_VIEWER") && (
              <Button variant="outline" size="sm" onClick={() => onNavigate('/connection-form', { customerId: consumer.customerId || consumer.id, govIdName: consumer.govIdName })} leftIcon={<Plus className="w-4 h-4" />}>Add Connection</Button>
            )}
          </div>
          {consumer.connectionData.map((conn: any, idx: number) => (
            <div key={conn.id} className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-primary-50 to-solar-50 rounded-lg border border-primary-100">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-primary-700">Connection {idx + 1}</div>
                <div className="text-[11px] text-secondary-700 font-mono">{conn.consumerId ?? conn.gharkulNumber}</div>
              </div>
              <div className="flex items-center gap-2">
                {userRole !== "ROLE_ORG_VIEWER" && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('/view-connection', { customerId: consumer.customerId || consumer.id, connectionId: conn.id, consumerId: conn.consumerId })} title="View Connection"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('/system-specifications', { connectionId: conn.id, consumerId: conn.consumerId, customerId: consumer.customerId || consumer.id })} title="Get System Specs"><Lightbulb className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('/generate-documents', { consumer: { id: conn.id, customerId: consumer.customerId || consumer.id, govIdName: consumer.govIdName, consumerId: conn.consumerId, mobileNumber: consumer.mobileNumber, emailAddress: consumer.emailAddress } })} title="Manage Documents"><FileText className="w-4 h-4" /></Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {consumer.connectionData?.length === 0 && (
        userRole === "ROLE_ORG_VIEWER" ? (
          <span className="text-sm text-gray-500">No Connection details found</span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onNavigate('/connection-form', {
                customerId: consumer.customerId || consumer.id,
                govIdName: consumer.govIdName
              })
            }
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Connection
          </Button>
        )
      )}
    </CardBody>
  </Card>
));


export const ListOfConsumers = memo(() => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Consumer[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [selectedVillage, setSelectedVillage] = useState("");
  const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allConsumers, setAllConsumers] = useState<any[]>([]);
  const [backendPage, setBackendPage] = useState(0);
  const [hasMoreBackend, setHasMoreBackend] = useState(true);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearchSeqRef = useRef(0);
  const userInfo = useMemo(() => JSON.parse(localStorage.getItem("selectedOrg") || "{}"), []);
  const ITEMS_PER_PAGE = 9;
  const BATCH_SIZE = 90;

  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const villageOptions = [
    { value: "", label: "All" }, // optional if you want default
    ...villages.map((village) => ({
      value: village.code,
      label: village.nameEnglish,
    })),
  ];

  const organizationOptions = [
    { value: "", label: "All" }, // 👈 Add this
    ...organizations
      .filter((org) => org.id != null)
      .map((org) => ({
        value: org.id as number,
        label: org.name,
      })),
  ];



  const agencyOptions = [
    { value: "", label: "All" },
    ...agencies
      .filter((agency) => agency.id != null)
      .map((agency) => ({
        value: agency.id as number,
        label: agency.name,
      })),
  ];

  const userOptions = [
    { value: "", label: "All" },
    ...users
      .filter((user) => user.id != null)
      .map((user) => ({
        value: user.id as number,
        label: `${user.nameAsPerGovId} (${user.username})`,
      })),
  ];

  const handleViewConsumer = useCallback((consumer: Consumer) => {
    const customerId = consumer.customerId;
    if (!customerId) return;
    navigate('/view-customer', { state: { consumer, customerId } });
  }, [navigate]);

  const handleNavigate = useCallback((path: string, state: any) => {
    navigate(path, { state });
  }, [navigate]);

  const loadConsumers = useCallback(async (pageNumber: number) => {
    if (!isInitialized) return;
    try {
      setLoading(true);
      let orgId = selectedOrgId ?? null;
      let agencyId = selectedAgencyId ?? null;
      let userId = selectedUserId ?? null;
      let villageCode: number | null = null;
      let talukaCode: number | null = null;
      let effectiveUserRole = userRole || userInfo?.role || null;

      if (userInfo?.role === "ROLE_BDO") {
        if (selectedVillage) {
          villageCode = Number(selectedVillage);
        } else {
          talukaCode = userInfo?.deptCode ?? null;
        }
        effectiveUserRole = "ROLE_BDO";
      }
      if (userInfo?.role === "ROLE_ORG_ADMIN" && userInfo?.orgId) {
        orgId = userInfo.orgId;
        effectiveUserRole = "ROLE_ORG_ADMIN";
      }
      if (userInfo?.role === "ROLE_AGENCY_ADMIN" && userInfo?.orgId) {
        agencyId = userInfo.orgId;
        orgId = null;
        effectiveUserRole = "ROLE_AGENCY_ADMIN";
      }
      if (userInfo?.role === "ROLE_ORG_STAFF" && userInfo?.orgId) {
        orgId = userInfo.orgId;
        effectiveUserRole = "ROLE_ORG_STAFF";
      }
      if (userInfo?.role === "ROLE_ORG_VIEWER" && userInfo?.orgId) {
        orgId = userInfo.orgId;
        effectiveUserRole = "ROLE_ORG_VIEWER";
      }
      if (userInfo?.role === "ROLE_AGENCY_STAFF" && userInfo?.orgId) {
        agencyId = userInfo.orgId;
        effectiveUserRole = "ROLE_AGENCY_STAFF";
        orgId = null;
      }
      if (userInfo?.role === "ROLE_ORG_REPRESENTATIVE" && userInfo?.orgId) {
        orgId = userInfo.orgId;
        effectiveUserRole = "ROLE_ORG_REPRESENTATIVE";
      }
      if (userInfo?.role === "ROLE_GRAMSEVAK") {
        villageCode = userInfo.deptCode;
        effectiveUserRole = "ROLE_GRAMSEVAK";
      }
      if (userInfo?.role === "ROLE_AGENCY_REPRESENTATIVE" && userInfo?.orgId) {
        agencyId = userInfo.orgId;
        effectiveUserRole = "ROLE_AGENCY_REPRESENTATIVE";
        orgId = null;
      }

      const data = await fetchConsumersWithConnectionsOptimized(pageNumber, BATCH_SIZE, {
        orgId, agencyId, userRole: effectiveUserRole, userId, isGharkulCustomer: false, villageCode, talukaCode
      });
      setAllConsumers(prev => [...prev, ...data.content]);
      if (data.content.length < BATCH_SIZE) setHasMoreBackend(false);
      setBackendPage(pageNumber);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, selectedOrgId, selectedAgencyId, selectedUserId, userRole, userInfo, selectedVillage, BATCH_SIZE]);

  const resetAndLoad = useCallback(async () => {
    setAllConsumers([]);
    setCurrentPage(0);
    setBackendPage(0);
    setHasMoreBackend(true);
    await loadConsumers(0);
  }, [loadConsumers]);

  useEffect(() => {
    fetchClaims().then(claims => {
      if (claims?.global_roles?.includes("ROLE_SUPER_ADMIN")) {
        setUserRole("ROLE_SUPER_ADMIN");
        fetchOrganizations().then(orgs => setOrganizations(orgs.map(o => ({ id: o.id as number, name: o.name }))));
      } else {
        setUserRole(claims?.role || "");
      }
      setIsInitialized(true);
    }).catch(() => {
      setIsInitialized(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const fetchConnectionDetails = async () => {
      if (!selectedConnection?.connection.id) return;

      setIsLoadingDetails(true);

      const data = await getConnectionByConnectionId(selectedConnection.connection.id);

      if (data) {
        setConnectionDetails(data);
      }

      setIsLoadingDetails(false);
    };

    if (isProgressModalOpen) {
      fetchConnectionDetails();
    }
  }, [isProgressModalOpen, selectedConnection]);


  useEffect(() => {
    if (selectedOrgId) getChildOrganizations(selectedOrgId).then(setAgencies);
  }, [selectedOrgId]);

  useEffect(() => {
    if (!isInitialized || !userInfo?.role) return;
    if (userInfo.role === "ROLE_ORG_ADMIN") {
      setSelectedOrgId(userInfo.orgId);
      getChildOrganizations(userInfo.orgId).then(res => res?.length && setAgencies(res));
    }
  }, [isInitialized, userInfo]);

  useEffect(() => {
    const orgIdToFetch = selectedAgencyId || selectedOrgId || (userInfo?.role === "ROLE_ORG_STAFF" || userInfo?.role === "ROLE_AGENCY_STAFF" || userInfo?.role === "ROLE_AGENCY_ADMIN" ? userInfo.orgId : null);
    if (orgIdToFetch) fetchUsersByOrgId(orgIdToFetch).then(setUsers).catch(() => setUsers([]));
  }, [selectedOrgId, selectedAgencyId, userInfo]);

  useEffect(() => {
    if (userInfo?.role === "ROLE_BDO" && userInfo?.deptCode) {
      fetchVillages(userInfo.deptCode).then(setVillages);
    }
  }, [userInfo]);

  useEffect(() => {
    if (!isInitialized) return;
    resetAndLoad();
  }, [selectedVillage, selectedOrgId, selectedAgencyId, selectedUserId, isInitialized, resetAndLoad]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const trimmed = searchQuery.trim();
    if (!trimmed) { setSearchResults([]); return; }
    if (trimmed.length < 2) return;

    searchTimeoutRef.current = setTimeout(async () => {
      const currentSeq = ++latestSearchSeqRef.current;
      try {
        const data = await searchCustomers(trimmed, 0, BATCH_SIZE, {
          orgId: selectedOrgId, agencyId: selectedAgencyId, userRole: userRole || userInfo?.role, userId: selectedUserId,
          villageCode: selectedVillage ? Number(selectedVillage) : null, talukaCode: userInfo?.deptCode
        });
        if (currentSeq === latestSearchSeqRef.current) setSearchResults(Array.isArray(data) ? data : data.content ?? []);
      } catch { if (currentSeq === latestSearchSeqRef.current) setSearchResults([]); }
    }, 300);
  }, [searchQuery, selectedOrgId, selectedAgencyId, selectedUserId, userRole, userInfo, selectedVillage]);


  const displayDataForCustomers = useMemo(() => allConsumers.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE), [allConsumers, currentPage]);
  const totalPagesLoaded = useMemo(() => Math.ceil(allConsumers.length / ITEMS_PER_PAGE), [allConsumers.length]);
  const displaySearchData = useMemo(() => searchResults.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE), [searchResults, currentPage]);
  const totalSearchPages = useMemo(() => Math.ceil(searchResults.length / ITEMS_PER_PAGE), [searchResults.length]);
  const finalDisplayData = useMemo(() => searchQuery.trim() ? displaySearchData : displayDataForCustomers, [searchQuery, displaySearchData, displayDataForCustomers]);

  return (
    <div className="p-4 max-w-7xl mx-auto py-2">

      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LEFT SIDE — Title */}
          <div>
            <h1 className="font-bold text-secondary-900 text-xl sm:text-2xl lg:text-2xl leading-tight">
              Customer Directory
            </h1>
          </div>

          {/* RIGHT SIDE — Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {(userInfo?.role === "ROLE_ORG_ADMIN" || userInfo?.role === "ROLE_BDO" || userRole === "ROLE_SUPER_ADMIN" || userInfo?.role === "ROLE_ORG_STAFF" || userInfo?.role === "ROLE_AGENCY_STAFF" || userInfo?.role === "ROLE_AGENCY_ADMIN") && (<button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>)}

          </div>
        </div>
      </div>

      <div className="mb-4">

        {showFilters && (
          <div className="mt-2 bg-white border rounded-xl shadow-md p-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {userInfo?.role === "ROLE_BDO" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Village
                  </label>
                  <ReusableDropdown
                    value={selectedVillage || ""}
                    onChange={(value) => setSelectedVillage(value as string)}
                    options={villageOptions}
                    placeholder="All Villages"
                  />
                </div>
              )}

              {/* Organization */}
              {userRole === "ROLE_SUPER_ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Organization
                  </label>
                  <ReusableDropdown
                    value={selectedOrgId ?? ""}
                    onChange={async (val) => {
                      const value = val === "" ? null : Number(val);

                      setSelectedOrgId(value);
                      setSelectedUserId(null);
                      setSelectedAgencyId(null);

                      if (value) {
                        const childOrgs = await getChildOrganizations(value);
                        setAgencies(childOrgs);
                      } else {
                        setAgencies([]);
                        resetAndLoad();
                      }
                    }}
                    options={organizationOptions}
                    placeholder="All Organizations"
                  />


                </div>
              )}

              {/* Agency */}
              {agencies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Agency
                  </label>
                  <ReusableDropdown
                    value={selectedAgencyId ?? ""}
                    onChange={(val) => {
                      const agencyId = val === "" ? null : Number(val);
                      setSelectedAgencyId(agencyId);

                      // reset user when agency changes
                      setSelectedUserId(null);
                    }}
                    options={agencyOptions}
                    placeholder="All Agencies"
                  />


                </div>
              )}

              {/* User */}
              {userInfo?.role !== "ROLE_ORG_REPRESENTATIVE" &&
                userInfo?.role !== "ROLE_AGENCY_REPRESENTATIVE" &&
                users.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      User
                    </label>
                    <ReusableDropdown
                      value={selectedUserId ?? ""}
                      onChange={(val) => {
                        const userId = val === "" ? null : Number(val);
                        setSelectedUserId(userId);
                      }}
                      options={userOptions}
                      placeholder="All Users"
                    />
                  </div>
                )}

            </div>
          </div>
        )}

      </div>

      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" />Loading...</div>
      ) : finalDisplayData.length === 0 ? (
        <Card className="text-center py-12"><CardBody><Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">No customers found</h3></CardBody></Card>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {finalDisplayData.map((c: Consumer) => (
              <ConsumerCard key={`consumer-${c.customerId}`} consumer={c} userRole={userInfo?.role} onView={handleViewConsumer} onNavigate={handleNavigate} />
            ))}
          </div>


          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-sm flex items-center px-2">Page {currentPage + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={searchQuery.trim() ? currentPage >= totalSearchPages - 1 : loading || (!hasMoreBackend && currentPage >= totalPagesLoaded - 1)}
              onClick={async () => {
                const next = currentPage + 1;
                if (!searchQuery.trim() && next >= totalPagesLoaded && hasMoreBackend && !loading) await loadConsumers(backendPage + 1);
                setCurrentPage(next);
              }}
            >
              Next
            </Button>
          </div>
        </>

      )}
    </div>
  );
});
