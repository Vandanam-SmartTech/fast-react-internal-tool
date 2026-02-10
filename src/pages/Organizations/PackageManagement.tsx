import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { fetchPhaseType } from "../../services/customerRequisitionService";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import { Plus } from "lucide-react";
import {
  generateQuotationPDF, saveSystemSpecs, saveInverterSpecs, getMaterialOrigins, getGridTypes, fetchInverterBrands,
  fetchInverterBrandCapacities, fetchPanelBrands, fetchPanelBrandCapacities, fetchBatteryBrands,
  fetchBatteryBrandCapacities, getSavedSystemSpecs, updateSystemSpecs, updateInverterSpecs, getSavedSystemSpecPackages,
  getPriceDetails, saveSystemSpecPackage, saveInverterSpecPackage
} from '../../services/quotationService';
import ReusableDropdown from "../../components/ReusableDropdown";
import { Eye, Pencil } from "lucide-react";


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

interface Inverter {
  inverterBrandName: string;
  inverterCapacity: number;
  inverterCount: number;
  gridTypeName: string;
}

export interface BatterySpec {
  id: number;
  batteryCapacity?: number;
  voltage?: number;
  modelNumber?: string;
  productWarranty?: number;
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

  const [, setOrgBatterySpecId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);


  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const [pipes, setPipes] = useState<any[]>([]);


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

  const [orgPanelSpecId, setOrgPanelSpecId] = useState<number | null>(null);
  const [panelCapacities, setPanelCapacities] = useState<number[]>([]);


  const [panelSpecId, setPanelSpecId] = useState<number | null>(null);

  const [batteryCapacities, setBatteryCapacities] = useState<BatterySpec[]>([]);


  const [systemCapacityKw, setSystemCapacityKw] = useState<number | null>(null);

  const [batteryBrands, setBatteryBrands] = useState<any[]>([]);
  const [batteryBrandId, setBatteryBrandId] = useState<number | null>(null);

  const [batterySpecId, setBatterySpecId] = useState<number | null>(null);


  const [isPrefilling, setIsPrefilling] = useState(false);

