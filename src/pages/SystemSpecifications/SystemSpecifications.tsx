import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchInstallationSpaceTypes, fetchInstallationSpaceTypesNames, getConnectionByConnectionId, getCustomerById } from '../../services/customerRequisitionService';
import {
  generateQuotationPDF, saveSystemSpecs, saveInverterSpecs, getMaterialOrigins, getGridTypes, fetchInverterBrands,
  fetchInverterBrandCapacities, fetchPanelBrandCapacities, fetchBatteryBrands,
  fetchBatteryBrandCapacities, getSavedSystemSpecs, getPriceDetails, getSecondaryId, fetchPanelSpecsByOrg,
  fetchPipeSpecification, savePipeSpecs, deleteSpecAPI, markQuotationFinal, fetchFinalQuotationByConnectionId
} from '../../services/quotationService';
import ReusableDropdown from "../../components/ReusableDropdown";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon, CurrencyRupeeIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useUser } from "../../contexts/UserContext";
import { fetchUploadedDocumentByDocumentTypeAndDocumentNumber, downloadDocumentById, deleteDocumentById } from "../../services/documentManagerService";
import { Download as DownloadIcon, CheckCircle, PencilIcon, LockIcon, X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

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



interface SystemSpec {
  id: number;
  connectionId: number;
  isRunningCopy: boolean;

  panelBrandShortName?: string;
  panelRatedWattageW?: number;
  systemCapacityKw?: number;

  systemCost?: number;
  fabricationCost?: number;

  batteryBrandName?: string;
  batteryCapacityKw?: number;

  inverters?: Inverter[];

  createdAt: string;
}

export const SystemSpecifications = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [, setIsSpecsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [, setIsCustomSpecs] = useState(false);
  const [govIdName, setGovIdName] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [orgId, setOrgId] = useState<number | null>(null);
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const [dialogType, setDialogType] = useState<
    "success" | "error" | "confirm" | ""
  >("");

  const [dialogMessage, setDialogMessage] = useState<string>("");

  const [dialogAction, setDialogAction] = useState<
    (() => Promise<void> | void) | null
  >(null);

  const [quotationFileMeta, setQuotationFileMeta] = useState<{
    systemCapacityKw?: number;
    panelBrandName?: string;
  }>({});

  const [showModal, setShowModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [priceAlreadySetFromCustomerData, setPriceAlreadySetFromCustomerData] = useState(false);
  const [isSpaceListOpen, setIsSpaceListOpen] = useState(false);
  const [, setConnectionDetails] = useState<any>(null);

  const [phaseTypeId, setPhaseTypeId] = useState<number | null>(null);
  const [avgMonthlyConsumption, setAvgMonthlyConsumption] = useState<number | null>(null);

  const [materialOriginId, setMaterialOriginId] = useState<number | null>(null);
  const [origins, setOrigins] = useState<any[]>([]);

  const [gridTypeId, setGridTypeId] = useState<number | null>(null);
  const [grids, setGrids] = useState<any[]>([]);

  const [inverterBrandId,] = useState<number | null>(null);
  const [inverters, setInverters] = useState<any[]>([]);


  const [, setInverterCapacities] = useState<any[]>([]);

  const [quotationNumber, setQuotationNumber] = useState("");


  const [panels, setPanels] = useState<any[]>([]);

  const [orgPanelSpecId, setOrgPanelSpecId] = useState<number | null>(null);
  const [panelCapacities, setPanelCapacities] = useState<number[]>([]);

  const [, setSystemCapacityKw] = useState<number | null>(null);

  const [batteryBrands, setBatteryBrands] = useState<any[]>([]);
  const [batteryBrandId, setBatteryBrandId] = useState<number | null>(null);

  const [pipes, setPipes] = useState<any[]>([]);

  const [, setOrgBatterySpecId] = useState<number | null>(null);
  const [batteryCapacities, setBatteryCapacities] = useState<BatterySpec[]>([]);

  const [savedSpecs, setSavedSpecs] = useState<SystemSpec[]>([]);

  const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null);

  const [isPrefilling, setIsPrefilling] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(savedSpecs.length === 0 || savedSpecs.length === 1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userClaims } = useUser();
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");

  const [activeTab, setActiveTab] = useState("System Specifications");

  const [inverterCapacitiesMap, setInverterCapacitiesMap] = useState<Record<number, any[]>>({});

  const [, setSystemSpecificationId] = useState(null);
  const [secondaryId, setSecondaryId] = useState(null);

  const [documentsMap, setDocumentsMap] = useState<{ [key: number]: any }>({});
  const [loadingDocs, setLoadingDocs] = useState<{ [key: number]: boolean }>({});

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const [showDatePickModal, setShowDatePickModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [activeLoadedSpecId, setActiveLoadedSpecId] = useState<number | null>(null);

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
  const [finalQuotationId, setFinalQuotationId] = useState<number | null>(null);
  const [secondaryIdMap, setSecondaryIdMap] = useState<Record<number, number>>({});
  const [isLoadingSavedSpecs, setIsLoadingSavedSpecs] = useState(false);

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
    inverters: [
      { inverterBrandId: null, orgInverterSpecId: null, inverterCount: 1 },
    ],
    pipes: [
      { orgPipeSpecId: null, pipeCount: 1 },
    ],
  });

  const connectionId = location.state?.connectionId;
  const consumerId = location.state?.consumerId;
  const customerId = location.state?.customerId;


  const formatIndianNumber = (value: number): string => {
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

        if (data?.phaseTypeId !== undefined && data?.phaseTypeId !== null && data?.avgMonthlyConsumption !== null && data?.connectionTypeName) {
          setPhaseTypeId(data.phaseTypeId);
          setAvgMonthlyConsumption(data.avgMonthlyConsumption);
          setConnectionType(data.connectionTypeName)
          console.log("Fetched Phase Type Id, monthly avg unit from API:", data.phaseTypeId, data.avgMonthlyConsumption);
        } else {
          setPhaseTypeId(null);
          setAvgMonthlyConsumption(null);
          setConnectionType("");
        }
      } catch (error) {
        console.error("Failed to fetch connection details", error);
      }
    };

    fetchConnection();
  }, [connectionId]);


  const fetchSavedSpecs = async () => {
    setIsLoadingSavedSpecs(true);

    try {

      hasFetchedRef.current = false;

      const data = await getSavedSystemSpecs(connectionId);
      setSavedSpecs(data || []);

      const lockedSpec = (data || []).find(spec => spec.isRunningCopy === false);

      if (lockedSpec) {
        console.log("Locked spec found:", lockedSpec);
        setSystemSpecificationId(lockedSpec.id);

        try {
          const secondaryData = await getSecondaryId(lockedSpec.id);

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
    } finally {

      setIsLoadingSavedSpecs(false);
    }
  };

  useEffect(() => {
    if (connectionId) {
      fetchSavedSpecs();
    }
  }, [connectionId]);



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

      if (phaseTypeId && gridTypeId && orgId) {
        const data = await fetchInverterBrands(phaseTypeId, gridTypeId, orgId);
        setInverters(Array.isArray(data) ? data : []);
      }

      setIsPrefilling(false);
    };

    loadInverterBrands();
  }, [phaseTypeId, gridTypeId, orgId]);




  useEffect(() => {
    if (isPrefilling) return;
    if (!inverterBrandId) return;

    const loadInverterBrandCapacities = async () => {
      setInverterCapacities([]);

      try {
        const data = await fetchInverterBrandCapacities(
          inverterBrandId,
          Number(orgId),
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
  }, [inverterBrandId, gridTypeId, orgId, phaseTypeId]);


  useEffect(() => {
    const loadPanelBrands = async () => {
      if (!materialOriginId || !orgId) return;

      // reset dependent state
      setPanels([]);
      setOrgPanelSpecId(null);
      setPanelCapacities([]);
      setSystemCapacityKw(null);
      setFormData((prev) => ({
        ...prev,
        orgPanelSpecId: null,
        systemCapacityKw: null,
      }));

      try {
        const data = await fetchPanelSpecsByOrg(
          Number(materialOriginId),
          Number(orgId)
        );
        setPanels(data);
      } catch (error) {
        console.error("Failed to fetch panel brands:", error);
        setPanels([]);
      }
    };

    loadPanelBrands();
  }, [materialOriginId, orgId]);   // ✅ include orgId


  useEffect(() => {
    const loadPanelBrandCapacities = async () => {
      if (
        phaseTypeId === null ||
        orgPanelSpecId === null ||
        avgMonthlyConsumption === null ||
        materialOriginId === null
      ) {
        return;
      }

      if (!formData.systemCapacityKw) {
        setPanelCapacities([]);
        setSystemCapacityKw(null);
        setFormData((prev) => ({
          ...prev,
          systemCapacityKw: null,
        }));
      }

      try {
        const data = await fetchPanelBrandCapacities(phaseTypeId, orgPanelSpecId);
        setPanelCapacities([...data]);
      } catch (error) {
        console.error("Failed to fetch panel brand capacities:", error);
        setPanelCapacities([]);
      }
    };

    loadPanelBrandCapacities();
  }, [phaseTypeId, orgPanelSpecId, materialOriginId]);




  useEffect(() => {
    const loadBatteryBrands = async () => {
      if (!orgId) return;

      if (formData.gridTypeId === 2 || formData.gridTypeId === 3) {
        const data = await fetchBatteryBrands(Number(orgId));
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
  }, [formData.gridTypeId, orgId]);   // ✅ add orgId


  useEffect(() => {
    // reset dependent state
    setBatteryCapacities([]);
    setOrgBatterySpecId(null);
    setFormData((prev) => ({
      ...prev,
      orgBatterySpecId: null,
    }));

    if (batteryBrandId !== null && orgId) {
      const loadBatteryCapacities = async () => {
        try {
          const data = await fetchBatteryBrandCapacities(
            Number(batteryBrandId),
            Number(orgId)
          );
          setBatteryCapacities(data);
        } catch (error) {
          console.error("Failed to fetch battery brand capacities:", error);
          setBatteryCapacities([]);
        }
      };

      loadBatteryCapacities();
    }
  }, [batteryBrandId, gridTypeId, orgId]);   // ✅ add orgId


  useEffect(() => {
    const loadPipeSpecs = async () => {
      const data = await fetchPipeSpecification(Number(orgId));
      setPipes(data);
    };

    if (orgId) {
      loadPipeSpecs();
    }
  }, [orgId]);




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
          const capacities = await fetchInverterBrandCapacities(value, Number(orgId), Number(phaseTypeId), Number(gridTypeId));
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



  const handleSaveSpecs = async () => {
    try {
      // ---------------------- VALIDATION ------------------------------

      // Inverter validation
      if (
        !formData.inverters ||
        formData.inverters.length === 0 ||
        formData.inverters.some(
          (inv) => !inv.inverterBrandId || !inv.orgInverterSpecId
        )
      ) {
        toast.error(
          "Please select at least one Inverter Brand and Specification for all inverters.",
          { autoClose: 1500, hideProgressBar: true }
        );
        return;
      }

      // ---------------------- SAVE SYSTEM SPECS ------------------------------

      setIsSubmitting(true);

      const systemResponse = await saveSystemSpecs({
        ...formData,
        installationSpaceType:
          formData.installationSpaceType?.trim() === ""
            ? null
            : formData.installationSpaceType,
        batteryCount: formData.orgBatterySpecId ? 1 : null,
        connectionId,
        orgPanelSpecId: formData.orgPanelSpecId,
        orgBatterySpecId: formData.orgBatterySpecId,
        orgId: agencyId ?? orgId,
        isRunningCopy: true,
      });

      console.log("System specs saved:", systemResponse);

      const systemSpecsId = systemResponse.id;

      // ---------------------- SAVE INVERTERS ------------------------------

      const inverterList = formData.inverters.map((inv) => ({
        systemSpecsId,
        orgInverterSpecId: inv.orgInverterSpecId,
        inverterCount: inv.inverterCount || 1,
      }));

      console.log("Inverter list to save:", inverterList);

      await saveInverterSpecs(inverterList);

      // ---------------------- SAVE PIPE SPECS ------------------------------

      // Save pipes if they exist, regardless of Heavy Duty Ramp checkbox
      if (formData.pipes && formData.pipes.length > 0 && formData.pipes.some((p) => p.orgPipeSpecId)) {
        const pipeList = formData.pipes
          .filter((pipe) => pipe.orgPipeSpecId) // Only save pipes with valid spec IDs
          .map((pipe) => ({
            systemSpecsId,
            orgPipeSpecId: pipe.orgPipeSpecId,
            pipeCount: pipe.pipeCount || 1,
          }));

        console.log("Pipe list to save:", pipeList);

        await savePipeSpecs(pipeList);
      }

      // ---------------------- REFRESH & SUCCESS ------------------------------

      await fetchSavedSpecs();

      toast.success("System Specification saved successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

    } catch (error) {
      console.error("Error saving specs:", error);
      toast.error("Failed to save system specs.", {
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


  const handleSelectSpec = async (spec) => {
    setIsPrefilling(true);
    setSelectedSpecId(spec.id);

    setQuotationFileMeta({
      systemCapacityKw: spec.systemCapacityKw,
      panelBrandName: spec.panelBrandShortName,
    });

    // STEP 1: Extract common fields FIRST
    const initialGridTypeId =
      spec.inverters?.length > 0 ? spec.inverters[0].gridTypeId : spec.gridTypeId;

    const initialMaterialOriginId = spec.materialOriginId;



    // Set them immediately
    setGridTypeId(initialGridTypeId);
    setMaterialOriginId(initialMaterialOriginId);

    setBatteryBrandId(spec.batteryBrandId || null);
    setOrgBatterySpecId(spec.orgBatterySpecId || null);

    // STEP 2: Build inverter list
    const inverterList = (spec.inverters || []).map((inv) => ({
      inverterBrandId: inv.inverterBrandId,
      inverterBrandName: inv.inverterBrandName,
      orgInverterSpecId: inv.orgInverterSpecId,
      inverterCount: inv.inverterCount || 1,
      inverterCapacity: inv.inverterCapacity,
      productWarranty: inv.productWarranty,
      almmModelNumber: inv.almmModelNumber,
      gridTypeId: inv.gridTypeId,
    }));

    // STEP 3: Fetch capacities for each inverter
    const capacitiesMap = {};
    for (let i = 0; i < inverterList.length; i++) {
      const inv = inverterList[i];

      if (inv.inverterBrandId) {
        try {
          const capacities = await fetchInverterBrandCapacities(
            inv.inverterBrandId,
            Number(orgId),
            Number(phaseTypeId),
            Number(initialGridTypeId) // ✅ FIX
          );

          capacitiesMap[i] = capacities;
        } catch (error) {
          capacitiesMap[i] = [];
        }
      } else {
        capacitiesMap[i] = [];
      }
    }

    setInverterCapacitiesMap(capacitiesMap);

    // STEP 4: Build pipe list if available
    const pipeList = (spec.pipes || []).map((pipe) => ({
      orgPipeSpecId: pipe.orgPipeSpecId,
      pipeCount: pipe.pipeCount || 1,
    }));

    // STEP 5: Then set all form data
    setFormData((prev) => ({
      ...prev,
      installationSpaceType: spec.installationSpaceType,
      installationStructureType: spec.installationStructureType,
      systemCost: spec.systemCost || 0,
      fabricationCost: spec.fabricationCost || 0,
      totalCost: (spec.systemCost || 0) + (spec.fabricationCost || 0),
      hasWaterSprinkler: spec.hasWaterSprinkler,
      hasHeavydutyRamp: spec.hasHeavydutyRamp,
      hasHeavydutyStairs: spec.hasHeavydutyStairs,
      orgPanelSpecId: spec.orgPanelSpecId,
      materialOriginId: initialMaterialOriginId, // safe
      gridTypeId: initialGridTypeId,            // safe
      batteryBrandId: spec.batteryBrandId,
      orgBatterySpecId: spec.orgBatterySpecId,
      systemCapacityKw: spec.systemCapacityKw,
      inverters: inverterList,
      pipes: pipeList.length > 0 ? pipeList : [{ orgPipeSpecId: null, pipeCount: 1 }],
    }));

    setOrgPanelSpecId(spec.orgPanelSpecId);

    setPriceAlreadySetFromCustomerData(true);

    setTimeout(() => setIsPrefilling(false), 0);

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
      return;
    }

    if (savedSpecs.length === 1) {
      handleSelectSpec(savedSpecs[0]);
      setSelectedSpecId(savedSpecs[0].id);
      setIsFormOpen(true);
      return;
    }

    const firstEditable = savedSpecs.find(
      (spec) => spec.isRunningCopy
    );

    if (firstEditable) {
      handleSelectSpec(firstEditable);
      setSelectedSpecId(firstEditable.id);
      setIsFormOpen(true);
    } else {
      setIsFormOpen(false);
    }
  }, [savedSpecs]);




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
    setIsCustomSpecs(true);
    setIsSpecsSaved(false);

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

  const handleGenerateQuotation = async (date: Date,
    quotationNumber?: string) => {
    if (!selectedSpecId || !date) return;

    setIsLoading(true);
    try {
      const normalizedQuotationNumber =
        quotationNumber && quotationNumber.trim() !== ""
          ? quotationNumber.trim()
          : null;

      const pdfBlob = await generateQuotationPDF(selectedSpecId, date, normalizedQuotationNumber as string);

      const safe = (val?: string | number) =>
        String(val || "")
          .trim()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9._-]/g, ""); // ✅ allow dot


      const fileName = [
        safe(govIdName),
        safe(quotationFileMeta.systemCapacityKw
          ? `${quotationFileMeta.systemCapacityKw}kW`
          : ""),
        safe(connectionType),          // ✅ FROM STATE
        safe(quotationFileMeta.panelBrandName),
        "Quotation",
      ]
        .filter(Boolean)
        .join("_") + ".pdf";


      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);

      await fetchSavedSpecs();

      window.scrollTo({
        top: 0,
        behavior: "smooth", // or "instant"
      });

    } catch (error) {
      console.error("Error generating quotation PDF:", error);
    } finally {
      setIsLoading(false);
      setSelectedDate(null);
    }
  };

  const handleDeleteSpec = (specId: number, documentId?: number) => {
    setDialogType("confirm");
    setDialogMessage("Are you sure you want to delete this specification?");
    setDialogAction(() => () => confirmDeleteSpec(specId, documentId));
    setDialogOpen(true);
  };



  const confirmDeleteSpec = async (specId: number, documentId?: number) => {
    try {
      await deleteSpecAPI(specId);

      if (documentId) {
        await deleteDocumentById(documentId);
      }

      await fetchSavedSpecs();

      toast.success("Specification deleted successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      setDialogOpen(false);



    } catch (err) {
      toast.error("Failed to delete specification!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      setDialogOpen(false);
    }
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    if (savedSpecs.length === 0) return;

    hasFetchedRef.current = true;

    const fetchLockedSpecsDocs = async () => {
      const lockedSpecs = savedSpecs.filter(
        (spec) => !spec.isRunningCopy
      );

      for (const spec of lockedSpecs) {
        try {
          setLoadingDocs((prev) => ({
            ...prev,
            [spec.id]: true,
          }));

          const secondaryResponse = await getSecondaryId(spec.id);
          const secondaryId =
            secondaryResponse?.id ?? secondaryResponse?.[0]?.id;

          if (!secondaryId) continue;

          setSecondaryIdMap((prev) => ({
            ...prev,
            [spec.id]: secondaryId,
          }));

          const documentResponse =
            await fetchUploadedDocumentByDocumentTypeAndDocumentNumber(
              spec.connectionId,
              "Unsigned Quotation",
              secondaryId
            );

          if (Array.isArray(documentResponse) && documentResponse.length > 0) {
            setDocumentsMap((prev) => ({
              ...prev,
              [spec.id]: documentResponse[0],
            }));
          }
        } catch (err) {
          console.error(`Error fetching document for specId ${spec.id}`, err);
        } finally {
          setLoadingDocs((prev) => ({
            ...prev,
            [spec.id]: false,
          }));
        }
      }
    };

    fetchLockedSpecsDocs();
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

  const handleView = async (id: number) => {
    try {
      const blob = await downloadDocumentById(id);
      const url = window.URL.createObjectURL(blob);

      // Open in new tab for preview
      window.open(url, "_blank");

      // Cleanup later (not immediately, otherwise tab may fail)
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Failed to preview file", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  const handleMarkFinal = async (
    e: React.MouseEvent,
    secondaryId: number
  ) => {
    e.stopPropagation();

    if (!connectionId) {
      console.error("connectionId missing");
      return;
    }

    try {
      const payload = {
        connectionId: connectionId,
        quotationId: secondaryId,
      };

      await markQuotationFinal(payload);
      await loadFinalQuotation();

      toast.success("Quotation marked as final", {
        autoClose: 1000,
        hideProgressBar: true
      });
    } catch (error) {
      console.error("Failed to mark final quotation", error);
      toast.error("Failed to mark quotation as final");
    }
  };

  const loadFinalQuotation = async () => {
    try {
      const response = await fetchFinalQuotationByConnectionId(connectionId);
      setFinalQuotationId(response?.quotationId ?? null);
    } catch (err) {
      console.error("Error fetching final quotation", err);
    }
  };

  useEffect(() => {
    if (connectionId) {
      loadFinalQuotation();
    }
  }, [connectionId]);



  const SpecCard = ({ spec }) => {

    const isEditable = spec.isRunningCopy;
    const document = documentsMap[spec.id];
    const isLoadingDoc = loadingDocs[spec.id];
    const secondaryIdForSpec = secondaryIdMap[spec.id];
    const isFinalQuotation =
      secondaryIdForSpec === finalQuotationId;
    const canMarkFinal =
      userInfo?.role === "ROLE_ORG_ADMIN" || userInfo?.role === "ROLE_AGENCY_ADMIN" ||
      userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN");


    return (
      <div
        onClick={() => {
          handleSelectSpec(spec);
          setActiveLoadedSpecId(spec.id);

          if (spec.isRunningCopy) {
            setSelectedSpecId(spec.id);
          }

          setIsFormOpen(true);
        }}
        className={`relative cursor-pointer border rounded-lg p-3 shadow transition
        ${isEditable
            ? "bg-gradient-to-br from-green-50 to-white border-green-400 hover:shadow-lg"
            : "bg-gray-100 border-gray-300 opacity-90 hover:shadow-md"}
        ${activeLoadedSpecId === spec.id ? "ring-2 ring-blue-400" : ""}
      `}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex-1 truncate pr-2">
            {spec.panelBrandShortName}
            <span className="text-sm font-medium text-gray-600">
              {" "}({spec.panelRatedWattageW}W)
            </span>
            <span className="text-gray-700"> - {spec.systemCapacityKw} kW</span>
          </h3>

          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-full flex items-center justify-center ${isEditable ? "bg-green-300" : "bg-gray-300"
                }`}
            >
              {isEditable ? (
                <PencilIcon className="w-4 h-4 text-green-700" />
              ) : (
                <LockIcon className="w-4 h-4 text-gray-500" />
              )}
            </span>

            {!isEditable &&
              (userInfo?.role === "ROLE_ORG_ADMIN" ||
                userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSpec(spec.id, document?.id);
                  }}
                  className="p-1 rounded-full text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors"
                  aria-label="Delete"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

          </div>
        </div>

        <div className="space-y-0.5">
          {spec.inverters?.length > 0 ? (
            spec.inverters.map((inv, index) => (
              <p key={index} className="text-sm text-gray-700">
                ⚡ Inverter {index + 1}:{" "}
                <span className="font-medium">
                  {inv.inverterBrandName}
                </span>{" "}
                - {inv.inverterCapacity} kW × {inv.inverterCount}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              No inverter details
            </p>
          )}

          {spec.inverters?.some(inv => inv.gridTypeName === "Hybrid") && (
            <p className="text-sm text-gray-700">
              🔋 Battery:{" "}
              <span className="font-medium">
                {spec.batteryBrandName}
              </span>{" "}
              - {spec.batteryCapacityKw} kW
            </p>
          )}
        </div>

        <div className="mt-0.5">
          <span className="text-sm font-semibold text-blue-800">
            Total Cost: ₹{((spec.systemCost || 0) + (spec.fabricationCost || 0)).toLocaleString("en-IN")}
          </span>
        </div>

        {!isEditable && (
          <div className="mt-2 bg-white border rounded-md p-2 shadow-sm">
            {isLoadingDoc ? (
              <p className="text-sm text-gray-500">Loading document...</p>
            ) : document ? (
              <div className="flex justify-between items-center">
                <div className="max-w-[70%]">
                  <p
                    className="text-sm font-medium truncate text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
                    title="Click to preview"
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 prevent card click
                      handleView(document.id);
                    }}
                  >
                    {document.fileName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Generated by: {document.uploadedBy}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      if (canMarkFinal && !isFinalQuotation && secondaryIdForSpec) {
                        handleMarkFinal(e, secondaryIdForSpec);
                      }
                    }}
                    disabled={isFinalQuotation}
                    className="p-2"
                    title={
                      isFinalQuotation
                        ? "Quotation marked as final"
                        : "Mark this quotation as final"
                    }
                  >
                    <CheckCircle
                      className={`w-5 h-5 ${isFinalQuotation ? "text-green-500" : "text-red-400"
                        }`}
                    />
                  </button>


                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(document.id, document.fileName);
                    }}
                    className="p-2 text-blue-600"
                  >
                    <DownloadIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No document found</p>
            )}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              navigate(-1)
            }
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="text-xl font-bold text-gray-700">
            System Specs Details
          </h1>
        </div>


        <div className="w-full max-w-4xl mx-auto mb-4 mt-2 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
          <div className="relative flex justify-center min-w-[500px] md:min-w-0">


            <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

            <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
              {tabs.map((tab) => {
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

        {isLoadingSavedSpecs && (
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


          </div>

          <div className="border-b border-gray-200 mb-4" />

          {savedSpecs.length > 0 && (() => {

            const editableSpecs = savedSpecs.filter(s => s.isRunningCopy);

            const lockedSpecs = [...savedSpecs]
              .filter(s => !s.isRunningCopy)
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );

            return (
              <>
                {/* ================= MOBILE VIEW ================= */}
                <div className="block md:hidden space-y-4 mb-4">

                  {/* Editable Spec - Full Width */}
                  {editableSpecs.map((spec) => (
                    <SpecCard
                      key={spec.id}
                      spec={spec}
                    />
                  ))}

                  {/* Locked Specs - Horizontal Scroll */}
                  {lockedSpecs.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                      {lockedSpecs.map((spec) => (
                        <div key={spec.id} className="min-w-full snap-center">

                          <SpecCard spec={spec} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ================= DESKTOP VIEW ================= */}
                <div className="hidden md:grid grid-cols-2 gap-2 mb-4">
                  {[...editableSpecs, ...lockedSpecs].map((spec) => (
                    <SpecCard
                      key={spec.id}
                      spec={spec}
                    />
                  ))}
                </div>
              </>
            );
          })()}




          {isFormOpen && (<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

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


            <div>
              <label className="block text-sm font-medium text-gray-700">PV System Capacity (kW)</label>
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

            <div className="md:col-span-2"><div className="border-b border-gray-200" /></div>

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

            <div className="md:col-span-2"><div className="border-b border-gray-200" /></div>

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


            <div className="col-span-full space-y-4 mt-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? (formData.systemCost === 0 ? "" : String(formData.systemCost))
                        : formatIndianNumber(formData.systemCost)
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
                    placeholder="Solar System Cost"
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
                        ? (formData.fabricationCost === 0 ? "" : String(formData.fabricationCost))
                        : formatIndianNumber(formData.fabricationCost)
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
                    placeholder="Fabrication Cost"
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
                    placeholder="Total Cost"
                  />
                </div>
              </div>


              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  type="button"
                  onClick={handleSaveButtonClick}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-5 py-2.5 text-white font-medium rounded-lg 
    bg-blue-600 hover:bg-blue-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? "Saving..." : "Save System Specs"}
                </button>



                {(userInfo?.role === "ROLE_ORG_ADMIN" ||
                  userInfo?.role === "ROLE_AGENCY_ADMIN" ||
                  userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          // Check if maximum limit of 5 quotations is reached
                          if (savedSpecs.length >= 6) {
                            setDialogType("error");
                            setDialogMessage("You have reached the maximum limit of 5 quotations. Please delete an existing quotation to create a new one.");
                            setDialogAction(null);
                            setDialogOpen(true);
                            return;
                          }
                          setSelectedDate(new Date());
                          setShowDatePickModal(true);

                        }}
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
                              Quotation Details
                            </h2>

                            {/* Native HTML Date Picker */}
                            {/* Quotation Number */}
                            <input
                              type="text"
                              placeholder="Enter Quotation Number"
                              value={quotationNumber}
                              onChange={(e) => setQuotationNumber(e.target.value)}
                              className="border px-3 py-2 rounded w-full mb-4"
                            />


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
                                      handleGenerateQuotation(selectedDate, quotationNumber);
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
                    onClick={async () => {
                      setDialogOpen(false);
                      if (dialogAction) {
                        await dialogAction();
                      }
                    }}
                    autoFocus
                  >
                    Yes
                  </Button>

                </>
              ) : (
                <Button
                  onClick={async () => {
                    setDialogOpen(false);
                    if (dialogAction) {
                      await dialogAction();
                    }
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

    </div>
  );
};