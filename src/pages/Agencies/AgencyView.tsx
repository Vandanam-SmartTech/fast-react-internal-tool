import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Building, Building2, Users, Shield, UserCheck, Briefcase } from 'lucide-react';
import { getOrganizationById, Organization, fetchOrganizationUsers } from '../../services/organizationService';
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
  const { id } = useParams();
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
      loadOrganizationUsers(parseInt(agencyId));
    }
  }, [id]);

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

  const loadOrganizationUsers = async (agencyId: number) => {
    setUsersLoading(true);
    try {
      const usersWithOrgRoles: OrganizationUser[] = await fetchOrganizationUsers(agencyId);
      setOrgUsers(usersWithOrgRoles);
    } catch (error) {
      console.error('Failed to load organization users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const getUsersByRole = (roleName: string) => {
    return orgUsers.filter(user =>
      user.organizationRoles?.some(role =>
        role.organizationId === parseInt(agencyId!) && role.roleName === roleName
      )
    );
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!organization) return <div className="flex justify-center p-8">Organization not found</div>;

  const isAgency = organization.parentId !== null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() =>
            navigate("/agencies", {
              state: {
                orgId: orgId,
              },
            })
          }
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {isAgency ? <Building2 className="h-6 w-6" /> : <Building className="h-6 w-6" />}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{organization.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <p className="text-gray-900">{organization.displayName || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
            <p className="text-gray-900">{organization.legalName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <p className="text-gray-900">{organization.addressLine1 || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <p className="text-gray-900">{organization.addressLine2 || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <p className="text-gray-900">{organization.pinCode || '-'}</p>
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

        {/* {!isAgency && (
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => navigate(`/agencies/${id}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Building2 className="h-4 w-4" />
              View Agencies
            </button>
          </div>
        )} */}
      </div>

      {/* Organization Users Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Agency Members
        </h2>

        {usersLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-6">
            {/* Admins */}
            {(() => {
              const admins = getUsersByRole('ROLE_ORG_ADMIN').concat(getUsersByRole('ROLE_AGENCY_ADMIN'));
              return admins.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    Administrators ({admins.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {admins.map(user => (
                      <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{user.nameAsPerGovId}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            {user.organizationRoles.find(r => r.organizationId === parseInt(id!))?.roleName.replace('ROLE_', '')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{user.emailAddress}</div>
                          <div>{user.contactNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Representatives */}
            {(() => {
              const representatives = getUsersByRole('ROLE_ORG_REPRESENTATIVE').concat(getUsersByRole('ROLE_AGENCY_REPRESENTATIVE'));
              return representatives.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    Representatives ({representatives.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {representatives.map(user => (
                      <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{user.nameAsPerGovId}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            REPRESENTATIVE
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{user.emailAddress}</div>
                          <div>{user.contactNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Staff */}
            {(() => {
              const staff = getUsersByRole('ROLE_ORG_STAFF').concat(getUsersByRole('ROLE_AGENCY_STAFF'));
              return staff.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Staff ({staff.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {staff.map(user => (
                      <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{user.nameAsPerGovId}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            STAFF
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{user.emailAddress}</div>
                          <div>{user.contactNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Customers */}
            {(() => {
              const customers = getUsersByRole('ROLE_CUSTOMER');
              return customers.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Customers ({customers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customers.map(user => (
                      <div key={user.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{user.nameAsPerGovId}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            CUSTOMER
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{user.emailAddress}</div>
                          <div>{user.contactNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {orgUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users assigned to this Agency
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyView;