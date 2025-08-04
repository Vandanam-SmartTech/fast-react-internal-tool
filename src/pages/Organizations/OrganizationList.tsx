import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Building, Building2, Eye, Search, Phone, FileText, MoreVertical } from 'lucide-react';
import { fetchOrganizations, deleteOrganization, Organization } from '../../services/organizationService';
import { toast } from 'react-toastify';

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const data = await fetchOrganizations();
      setOrganizations(data);
      setFilteredOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(term.toLowerCase()) ||
      org.displayName?.toLowerCase().includes(term.toLowerCase()) ||
      org.contactNumber?.includes(term) ||
      org.gstNumber?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredOrganizations(filtered);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id);
        toast.success('Organization deleted successfully');
        loadOrganizations();
      } catch (error) {
        toast.error('Failed to delete organization');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Building className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
                            navigate(`/organization-view/${org.id}`);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/agencies/${org.id}`);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Building2 className="h-4 w-4" />
                          View Agencies
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/organization-form/${org.id}`);
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
                    onClick={() => navigate(`/organization-view/${org.id}`)}
                    className="flex-1 bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/agencies/${org.id}`)}
                    className="flex-1 bg-white text-green-600 border border-green-300 px-3 py-2 rounded text-sm hover:bg-green-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Building2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Agencies</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/organization-form/${org.id}`)}
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
    </div>
  );
};

export default OrganizationList;