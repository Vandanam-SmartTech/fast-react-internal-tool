import React, { useState, useEffect } from 'react';
import { Building2, Check } from 'lucide-react';
import { fetchOrganizations, Organization } from '../services/organizationService';

interface OrganizationSelectorProps {
  onSelect: (orgId: string, orgName: string) => void;
  onCancel: () => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ onSelect, onCancel }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await fetchOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  const handleSelect = () => {
    if (selectedOrgId) {
      const selectedOrg = organizations.find(org => org.id?.toString() === selectedOrgId);
      if (selectedOrg) {
        onSelect(selectedOrgId, selectedOrg.name);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Select Organization</h2>
        </div>

        {/* Content area */}
        <div className="space-y-2 mb-4 overflow-y-auto flex-1">
          {loading ? (
            // Loading Spinner
            <div className="flex justify-center py-8">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          ) : organizations.length === 0 ? (
            // No organizations found
            <div className="text-center text-gray-500 py-4">
              No organizations found
            </div>
          ) : (
            // List of organizations
            organizations.map((org) => (
              <label
                key={org.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="organization"
                  value={org.id?.toString()}
                  checked={selectedOrgId === org.id?.toString()}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="text-blue-600"
                />
                <span className="flex-1">{org.name}</span>
              </label>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedOrgId || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelector;