  const [priceAlreadySetFromCustomerData, setPriceAlreadySetFromCustomerData] = useState(false);
  const [isSpecsSaved, setIsSpecsSaved] = useState(false);
  const [isCustomSpecs, setIsCustomSpecs] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inverterCapacitiesMap, setInverterCapacitiesMap] = useState<Record<number, any[]>>({});

  const [savedSpecs, setSavedSpecs] = useState<any[]>([]);

  const [fetchTrigger, setFetchTrigger] = useState(0);



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
    materialOriginId: null,
    gridTypeId: null,
    panelBrandId: null,
    orgPanelSpecId: null,
    batteryBrandId: null,
    orgBatterySpecId: null,
    systemCapacityKw: null,
    title: "",
    description: "",
    inverters: [
      { inverterBrandId: null, orgInverterSpecId: null, inverterCount: 1 },
    ],
    pipes: [
      { orgPipeSpecId: null, pipeCount: 1 },
    ],
  });


  const formatIndianNumber = (value: number): string => {
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

    // Pipe details are now independent of Heavy Duty Ramp checkbox
    // No special handling needed when hasHeavydutyRamp changes

    updatedFormData.totalCost =
      (Number(updatedFormData.systemCost) || 0) +
      (Number(updatedFormData.fabricationCost) || 0);

    setFormData(updatedFormData);

    if (priceAlreadySetFromCustomerData) {
      setPriceAlreadySetFromCustomerData(false);
    }
  };

  const priceInputsKey = JSON.stringify({
    systemCapacityKw: formData.systemCapacityKw,
    orgPanelSpecId: formData.orgPanelSpecId,
    orgBatterySpecId: formData.orgBatterySpecId,
    inverters: formData.inverters,
    pipes: formData.pipes,
  });


  useEffect(() => {
    const fetchPriceDetails = async () => {
      if (priceAlreadySetFromCustomerData && fetchTrigger === 0) return;

      const hasValidSystem = !!formData.systemCapacityKw || !!formData.orgPanelSpecId;
      const hasValidBattery = !!formData.orgBatterySpecId;
      const validInverters = (formData.inverters || []).filter(
        (inv) => inv.orgInverterSpecId && inv.inverterCount > 0
      );
      const validPipes = (formData.pipes || []).filter(
        (pipe) => pipe.orgPipeSpecId && pipe.pipeCount > 0
      );

      if (!hasValidSystem && !hasValidBattery && validInverters.length === 0 && validPipes.length === 0) {
        setFormData((prev) => ({
          ...prev,
          systemCost: 0,
          fabricationCost: 0,
          totalCost: 0,
        }));
        return;
      }

      try {
        const response = await getPriceDetails({
          systemCapacityKw: formData.systemCapacityKw,
          orgPanelSpecId: formData.orgPanelSpecId,
          orgBatterySpecId: formData.orgBatterySpecId,
          batteryCount: hasValidBattery ? 1 : 0,
          inverters: validInverters.map((inv) => ({
            orgInverterSpecId: inv.orgInverterSpecId,
            inverterCount: inv.inverterCount,
          })),
          pipes: validPipes.map((pipe) => ({
            orgPipeSpecId: pipe.orgPipeSpecId,
            pipeCount: pipe.pipeCount
          }))
        });

        console.log("Fetched price details:", response);

        if (response) {
          setFormData((prev) => ({
            ...prev,
            systemCost: response.systemCost || 0,
            fabricationCost: response.fabricationCost || 0,
            totalCost: (response.systemCost || 0) + (response.fabricationCost || 0),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch price details", err);
      }
    };

    fetchPriceDetails();
  }, [priceInputsKey, fetchTrigger]);


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

  // useEffect(() => {
  //   if (!organizationId) {
  //     setAgencyList([]);
  //     setAgencyId("");
  //     return;
  //   }

  //   const loadAgencies = async () => {
  //     try {
  //       const data = await fetchAgenciesForOrg(Number(organizationId));
  //       setAgencyList(data);
  //     } catch (error) {
  //       console.error("Error fetching agencies:", error);
  //       setAgencyList([]);
  //     }
  //   };

  //   loadAgencies();
  // }, [organizationId]);

  // const fetchSavedSpecPackages = async () => {
  //   try {
  //     const data = await getSavedSystemSpecPackages();
  //     setSavedSpecs(data);
  //   } catch (err) {
  //     console.error("Error fetching saved spec packages", err);
  //   }
  // };

  // useEffect(() => {
  //   fetchSavedSpecPackages();
  // }, []);

  useEffect(() => {
    fetchAllPackages();
  }, []);

  const fetchAllPackages = async () => {
    setLoading(true);
    const data = await getSavedSystemSpecPackages(); // No param
    setSavedSpecs(data || []);
    setLoading(false);
  };




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
    const storedOrg = localStorage.getItem("selectedOrg");
    if (storedOrg) {
      setSelectedOrg(JSON.parse(storedOrg));
    }
  }, []);

  useEffect(() => {
    const loadInverterBrands = async () => {

      setInverters([]);
      setInverterCapacities([]);

      if (!isPrefilling) {
        setFormData((prev) => ({
          ...prev,
          inverters: (prev.inverters || []).map(inv => ({
            ...inv,
            inverterBrandId: null,
            orgInverterSpecId: null,
          })),
        }));

        setInverterCapacitiesMap({});
      }

      if (phaseTypeId && gridTypeId && selectedOrg?.orgId) {
        const data = await fetchInverterBrands(phaseTypeId, gridTypeId, selectedOrg?.orgId);
        setInverters(Array.isArray(data) ? data : []);
      }

      setIsPrefilling(false);
    };

    loadInverterBrands();
  }, [phaseTypeId, gridTypeId, selectedOrg?.orgId]);

  useEffect(() => {
    if (isPrefilling) return;
    if (!inverterBrandId) return;

    const loadInverterBrandCapacities = async () => {
      setInverterCapacities([]);

      try {
        const data = await fetchInverterBrandCapacities(
          inverterBrandId,
          Number(selectedOrg?.orgId),
          Number(phaseTypeId),
          Number(gridTypeId)
        );
        setInverterCapacities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch inverter brand capacities:", error);
        setInverterCapacities([]);
      }
    };

    loadInverterBrandCapacities();
  }, [inverterBrandId, gridTypeId, selectedOrg?.orgId, phaseTypeId]);


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

  const handleInverterChange = async (index, field, value) => {
    const updatedInverters = [...(formData.inverters || [])];
    // Ensure the row exists
    if (!updatedInverters[index]) updatedInverters[index] = {};

    updatedInverters[index][field] = value;

    // If brand changed, reset spec and fetch capacities for that row
    if (field === "inverterBrandId") {
      updatedInverters[index].orgInverterSpecId = null;

      if (value !== null) {
        try {
          // capacities for the particular brand (and implicitly for current gridTypeId)
          const capacities = await fetchInverterBrandCapacities(value, Number(selectedOrg?.orgId), Number(phaseTypeId), Number(gridTypeId));
          setInverterCapacitiesMap((prev) => ({
            ...prev,
            [index]: Array.isArray(capacities) ? capacities : [],
          }));
        } catch (error) {
          console.error("Failed to fetch inverter capacities for brand:", error);
          setInverterCapacitiesMap((prev) => ({ ...prev, [index]: [] }));
        }
      } else {
        // brand cleared -> clear capacities for that row
        setInverterCapacitiesMap((prev) => ({ ...prev, [index]: [] }));
      }
    }

    // If gridTypeId changes elsewhere, the effect above will already have reset per-row fields.
    setFormData((prev) => ({ ...prev, inverters: updatedInverters }));

    if (priceAlreadySetFromCustomerData) {
      setFetchTrigger((prev) => prev + 1);
    }
  };



  const addNewInverter = () => {
    const newInverter = {
      inverterBrandId: null,
      orgInverterSpecId: null,
      inverterCount: 1,
    };

    setFormData((prev) => ({
      ...prev,
      inverters: [...(prev.inverters || []), newInverter],
    }));

    // also maintain a matching entry in inverterCapacitiesMap
    setInverterCapacitiesMap((prev) => ({
      ...prev,
      [formData.inverters?.length || 0]: [], // initialize empty for new row
    }));

    if (priceAlreadySetFromCustomerData) {
      setFetchTrigger((prev) => prev + 1);
    }
  };


  const removeInverter = (index) => {
    setFormData((prev) => {
      const updated = (prev.inverters || []).filter((_, i) => i !== index);
      return { ...prev, inverters: updated };
    });

    setInverterCapacitiesMap((prev) => {
      const updatedMap = { ...prev };
      delete updatedMap[index];
      // Re-index remaining capacities so that map stays in sync with inverters
      const reIndexed = Object.keys(updatedMap).reduce((acc, key) => {
        const newIndex = key > index ? key - 1 : key;
        acc[newIndex] = updatedMap[key];
        return acc;
      }, {});
      return reIndexed;
    });

    if (priceAlreadySetFromCustomerData) {
      setFetchTrigger((prev) => prev + 1);
    }
  };

  const handlePipeChange = (index: number, field: string, value: any) => {
    const updatedPipes = [...(formData.pipes || [])];
    // Ensure the row exists
    if (!updatedPipes[index]) updatedPipes[index] = { orgPipeSpecId: null, pipeCount: 1 };

    (updatedPipes[index] as any)[field] = value;

    setFormData((prev) => ({ ...prev, pipes: updatedPipes }));

    if (priceAlreadySetFromCustomerData) {
      setFetchTrigger((prev) => prev + 1);
    }
  };

  const addNewPipe = () => {
    const newPipe = {
      orgPipeSpecId: null,
      pipeCount: 1,
    };

    setFormData((prev) => ({
      ...prev,
      pipes: [...(prev.pipes || []), newPipe],
    }));

    if (priceAlreadySetFromCustomerData) {
      setFetchTrigger((prev) => prev + 1);
    }
  };

  const removePipe = (index: number) => {
    setFormData((prev) => {
      const updated = (prev.pipes || []).filter((_, i) => i !== index);
      return { ...prev, pipes: updated };
    });

    if (priceAlreadySetFromCustomerData) {
      setFetchTrigger((prev) => prev + 1);
    }
  };



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
      if (!selectedOrg?.orgId) return;

      if (formData.gridTypeId === 2 || formData.gridTypeId === 3) {
        const data = await fetchBatteryBrands(Number(selectedOrg?.orgId));
        if (data) setBatteryBrands(data);
      } else {
        // reset battery-related state
        setBatteryBrands([]);
        setBatteryBrandId(null);
        setOrgBatterySpecId(null);
        setBatteryCapacities([]);
        setFormData((prev) => ({
          ...prev,
          batteryBrandId: null,
          orgBatterySpecId: null,
        }));
      }
    };

    loadBatteryBrands();
  }, [formData.gridTypeId, selectedOrg?.orgId]);   // ✅ add orgId

  useEffect(() => {
    // reset dependent state
    setBatteryCapacities([]);
    setOrgBatterySpecId(null);
    setFormData((prev) => ({
      ...prev,
      orgBatterySpecId: null,
    }));

    if (batteryBrandId !== null && selectedOrg?.orgId) {
      const loadBatteryCapacities = async () => {
        try {
          const data = await fetchBatteryBrandCapacities(
            Number(batteryBrandId),
            Number(selectedOrg?.orgId)
          );
          setBatteryCapacities(data);
        } catch (error) {
          console.error("Failed to fetch battery brand capacities:", error);
          setBatteryCapacities([]);
        }
      };

      loadBatteryCapacities();
    }
  }, [batteryBrandId, gridTypeId, selectedOrg?.orgId]);   // ✅ add orgId



  const handleOpenSpecsModal = () => {
    // if (!phaseTypeId || !organizationId) {
    //   toast.error("Please select a Phase Type, Organization before adding system specs.", {
    //     autoClose: 1500,
    //     hideProgressBar: true,
    //   });
    //   return;
    // }

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

  // const handleSaveSpecPackage = async () => {
  //   try {

  //     if (!formData.inverterBrandId || !formData.inverterSpecId) {
  //       toast.error("Please select both Inverter Brand and Inverter Specification before saving.", {
  //         autoClose: 1500,
  //         hideProgressBar: true,
  //       });
  //       return;
  //     }

  //     setIsSubmitting(true);


  //     const systemResponse = await saveSystemSpecPackage({
  //       ...formData,
  //       specSourceId: 2,
  //       panelSpecsId: formData.panelSpecId,
  //       batterySpecsId: formData.batterySpecId,
  //       orgId: organizationId,
  //       agencyId
  //     });

  //     console.log("System specs saved:", systemResponse);

  //     const systemSpecsPackageId = systemResponse.id;

  //     const inverterResponse = await saveInverterSpecPackage({
  //       systemSpecsPackageId,
  //       inverterSpecId: formData.inverterSpecId,
  //       inverterCount: 1,
  //     });

  //     console.log("Inverter specs saved:", inverterResponse);

  //     await fetchSavedSpecPackages();

  //     setIsModalOpen(false);

  //     toast.success("Package created successfully!", {
  //       autoClose: 1000,
  //       hideProgressBar: true,
  //     });
  //   } catch (error) {
  //     console.error("Error saving specs:", error);
  //     toast.error("Failed to create package.", {
  //       autoClose: 1000,
  //       hideProgressBar: true,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  return (
    <div className="p-4 max-w-7xl mx-auto space-y-2">

      <div className="flex items-center justify-between gap-4 mb-3">

        {/* Left Side - Title */}
        <h1 className="font-bold text-secondary-900
                 text-lg sm:text-2xl
                 leading-tight">
          Package Management
        </h1>

        {/* Right Side - Add Button */}
        <Button
          onClick={handleOpenSpecsModal}
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add New Package</span>
        </Button>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {savedSpecs.length > 0 ? (
          savedSpecs.map((pkg) => (
            <Card
              key={pkg.id}
              // onClick={() => handleView(pkg)}
              className="group relative cursor-pointer rounded-xl border border-slate-200
        bg-white shadow-sm hover:shadow-xl hover:-translate-y-1
        transition-all duration-300 overflow-hidden"
            >
              {/* Edit Icon */}
              <button
                // onClick={(e) => {
                //   e.stopPropagation(); 
                //   handleEdit(pkg);
                // }}
                className="absolute top-3 right-3 p-1.5 rounded-full
          bg-slate-100 hover:bg-amber-100 text-slate-600
          hover:text-amber-600 transition"
              >
                <Pencil size={16} />
              </button>

              <div className="p-4">

                {/* Title */}
                <h2 className="text-lg font-bold text-slate-900 truncate pr-8">
                  {pkg.title}
                </h2>

                {/* Panel + Capacity */}
                <p className="mt-1 text-sm text-slate-600 truncate">
                  <span className="font-semibold text-slate-800">
                    {pkg.panelBrandShortName}
                  </span>
                  {" "}
                  ({pkg.panelRatedWattageW}W)
                  {" "} -{" "}
                  <span className="font-semibold text-slate-800">
                    {pkg.systemCapacityKw} kW
                  </span>
                </p>


                {/* Inverters */}
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {pkg.inverters?.length > 0 ? (
                    pkg.inverters.map((inv: any, index: number) => (
                      <p key={index} className="truncate">
                        ⚡{" "}
                        <span className="font-semibold text-slate-900">
                          {inv.inverterBrandName}
                        </span>
                        {" "} - {inv.inverterCapacity}kW × {inv.inverterCount}
                      </p>
                    ))
                  ) : (
                    <p className="italic text-slate-400">
                      No inverter details
                    </p>
                  )}

                  {pkg.inverters?.some(
                    (inv: any) => inv.gridTypeName === "Hybrid"
                  ) && (
                      <p className="truncate">
                        🔋{" "}
                        <span className="font-semibold text-slate-900">
                          {pkg.batteryBrandName}
                        </span>
                        {" "} - {pkg.batteryCapacityKw} kW
                      </p>
                    )}
                </div>


                {/* Price */}
                <div className="mt-3 pt-2 border-t flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-bold">
                    Total Cost
                  </span>
                  <span className="text-sm font-semibold text-blue-700">
                    ₹{(
                      Number(pkg.systemCost ?? 0) +
                      Number(pkg.fabricationCost ?? 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

              </div>

              {/* Subtle bottom accent on hover */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-500 
          group-hover:w-full transition-all duration-300"></div>

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
              <ReusableDropdown
                name="gridTypeId"
                value={formData.gridTypeId ?? ""}
                onChange={(val) => {
                  const selectedId = val === "" ? null : Number(val);
                  setGridTypeId(selectedId);
                  handleChange({
                    target: { name: "gridTypeId", value: selectedId },
                  } as any);
                }}
                options={grids.map((grid) => ({
                  value: grid.id,
                  label: grid.gridType,
                }))}
                placeholder="Select Grid Type"
                className="mt-1"
              />
            </div>


            {/* --- Column 2 --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Material Origin Type
              </label>
              <ReusableDropdown
                name="materialOriginId"
                value={formData.materialOriginId ?? ""}
                onChange={(val) => {
                  const selectedId = val === "" ? null : Number(val);
                  setMaterialOriginId(selectedId);
                  handleChange({
                    target: { name: "materialOriginId", value: selectedId },
                  } as any);
                }}
                options={origins.map((origin) => ({
                  value: origin.id,
                  label: origin.originCode,
                }))}
                placeholder="Select Material Origin Type"
                className="mt-1"
              />
            </div>
            {/* --- Column 3 --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700">PV Panel Specification</label>
              <ReusableDropdown
                name="orgPanelSpecId"
                value={formData.orgPanelSpecId ?? ""}
                onChange={(val) => {
                  const selectedId = val === "" ? null : Number(val);
                  setOrgPanelSpecId(selectedId);
                  handleChange({
                    target: { name: "orgPanelSpecId", value: selectedId },
                  } as any);
                }}

                options={panels.map((panel) => {
                  const parts = [
                    panel.panelBrandName || null,
                    panel.panelTypeName || null,
                    panel.ratedWattageW ? `(${panel.ratedWattageW} W)` : null,
                    panel.modelNumber ? `(${panel.modelNumber})` : null
                  ];

                  const label = parts.filter(Boolean).join(" - ");

                  return {
                    value: panel.id,
                    label,
                  };
                })}

                placeholder="Select PV System Brand"
                className={`mt-1 ${!materialOriginId ? "opacity-60 pointer-events-none" : ""}`}
              />
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

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-nowrap">
                  <h3 className="text-base font-semibold text-gray-800 whitespace-nowrap">
                    Inverter Details
                  </h3>

                  <button
                    type="button"
                    onClick={addNewInverter}
                    disabled={
                      formData.inverters?.some((inv) => !inv.orgInverterSpecId) ?? false
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition whitespace-nowrap
      ${formData.inverters?.some((inv) => !inv.orgInverterSpecId)
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    + Add More Inverter
                  </button>
                </div>


                {formData.inverters.map((inv, index) => (
                  <div
                    key={index}
                    className="md:col-span-2 grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50 relative"
                  >
                    {formData.inverters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInverter(index)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}

                    {/* Inverter Brand */}
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700">Inverter Brand</label>
                      <ReusableDropdown
                        name="inverterBrandId"
                        value={inv.inverterBrandId ?? ""}
                        onChange={(val) =>
                          handleInverterChange(index, "inverterBrandId", val === "" ? null : Number(val))
                        }
                        options={inverters.map((inv) => ({
                          value: inv.inverterBrandId,
                          label: inv.inverterBrandName,
                        }))}
                        placeholder="Select Inverter Brand"
                      />
                    </div>

                    {/* Inverter Spec */}
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700">Inverter Specification</label>
                      <ReusableDropdown
                        name="orgInverterSpecId"
                        value={inv.orgInverterSpecId ?? ""}
                        onChange={(val) =>
                          handleInverterChange(index, "orgInverterSpecId", val === "" ? null : Number(val))
                        }

                        options={(inverterCapacitiesMap[index] || []).map((spec) => {
                          const parts = [
                            spec.inverterCapacity ? `${spec.inverterCapacity} kW` : null,
                            spec.productWarranty ? `(${spec.productWarranty} )` : null,
                            spec.almmModelNumber ? `(${spec.almmModelNumber})` : null
                          ];

                          const label = parts.filter(Boolean).join(" - ");

                          return {
                            value: spec.id,
                            label,
                          };
                        })}
                        disabled={!inv.inverterBrandId}
                        placeholder="Select Inverter Spec"
                      />
                    </div>

                    {/* Inverter Count */}
                    <div className="col-span-12 md:col-span-2 flex flex-col justify-end">
                      <label className="block text-sm font-medium text-gray-700">Count</label>
                      <div className="flex items-center border rounded-md shadow-sm bg-white">
                        <button
                          type="button"
                          disabled={(inv.inverterCount ?? 1) <= 1}
                          onClick={() =>
                            handleInverterChange(index, "inverterCount", Math.max((inv.inverterCount || 1) - 1, 1))
                          }
                          className={`px-3 py-2 text-lg font-bold rounded-l-md transition ${(inv.inverterCount ?? 1) <= 1
                            ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                            : "text-gray-600 hover:text-white hover:bg-red-500"
                            }`}
                        >
                          −
                        </button>

                        <input
                          type="text"
                          name="inverterCount"
                          inputMode="numeric"
                          value={inv.inverterCount ?? 1}
                          onChange={(e) => {
                            const value = Math.max(Number(e.target.value) || 1, 1);
                            handleInverterChange(index, "inverterCount", value);
                          }}
                          className="w-full text-center border-x border-gray-200 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleInverterChange(index, "inverterCount", (inv.inverterCount || 1) + 1)
                          }
                          className="px-3 py-2 text-lg font-bold text-gray-600 hover:text-white hover:bg-green-500 rounded-r-md transition"
                        >
                          +
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(formData.gridTypeId === 2 || formData.gridTypeId === 3) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Battery Brand
                  </label>
                  <ReusableDropdown
                    name="batteryBrandId"
                    value={formData.batteryBrandId ?? ""}
                    onChange={(val) => {
                      const selectedId = val === "" ? null : Number(val);
                      setBatteryBrandId(selectedId);
                      handleChange({
                        target: { name: "batteryBrandId", value: selectedId },
                      });
                    }}
                    options={batteryBrands.map((batteryBrand) => ({
                      value: batteryBrand.brandId,
                      label: batteryBrand.brandName,
                    }))}
                    placeholder="Select Battery Brand"
                    className="mt-1"
                  />

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Battery Specification</label>
                  <ReusableDropdown
                    name="orgBatterySpecId"
                    value={formData.orgBatterySpecId ?? ""}
                    onChange={(val) => {
                      const selectedId = val === "" ? null : Number(val);
                      setOrgBatterySpecId(selectedId);
                      handleChange({
                        target: { name: "orgBatterySpecId", value: selectedId },
                      });
                    }}
                    // options={batteryCapacities.map((batteryCapacity) => ({
                    //   value: batteryCapacity.id,
                    //   label: `${batteryCapacity.batteryCapacity} kW - ${batteryCapacity.voltage} V - ${batteryCapacity.modelNumber} (${batteryCapacity.warrantyMonths} months)`,
                    // }))}
                    options={batteryCapacities.map((b) => {
                      const parts = [
                        b.batteryCapacity ? `${b.batteryCapacity} kW` : null,
                        b.voltage ? `${b.voltage} V` : null,
                        b.modelNumber || null,
                        b.productWarranty ? `(${b.productWarranty} )` : null
                      ];

                      // Filter out null/empty values and join with " - "
                      const label = parts.filter(Boolean).join(" - ");

                      return {
                        value: b.id,
                        label,
                      };
                    })}

                    placeholder="Select Battery Capacity"
                    className="mt-1"
                  />

                </div>
              </>
            )}

            <div className="md:col-span-2"><div className="border-b border-gray-200" /></div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">Pipe Details</h3>
                  <button
                    type="button"
                    onClick={addNewPipe}
                    disabled={
                      formData.pipes?.some((pipe) => !pipe.orgPipeSpecId) ?? false
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition ${formData.pipes?.some((pipe) => !pipe.orgPipeSpecId)
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    + Add More Pipe
                  </button>
                </div>

                {formData.pipes.map((pipe, index) => (
                  <div
                    key={index}
                    className="md:col-span-2 grid grid-cols-12 items-center gap-6 p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50 relative"
                  >
                    {formData.pipes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePipe(index)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}



                    {/* LEFT EMPTY SPACE (2 columns) */}
                    <div className="hidden md:block md:col-span-2"></div>

                    {/* Pipe Specification - 5 columns */}
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Pipe Specification</label>
                      <ReusableDropdown
                        name="orgPipeSpecId"
                        value={pipe.orgPipeSpecId ?? ""}
                        onChange={(val) =>
                          handlePipeChange(index, "orgPipeSpecId", val === "" ? null : Number(val))
                        }
                        options={pipes.map((p) => ({
                          value: p.id,
                          label: `${p.pipeBrandName} – ${p.widthMm}×${p.heightMm}×${p.thicknessMm} mm`,
                        }))}

                        placeholder="Select Pipe Specification"
                      />
                    </div>

                    {/* Pipe Count - 3 columns */}
                    <div className="col-span-12 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Count</label>
                      <div className="flex items-center border rounded-md shadow-sm bg-white">
                        <button
                          type="button"
                          disabled={(pipe.pipeCount ?? 1) <= 1}
                          onClick={() =>
                            handlePipeChange(index, "pipeCount", Math.max((pipe.pipeCount || 1) - 1, 1))
                          }
                          className={`px-3 py-2 text-lg font-bold rounded-l-md transition ${(pipe.pipeCount ?? 1) <= 1
                            ? "text-gray-300 bg-gray-100 cursor-not-allowed"
                            : "text-gray-600 hover:text-white hover:bg-red-500"
                            }`}
                        >
                          −
                        </button>

                        <input
                          type="text"
                          name="pipeCount"
                          inputMode="numeric"
                          value={pipe.pipeCount ?? 1}
                          onChange={(e) => {
                            const value = Math.max(Number(e.target.value) || 1, 1);
                            handlePipeChange(index, "pipeCount", value);
                          }}
                          className="w-full text-center border-x border-gray-200 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handlePipeChange(index, "pipeCount", (pipe.pipeCount || 1) + 1)
                          }
                          className="px-3 py-2 text-lg font-bold text-gray-600 hover:text-white hover:bg-green-500 rounded-r-md transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* RIGHT EMPTY SPACE (2 columns) */}
                    <div className="hidden md:block md:col-span-2"></div>
                  </div>
                ))}

              </div>
            </div>

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

          {/* <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>

                <Button variant="primary" onClick={handleSaveSpecPackage}>
                  Add Package
                </Button>
              </div> */}
        </div>
      </Modal>


    </div>
  );
};

export default PackageManagement;
