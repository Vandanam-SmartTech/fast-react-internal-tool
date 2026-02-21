import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { fetchPhaseType } from "../../services/customerRequisitionService";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import { Plus } from "lucide-react";
import {
  saveSystemSpecs, saveInverterSpecs, getMaterialOrigins, getGridTypes, fetchInverterBrands,
  fetchInverterBrandCapacities, fetchPanelBrandCapacities, fetchBatteryBrands,
  fetchBatteryBrandCapacities, updateSystemSpecs, updateInverterSpecs, getSavedSystemSpecPackages,
  getPriceDetails, saveSystemSpecPackage, saveInverterSpecPackage, fetchPanelSpecsByOrg, fetchPipeSpecification, savePipeSpecs,
  editSystemSpecPackage
} from '../../services/quotationService';
import ReusableDropdown from "../../components/ReusableDropdown";
import { Eye, Pencil } from "lucide-react";
import { toast } from "react-toastify";


interface Organization {
  id: number;
  name: string;
}

interface Agency {
  id: number;
  name: string;
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
  const [phaseTypes, setPhaseTypes] = useState<any[]>([]);
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);

  const [inverterCapacitiesMap, setInverterCapacitiesMap] = useState<Record<number, any[]>>({});

  const [savedSpecs, setSavedSpecs] = useState<any[]>([]);

  const [fetchTrigger, setFetchTrigger] = useState(0);



  const initialFormData = {
    systemCost: 0,
    fabricationCost: 0,
    totalCost: 0,
    phaseTypeId: null,
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
    isGharkulPackage: false,
    title: "",
    description: "",
    inverters: [
      { inverterBrandId: null, orgInverterSpecId: null, inverterCount: 1 },
    ],
    pipes: [
      { orgPipeSpecId: null, pipeCount: 1 },
    ],
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);


  const formatIndianNumber = (value: number): string => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    const newValue = value === "" ? null : (type === "checkbox" ? checked : value);

    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

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
          // Note: Managed centrally in handleEditPackage for better control
          // const data = await fetchInverterBrandCapacities(inverterBrandId);
          // setInverterCapacities([...data]);
        } catch (error) {
          console.error("Failed to fetch inverter brand capacities:", error);
          setInverterCapacities([]);
        } finally {
          // setIsPrefilling(false);
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

  useEffect(() => {
    const loadPipeSpecs = async () => {
      const data = await fetchPipeSpecification(Number(selectedOrg?.orgId));
      setPipes(data);
    };

    if (selectedOrg?.orgId) {
      loadPipeSpecs();
    }
  }, [selectedOrg?.orgId]);

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
      if (!materialOriginId || !selectedOrg?.orgId) return;

      // reset dependent state
      if (!isPrefilling) {
        setPanels([]);
        setOrgPanelSpecId(null);
        setPanelCapacities([]);
        setSystemCapacityKw(null);
        setFormData((prev) => ({
          ...prev,
          orgPanelSpecId: null,
          systemCapacityKw: null,
        }));
      }

      try {
        const data = await fetchPanelSpecsByOrg(
          Number(materialOriginId),
          Number(selectedOrg?.orgId)
        );
        setPanels(data);
      } catch (error) {
        console.error("Failed to fetch panel brands:", error);
        setPanels([]);
      }
    };

    loadPanelBrands();
  }, [materialOriginId, selectedOrg?.orgId]);   // ✅ include orgId


  useEffect(() => {
    const loadPanelBrandCapacities = async () => {

      if (
        phaseTypeId === null ||
        orgPanelSpecId === null ||
        materialOriginId === null
      ) {

        return;
      }

      if (!formData.systemCapacityKw) {
        if (!isPrefilling) {
          setPanelCapacities([]);
          setSystemCapacityKw(null);
          setFormData((prev) => ({
            ...prev,
            systemCapacityKw: null,
          }));
        }
      }

      try {

        const data = await fetchPanelBrandCapacities(
          phaseTypeId,
          orgPanelSpecId
        );

        setPanelCapacities([...data]);
      } catch (error) {
        console.error("❌ Failed to fetch panel brand capacities:", error);
        setPanelCapacities([]);
      }
    };

    loadPanelBrandCapacities();
  }, [phaseTypeId, orgPanelSpecId, materialOriginId]);




  useEffect(() => {
    const loadBatteryBrands = async () => {
      if (!selectedOrg?.orgId) return;

      if (formData.gridTypeId === 2 || formData.gridTypeId === 3) {
        const data = await fetchBatteryBrands(Number(selectedOrg?.orgId));
        if (data) setBatteryBrands(data);
      } else {
        // reset battery-related state
        if (!isPrefilling) {
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
      }
    };

    loadBatteryBrands();
  }, [formData.gridTypeId, selectedOrg?.orgId]);   // ✅ add orgId

  useEffect(() => {
    // reset dependent state
    if (!isPrefilling) {
      setBatteryCapacities([]);
      setOrgBatterySpecId(null);
      setFormData((prev) => ({
        ...prev,
        orgBatterySpecId: null,
      }));
    }

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
    setFormData(initialFormData);
    setPhaseTypeId(null);
    setMaterialOriginId(null);
    setGridTypeId(null);
    setInverterBrandId(null);
    setPanelBrandId(null);
    setOrgPanelSpecId(null);
    setSystemCapacityKw(null);
    setBatteryBrandId(null);
    setInverterCapacitiesMap({});
    setIsEditing(false);
    setEditingPackageId(null);
    setIsModalOpen(true);
  };

  const handleEditPackage = async (id: number) => {
    const selectedPackage = savedSpecs.find(pkg => pkg.id === id);
    if (!selectedPackage) return;

    setIsPrefilling(true);
    const specs = selectedPackage.systemSpecs;

    // ✅ Extract inverter list safely
    const inverterList = specs?.inverters?.length
      ? specs.inverters
      : [{ inverterBrandId: null, orgInverterSpecId: null, inverterCount: 1 }];

    // ✅ Get base IDs
    const gId = specs?.inverters?.[0]?.gridTypeId ?? null;
    const pId = specs?.inverters?.[0]?.phaseTypeId ?? null;
    const mId = specs?.materialOriginId || null;

    // ✅ Set individual states FIRST to trigger dependent fetches
    setPhaseTypeId(pId);
    setGridTypeId(gId);
    setMaterialOriginId(mId);
    setOrgPanelSpecId(specs?.orgPanelSpecId || null);
    setSystemCapacityKw(specs?.systemCapacityKw || null);
    setBatteryBrandId(specs?.batteryBrandId || null);

    // ✅ Pre-fetch inverter capacities for the map
    const capsMap: Record<number, any[]> = {};
    for (let i = 0; i < inverterList.length; i++) {
      const inv = inverterList[i];
      if (inv.inverterBrandId) {
        try {
          const capacities = await fetchInverterBrandCapacities(
            inv.inverterBrandId,
            Number(selectedOrg?.orgId),
            Number(pId),
            Number(gId)
          );
          capsMap[i] = Array.isArray(capacities) ? capacities : [];
        } catch (error) {
          console.error(`Failed to fetch capacities for inverter at index ${i}:`, error);
          capsMap[i] = [];
        }
      }
    }
    setInverterCapacitiesMap(capsMap);

    setFormData({
      systemCost: specs?.systemCost || 0,
      fabricationCost: specs?.fabricationCost || 0,
      totalCost: (specs?.systemCost || 0) + (specs?.fabricationCost || 0),

      installationSpaceType: specs?.installationSpaceType || "",
      installationStructureType: specs?.installationStructureType || "Static",

      hasWaterSprinkler: specs?.hasWaterSprinkler || false,
      hasHeavydutyRamp: specs?.hasHeavydutyRamp || false,
      hasHeavydutyStairs: specs?.hasHeavydutyStairs || false,

      materialOriginId: mId,
      orgPanelSpecId: specs?.orgPanelSpecId || null,
      orgBatterySpecId: specs?.orgBatterySpecId || null,
      batteryBrandId: specs?.batteryBrandId || null,
      panelBrandId: specs?.panelBrandId || null,
      systemCapacityKw: specs?.systemCapacityKw || null,

      gridTypeId: gId,
      phaseTypeId: pId,

      isGharkulPackage: selectedPackage?.isGharkulPackage || false,
      title: selectedPackage?.title || "",
      description: selectedPackage?.description || "",

      inverters: inverterList,

      pipes:
        specs?.pipes?.length > 0
          ? specs.pipes
          : [{ orgPipeSpecId: null, pipeCount: 1 }],
    });

    setIsEditing(true);
    setEditingPackageId(id);
    setIsModalOpen(true);

    // Provide a longer timeout for all effects to settle
    setTimeout(() => {
      setIsPrefilling(false);
    }, 1000);
  };

  const handleEditSpecPackage = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        isGharkulPackage: formData.isGharkulPackage,
        orgId: selectedOrg?.orgId,

        systemSpecs: {
          installationSpaceType: formData.installationSpaceType,
          installationStructureType: formData.installationStructureType,
          systemCost: formData.systemCost,
          fabricationCost: formData.fabricationCost,
          batteryCount: formData.orgBatterySpecId ? 1 : null,
          orgPanelSpecId: formData.orgPanelSpecId,
          orgBatterySpecId: formData.orgBatterySpecId,
          specSourceId: 2,
          systemCapacityKw: formData.systemCapacityKw,
          hasWaterSprinkler: formData.hasWaterSprinkler,
          hasHeavydutyRamp: formData.hasHeavydutyRamp,
          hasHeavydutyStairs: formData.hasHeavydutyStairs,
        },
      };

      console.log("Final Payload:", payload);

      if (!editingPackageId) throw new Error("Missing Package ID for editing.");

      const systemResponse = await editSystemSpecPackage(editingPackageId, payload);

      const systemSpecsId = systemResponse.systemSpecs.id;

      // ---------------------- SAVE INVERTERS ------------------------------

      const inverterList = formData.inverters.map((inv) => ({
        systemSpecsId,
        orgInverterSpecId: inv.orgInverterSpecId,
        inverterCount: inv.inverterCount || 1,
      }));

      await saveInverterSpecs(inverterList);

      // ---------------------- SAVE PIPE SPECS ------------------------------

      if (
        formData.pipes &&
        formData.pipes.length > 0 &&
        formData.pipes.some((p) => p.orgPipeSpecId)
      ) {
        const pipeList = formData.pipes
          .filter((pipe) => pipe.orgPipeSpecId)
          .map((pipe) => ({
            systemSpecsId,
            orgPipeSpecId: pipe.orgPipeSpecId,
            pipeCount: pipe.pipeCount || 1,
          }));

        await savePipeSpecs(pipeList);
      }

      await fetchAllPackages();

      setIsModalOpen(false);

      toast.success("Package updated successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Error updating specs:", error);
      toast.error("Failed to update package.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };




  const handleSaveSpecPackage = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        isGharkulPackage: formData.isGharkulPackage,
        orgId: selectedOrg?.orgId,

        systemSpecs: {
          installationSpaceType: formData.installationSpaceType,
          installationStructureType: formData.installationStructureType,
          systemCost: formData.systemCost,
          fabricationCost: formData.fabricationCost,
          batteryCount: formData.orgBatterySpecId ? 1 : null,
          orgPanelSpecId: formData.orgPanelSpecId,
          orgBatterySpecId: formData.orgBatterySpecId,
          specSourceId: 2,
          systemCapacityKw: formData.systemCapacityKw,
          hasWaterSprinkler: formData.hasWaterSprinkler,
          hasHeavydutyRamp: formData.hasHeavydutyRamp,
          hasHeavydutyStairs: formData.hasHeavydutyStairs,
        },
      };

      console.log("Final Payload:", payload);

      const systemResponse = await saveSystemSpecPackage(payload);

      const systemSpecsId = systemResponse.systemSpecs.id;

      // ---------------------- SAVE INVERTERS ------------------------------

      const inverterList = formData.inverters.map((inv) => ({
        systemSpecsId,
        orgInverterSpecId: inv.orgInverterSpecId,
        inverterCount: inv.inverterCount || 1,
      }));

      await saveInverterSpecs(inverterList);

      // ---------------------- SAVE PIPE SPECS ------------------------------

      if (
        formData.pipes &&
        formData.pipes.length > 0 &&
        formData.pipes.some((p) => p.orgPipeSpecId)
      ) {
        const pipeList = formData.pipes
          .filter((pipe) => pipe.orgPipeSpecId)
          .map((pipe) => ({
            systemSpecsId,
            orgPipeSpecId: pipe.orgPipeSpecId,
            pipeCount: pipe.pipeCount || 1,
          }));

        await savePipeSpecs(pipeList);
      }

      await fetchAllPackages();

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

  return (
    <div className="p-4 max-w-7xl mx-auto py-2">

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
          savedSpecs.map((pkg) => {
            const specs = pkg.systemSpecs;

            return (
              <Card
                key={pkg.id}
                className="group relative cursor-pointer rounded-2xl
          bg-gradient-to-br from-blue-50 via-white to-emerald-50
          border border-blue-100
          shadow-md hover:shadow-2xl hover:-translate-y-1
          transition-all duration-300 overflow-hidden"
              >
                {/* Edit Icon */}
                <button
                  onClick={() => handleEditPackage(pkg.id)}
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
                  <p className="mt-1 text-sm text-slate-700 truncate">
                    <span className="font-semibold text-blue-700">
                      {specs?.panelBrandShortName}
                    </span>{" "}
                    ({specs?.panelRatedWattageW}W) -{" "}
                    <span className="font-semibold text-emerald-700">
                      {specs?.systemCapacityKw} kW
                    </span>
                  </p>

                  {/* Inverters */}
                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    {specs?.inverters?.length > 0 ? (
                      specs.inverters.map((inv: any, index: number) => (
                        <p key={index} className="truncate">
                          ⚡{" "}
                          <span className="font-semibold text-slate-900">
                            {inv.inverterBrandName}
                          </span>{" "}
                          - {inv.inverterCapacity}kW × {inv.inverterCount}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-slate-400">
                        No inverter details
                      </p>
                    )}

                    {/* Show battery only if Hybrid */}
                    {specs?.inverters?.some(
                      (inv: any) => inv.gridTypeName === "Hybrid"
                    ) && specs?.batteryBrandName && (
                        <p className="truncate">
                          🔋{" "}
                          <span className="font-semibold text-slate-900">
                            {specs?.batteryBrandName}
                          </span>{" "}
                          - {specs?.batteryCapacityKw} kW
                        </p>
                      )}
                  </div>

                  {/* Price */}
                  <div className="mt-3 pt-2 border-t border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">
                      Total Cost
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      ₹{(
                        Number(specs?.systemCost ?? 0) +
                        Number(specs?.fabricationCost ?? 0)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>

                {/* Bottom Accent */}
                <div
                  className="absolute bottom-0 left-0 w-0 h-1
            bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-500
            group-hover:w-full transition-all duration-500"
                ></div>

              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">
              No packages found. Click "Add New Package" to create one.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-2">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">

              {/* Left Side - Title */}
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit Package" : "Add New Package"}
              </h2>

              {/* Right Side - Checkbox + Close */}
              <div className="flex items-center space-x-6">

                {/* Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGharkulPackage"
                    checked={formData.isGharkulPackage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isGharkulPackage: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isGharkulPackage"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Is Gharkul Package
                  </label>
                </div>

                {/* Close Icon */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

              </div>
            </div>

            <div className="border-b border-gray-200 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">



              {/* Package Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  placeholder="Package Title"
                  onChange={handleChange}
                  maxLength={50}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>

              {/* Package Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  placeholder="Package Description"
                  onChange={handleChange}
                  maxLength={50}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                />
              </div>




              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phase Type <span className="text-red-500">*</span>
                    </label>
                    <ReusableDropdown
                      name="phaseTypeId"
                      value={formData.phaseTypeId ?? ""}
                      onChange={(val) => {
                        const selectedId = val === "" ? null : Number(val);
                        setPhaseTypeId(selectedId);
                        handleChange({
                          target: { name: "phaseTypeId", value: selectedId },
                        } as any);
                      }}
                      options={phaseTypes.map((phase) => ({
                        value: phase.id,
                        label: phase.nameEn,
                      }))}
                      placeholder="Select Phase Type"
                      className="mt-1"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grid Type <span className="text-red-500">*</span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Origin Type <span className="text-red-500">*</span>
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
                </div>
              </div>

              {/* --- Column 3 --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PV Panel Specification <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PV System Capacity (kW) <span className="text-red-500">*</span></label>
                <ReusableDropdown
                  name="systemCapacityKw"
                  value={formData.systemCapacityKw ?? ""}
                  onChange={(val) => {
                    const selectedValue = val === "" ? null : Number(val);
                    setSystemCapacityKw(selectedValue);
                    handleChange({
                      target: { name: "systemCapacityKw", value: selectedValue },
                    } as any);
                  }}
                  options={panelCapacities.map((panelCapacity) => ({
                    value: panelCapacity,
                    label: `${panelCapacity} kW`,
                  }))}
                  placeholder="Select PV System Capacity"
                  className={`mt-1 ${!materialOriginId || !orgPanelSpecId ? "opacity-60 pointer-events-none" : ""}`}
                />
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
                        <label className="block text-sm font-medium text-gray-700">Inverter Brand <span className="text-red-500">*</span></label>
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
                        <label className="block text-sm font-medium text-gray-700">Inverter Specification <span className="text-red-500">*</span></label>
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
                        <label className="block text-sm font-medium text-gray-700">Pipe Specification <span className="text-red-500">*</span></label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    placeholder="Solar System Cost"
                    className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    placeholder="Fabrication Cost"
                    className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost (₹)
                  </label>
                  <input
                    type="text"
                    name="totalCost"
                    value={formatIndianNumber(formData.totalCost)}
                    readOnly
                    placeholder="Total Cost"
                    className="w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={isEditing ? handleEditSpecPackage : handleSaveSpecPackage}
                loading={isSubmitting}
              >
                {isSubmitting ? "" : isEditing ? "Edit Package" : "Add Package"}
              </Button>
            </div>
          </div>


        </div>
      </div>)}


    </div>
  );
};

export default PackageManagement;
