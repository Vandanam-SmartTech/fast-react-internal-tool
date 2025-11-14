import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchInstallationSpaceTypes, fetchInstallationSpaceTypesNames, getConnectionByConnectionId, getCustomerById } from '../../services/customerRequisitionService';
import {
  generateQuotationPDF, previewQuotationPDF, saveSystemSpecs, saveInverterSpecs, getMaterialOrigins, getGridTypes, fetchInverterBrands,
  fetchInverterBrandCapacities, fetchPanelBrands, fetchPanelBrandCapacities, fetchBatteryBrands,
  fetchBatteryBrandCapacities, getSavedSystemSpecs, updateSystemSpecs, updateInverterSpecs, getPriceDetails, getSecondaryId
} from '../../services/quotationService';
import ReusableDropdown from "../../components/ReusableDropdown";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon, CurrencyRupeeIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useUser } from "../../contexts/UserContext";
import { fetchUploadedDocumentByDocumentTypeAndDocumentNumber, downloadDocumentById } from "../../services/documentManagerService";
import { Download as DownloadIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export const SystemSpecifications = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showCostDetails, setShowCostDetails] = useState(false);
  const [isSpecsSaved, setIsSpecsSaved] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [Kw, setKw] = useState("");
  const [inverterKw, setInverterKw] = useState("");
  const [dcrNonDcrType, setDcrNonDcrType] = useState("");
  const [inversionType, setInversionType] = useState("");
  const [inverterBrand, setInverterBrand] = useState("");
  const [panelBrand, setPanelBrand] = useState("");
  const [phaseType, setPhaseType] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [panelWattages, setPanelWattages] = useState([]);
  const [inverterWattages, setInverterWattages] = useState([]);
  const [isCustomSpecs, setIsCustomSpecs] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [govIdName, setGovIdName] = useState("");
  const [orgId, setOrgId] = useState<number | null>(null);
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [priceAlreadySetFromCustomerData, setPriceAlreadySetFromCustomerData] = useState(false);
  const [isSpaceListOpen, setIsSpaceListOpen] = useState(false);
  const [inverterBrands, setInverterBrands] = useState<string[]>([]);
  const [panelBrands, setPanelBrands] = useState<any[]>([]);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  const [phaseTypeId, setPhaseTypeId] = useState<number | null>(null);
  const [avgMonthlyConsumption, setAvgMonthlyConsumption] = useState<number | null>(null);

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

  const [savedSpecs, setSavedSpecs] = useState([]);
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  const [selectedSystemSpecsInverterId, setSelectedSystemSpecsInverterId] = useState(null);

  const [isPrefilling, setIsPrefilling] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(savedSpecs.length === 0 || savedSpecs.length === 1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userClaims } = useUser();
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");

  const [activeTab, setActiveTab] = useState("System Specifications");

  const [inverterCapacitiesMap, setInverterCapacitiesMap] = useState<Record<number, any[]>>({});

  const [systemSpecificationId, setSystemSpecificationId] = useState(null);
  const [secondaryId, setSecondaryId] = useState(null);

  const [documentsMap, setDocumentsMap] = useState<{ [key: number]: any }>({});
  const [loadingDocs, setLoadingDocs] = useState<{ [key: number]: boolean }>({});

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const [showDatePickModal, setShowDatePickModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [activeLoadedSpecId, setActiveLoadedSpecId] = useState(null);




  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  const [availableSpaceTypes, setAvailableSpaceTypes] = useState<any[]>([]);
  const [installationTypeMap, setInstallationTypeMap] = useState<Record<number, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFabrication, setIsEditingFabrication] = useState(false);


  const [formData, setFormData] = useState({
    systemCost: 0,
    fabricationCost: 0,
    totalCost: 0,
    installationSpaceType: "",
    installationStructureType: "Static",
    hasWaterSprinkler: false,
    hasHeavydutyRamp: false,
    hasHeavydutyStairs: false,
    //inverterBrandId: null,
    materialOriginId: null,
    gridTypeId: null,
    //inverterSpecId: null,
    //inverterCount: 1,
    panelBrandId: null,
    panelSpecId: null,
    batteryBrandId: null,
    batterySpecId: null,
    systemCapacityKw: null,
    inverters: [
      { inverterBrandId: null, inverterSpecId: null, inverterCount: 1 },
    ],
  });

  const connectionId = location.state?.connectionId;
  const consumerId = location.state?.consumerId;
  const customerId = location.state?.customerId;

  const formatIndianNumber = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);
  };



  useEffect(() => {
    const loadInstallationSpaceTypeMap = async () => {
      try {
        const types = await fetchInstallationSpaceTypesNames();
        const typeMap: Record<number, string> = {};
        types.forEach((type) => {
          typeMap[type.id] = type.nameEnglish;
        });
        setInstallationTypeMap(typeMap);
      } catch (error) {
        console.error("Failed to load installation space types", error);
      }
    };

    loadInstallationSpaceTypeMap();
  }, []);


  useEffect(() => {
    const loadInstallationSpaceDetails = async () => {
      if (!connectionId || Object.keys(installationTypeMap).length === 0) return;

      const installationSpaces = await fetchInstallationSpaceTypes(Number(connectionId));

      const enrichedSpaces = installationSpaces.map((space: any) => ({
        ...space,
        installationSpaceType:
          installationTypeMap[space.installationSpaceTypeId] || "Unknown",
      }));

      setAvailableSpaceTypes(enrichedSpaces);


      if (enrichedSpaces.length > 0) {
        setFormData((prev) => ({
          ...prev,
          installationSpaceType: enrichedSpaces[0].installationSpaceType,
        }));
        setSelectedSpace(enrichedSpaces[0]);
      } else {
        setFormData((prev) => ({
          ...prev,
          installationSpaceType: "",
        }));
        setSelectedSpace(null);
      }
    };

    loadInstallationSpaceDetails();
  }, [connectionId, installationTypeMap]);



  useEffect(() => {
    const fetchCustomer = async () => {
      if (customerId) {
        const data = await getCustomerById(Number(customerId));
        setGovIdName(data?.govIdName || "");
        setOrgId(data?.organizationId || null);
        setAgencyId(data?.agencyId || null);
      }
    };
    fetchCustomer();
  }, [customerId]);


  useEffect(() => {
    const fetchConnection = async () => {
      if (!connectionId) {
        console.error("Connection ID not found!");
        return;
      }

      try {
        const data = await getConnectionByConnectionId(Number(connectionId));
        setConnectionDetails(data);

        if (data?.phaseTypeId !== undefined && data?.phaseTypeId !== null && data?.avgMonthlyConsumption !== null) {
          setPhaseTypeId(data.phaseTypeId);
          setAvgMonthlyConsumption(data.avgMonthlyConsumption);
          console.log("Fetched Phase Type Id, monthly avg unit from API:", data.phaseTypeId, data.avgMonthlyConsumption);
        } else {
          setPhaseTypeId(null);
          setAvgMonthlyConsumption(null);
        }
      } catch (error) {
        console.error("Failed to fetch connection details", error);
      }
    };

    fetchConnection();
  }, [connectionId]);

  // useEffect(() => {
  //   if (phaseTypeId === 1) {
  //     setMaterialOriginId(1);
  //     setFormData((prev) => ({ ...prev, materialOriginId: 1 }));
  //   } else if (phaseTypeId === 2) {
  //     setMaterialOriginId(2);
  //     setFormData((prev) => ({ ...prev, materialOriginId: 2 }));
  //   }
  // }, [phaseTypeId]);




  const fetchSavedSpecs = async () => {
    try {
      const data = await getSavedSystemSpecs(connectionId);
      setSavedSpecs(data || []);

      // 🔍 Find the first locked spec (isRunningCopy = false)
      const lockedSpec = (data || []).find(spec => spec.isRunningCopy === false);

      if (lockedSpec) {
        console.log("Locked spec found:", lockedSpec);
        setSystemSpecificationId(lockedSpec.id);

        // 🔄 Fetch secondaryId for that locked spec
        try {
          const secondaryData = await getSecondaryId(lockedSpec.id);

          // handle both array or object responses
          const secondaryIdValue = Array.isArray(secondaryData)
            ? secondaryData[0]?.id
            : secondaryData?.id;

          if (secondaryIdValue) {
            setSecondaryId(secondaryIdValue);
            console.log("Fetched secondaryId:", secondaryIdValue);
          } else {
            console.warn("No valid secondaryId found in response:", secondaryData);
          }
        } catch (secondaryErr) {
          console.error("Error fetching secondaryId:", secondaryErr);
        }
      } else {
        console.log("No locked (isRunningCopy=false) spec found.");
      }
    } catch (err) {
      console.error("Error fetching saved specs", err);
    }
  };

  useEffect(() => {
    if (connectionId) {
      fetchSavedSpecs();
    }
  }, [connectionId]);



  useEffect(() => {
    const fetchOrigins = async () => {
      try {
        const data = await getMaterialOrigins();
        setOrigins(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch material origins:", error);
        setOrigins([]);
      }
    };

    fetchOrigins();
  }, []);


  useEffect(() => {
    const fetchGrids = async () => {
      try {
        const data = await getGridTypes();
        setGrids(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch grid types:", error);
        setGrids([]);
      }
    };

    fetchGrids();
  }, []);



  useEffect(() => {
    const loadInverterBrands = async () => {
      // If not pre-filling, clear dependent fields first (because user changed phase/grid)
      if (!isPrefilling) {
        setInverters([]);
        setInverterCapacities([]);
        setFormData((prev) => {
          const updatedInverters = (prev.inverters || []).map((inv) => ({
            ...inv,
            inverterBrandId: null,
            inverterSpecId: null,
          }));
          return {
            ...prev,
            inverterBrandId: null,
            inverterSpecId: null,
            inverters: updatedInverters,
          };
        });
        setInverterCapacitiesMap({});
      } else {
        // while pre-filling we do not reset form fields — but allow fetching options
        setInverterCapacities([]); // keep capacity list empty initially
      }

      if (phaseTypeId !== null && gridTypeId !== null) {
        try {
          const data = await fetchInverterBrands(phaseTypeId, gridTypeId);
          setInverters(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch inverter brands:", error);
          setInverters([]);
        }
      } else {
        // no fetch possible — keep empty if not pre-filling
        if (!isPrefilling) {
          setInverters([]);
        }
      }
    };

    loadInverterBrands();
  }, [phaseTypeId, gridTypeId]); // keep same deps



  useEffect(() => {
    const loadInverterBrandCapacities = async () => {
      // Reset capacities & spec only when user changes brand (i.e., not during prefill)
      if (!isPrefilling) {
        setInverterCapacities([]);
        setInverterSpecId(null);
        setFormData((prev) => ({ ...prev, inverterSpecId: null }));
      } else {
        // while pre-filling, don't clear the spec (we want what prefill sets)
        setInverterCapacities([]);
      }

      if (!inverterBrandId || !gridTypeId) {
        return;
      }

      try {
        const data = await fetchInverterBrandCapacities(inverterBrandId);
        setInverterCapacities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch inverter brand capacities:", error);
        setInverterCapacities([]);
      }
    };

    loadInverterBrandCapacities();
  }, [inverterBrandId, gridTypeId]);



  useEffect(() => {
    const loadPanelBrands = async () => {
      if (!materialOriginId) {
        // clear if user cleared origin (but skip clearing if prefill is happening)
        if (!isPrefilling) {
          setPanels([]);
          setPanelSpecId(null);
          setPanelCapacities([]);
          setSystemCapacityKw(null);
          setFormData((prev) => ({ ...prev, panelSpecId: null, systemCapacityKw: null }));
        }
        return;
      }

      // When user changes origin, clear dependents; skip clearing during prefill
      if (!isPrefilling) {
        setPanels([]);
        setPanelSpecId(null);
        setPanelCapacities([]);
        setSystemCapacityKw(null);
        setFormData((prev) => ({ ...prev, panelSpecId: null, systemCapacityKw: null }));
      }

      try {
        const data = await fetchPanelBrands(Number(materialOriginId));
        setPanels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch panel brands:", error);
        setPanels([]);
      }
    };

    loadPanelBrands();
  }, [materialOriginId]);






  useEffect(() => {
    const loadPanelBrandCapacities = async () => {
      // Guard: any required value missing -> reset capacities and exit (unless prefill)
      if (
        phaseTypeId == null ||
        panelSpecId == null ||
        avgMonthlyConsumption == null ||
        materialOriginId == null
      ) {
        if (!isPrefilling) setPanelCapacities([]);
        return;
      }

      // Reset capacities when user changes panel/phase; skip clearing systemCapacity during prefill
      if (!isPrefilling) {
        setPanelCapacities([]);
        if (!formData.systemCapacityKw) {
          setSystemCapacityKw(null);
          setFormData((prev) => ({ ...prev, systemCapacityKw: null }));
        }
      } else {
        // during prefill we still clear panel capacities before fetching options
        setPanelCapacities([]);
      }

      try {
        const data = await fetchPanelBrandCapacities(phaseTypeId, panelSpecId);
        setPanelCapacities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch panel brand capacities:", error);
        setPanelCapacities([]);
      }
    };

    loadPanelBrandCapacities();
  }, [phaseTypeId, panelSpecId, materialOriginId, avgMonthlyConsumption]);





  useEffect(() => {
    const loadBatteryBrands = async () => {
      // When grid type requires battery
      if (gridTypeId === 2 || gridTypeId === 3) {
        try {
          const data = await fetchBatteryBrands();
          setBatteryBrands(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch battery brands:", error);
          setBatteryBrands([]);
        }
        return;
      }

      // When grid type doesn't require battery -> clear if NOT pre-filling
      if (!isPrefilling) {
        setBatteryBrands([]);
        setBatteryBrandId(null);
        setBatterySpecId(null);
        setBatteryCapacities([]);
        setFormData((prev) => ({ ...prev, batteryBrandId: null, batterySpecId: null }));
      } else {
        // if pre-filling, do not clear batteryBrandId/spec — keep what's being prefilled
        setBatteryBrands([]);
      }
    };

    loadBatteryBrands();
  }, [gridTypeId]); // switched to gridTypeId for clarity


  useEffect(() => {
    const loadBatteryCapacities = async () => {
      if (!isPrefilling) {
        setBatteryCapacities([]);
        setBatterySpecId(null);
        setFormData((prev) => ({ ...prev, batterySpecId: null }));
      } else {
        setBatteryCapacities([]);
      }

      if (!batteryBrandId || !gridTypeId) {
        return;
      }

      try {
        const data = await fetchBatteryBrandCapacities(batteryBrandId);
        setBatteryCapacities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch battery brand capacities:", error);
        setBatteryCapacities([]);
      }
    };

    loadBatteryCapacities();
  }, [batteryBrandId, gridTypeId]);




  const handleInverterChange = async (index, field, value) => {
    const updatedInverters = [...(formData.inverters || [])];
    // Ensure the row exists
    if (!updatedInverters[index]) updatedInverters[index] = {};

    updatedInverters[index][field] = value;

    // If brand changed, reset spec and fetch capacities for that row
    if (field === "inverterBrandId") {
      updatedInverters[index].inverterSpecId = null;

      if (value !== null) {
        try {
          // capacities for the particular brand (and implicitly for current gridTypeId)
          const capacities = await fetchInverterBrandCapacities(value, gridTypeId);
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
      inverterSpecId: null,
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


  const handleSaveSpecs = async () => {
    try {

      if (
        !formData.inverters ||
        formData.inverters.length === 0 ||
        formData.inverters.some(
          (inv) => !inv.inverterBrandId || !inv.inverterSpecId
        )
      ) {
        toast.error(
          "Please select at least one Inverter Brand and Specification for all inverters before saving.",
          { autoClose: 1500, hideProgressBar: true }
        );
        return;
      }

      setIsSubmitting(true);

      const systemResponse = await saveSystemSpecs({
        ...formData,
        installationSpaceType:
          formData.installationSpaceType?.trim() === "" ? null : formData.installationSpaceType,
        batteryCount: formData.batterySpecId ? 1 : null,
        connectionId,
        panelSpecsId: formData.panelSpecId,
        batterySpecsId: formData.batterySpecId,
        orgId,
        agencyId,
        isRunningCopy: true,
      });

      console.log("System specs saved:", systemResponse);

      const systemSpecsId = systemResponse.id;

      const inverterList = formData.inverters.map((inv) => ({
        systemSpecsId,
        inverterSpecId: inv.inverterSpecId,
        inverterCount: inv.inverterCount || 1,
      }));

      console.log("Inverter list to save:", inverterList);

      const inverterResponse = await saveInverterSpecs(inverterList);

      console.log("Inverter specs saved:", inverterResponse);


      await fetchSavedSpecs();

      toast.success("System Specification details saved successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Error saving specs:", error);
      toast.error("Failed to save system specs or inverter specs.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSaveButtonClick = () => {
    setDialogType("confirm");
    setDialogMessage("Do you want to save system specification details?");
    setDialogAction(() => handleSaveSpecs);
    setDialogOpen(true);
  };

  const handleUpdateButtonClick = () => {
    setDialogType("confirm");
    setDialogMessage("Do you want to update system specification details?");
    setDialogAction(() => handleUpdateSpecs);
    setDialogOpen(true);
  };


  const handleSelectSpec = async (spec) => {
    // Begin prefill mode
    setIsPrefilling(true);

    // set selected id immediately
    setSelectedSpecId(spec.id);

    // Build inverter list (no side effects)
    const inverterList = (spec.inverters || []).map((inv) => ({
      inverterBrandId: inv.inverterBrandId ?? null,
      inverterBrandName: inv.inverterBrandName ?? "",
      inverterSpecId: inv.inverterSpecId ?? null,
      inverterCount: inv.inverterCount || 1,
      inverterCapacity: inv.inverterCapacity ?? null,
      inverterWarrantyMonths: inv.inverterWarrantyMonths ?? null,
      almmModelNumber: inv.almmModelNumber ?? "",
      gridTypeId: inv.gridTypeId ?? spec.gridTypeId ?? gridTypeId,
    }));

    // Fetch capacities in parallel
    const capacitiesMap = {};
    await Promise.all(
      inverterList.map(async (inv, idx) => {
        if (!inv.inverterBrandId) {
          capacitiesMap[idx] = [];
          return;
        }
        try {
          const data = await fetchInverterBrandCapacities(inv.inverterBrandId);
          capacitiesMap[idx] = Array.isArray(data) ? data : [];
        } catch (err) {
          capacitiesMap[idx] = [];
        }
      })
    );

    // Set capacities map
    setInverterCapacitiesMap(capacitiesMap);

    // Decide detected grid type (from first inverter or spec fallback)
    const detectedGridType = inverterList.length > 0
      ? inverterList[0].gridTypeId
      : spec.gridTypeId ?? gridTypeId;

    // Update formData once (atomic)
    setFormData((prev) => ({
      ...prev,
      installationSpaceType: spec.installationSpaceType ?? prev.installationSpaceType,
      installationStructureType: spec.installationStructureType ?? prev.installationStructureType,
      systemCost: spec.systemCost ?? 0,
      fabricationCost: spec.fabricationCost ?? 0,
      totalCost: (spec.systemCost ?? 0) + (spec.fabricationCost ?? 0),
      hasWaterSprinkler: !!spec.hasWaterSprinkler,
      hasHeavydutyRamp: !!spec.hasHeavydutyRamp,
      hasHeavydutyStairs: !!spec.hasHeavydutyStairs,
      panelSpecId: spec.panelSpecsId ?? null,
      materialOriginId: spec.materialOriginId ?? null,
      gridTypeId: detectedGridType,
      batteryBrandId: spec.batteryBrandId ?? null,
      batterySpecId: spec.batterySpecsId ?? null,
      systemCapacityKw: spec.systemCapacityKw ?? null,
      inverters: inverterList,
    }));

    // Update individual dependent states (these will trigger fetch effects)
    setMaterialOriginId(spec.materialOriginId ?? null);
    setGridTypeId(detectedGridType);
    setPanelSpecId(spec.panelSpecsId ?? null);
    setBatteryBrandId(spec.batteryBrandId ?? null);
    setBatterySpecId(spec.batterySpecsId ?? null);

    // allow React to flush the queued state updates before leaving prefill mode
    // this reduces risk of race conditions in production
    await Promise.resolve();
    setIsPrefilling(false);

    // mark that pricing is from saved spec (so price effect may skip if needed)
    setPriceAlreadySetFromCustomerData(true);
  };




  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalCost: (Number(prev.systemCost) || 0) + (Number(prev.fabricationCost) || 0),
    }));
  }, [formData.systemCost, formData.fabricationCost]);

  useEffect(() => {
    if (savedSpecs.length === 0) {
      setIsFormOpen(true);
    } else if (savedSpecs.length === 1) {
      handleSelectSpec(savedSpecs[0]);
      setSelectedSpecId(savedSpecs[0].id);
      setIsFormOpen(true);
    } else {

      const firstEditable = savedSpecs.find(spec => spec.isRunningCopy);
      if (firstEditable) {
        handleSelectSpec(firstEditable);
        setSelectedSpecId(firstEditable.id);
        setIsFormOpen(true);
      } else {

        setIsFormOpen(false);
      }
    }
  }, [savedSpecs]);



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

    if (priceAlreadySetFromCustomerData) {
      setPriceAlreadySetFromCustomerData(false);
    }
  };


  const priceInputsKey = JSON.stringify({
    systemCapacityKw: formData.systemCapacityKw,
    panelSpecId: formData.panelSpecId,
    batterySpecId: formData.batterySpecId,
    inverters: formData.inverters,
  });


  useEffect(() => {
    const fetchPriceDetails = async () => {
      if (priceAlreadySetFromCustomerData && fetchTrigger === 0) return;

      const hasValidSystem = !!formData.systemCapacityKw || !!formData.panelSpecId;
      const hasValidBattery = !!formData.batterySpecId;
      const validInverters = (formData.inverters || []).filter(
        (inv) => inv.inverterSpecId && inv.inverterCount > 0
      );

      if (!hasValidSystem && !hasValidBattery && validInverters.length === 0) {
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
          panelSpecsId: formData.panelSpecId,
          batterySpecsId: formData.batterySpecId,
          batteryCount: hasValidBattery ? 1 : 0,
          inverters: validInverters.map((inv) => ({
            inverterSpecsId: inv.inverterSpecId,
            inverterCount: inv.inverterCount,
          })),
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






  const handleGenerateQuotation = async (date) => {
    if (!selectedSpecId || !date) return;

    setIsLoading(true);
    try {
      const pdfBlob = await generateQuotationPDF(selectedSpecId, date);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `quotation_${govIdName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);

      await fetchSavedSpecs();
    } catch (error) {
      console.error("Error generating quotation PDF:", error);
    } finally {
      setIsLoading(false);
      setSelectedDate(null);
    }
  };




  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      if (!selectedSpecId) {
        console.error("System Specs ID is missing");
        return;
      }

      console.log("Fetching PDF for System Specs ID:", selectedSpecId);

      const pdfBlob = await previewQuotationPDF(selectedSpecId);
      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Failed to preview the quotation:", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    const fetchLockedSpecsDocs = async () => {
      const lockedSpecs = savedSpecs.filter((spec) => !spec.isRunningCopy);
      if (lockedSpecs.length === 0) return;

      for (const spec of lockedSpecs) {
        try {
          setLoadingDocs((prev) => ({ ...prev, [spec.id]: true }));

          // Step 1: Get secondaryId using systemSpecificationId
          const secondaryResponse = await getSecondaryId(spec.id);
          const secondaryId = secondaryResponse?.id || secondaryResponse?.[0]?.id;
          if (!secondaryId) continue;

          // Step 2: Fetch document by documentType & documentNumber
          const documentResponse = await fetchUploadedDocumentByDocumentTypeAndDocumentNumber(
            spec.connectionId,
            "Unsigned Quotation",
            secondaryId
          );

          if (Array.isArray(documentResponse) && documentResponse.length > 0) {
            setDocumentsMap((prev) => ({ ...prev, [spec.id]: documentResponse[0] }));
          }
        } catch (err) {
          console.error(`Error fetching document for specId ${spec.id}:`, err);
        } finally {
          setLoadingDocs((prev) => ({ ...prev, [spec.id]: false }));
        }
      }
    };

    if (savedSpecs?.length > 0) fetchLockedSpecsDocs();
  }, [savedSpecs]);


  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await downloadDocumentById(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading document:", err);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            navigate(-1)
          }
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>


        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 ml-2 md:ml-0">
          {/* {isCustomSpecs ? "Customized System Specifications" : "Recommended System Specifications"} */}
          System Specification Details
        </h2>
      </div>


      <div className="w-full max-w-4xl mx-auto mb-6 mt-4 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
        <div className="relative flex justify-center min-w-[500px] md:min-w-0">


          <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

          <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab;

              const Icon =
                tab === "Customer Details"
                  ? UserCircleIcon
                  : tab === "Connection Details"
                    ? BoltIcon
                    : tab === "Installation Details"
                      ? HomeModernIcon
                      : Cog6ToothIcon;

              const shouldHighlightIcon = tab === "Customer Details" || tab === "Connection Details" || tab === "Installation Details";


              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "Customer Details") {
                      navigate(`/view-customer`, {
                        state: {
                          customerId,
                        },
                      });
                    } else if (tab === "Connection Details") {
                      navigate(`/view-connection`, {
                        state: { consumerId, customerId, connectionId },
                      });
                    }
                  }}
                  className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
                >
                  <div
                    className={`rounded-full p-2 transition-all duration-300 ${shouldHighlightIcon
                      ? "bg-blue-500 text-white border border-transparent"
                      : "bg-white border border-gray-300 text-gray-500"}
                      }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs md:text-sm font-semibold mt-1 ${isActive ? "text-gray-700" : "text-gray-700"
                      }`}
                  >
                    {tab}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {isFetchingRecommendations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span className="text-gray-700 text-lg font-medium">Fetching System Specification Details...</span>
          </div>
        </div>
      )}





      <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          {/* Left side: Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">System Specifications</h3>
          </div>

          {/* {savedSpecs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedSpecId(null);
                setFormData(defaultFormData);
                setMaterialOriginId(null);
                setGridTypeId(null);
                setPanelSpecId(null);
                setInverterSpecId(null);
                setBatteryBrandId(null);
                setBatterySpecId(null);
                setInverterBrandId(null);
                setSystemCapacityKw(null);

                setIsFormOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusIcon className="w-4 h-4 text-white" />
              Add Another System Specs
            </button>

          )} */}


        </div>

        <div className="border-b border-gray-200 mb-4" />

        {savedSpecs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {savedSpecs.map((spec) => {
              const isEditable = spec.isRunningCopy;
              const document = documentsMap[spec.id];
              const isLoadingDoc = loadingDocs[spec.id];

              return (
                <div
                  key={spec.id}
                  // onClick={() => {
                  //   if (!isEditable) return;
                  //   handleSelectSpec(spec);
                  //   setIsFormOpen(true);
                  // }}

                  onClick={() => {
                    handleSelectSpec(spec);
                    setActiveLoadedSpecId(spec.id);

                    if (spec.isRunningCopy) {
                      setSelectedSpecId(spec.id);
                    }

                    setIsFormOpen(true);
                  }}

                  className={`cursor-pointer border rounded-lg p-4 shadow hover:shadow-md transition 
            ${isEditable
                      ? "bg-green-50 border-green-400 hover:shadow-lg"
                      : "bg-gray-100 border-gray-300 opacity-80 cursor-not-allowed"
                    }
           ${activeLoadedSpecId === spec.id ? "ring-2 ring-blue-400" : ""}

          `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {spec.panelBrandShortName} ({spec.panelRatedWattageW} W) – {spec.systemCapacityKw} kW
                    </h3>

                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${isEditable ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {isEditable ? "Editable" : "Locked"}
                    </span>
                  </div>

                  {/* ✅ Handle list of inverters */}
                  {spec.inverters && spec.inverters.length > 0 ? (
                    spec.inverters.map((inv, index) => (
                      <p key={index} className="text-sm font-medium text-gray-700 mb-1">
                        Inverter {index + 1}: {inv.inverterBrandName} – {inv.inverterCapacity} kW × {inv.inverterCount}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-gray-500 mb-1">No inverter details</p>
                  )}

                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>System Cost: ₹{spec.systemCost.toLocaleString("en-IN")}</span>
                    <span>Fabrication Cost: ₹{spec.fabricationCost?.toLocaleString("en-IN") || 0}</span>
                  </div>

                  {/* 📄 Show document for locked specs */}
                  {!isEditable && (
                    <div className="mt-4 bg-white border rounded-md p-2 shadow-sm">
                      {isLoadingDoc ? (
                        <p className="text-sm text-gray-500">Loading document...</p>
                      ) : document ? (
                        <div className="flex justify-between items-center">
                          <div className="max-w-[70%]">
                            <p
                              className="text-sm font-medium text-gray-700 truncate"
                              title={document.fileName}
                            >
                              {document.fileName}
                            </p>
                            <p className="text-xs text-gray-500">Generated by: {document.uploadedBy}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(document.id, document.fileName);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full transition"
                            title="Download Document"
                          >
                            <DownloadIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No document found</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}



        {isFormOpen && (<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-1">

            <label className="block text-sm font-medium text-gray-700">Installation Space</label>

            <div className="mt-1 relative">
              <button
                type="button"
                onClick={() => setIsSpaceListOpen(!isSpaceListOpen)}
                className="w-full p-2 border rounded-md shadow-sm text-left flex items-center justify-between focus:border-blue-500 focus:ring-blue-500"
              >
                <span className="flex items-center gap-2">

                  <span>
                    {formData.installationSpaceType
                      ? `On ${formData.installationSpaceType}${selectedSpace?.installationSpaceTitle ? ` (${selectedSpace.installationSpaceTitle})` : ""}`
                      : "Installations Not Available"}
                  </span>
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isSpaceListOpen ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSpaceListOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-auto">
                  {availableSpaceTypes.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Installations Not Available</div>
                  ) : (
                    availableSpaceTypes.map((space) => (
                      <div key={space.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                        <button
                          type="button"
                          className="text-left flex-1 flex items-center gap-2 text-sm text-gray-800"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, installationSpaceType: space.installationSpaceType }));
                            setSelectedSpace(space);
                            setIsSpaceListOpen(false);
                          }}
                        >

                          <span>On {space.installationSpaceType} ({space.installationSpaceTitle})</span>
                        </button>
                        <button
                          type="button"
                          className="ml-3 px-2 py-1 text-xs rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                          onClick={() => { setSelectedSpace(space); setShowModal(true); }}
                        >
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {showModal && selectedSpace && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative overflow-y-auto max-h-[70vh]">
                  <div className="absolute top-4 right-4 flex items-center space-x-4">
                    {/* Edit Button */}
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm transition-all"
                      onClick={() =>
                        navigate("/edit-installation", { state: { installationId: selectedSpace.id, connectionId: connectionId, consumerId: consumerId, customerId: customerId } })
                      }
                    >
                      Edit
                    </button>


                    {/* Close Button */}
                    <button
                      className="text-gray-500 hover:text-gray-700 text-lg"
                      onClick={() => setShowModal(false)}
                    >
                      ✖
                    </button>
                  </div>

                  <h2 className="text-lg font-semibold mb-4">
                    Installation on {selectedSpace.installationSpaceType} ({selectedSpace.installationSpaceTitle})
                  </h2>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4">

                    {(() => {
                      const ew = selectedSpace.availableEastWestLengthFt;
                      const sn = selectedSpace.availableSouthNorthLengthFt;

                      let shapeClass = "w-16 h-16";
                      if (ew > sn * 1.3) shapeClass = "w-24 h-16";
                      else if (sn > ew * 1.3) shapeClass = "w-16 h-24";

                      return (
                        <div className="relative w-40 h-36 border border-dashed border-gray-300 flex items-center justify-center">


                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[11px] text-gray-700 font-bold flex items-center leading-none">
                            <span className="mr-1">N</span>
                            <span className="text-base">↑</span>
                          </div>

                          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 text-[11px] text-gray-700 font-bold flex flex-col items-center leading-none">
                            <span className="mb-[2px]">E</span>
                            <span className="text-base">→</span>
                          </div>

                          <div className={`relative border-2 border-black bg-white ${shapeClass} flex items-center justify-center`}>
                            <span className="text-[10px] text-gray-800 font-semibold">
                              {ew * sn} ft²
                            </span>
                          </div>


                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] text-blue-600 font-semibold flex items-center">
                            <span className="mr-1">←</span>
                            <span>{ew} Ft</span>
                            <span className="ml-1">→</span>
                          </div>

                          <div className="absolute top-1/2 left-1 transform -translate-y-1/2 text-[10px] text-green-600 font-semibold flex flex-col items-center space-y-1">
                            <span>↑</span>
                            <span>{sn} Ft</span>
                            <span>↓</span>
                          </div>
                        </div>
                      );
                    })()}


                    <div className="text-s text-gray-600 space-y-2">
                      <div><strong>Structure to Inverter Distance:</strong> {selectedSpace.structureInverterDistanceFt || "..."} ft</div>
                      <div><strong>Inverter to GenMeter Distance:</strong> {selectedSpace.inverterMeterDistanceFt || "..."} ft</div>
                      <div><strong>Earthing Pit to Inverter Distance:</strong> {selectedSpace.inverterEarthDistanceFt || "..."} ft</div>
                      <div><strong>Lightning Arrester to Ground Distance:</strong> {selectedSpace.arresterEarthDistanceFt || "..."} ft</div>
                      <div><strong>height of Structure:</strong> {selectedSpace.minimumElevationFt || "..."} ft</div>
                      <div><strong>Description:</strong> {selectedSpace.descriptionOfInstallation || "....."}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-1 flex items-center justify-left md:mt-0 md:pt-6">

            <button
              type="button"
              onClick={() =>
                navigate("/installation-form", {
                  state: { connectionId, customerId, consumerId },
                })
              }
              className="py-1 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add New Installation</span>
            </button>

          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grid Type
            </label>

            {/* <select
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
            </select> */}

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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material Origin Type
            </label>

            {/* <select
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
            </select> */}

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

          <div>
            <label className="block text-sm font-medium text-gray-700">PV Panel Specification</label>
            {/* <select
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
            </select> */}
            <ReusableDropdown
              name="panelSpecId"
              value={formData.panelSpecId ?? ""}
              onChange={(val) => {
                const selectedId = val === "" ? null : Number(val);
                setPanelSpecId(selectedId);
                handleChange({
                  target: { name: "panelSpecId", value: selectedId },
                } as any);
              }}
              options={panels.map((panel) => ({
                value: panel.panelSpecId,
                label: `${panel.brandShortname} - (${panel.ratedWattageW} W) - (${panel.modelNumber})`,
              }))}
              placeholder="Select PV System Brand"
              className={`mt-1 ${!materialOriginId ? "opacity-60 pointer-events-none" : ""}`}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">PV System Capacity (kW)</label>
            {/* <select
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
              //onChange={(e) => handleChange(e)}
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
            </select> */}
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
              className={`mt-1 ${!materialOriginId || !panelSpecId ? "opacity-60 pointer-events-none" : ""}`}
            />
          </div>

          <div className="md:col-span-2">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">Inverter Details</h3>
                <button
                  type="button"
                  onClick={addNewInverter}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                >
                  + Add Another Inverter
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
                        value: inv.id,
                        label: inv.inverterBrandName,
                      }))}
                      placeholder="Select Inverter Brand"
                    />
                  </div>

                  {/* Inverter Spec */}
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700">Inverter Specification</label>
                    <ReusableDropdown
                      name="inverterSpecId"
                      value={inv.inverterSpecId ?? ""}
                      onChange={(val) =>
                        handleInverterChange(index, "inverterSpecId", val === "" ? null : Number(val))
                      }
                      options={(inverterCapacitiesMap[index] || []).map((spec) => ({
                        value: spec.id,
                        label: `${spec.inverterCapacity} kW - (${spec.productWarrantyMonths} months) - (${spec.almmModelNumber})`,
                      }))}
                      disabled={!inv.inverterBrandId || !formData.systemCapacityKw}
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
                {/* <select
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
                </select> */}
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
                    value: batteryBrand.id,
                    label: batteryBrand.brandName,
                  }))}
                  placeholder="Select Battery Brand"
                  className="mt-1"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Battery Specification</label>
                {/* <select
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
                </select> */}
                <ReusableDropdown
                  name="batterySpecId"
                  value={formData.batterySpecId ?? ""}
                  onChange={(val) => {
                    const selectedId = val === "" ? null : Number(val);
                    setBatterySpecId(selectedId);
                    handleChange({
                      target: { name: "batterySpecId", value: selectedId },
                    });
                  }}
                  options={batteryCapacities.map((batteryCapacity) => ({
                    value: batteryCapacity.id,
                    label: `${batteryCapacity.batteryCapacity} kW - ${batteryCapacity.voltage} V - ${batteryCapacity.modelNumber} (${batteryCapacity.warrantyMonths} months)`,
                  }))}
                  placeholder="Select Battery Capacity"
                  className="mt-1"
                />

              </div>
            </>
          )}



          <div className="col-span-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="hasWaterSprinkler"
                  checked={formData.hasWaterSprinkler || false}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="text-base text-gray-800">Water Sprinkler System</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="hasHeavydutyRamp"
                  checked={formData.hasHeavydutyRamp || false}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="text-base text-gray-800">Heavy Duty Ramp</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="hasHeavydutyStairs"
                  checked={formData.hasHeavydutyStairs || false}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="text-base text-gray-800">Heavy Duty Stairs</span>
              </label>
            </div>
          </div>


          <div className="col-span-full space-y-6 mt-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Cost Details</h3>
              </div>

              {/* Horizontal line */}
              <div className="mt-2 border-b border-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Solar System Cost (₹)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="systemCost"
                  value={
                    isEditing
                      ? formData.systemCost // raw while typing
                      : formatIndianNumber(formData.systemCost) // formatted otherwise
                  }
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => setIsEditing(false)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({
                      ...formData,
                      systemCost: rawValue,
                    });
                  }}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fabrication Cost (₹)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="fabricationCost"
                  value={
                    isEditingFabrication
                      ? formData.fabricationCost // raw while editing
                      : formatIndianNumber(formData.fabricationCost) // formatted on blur
                  }
                  onFocus={() => setIsEditingFabrication(true)}
                  onBlur={() => setIsEditingFabrication(false)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, ""); // keep only digits
                    setFormData({
                      ...formData,
                      fabricationCost: rawValue,
                    });
                  }}
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


            <div className="flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                onClick={handleSaveButtonClick}
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-5 py-2.5 text-white font-medium rounded-lg 
    ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isSubmitting ? "Saving..." : "Save System Specs"}
              </button>



              {/* {(userInfo?.role === "ROLE_ORG_ADMIN" ||
                userInfo?.role === "ROLE_AGENCY_ADMIN" ||
                userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) && (<button
                  type="button"
                  onClick={handlePreview}
                  disabled={!selectedSpecId || isPreviewLoading}
                  className="hidden md:block w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPreviewLoading ? "Previewing..." : "Preview Quotation"}
                </button>)} */}

              {(userInfo?.role === "ROLE_ORG_ADMIN" ||
                userInfo?.role === "ROLE_AGENCY_ADMIN" ||
                userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowDatePickModal(true)}
                      disabled={!selectedSpecId || isLoading}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Generating..." : "Generate & Save Quotation"}
                    </button>

                    {/* Modal */}
                    {showDatePickModal && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
                          <h2 className="text-lg font-semibold mb-4 text-gray-800">
                            Select Quotation Date
                          </h2>

                          {/* Native HTML Date Picker */}
                          <input
                            type="date"
                            value={
                              selectedDate
                                ? selectedDate.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => {
                              const picked = e.target.value ? new Date(e.target.value) : null;
                              setSelectedDate(picked);
                            }}
                            className="border px-3 py-2 rounded w-full"
                          />

                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={() => setShowDatePickModal(false)}
                              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() => {
                                if (selectedDate) {
                                  setShowDatePickModal(false); // close modal first
                                  // slight delay to ensure modal close before API call
                                  setTimeout(() => {
                                    handleGenerateQuotation(selectedDate);
                                  }, 300);
                                }
                              }}
                              disabled={!selectedDate || isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {isLoading ? "Generating..." : "Confirm & Generate"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

            </div>
          </div>

        </form>)}

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">
            {dialogType === "success" && "Success"}
            {dialogType === "error" && "Error"}
            {dialogType === "confirm" && "Confirm"}
          </DialogTitle>

          <DialogContent dividers>
            <Alert
              severity={
                dialogType === "success"
                  ? "success"
                  : dialogType === "error"
                    ? "error"
                    : "info"
              }
            >
              {dialogMessage}
            </Alert>
          </DialogContent>

          <DialogActions>
            {dialogType === "confirm" ? (
              <>
                <Button
                  onClick={() => setDialogOpen(false)}
                // color="error"
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    if (dialogAction) dialogAction();
                  }}
                  autoFocus
                >
                  Yes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  if (dialogAction) dialogAction();
                }}
                autoFocus
              >
                OK
              </Button>
            )}
          </DialogActions>
        </Dialog>

      </div>


    </div>
  );
};
