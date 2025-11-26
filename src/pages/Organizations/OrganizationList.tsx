import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Building, Building2, Eye, Search, Phone, FileText, MoreVertical, RefreshCw } from 'lucide-react';
import { fetchOrganizationsInPagination, deleteOrganization, Organization } from '../../services/organizationService';
import { fetchOrganizationImage } from '../../services/documentManagerService';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui';

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [organizationLogos, setOrganizationLogos] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    loadOrganizations(0);
  }, []);

  useEffect(() => {
    loadOrganizations(currentPage);
  }, [currentPage]);

  const loadOrganizations = async (page: number) => {
    try {
      setLoading(true);
      const data = await fetchOrganizationsInPagination(page);
      setOrganizations(data.content);
      setFilteredOrganizations(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.currentPage);
    } catch (error) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    organizations.forEach(async (org) => {
      if (org.id && !organizationLogos.has(org.id)) {
        try {
          const imageUrl = await fetchOrganizationImage(org.id);
          setOrganizationLogos(prevLogos => new Map(prevLogos).set(org.id!, imageUrl));
        } catch (error) {
          console.error(`Failed to fetch logo for organization ${org.id}:`, error);
        }
      }
    });
  }, [organizations, organizationLogos]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(term.toLowerCase()) ||
        org.displayName?.toLowerCase().includes(term.toLowerCase()) ||
        org.contactNumber?.includes(term) ||
        org.gstNumber?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  };

  const renderPagination = () => {
    if (searchTerm.trim() !== "") return null;

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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id);
        toast.success('Organization deleted successfully',{
          autoClose:1000,
          hideProgressBar:true,
        });
        loadOrganizations(currentPage);
      } catch (error) {
        toast.error('Failed to delete organization',{
          autoClose:1000,
          hideProgressBar:true,
        });
      }
    }
    setOpenDropdown(null);
  };

  const toggleDropdown = (id: number) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="inline-flex items-center gap-2 text-gray-700">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading organizations...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="h-6 w-6" />
          Organizations
        </h1>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => navigate('/organization-form')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
        </div>

        {!loading && filteredOrganizations.length > 0 && searchTerm.trim() !== "" && (
          <div className="text-sm text-gray-700">
            Search results for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Cards Grid */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No organizations match your search' : 'No organizations found'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/organization-form')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first organization
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {organizationLogos.has(org.id!) && (
                      <img
                        src={organizationLogos.get(org.id!)}
                        alt={`${org.name} logo`}
                        className="h-12 w-12 object-contain rounded-full border border-gray-200 p-1 bg-white"
                      />
                    )}
                    {!organizationLogos.has(org.id!) && (
                      <Building className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                    <h3 className="font-semibold text-gray-900 truncate" title={org.name}>
                      {org.name}
                    </h3>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(org.id!);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>

                    {openDropdown === org.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-40">
                        <button
                          onClick={() => {
                            navigate("/organization-view", {
                              state: { orgId: org.id }
                            });
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            navigate("/agencies", {
                              state: { orgId: org.id }
                            });
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Building2 className="h-4 w-4" />
                          View Agencies
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/edit-organization`, {
                              state: {
                                organizationId: org.id,
                                gstNumber: org.gstNumber,
                              }
                            });
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(org.id!)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Name */}
                {org.displayName && (
                  <p className="text-sm text-gray-600 mb-3 truncate" title={org.displayName}>
                    {org.displayName}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2">
                  {org.contactNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{org.contactNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate" title={org.gstNumber || 'Not Available'}>
                      {org.gstNumber || 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons - Mobile Friendly */}
              <div className="border-t border-gray-100 p-3 bg-gray-50">
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={() =>
                      navigate("/organization-view", {
                        state: { orgId: org.id }
                      })
                    }

                    className="flex-1 bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate("/agencies", {
                        state: { orgId: org.id, gstNumber:org.gstNumber }
                      })
                    }

                    className="flex-1 bg-white text-green-600 border border-green-300 px-3 py-2 rounded text-sm hover:bg-green-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Building2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Agencies</span>
                  </button>

                  <button
                    onClick={() => navigate(`/edit-organization`, {
                      state: {
                        organizationId: org.id
                      }
                    })}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination() && (
        <div className="flex justify-center items-center mt-8 gap-2">
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default OrganizationList;