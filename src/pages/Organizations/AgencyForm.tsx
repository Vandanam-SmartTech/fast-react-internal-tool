import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { createOrganization, updateOrganization, getOrganizationById, Organization } from '../../services/organizationService';
import { fetchClaims } from '../../services/jwtService';
import { toast } from 'react-toastify';

const AgencyForm: React.FC = () => {
  const { orgId, agencyId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(agencyId);

  const [formData, setFormData] = useState<Organization>({
    name: '',
    displayName: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    contactNumber: '',
    parentId: parseInt(orgId!)
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && agencyId) {
      loadAgency(parseInt(agencyId));
    }
  }, [agencyId, isEdit]);

  const loadAgency = async (id: number) => {
    try {
      const agency = await getOrganizationById(id);
      setFormData(agency);
    } catch (error) {
      toast.error('Failed to load agency');
      navigate(`/agencies/${orgId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const claims = await fetchClaims();
      const userId = claims?.id || claims?.user_id || claims?.userId;
      
      const agencyData = {
        ...formData,
        parentId: parseInt(orgId!),
        createdBy: userId
      };
      
      if (isEdit && agencyId) {
        await updateOrganization(parseInt(agencyId), agencyData);
        toast.success('Agency updated successfully');
      } else {
        await createOrganization(agencyData);
        toast.success('Agency created successfully');
      }
      navigate(`/agencies/${orgId}`);
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} agency`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/agencies/${orgId}`)}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Agency' : 'Create Agency'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1 || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode || ''}
              onChange={handleChange}
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber || ''}
              onChange={handleChange}
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(`/agencies/${orgId}`)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgencyForm;