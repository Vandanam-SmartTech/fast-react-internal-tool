import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Building2, ArrowLeft, Eye, Search } from 'lucide-react';
import { getChildOrganizations, deleteOrganization, Organization } from '../../services/organizationService';
import { toast } from 'react-toastify';

const AgencyList: React.FC = () => {
  const { orgId } = useParams();
  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (orgId) {
      loadAgencies(parseInt(orgId));
    }
  }, [orgId]);

  const loadAgencies = async (parentId: number) => {
    try {
      const data = await getChildOrganizations(parentId);
      setAgencies(data);
      setFilteredAgencies(data);
    } catch (error) {
      toast.error('Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = agencies.filter(agency => 
      agency.name.toLowerCase().includes(term.toLowerCase()) ||
      agency.displayName?.toLowerCase().includes(term.toLowerCase()) ||
      agency.contactNumber?.includes(term)
    );
    setFilteredAgencies(filtered);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await deleteOrganization(id);
        toast.success('Agency deleted successfully');
        loadAgencies(parseInt(orgId!));
      } catch (error) {
        toast.error('Failed to delete agency');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/organizations')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Agencies
        </h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => navigate(`/agency-form/${orgId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Agency
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAgencies.map((agency) => (
              <tr key={agency.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {agency.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {agency.displayName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {agency.contactNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/organization-view/${agency.id}`)}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/agency-form/${orgId}/${agency.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(agency.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAgencies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No agencies match your search' : 'No agencies found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyList;