import React, { useState, useEffect, useMemo } from "react";
import { fetchOnboardedConsumers, getMaterialsByConnectionId } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  User, 
  Zap, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  FileText,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "../../components/ui";
import Card, { CardBody } from "../../components/ui/Card";

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

interface FilterOptions {
  hasMaterials: boolean | null;
  hasEmail: boolean | null;
  connectionType: string;
  sortBy: 'name' | 'email' | 'consumerId' | 'connectionType';
  sortOrder: 'asc' | 'desc';
}

const OnboardedConsumers: React.FC = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [materialsMap, setMaterialsMap] = useState<Record<number, boolean>>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [allConsumers, setAllConsumers] = useState<Consumer[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    hasMaterials: null,
    hasEmail: null,
    connectionType: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const handleViewConsumer = (consumer: Consumer) => {
    console.log('Viewing onboarded consumer:', { consumer });
    navigate(`/view-connection/${consumer.id}`, {
      state: {
        customerId: consumer.customerId,
        connectionId: consumer.id,
        consumerId: consumer.consumerId,
      },
    });
  };

  const handleGenerateDocuments = (consumer: Consumer) => {
    navigate(`/generatedocuments/${consumer.id}`, { state: { consumer } });
  };

  const handleMaterialDetails = (consumer: Consumer) => {
    navigate(`/material-form/${consumer.id}`, {
      state: { consumer, connectionId: consumer.id },
    });
  };

  const handleViewMaterialDetails = (consumer: Consumer) => {
    navigate(`/material-form/${consumer.id}`, {
      state: { consumer, connectionId: consumer.id },
    });
  };
  
  const loadOnboardedConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchOnboardedConsumers(page);
      setConsumers(data.content);
      setTotalPages(data.totalPages);

            // Use materials data from API response
      const map: Record<number, boolean> = {};
      data.content.forEach((consumer: Consumer) => {
        map[consumer.id] = consumer.materials ? consumer.materials.length > 0 : false;
      });
      setMaterialsMap(map);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load all onboarded consumers for comprehensive search
  const loadAllOnboardedConsumers = async () => {
    if (allConsumers.length > 0) return; // Already loaded
    
    try {
      setIsLoadingAll(true);
      const allData: Consumer[] = [];
      let currentPage = 0;
      let hasMorePages = true;

      while (hasMorePages) {
        const data = await fetchOnboardedConsumers(currentPage);
        allData.push(...data.content);
        
        if (currentPage >= data.totalPages - 1) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      setAllConsumers(allData);
    } catch (error) {
      console.error("Error loading all onboarded consumers:", error);
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    const data = searchQuery.trim() !== "" ? allConsumers : consumers;
    
    let filtered = data.filter(consumer => {
      // Search filter
      if (searchQuery.trim()) {
        const lowerSearch = searchQuery.toLowerCase();
        const matches = 
          String(consumer.govIdName).toLowerCase().includes(lowerSearch) ||
          String(consumer.emailAddress).toLowerCase().includes(lowerSearch) ||
          String(consumer.mobileNumber).toLowerCase().includes(lowerSearch) ||
          String(consumer.consumerId).toLowerCase().includes(lowerSearch) ||
          String(consumer.connectionType).toLowerCase().includes(lowerSearch);
        
        if (!matches) return false;
      }

      // Filter by materials
      if (filters.hasMaterials !== null) {
        const hasMaterials = materialsMap[consumer.id] || false;
        if (filters.hasMaterials !== hasMaterials) return false;
      }

      // Filter by email
      if (filters.hasEmail !== null) {
        const hasEmail = consumer.emailAddress && consumer.emailAddress !== "NA";
        if (filters.hasEmail !== hasEmail) return false;
      }

      // Filter by connection type
      if (filters.connectionType && filters.connectionType !== '') {
        if (consumer.connectionType !== filters.connectionType) return false;
      }

      return true;
    });

    // Sorting
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
        case 'consumerId':
          aValue = a.consumerId;
          bValue = b.consumerId;
          break;
        case 'connectionType':
          aValue = a.connectionType?.toLowerCase() || '';
          bValue = b.connectionType?.toLowerCase() || '';
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
  }, [consumers, allConsumers, searchQuery, materialsMap, filters]);

  const clearFilters = () => {
    setFilters({
      hasMaterials: null,
      hasEmail: null,
      connectionType: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.hasMaterials !== null) count++;
    if (filters.hasEmail !== null) count++;
    if (filters.connectionType !== '') count++;
    return count;
  };

  // Get unique connection types for filter dropdown
  const connectionTypes = useMemo(() => {
    const types = new Set(consumers.map(c => c.connectionType).filter(Boolean));
    return Array.from(types).sort();
  }, [consumers]);

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

  useEffect(() => {
    loadAllOnboardedConsumers();
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
    <Card key={consumer.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardBody className="p-6">
        {/* Header with status indicators */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 truncate">
              {consumer.govIdName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span className="text-sm text-success-600 dark:text-success-400">Onboarded</span>
              </div>
              {consumer.emailAddress && consumer.emailAddress !== "NA" && (
                <div className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-primary-600 dark:text-primary-400">Active</span>
                </div>
              )}
              {materialsMap[consumer.id] && (
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-solar-500" />
                  <span className="text-sm text-solar-600 dark:text-solar-400">Materials Added</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                            <Mail className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-secondary-700 dark:text-secondary-300 truncate">
              {consumer.emailAddress || "No email provided"}
  </span>
</div>

          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                            <Phone className="w-4 h-4 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              {consumer.mobileNumber}
      </span>
    </div>

          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
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

        {/* Action Buttons */}
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
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              Onboarded Customers
            </h1>
            <p className="text-secondary-700 dark:text-secondary-300 mt-1">
              Manage customers who have completed the onboarding process
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
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
            placeholder="Search onboarded customers..."
            value={searchQuery}
            onChange={async (e) => {
              const query = e.target.value;
              setSearchQuery(query);
              
              if (query.trim() && allConsumers.length === 0) {
                await loadAllOnboardedConsumers();
              }
            }}
            className="w-full pl-10 pr-4 py-3 border border-secondary-200 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                {getActiveFiltersCount()}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-2 text-secondary-700 dark:text-secondary-300 hover:text-secondary-800 dark:hover:text-secondary-100"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="animate-slide-down">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Materials Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Materials Status
                  </label>
                  <select
                    value={filters.hasMaterials === null ? '' : filters.hasMaterials.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasMaterials: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All</option>
                    <option value="true">With Materials</option>
                    <option value="false">Without Materials</option>
                  </select>
                </div>

                {/* Email Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email Status
                  </label>
                  <select
                    value={filters.hasEmail === null ? '' : filters.hasEmail.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasEmail: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All</option>
                    <option value="true">With Email</option>
                    <option value="false">Without Email</option>
                  </select>
                </div>

                {/* Connection Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Connection Type
                  </label>
                  <select
                    value={filters.connectionType}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      connectionType: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    {connectionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value as FilterOptions['sortBy']
                    }))}
                    className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="consumerId">Consumer ID</option>
                    <option value="connectionType">Connection Type</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>
              )}
            </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-secondary-700 dark:text-secondary-300">
          {loading || isLoadingAll ? (
            isLoadingAll ? "Loading all onboarded customers for search..." : "Loading onboarded customers..."
          ) : (
            `Showing ${filteredAndSortedData.length} onboarded customer${filteredAndSortedData.length !== 1 ? 's' : ''}`
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
          <div className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading onboarded customers...
          </div>
        </div>
      )}

      {/* Loading All Data for Search */}
      {isLoadingAll && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading all onboarded customers for search...
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

export default OnboardedConsumers;