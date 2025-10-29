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
import { Plus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";
import {
  generateQuotationPDF, previewQuotationPDF, saveSystemSpecs, saveInverterSpecs, getMaterialOrigins, getGridTypes, fetchInverterBrands,
  fetchInverterBrandCapacities, fetchPanelBrands, fetchPanelBrandCapacities, fetchBatteryBrands,
  fetchBatteryBrandCapacities, getSavedSystemSpecs, updateSystemSpecs, updateInverterSpecs, getSavedSystemSpecPackages,
  getPriceDetails, saveSystemSpecPackage, saveInverterSpecPackage
} from '../../services/quotationService';
import { toast } from "react-toastify";
import { describe } from "node:test";

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
  const [phaseTypes, setPhaseTypes] = useState([]);
  const [phaseTypeId, setPhaseTypeId] = useState<number | null>(null);
  const [selectedPhaseType, setSelectedPhaseType] = useState<string>("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [materialOriginId, setMaterialOriginId] = useState<number | null>(null);
  const [origins, setOrigins] = useState<any[]>([]);

  const [gridTypeId, setGridTypeId] = useState<number | null>(null);
  const [grids, setGrids] = useState<any[]>([]);

  const [inverterBrandId, setInverterBrandId] = useState<number | null>(null);
  const [inverters, setInverters] = useState<any[]>([]);

  const [inverterSpecId, setInverterSpecId] = useState<number | null>(null);
  const [inverterCapacities, setInverterCapacities] = useState<any[]>([]);

  const [panelBrandId, setPanelBrandId] = useState<number | null>(null);
  const [panels, setPanels] = useState<any[]>([]);

  const [panelSpecId, setPanelSpecId] = useState<number | null>(null);
  const [panelCapacities, setPanelCapacities] = useState([]);

  const [systemCapacityKw, setSystemCapacityKw] = useState<number | null>(null);

  const [batteryBrands, setBatteryBrands] = useState<any[]>([]);
  const [batteryBrandId, setBatteryBrandId] = useState<number | null>(null);

  const [batterySpecId, setBatterySpecId] = useState<number | null>(null);
  const [batteryCapacities, setBatteryCapacities] = useState([]);

  const [isPrefilling, setIsPrefilling] = useState(false);

  const [priceAlreadySetFromCustomerData, setPriceAlreadySetFromCustomerData] = useState(false);
  const [isSpecsSaved, setIsSpecsSaved] = useState(false);
  const [isCustomSpecs, setIsCustomSpecs] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [savedSpecs, setSavedSpecs] = useState<any[]>([]);



  // Form state
  const [formData, setFormData] = useState({
    systemCost: 0,
    fabricationCost: 0,
    totalCost: 0,
    installationSpaceType: "",
    installationStructureType: "Static",
    hasWaterSprinkler: false,
    hasHeavydutyRamp: false,
    hasHeavydutyStairs: false,
    inverterBrandId: null,
    materialOriginId: null,
    gridTypeId: null,
    inverterSpecId: null,
    inverterCount: 1,
    panelBrandId: null,
    panelSpecId: null,
    batteryBrandId: null,
    batterySpecId: null,
    systemCapacityKw: null,
    title: "",
    description: "",
  });

  const defaultFormData = {
    systemCost: 0,
    fabricationCost: 0,
    totalCost: 0,
    installationSpaceType: "",
    installationStructureType: "Static",
    hasWaterSprinkler: false,
    hasHeavydutyRamp: false,
    hasHeavydutyStairs: false,
    inverterBrandId: null,
    materialOriginId: null,
    gridTypeId: null,
    inverterSpecId: null,
    inverterCount: 1,
    panelBrandId: null,
    panelSpecId: null,
    batteryBrandId: null,
    batterySpecId: null,
    systemCapacityKw: null,
    title: "",
    description: "",
  };

  const formatIndianNumber = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;

    const newValue = value === "" ? null : (type === "checkbox" ? checked : value);

    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    updatedFormData.totalCost =
      (Number(updatedFormData.systemCost) || 0) +
      (Number(updatedFormData.fabricationCost) || 0);

    setFormData(updatedFormData);
    setIsCustomSpecs(true);
    setIsSpecsSaved(false);
    setPriceAlreadySetFromCustomerData(false);
  };


  useEffect(() => {
    const fetchPriceDetails = async () => {
      if (formData.systemCapacityKw && formData.panelSpecId) {
        try {
          const response = await getPriceDetails({
            panelSpecsId: formData.panelSpecId ?? "",
            systemCapacityKw: formData.systemCapacityKw ?? "",
            inverterSpecsId: formData.inverterSpecId ?? "",
            batterySpecsId: formData.batterySpecId ?? "",
            inverterCount: 1,
            batteryCount: 1,
          });

          if (response) {
            setFormData((prev: any) => ({
              ...prev,
              systemCost: response.systemCost || 0,
              fabricationCost: response.fabricationCost || 0,
              totalCost: (response.systemCost || 0) + (response.fabricationCost || 0),
            }));
          }
        } catch (err) {
          console.error("Failed to fetch price details", err);
        }
      } else {
        setFormData((prev: any) => ({
          ...prev,
          systemCost: 0,
          fabricationCost: 0,
          totalCost: 0,
        }));
      }
    };

    fetchPriceDetails();
  }, [formData.systemCapacityKw, formData.panelSpecId, formData.inverterSpecId, formData.batterySpecId]);


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

  const fetchSavedSpecPackages = async () => {
    try {
      const data = await getSavedSystemSpecPackages();
      setSavedSpecs(data);
    } catch (err) {
      console.error("Error fetching saved spec packages", err);
    }
  };

  useEffect(() => {
    fetchSavedSpecPackages();
  }, []);



  useEffect(() => {
    const fetchOrigins = async () => {
      const data = await getMaterialOrigins();
      if (data) setOrigins(data);
    };

    fetchOrigins();
  }, []);

  useEffect(() => {
    const fetchGrids = async () => {
      const data = await getGridTypes();
      if (data) setGrids(data);
    };

    fetchGrids();
  }, []);

  useEffect(() => {
    const loadInverterBrands = async () => {
      if (!isPrefilling) {
        setInverters([]);
        setInverterBrandId(null);
        setInverterCapacities([]);
        setInverterSpecId(null);
        setFormData((prev) => ({
          ...prev,
          inverterBrandId: null,
          inverterSpecId: null
        }));
      }

      if (phaseTypeId !== null && gridTypeId !== null) {
        try {
          const data = await fetchInverterBrands(phaseTypeId, gridTypeId);
          setInverters([...data]);
        } catch (error) {
          console.error("Failed to fetch inverter brands:", error);
          setInverters([]);
        } finally {
          setIsPrefilling(false);
        }
      }
    };

    loadInverterBrands();
  }, [phaseTypeId, gridTypeId]);


  useEffect(() => {
    const loadInverterBrandCapacities = async () => {
      if (!isPrefilling) {
        setInverterCapacities([]);
        setInverterSpecId(null);
        setFormData((prev) => ({
          ...prev,
          inverterSpecId: null
        }));
      }

      if (inverterBrandId !== null && gridTypeId !== null) {
        try {
          const data = await fetchInverterBrandCapacities(inverterBrandId);
          setInverterCapacities([...data]);
        } catch (error) {
          console.error("Failed to fetch inverter brand capacities:", error);
          setInverterCapacities([]);
        } finally {
          setIsPrefilling(false);
        }
      }
    };

    loadInverterBrandCapacities();
  }, [inverterBrandId]);


  useEffect(() => {
    const loadPanelBrands = async () => {
      if (!isPrefilling) {
        setPanels([]);
        setPanelSpecId(null);
        setPanelCapacities([]);
        setSystemCapacityKw(null);
        setFormData((prev) => ({
          ...prev,
          panelSpecId: null,
          systemCapacityKw: null
        }));
      }

      if (materialOriginId) {
        try {
          const data = await fetchPanelBrands(Number(materialOriginId));
          setPanels([...data]);
        } catch (error) {
          console.error("Failed to fetch panel brands:", error);
          setPanels([]);
        } finally {
          setIsPrefilling(false);
        }
      }
    };

    loadPanelBrands();
  }, [materialOriginId]);


  useEffect(() => {
    const loadPanelBrandCapacities = async () => {
      if (!isPrefilling) {
        setPanelCapacities([]);
        setSystemCapacityKw(null);
        setFormData((prev) => ({
          ...prev,
          systemCapacityKw: null
        }));
      }

      if (phaseTypeId !== null && panelSpecId !== null) {
        try {
          const data = await fetchPanelBrandCapacities(phaseTypeId, panelSpecId);
          setPanelCapacities([...data]);
        } catch (error) {
          console.error("Failed to fetch panel brand capacities:", error);
          setPanelCapacities([]);
        } finally {
          setIsPrefilling(false);
        }
      }
    };

    loadPanelBrandCapacities();
  }, [phaseTypeId, panelSpecId]);


  useEffect(() => {
    const loadBatteryBrands = async () => {
      const data = await fetchBatteryBrands();
      if (data) setBatteryBrands(data);
    };

    loadBatteryBrands();
  }, []);

  useEffect(() => {

    if (!isPrefilling) {
      setBatteryCapacities([]);
      setBatterySpecId(null);
      setFormData((prev) => ({
        ...prev,
        batterySpecId: null
      }));
    }

    if (batteryBrandId !== null) {
      const loadBatteryCapacities = async () => {
        try {
          const data = await fetchBatteryBrandCapacities(batteryBrandId);
          setBatteryCapacities([...data]);
        } catch (error) {
          console.error("Failed to fetch battery brand capacities:", error);
          setBatteryCapacities([]);
        } finally {
          setIsPrefilling(false);
        }
      };

      loadBatteryCapacities();
    }
  }, [batteryBrandId, gridTypeId]);



  const handleOpenSpecsModal = () => {
    if (!phaseTypeId || !organizationId) {
      toast.error("Please select a Phase Type, Organization before adding system specs.", {
        autoClose: 1500,
        hideProgressBar: true,
      });
      return;
    }

    setIsModalOpen(true);
  };

  // const fetchSavedSpecs = async () => {
  //     try {
  //       const data = await getSavedSystemSpecs(connectionId);
  //       setSavedSpecs(data);
  //     } catch (err) {
  //       console.error("Error fetching saved specs", err);
  //     }
  //   };

  //   useEffect(() => {
  //     if (connectionId) {
  //       fetchSavedSpecs();
  //     }
  //   }, [connectionId]);

  const handleSaveSpecPackage = async () => {
    try {

      if (!formData.inverterBrandId || !formData.inverterSpecId) {
        toast.error("Please select both Inverter Brand and Inverter Specification before saving.", {
          autoClose: 1500,
          hideProgressBar: true,
        });
        return;
      }

      setIsSubmitting(true);


      const systemResponse = await saveSystemSpecPackage({
        ...formData,
        specSourceId: 2,
        panelSpecsId: formData.panelSpecId,
        batterySpecsId: formData.batterySpecId,
        orgId: organizationId,
        agencyId
      });

      console.log("System specs saved:", systemResponse);

      const systemSpecsPackageId = systemResponse.id;

      const inverterResponse = await saveInverterSpecPackage({
        systemSpecsPackageId,
        inverterSpecId: formData.inverterSpecId,
        inverterCount: 1,
      });

      console.log("Inverter specs saved:", inverterResponse);

      await fetchSavedSpecPackages();

      setIsModalOpen(false);

      toast.success("Package created successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Error saving specs:", error);
      toast.error("Failed to create package.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeletePackage = (packageId?: number) => {
    setPackages(packages.filter((pkg) => pkg.id !== packageId));
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
                value={phaseTypeId ?? ""} // handle null as empty string
                onChange={(e) => setPhaseTypeId(Number(e.target.value) || null)}
                className="block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Phase Types</option>
                {phaseTypes.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.nameEn}
                  </option>
                ))}
              </select>
            </div>


            {/* Add Button */}
            <div className="flex items-end">
              <Button
                onClick={handleOpenSpecsModal}
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                className="mt-auto"
              >
                Add New Package
              </Button>
            </div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {savedSpecs.length > 0 ? (
              savedSpecs.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-[0_10px_25px_-10px_rgba(2,6,23,0.25)] hover:shadow-[0_20px_40px_-12px_rgba(2,6,23,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300"
                >
                  {/* Decorative gradient glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/10 via-sky-400/10 to-cyan-300/10 blur-2xl"></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                          {pkg.title}
                        </h3>
                        {pkg.description && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{pkg.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200">
                        {pkg.systemCapacityKw} kW
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4 rounded-xl bg-gradient-to-r from-slate-50 to-white ring-1 ring-slate-200 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
                          <CurrencyRupeeIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-slate-500">Total Price</span>
                      </div>
                      <div className="text-lg font-bold tracking-tight text-slate-900">
                        ₹{formatIndianNumber((pkg.systemCost || 0) + (pkg.fabricationCost || 0))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs">
                      <div>
                        <p className="text-slate-500">Grid Type</p>
                        <p className="font-semibold text-slate-900 truncate">{pkg.gridTypeName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Origin</p>
                        <p className="font-semibold text-slate-900">{pkg.originCode}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Panel Brand</p>
                        <p className="font-semibold text-slate-900 truncate">{pkg.panelBrandShortName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Wattage</p>
                        <p className="font-semibold text-slate-900">{pkg.panelRatedWattageW} W</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Inverter</p>
                        <p className="font-semibold text-slate-900 truncate">{pkg.inverterBrandName || "—"}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">
                  No packages found. Click "Add New Package" to create one.
                </p>
              </div>
            )}
          </div>


          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add New Package"
            size="full"
          >
            <div className="space-y-4">
              {/* ✅ Grid for two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Column 1 --- */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Package Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    placeholder="Package Title"
                    onChange={handleChange}
                    maxLength={50}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Package Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    placeholder="Package Description"
                    onChange={handleChange}
                    maxLength={50}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grid Type
                  </label>
                  <select
                    id="gridTypeId"
                    name="gridTypeId"
                    value={formData.gridTypeId ?? ""}
                    onChange={(e) => {
                      const selectedId = e.target.value === "" ? null : Number(e.target.value);
                      setGridTypeId(selectedId);
                      handleChange({
                        target: { name: "gridTypeId", value: selectedId },
                      } as any);
                    }}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Grid Type</option>
                    {grids.map((grid) => (
                      <option key={grid.id} value={grid.id}>
                        {grid.gridType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* --- Column 2 --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Material Origin Type
                  </label>
                  <select
                    id="materialOriginId"
                    name="materialOriginId"
                    value={formData.materialOriginId ?? ""}
                    onChange={(e) => {
                      const selectedId = e.target.value === "" ? null : Number(e.target.value);
                      setMaterialOriginId(selectedId);
                      handleChange({
                        target: { name: "materialOriginId", value: selectedId },
                      } as any);
                    }}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Material Origin Type</option>
                    {origins.map((origin) => (
                      <option key={origin.id} value={origin.id}>
                        {origin.originCode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* --- Column 3 --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PV Panel Specification
                  </label>
                  <select
                    id="panelSpecId"
                    name="panelSpecId"
                    value={formData.panelSpecId ?? ""}
                    onChange={(e) => {
                      const selectedId = e.target.value === "" ? null : Number(e.target.value);
                      setPanelSpecId(selectedId);
                      handleChange({
                        target: { name: "panelSpecId", value: selectedId },
                      } as any);
                    }}
                    disabled={!materialOriginId}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select PV System Brand</option>
                    {panels.map((panel) => (
                      <option key={panel.panelSpecId} value={panel.panelSpecId}>
                        {panel.brandShortname} - ({panel.ratedWattageW} W) - ({panel.modelNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* --- Column 4 --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PV System Capacity (kW)
                  </label>
                  <select
                    id="systemCapacityKw"
                    name="systemCapacityKw"
                    value={formData.systemCapacityKw ?? ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value === "" ? null : Number(e.target.value);
                      setSystemCapacityKw(selectedValue);
                      handleChange({
                        target: { name: "systemCapacityKw", value: selectedValue },
                      } as any);
                    }}
                    disabled={!materialOriginId || !panelSpecId}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select PV System Capacity</option>
                    {panelCapacities.map((panelCapacity) => (
                      <option key={panelCapacity} value={panelCapacity}>
                        {panelCapacity}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Inverter Brand</label>
                  <select
                    id="inverterBrandId"
                    name="inverterBrandId"
                    value={formData.inverterBrandId ?? ""}
                    onChange={(e) => {
                      const selectedId = e.target.value === "" ? null : Number(e.target.value);
                      setInverterBrandId(selectedId);
                      handleChange({
                        target: { name: "inverterBrandId", value: selectedId },
                      } as any);
                    }}
                    disabled={!gridTypeId}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Inverter Brand</option>
                    {inverters.map((inverter) => (
                      <option key={inverter.id} value={inverter.id}>
                        {inverter.inverterBrandName}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700">Inverter Specification</label>
                  <select
                    id="inverterSpecId"
                    name="inverterSpecId"
                    value={formData.inverterSpecId ?? ""}
                    onChange={(e) => {
                      const selectedId = e.target.value === "" ? null : Number(e.target.value);
                      setInverterSpecId(selectedId);
                      handleChange({
                        target: { name: "inverterSpecId", value: selectedId },
                      } as any);
                    }}
                    disabled={!gridTypeId || !inverterBrandId || !systemCapacityKw}
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Inverter Capacity</option>
                    {inverterCapacities.map((inverterCapacity) => (
                      <option key={inverterCapacity.id} value={inverterCapacity.id}>
                        {inverterCapacity.inverterCapacity} kW - ({inverterCapacity.productWarrantyMonths} months) - ({inverterCapacity.almmModelNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {(formData.gridTypeId === 2 || formData.gridTypeId === 3) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Battery Brand
                      </label>
                      <select
                        id="batteryBrandId"
                        name="batteryBrandId"
                        value={formData.batteryBrandId ?? ""}
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          setBatteryBrandId(selectedId);
                          handleChange({
                            target: { name: "batteryBrandId", value: selectedId },
                          });
                        }}
                        className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Battery Brand</option>
                        {batteryBrands.map((batteryBrand) => (
                          <option key={batteryBrand.id} value={batteryBrand.id}>
                            {batteryBrand.brandName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Battery Specification</label>
                      <select
                        id="batterySpecId"
                        name="batterySpecId"
                        value={formData.batterySpecId ?? ""}
                        onChange={(e) => {
                          const selectedId = e.target.value === "" ? null : Number(e.target.value);
                          setBatterySpecId(selectedId);
                          handleChange({
                            target: { name: "batterySpecId", value: selectedId },
                          } as any);
                        }}
                        className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Battery Capacity</option>
                        {batteryCapacities.map((batteryCapacity) => (
                          <option key={batteryCapacity.id} value={batteryCapacity.id}>
                            {batteryCapacity.batteryCapacity} kW - {batteryCapacity.voltage} V - {batteryCapacity.modelNumber} ({batteryCapacity.warrantyMonths} months)
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-full space-y-6">
                  <div className="border-b border-gray-200"></div>
                </div>
              </div>



              <div className="col-span-full space-y-6 mt-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Solar System Cost (₹)
                    </label>
                    <input
                      type="text"
                      name="systemCost"
                      value={formatIndianNumber(formData.systemCost)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          systemCost: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                        })
                      }
                      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fabrication Cost (₹)
                    </label>
                    <input
                      type="text"
                      name="fabricationCost"
                      value={formatIndianNumber(formData.fabricationCost)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fabricationCost: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                        })
                      }
                      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Cost (₹)
                    </label>
                    <input
                      type="text"
                      name="totalCost"
                      value={formatIndianNumber(formData.totalCost)}
                      readOnly
                      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

              </div>

              {/* Footer buttons */}
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                {/* Uncomment this when ready */}
                <Button variant="primary" onClick={handleSaveSpecPackage}>
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
