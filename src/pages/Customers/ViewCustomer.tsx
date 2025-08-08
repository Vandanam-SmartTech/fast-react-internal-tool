import { useEffect, useState } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { redirectToDashboard } from '../../routes/DashboardRoute'
import { getCustomerById, fetchConsumerNumber, getInstallationByConsumerId, fetchInstallationSpaceTypesNames } from "../../services/customerRequisitionService";
import { fetchClaims } from "../../services/jwtService";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid"
import { Eye, User, Phone, Mail, MapPin, Settings, CheckCircle, Plus, Edit } from 'lucide-react';

export const ViewCustomer = () => {
  
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const navigate = useNavigate();
  const customerId = location.state?.customerId;
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [roles, setRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Customer Details");
  const [installationsByConsumer, setInstallationsByConsumer] = useState<Record<string, any[]>>({});
  const [spaceTypes, setSpaceTypes] = useState<{ id: number; nameEnglish: string }[]>([]);

  useEffect(() => {
    if (!location.state) {
      redirectToDashboard(navigate);
    }
  }, [location, navigate]);

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  useEffect(() => {
    const getClaims = async () => {
      try {
        const claims = await fetchClaims();
        setRoles(claims.roles || []);
      } catch (error) {
        console.error("Failed to fetch user claims", error);
      }
    };

    getClaims();
  }, []);

  useEffect(() => {
    const fetchAllInstallations = async () => {
      if (!connections || connections.length === 0) return;

      const newInstallationsMap: Record<string, any[]> = {};

      for (const connection of connections) {
        if (!connection.consumerId) continue;

        const data = await getInstallationByConsumerId(Number(connection.consumerId));
        newInstallationsMap[connection.consumerId] = data || [];
      }

      setInstallationsByConsumer(newInstallationsMap);
    };

    fetchAllInstallations();
  }, [connections]);

  useEffect(() => {
    const loadSpaceTypes = async () => {
      try {
        const types = await fetchInstallationSpaceTypesNames();
        setSpaceTypes(types);
      } catch (error) {
        console.error("Failed to load space types", error);
      }
    };

    loadSpaceTypes();
  }, []);

  const getSpaceTypeName = (id: number) => {
    return spaceTypes.find((type) => type.id === id)?.nameEnglish || "Unknown";
  };

  useEffect(() => {
    console.log("Fetch Consumer Number API is used");
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setCustomer(data);
      }
    };

    const fetchConnections = async () => {
      if (customerId) {
        const data = await fetchConsumerNumber(Number(customerId));
        if (data) setConnections(data);
      }
    };

    fetchCustomer();
    fetchConnections();
  }, [customerId]);

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">View Customer Details</h1>
                <p className="text-gray-600 mt-1">Customer information and connections overview</p>
              </div>
            </div>

            {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 rounded-full"></div>
            <div className="relative flex justify-between">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab;
                const Icon = tab === "Customer Details" ? UserCircleIcon : 
                           tab === "Connection Details" ? BoltIcon :
                           tab === "Installation Details" ? HomeModernIcon : Cog6ToothIcon;

                return (
                  <div key={tab} className="flex flex-col items-center">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium mt-2 text-center ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {tab}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Name as per Government ID
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {customer.govIdName || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Mobile Number
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {customer.mobileNumber || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Preferred Name
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {customer.preferredName || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Address
                </label>
                <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  {customer.emailAddress || "Not provided"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() =>
                  navigate(`/edit-customer/${customerId}`, {
                    state: {
                      customerId,
                      selectedRepresentative,
                    },
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Edit className="h-5 w-5" />
                Edit Customer
              </button>

              {connections.length === 0 && (
                <button
                  onClick={() =>
                    navigate(`/ConnectionForm`, {
                      state: {
                        customerId,
                        selectedRepresentative,
                        govIdName: customer.govIdName,
                      },
                    })
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  Add New Connection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Connections Section */}
        {connections.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                <BoltIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Connections</h2>
            </div>

            {connections.map((connection, index) => (
              <div key={connection.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BoltIcon className="h-5 w-5" />
                      Connection {index + 1}
                    </h3>
                    <button
                      onClick={() =>
                        navigate(`/view-connection/${connection.id}`, {
                          state: {
                            consumerId: connection.consumerId,
                            customerId,
                            connectionId: connection.id,
                            selectedRepresentative,
                          },
                        })
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Consumer Number
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.consumerId || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Connection Type
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.connectionTypeName || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Phase Type
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.phaseTypeName || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Monthly Consumption
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.monthlyAvgConsumptionUnits || "Not provided"} units
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Section ID
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.sectionId || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        GST Number
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.gstIn || "Not provided"}
                      </p>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Address
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.addressLine1}, {connection.villageName}, {connection.talukaName}, {connection.districtName}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Postal Code
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.postalCode || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Coordinates
                      </label>
                      <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                        {connection.latitude || "--"}, {connection.longitude || "--"}
                      </p>
                    </div>

                    {connection.isNameCorrectionRequired && (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Correction Required
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                          {connection.correctionName || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Connection Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={() =>
                        navigate(`/edit-connection/${connection.id}`, {
                          state: {
                            consumerId: connection.consumerId,
                            connectionId: connection.id,
                            customerId: customerId,
                            selectedRepresentative: selectedRepresentative,
                          },
                        })
                      }
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Edit className="h-5 w-5" />
                      Edit Connection
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/SystemSpecifications`, {
                          state: {
                            connectionId: connection.id,
                            consumerId: connection.consumerId,
                            customerId,
                            selectedRepresentative: selectedRepresentative,
                          },
                        })
                      }
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Settings className="h-5 w-5" />
                      Get Recommendation
                    </button>
                  </div>

                  {/* Installations Section */}
                  {(installationsByConsumer[connection.consumerId] || []).length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg">
                          <HomeModernIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Installations</h3>
                      </div>

                      <div className="space-y-4">
                        {(installationsByConsumer[connection.consumerId] || []).map((installation, idx) => (
                          <div key={installation.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-semibold text-gray-800">
                                Installation {idx + 1} - {getSpaceTypeName(installation.installationSpaceTypeId)}
                              </h4>
                              <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                                {installation.installationSpaceTitle}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">East-West Length</label>
                                <p className="text-sm font-semibold text-gray-900">{installation.availableEastWestLengthFt || "N/A"} ft</p>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">South-North Length</label>
                                <p className="text-sm font-semibold text-gray-900">{installation.availableSouthNorthLengthFt || "N/A"} ft</p>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">AC Wire Length</label>
                                <p className="text-sm font-semibold text-gray-900">{installation.acWireLengthFt || "N/A"} ft</p>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">DC Wire Length</label>
                                <p className="text-sm font-semibold text-gray-900">{installation.dcWireLengthFt || "N/A"} ft</p>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">Earthing Wire</label>
                                <p className="text-sm font-semibold text-gray-900">{installation.earthingWireLengthFt || "N/A"} ft</p>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">GP Pipes</label>
                                <p className="text-sm font-semibold text-gray-900">{installation.numberOfGpPipes || "N/A"}</p>
                              </div>
                            </div>

                            {installation.descriptionOfInstallation && (
                              <div className="mt-4 space-y-1">
                                <label className="block text-xs font-medium text-gray-600">Description</label>
                                <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-orange-200">
                                  {installation.descriptionOfInstallation}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-start mt-4">
                              <button
                                onClick={() =>
                                  navigate(`/edit-installation/${installation.id}`, {
                                    state: {
                                      installationId: installation.id,
                                      connectionId: connection.id,
                                      consumerId: connection.consumerId,
                                      customerId,
                                      selectedRepresentative,
                                    }
                                  })
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Installation
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-start mt-6">
                        <button
                          onClick={() => {
                            navigate(`/InstallationForm`, { 
                              state: { 
                                connectionId: connection.id, 
                                consumerId: connection.consumerId, 
                                customerId, 
                                selectedRepresentative: selectedRepresentative 
                              } 
                            });
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Plus className="h-5 w-5" />
                          Add New Installation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Installation Button if no installations */}
                  {(installationsByConsumer[connection.consumerId] || []).length === 0 && (
                    <div className="flex justify-start mt-6">
                      <button
                        onClick={() => {
                          navigate(`/InstallationForm`, { 
                            state: { 
                              connectionId: connection.id, 
                              consumerId: connection.consumerId, 
                              customerId, 
                              selectedRepresentative: selectedRepresentative 
                            } 
                          });
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Plus className="h-5 w-5" />
                        Add New Installation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Connection Button */}
            <div className="flex justify-start">
              <button
                onClick={() =>
                  navigate(`/ConnectionForm`, {
                    state: {
                      customerId: customerId,
                      selectedRepresentative: selectedRepresentative,
                      govIdName: customer.govIdName,
                    },
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Add New Connection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
