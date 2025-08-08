import React, { useState, useEffect, useMemo } from "react";
import { fetchConsumersWithConnections } from "../../services/customerRequisitionService";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Mail, 
  Phone, 
  Lightbulb, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Star,
  Zap
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

  const loadConsumers = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchConsumersWithConnections(page);
      console.log('Loaded consumers data:', data.content);
      setConsumers(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching consumers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load all consumers for comprehensive search
  const loadAllConsumers = async () => {
    if (allConsumers.length > 0) return; // Already loaded
    
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

    // If we don't have all consumers loaded yet, load them
    if (allConsumers.length === 0) {
      await loadAllConsumers();
    }

    // Search through all consumers
    const searchTerm = query.toLowerCase().trim();
    const results = allConsumers.filter(consumer => {
      // Search in customer name
      if (consumer.govIdName?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in email
      if (consumer.emailAddress?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in mobile number
      if (consumer.mobileNumber?.toString().includes(searchTerm)) return true;
      
      // Search in connections
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

    // Enhanced filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    const data = searchQuery.trim() !== "" ? searchResults : consumers;
    
    let filtered = data.filter(consumer => {
      // Filter by connections
      if (filters.hasConnections !== null) {
        const hasConnections = consumer.connections && consumer.connections.length > 0;
        if (filters.hasConnections !== hasConnections) return false;
      }
      
      // Filter by email
      if (filters.hasEmail !== null) {
        const hasEmail = consumer.emailAddress && consumer.emailAddress !== "NA";
        if (filters.hasEmail !== hasEmail) return false;
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
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
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
            <Mail className="w-4 h-4 text-secondary-500 flex-shrink-0" />
            <span className="text-sm text-secondary-700 dark:text-secondary-300 truncate">
              {consumer.emailAddress || "No email provided"}
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <Phone className="w-4 h-4 text-secondary-500 flex-shrink-0" />
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
                  <div className="text-xs text-secondary-600 dark:text-secondary-400 font-mono">
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
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              Customer Directory
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              Manage and view all your customers and their connections
            </p>
          </div>
          
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, mobile number, or connection ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
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
              className="flex items-center gap-2 text-secondary-600 hover:text-secondary-800"
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
                {/* Connection Filter */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Connections
                  </label>
                  <select
                    value={filters.hasConnections === null ? '' : filters.hasConnections.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      hasConnections: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All</option>
                    <option value="true">With Connections</option>
                    <option value="false">Without Connections</option>
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
                    <option value="connections">Connections</option>
                    <option value="date">Date Added</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Order
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortOrder: e.target.value as FilterOptions['sortOrder']
                    }))}
                    className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          {loading || isLoadingAll ? (
            isLoadingAll ? "Loading all customers for search..." : "Loading customers..."
          ) : (
            `Showing ${filteredAndSortedData.length} customer${filteredAndSortedData.length !== 1 ? 's' : ''}`
          )}
        </div>
        
        {!loading && !isLoadingAll && filteredAndSortedData.length > 0 && (
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {searchQuery.trim() !== "" && `Search results for "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading customers...
          </div>
        </div>
      )}

      {/* Loading All Data for Search */}
      {isLoadingAll && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
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
                <p className="text-secondary-600 dark:text-secondary-400">
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