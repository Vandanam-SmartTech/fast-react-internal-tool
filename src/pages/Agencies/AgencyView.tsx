import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Building, Building2, Users, Shield, UserCheck, Briefcase } from 'lucide-react';
import { getOrganizationById, fetchAllUsersByOrgId } from '../../services/organizationService';
import { toast } from 'react-toastify';

interface OrganizationUser {
  id: number;
  username: string;
  nameAsPerGovId: string;
  emailAddress: string;
  contactNumber: string;
  organizationRoles: Array<{
    organizationId: number;
    organizationName: string;
    roleId: number;
    roleName: string;
  }>;
}

const AgencyView: React.FC = () => {
  //const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<any>(null);
  const [orgUsers, setOrgUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const location = useLocation();
  const orgId = location.state?.orgId;
  const agencyId = location.state?.agencyId

  useEffect(() => {
    if (agencyId) {
      loadOrganization(parseInt(agencyId));
      loadUsersByOrg(agencyId);
    }
  }, [agencyId]);

  const loadOrganization = async (agencyId: number) => {
    try {
      const agency = await getOrganizationById(agencyId);
      setOrganization(agency);
    } catch (error) {
      toast.error('Failed to load agency');
      navigate('/agencies');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersByOrg = async (agencyId: string | number) => {
      try {
        setUsersLoading(true);
        const data = await fetchAllUsersByOrgId(agencyId);
        setOrgUsers(data);  
      } catch (error) {
        toast.error("Failed to load organization users");
      } finally {
        setUsersLoading(false);
      }
    };


  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!organization) return <div className="flex justify-center p-8">Organization not found</div>;

  //const isAgency = organization.parentId !== null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() =>
            navigate(-1)
          }
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Agency Details
        </h1>
        <button
          onClick={() => navigate("/edit-agency",{
            state:{
              orgId: orgId,
              agencyId: agencyId,
            }
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Short Name)</label>
            <p className="text-gray-900">{organization.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <p className="text-gray-900">{organization.displayName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
            <p className="text-gray-900">{organization.legalName || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <p className="text-gray-900">
              {`${organization.addressLine1}, ${organization.villageName}, ${organization.talukaName}, ${organization.districtName}, ${organization.pinCode}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <p className="text-gray-900">{organization.contactNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <p className="text-gray-900">{organization.gstNumber || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Government Registration Number</label>
            <p className="text-gray-900">{organization.govtRegNumber || '-'}</p>
          </div>

          {organization.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">{new Date(organization.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

      </div>

      {/* Organization Users Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Agency Members ({orgUsers.length})
        </h2>

        {usersLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-6">
            {orgUsers.length > 0 ? (
              <div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {orgUsers.map(user => (
                    <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{user.nameAsPerGovId}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        <div>{user.emailAddress}</div>
                        <div>{user.contactNumber}</div>
                      </div>

                      {/* ✅ Show all roles with organization names */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.organizationRoles?.map((role, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-[11px] rounded-full bg-blue-100 text-blue-800"
                          >
                            {role.roleName.replace('ROLE_', '')} — {role.organizationName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No users assigned to this organization
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AgencyView;