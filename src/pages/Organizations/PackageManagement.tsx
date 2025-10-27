import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import {
  fetchOrganizations,
  fetchAgenciesForOrg,
} from "../../services/organizationService";
import { fetchPhaseType } from "../../services/customerRequisitionService";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import { Plus, Trash2 } from "lucide-react";

interface Organization {
  id: number;
  name: string;
}

interface Agency {
  id: number;
  name: string;
}

interface PhaseType {
  id: number;
  nameEn: string;
}

interface Package {
  id?: number;
  panelBrand: string;
  panelCapacity: string;
  inverterBrand: string;
  phaseType: string;
  organizationId?: number;
  agencyId?: number;
}

const PackageManagement: React.FC = () => {
  const { userClaims } = useUser();

  const [userRole, setUserRole] = useState<string>("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [agencyList, setAgencyList] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState<number | "">("");
  const [phaseTypes, setPhaseTypes] = useState<PhaseType[]>([]);
  const [selectedPhaseType, setSelectedPhaseType] = useState<string>("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newPackage, setNewPackage] = useState<Package>({
    panelBrand: "",
    panelCapacity: "",
    inverterBrand: "",
    phaseType: "",
  });


  useEffect(() => {
    if (userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) {
      setUserRole("ROLE_SUPER_ADMIN");

      fetchOrganizations()
        .then((data) => setOrganizations(data))
        .catch((err) => console.error("Failed to fetch organizations:", err));
    } else {
      setUserRole("Invalid Role");
    }
  }, [userClaims]);

  useEffect(() => {
    const loadPhaseTypes = async () => {
      try {
        const data = await fetchPhaseType();
        setPhaseTypes(data);
      } catch (error) {
        console.error("Failed to fetch phase types:", error);
      }
    };
    loadPhaseTypes();
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setAgencyList([]);
      setAgencyId("");
      return;
    }

    const loadAgencies = async () => {
      try {
        const data = await fetchAgenciesForOrg(Number(organizationId));
        setAgencyList(data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
        setAgencyList([]);
      }
    };

    loadAgencies();
  }, [organizationId]);

  // Filter packages by selected phase type and organization/agency
  const filteredPackages = packages.filter((pkg) => {
    const phaseMatch = !selectedPhaseType || pkg.phaseType === selectedPhaseType;
    const orgMatch = !organizationId || pkg.organizationId === organizationId;
    const agencyMatch = !agencyId || pkg.agencyId === agencyId;
    return phaseMatch && orgMatch && agencyMatch;
  });

  const handleAddPackage = () => {
    if (!selectedPhaseType) {
      alert("Please select a phase type first");
      return;
    }
    setNewPackage({ ...newPackage, phaseType: selectedPhaseType });
    setIsModalOpen(true);
  };

  const handleSubmitPackage = () => {
    if (!newPackage.panelBrand || !newPackage.panelCapacity || !newPackage.inverterBrand) {
      alert("Please fill in all fields");
      return;
    }

    const packageToAdd = {
      ...newPackage,
      phaseType: selectedPhaseType,
      organizationId: organizationId ? Number(organizationId) : undefined,
      agencyId: agencyId ? Number(agencyId) : undefined,
    };

    // Add package to the list (In a real app, you'd make an API call here)
    setPackages([...packages, { ...packageToAdd, id: Date.now() }]);
    
    // Reset form
    setNewPackage({
      panelBrand: "",
      panelCapacity: "",
      inverterBrand: "",
      phaseType: "",
    });
    setIsModalOpen(false);
  };

  const handleDeletePackage = (packageId?: number) => {
    setPackages(packages.filter((pkg) => pkg.id !== packageId));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPackage({
      ...newPackage,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-start ml-2 p-2">
      {/* --- Header Section with Dropdowns --- */}
      {userRole === "ROLE_SUPER_ADMIN" ? (
        <>
<div className="flex flex-wrap items-end gap-6 p-4 w-full bg-gray-50 rounded-lg mb-6">
  {/* Organization Dropdown */}
  <div className="flex flex-col w-64">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Organization
    </label>
    <select
      value={organizationId}
      onChange={(e) => {
        setOrganizationId(Number(e.target.value));
        setAgencyId("");
      }}
      className="block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">All Organizations</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  </div>

  {/* Agency Dropdown */}
  <div className="flex flex-col w-64">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Agency
    </label>
    <select
      value={agencyId}
      onChange={(e) => setAgencyId(Number(e.target.value))}
      className="block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">All Agencies</option>
      {agencyList.map((agency) => (
        <option key={agency.id} value={agency.id}>
          {agency.name}
        </option>
      ))}
    </select>
  </div>

  {/* Phase Type Dropdown */}
  <div className="flex flex-col w-64">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Phase Type
    </label>
    <select
      value={selectedPhaseType}
      onChange={(e) => setSelectedPhaseType(e.target.value)}
      className="block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">All Phase Types</option>
      {phaseTypes.map((phase) => (
        <option key={phase.id} value={phase.nameEn}>
          {phase.nameEn}
        </option>
      ))}
    </select>
  </div>

  {/* Add Button */}
  <div className="flex items-end">
    <Button
      onClick={handleAddPackage}
      variant="primary"
      leftIcon={<Plus className="h-4 w-4" />}
      className="mt-auto"
    >
      Add New Package
    </Button>
  </div>
</div>



          {/* Packages Grid - 3 cards per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  hover
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Package #{pkg.id}
                      </h3>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Delete package"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Panel Brand
                        </p>
                        <p className="text-base text-gray-900">
                          {pkg.panelBrand}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Panel Capacity
                        </p>
                        <p className="text-base text-gray-900">
                          {pkg.panelCapacity} kW
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Inverter Brand
                        </p>
                        <p className="text-base text-gray-900">
                          {pkg.inverterBrand}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Phase Type
                        </p>
                        <p className="text-sm text-gray-900">{pkg.phaseType}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 text-lg">
                  No packages found. Click "Add New Package" to create one.
                </p>
              </div>
            )}
          </div>

          {/* Add Package Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add New Package"
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phase Type
                </label>
                <select
                  value={selectedPhaseType}
                  onChange={(e) => setSelectedPhaseType(e.target.value)}
                  className="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Phase Type</option>
                  {phaseTypes.map((phase) => (
                    <option key={phase.id} value={phase.nameEn}>
                      {phase.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Brand
                </label>
                <input
                  type="text"
                  name="panelBrand"
                  value={newPackage.panelBrand}
                  onChange={handleFormChange}
                  placeholder="Enter panel brand"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Capacity (kW)
                </label>
                <input
                  type="text"
                  name="panelCapacity"
                  value={newPackage.panelCapacity}
                  onChange={handleFormChange}
                  placeholder="Enter panel capacity (e.g., 3.3)"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inverter Brand
                </label>
                <input
                  type="text"
                  name="inverterBrand"
                  value={newPackage.inverterBrand}
                  onChange={handleFormChange}
                  placeholder="Enter inverter brand"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitPackage}
                >
                  Add Package
                </Button>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <p className="text-red-500 text-sm text-center mt-6">
          You don't have permission to view this page.
        </p>
      )}
    </div>
  );
};

export default PackageManagement;
