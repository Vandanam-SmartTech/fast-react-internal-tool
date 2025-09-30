import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchInstallationSpaceTypes, fetchInstallationSpaceTypesNames, getConnectionByConnectionId } from '../../services/customerRequisitionService';
import {
  generateQuotationPDF, previewQuotationPDF, saveSystemSpecs, saveInverterSpecs, getMaterialOrigins, getGridTypes, fetchInverterBrands,
  fetchInverterBrandCapacities, fetchPanelBrands, fetchPanelBrandCapacities, fetchBatteryBrands, fetchBatteryBrandCapacities, getSavedSystemSpecs, updateSystemSpecs, updateInverterSpecs
} from '../../services/quotationService';

import { ArrowLeft } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import { UserCircleIcon, BoltIcon, HomeModernIcon, Cog6ToothIcon, CurrencyRupeeIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useUser } from "../../contexts/UserContext";



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



  const { userClaims } = useUser();
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");

  const [activeTab, setActiveTab] = useState("System Specifications");

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];

  const [availableSpaceTypes, setAvailableSpaceTypes] = useState<any[]>([]);
  const [installationTypeMap, setInstallationTypeMap] = useState<Record<number, string>>({});


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

  const fetchSavedSpecs = async () => {
    try {
      const data = await getSavedSystemSpecs(connectionId);
      setSavedSpecs(data);
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

      if (inverterBrandId !== null && systemCapacityKw !== null) {
        try {
          const data = await fetchInverterBrandCapacities(inverterBrandId, systemCapacityKw);
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
  }, [inverterBrandId, systemCapacityKw]);


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

      if (phaseTypeId !== null && panelSpecId !== null && avgMonthlyConsumption !== null) {
        try {
          const data = await fetchPanelBrandCapacities(phaseTypeId, panelSpecId, avgMonthlyConsumption);
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
  }, [phaseTypeId, panelSpecId, avgMonthlyConsumption]);


  useEffect(() => {
    const loadBatteryBrands = async () => {
      const data = await fetchBatteryBrands();
      if (data) setBatteryBrands(data);
    };

    loadBatteryBrands();
  }, []);

  useEffect(() => {
    const loadBatteryBrandCapacities = async () => {
      if (!isPrefilling) {
        setBatteryCapacities([]);
        setBatterySpecId(null);
        setFormData((prev) => ({
          ...prev,
          batterySpecId: null
        }));
      }

      if (batteryBrandId !== null) {
        try {
          const data = await fetchBatteryBrandCapacities(batteryBrandId);
          setBatteryCapacities([...data]);
        } catch (error) {
          console.error("Failed to fetch battery brand capacities:", error);
          setBatteryCapacities([]);
        } finally {
          setIsPrefilling(false);
        }
      }
    };

    loadBatteryBrandCapacities();
  }, [batteryBrandId]);


  const handleSaveSpecs = async () => {
    try {
      const systemResponse = await saveSystemSpecs({
        ...formData,
        connectionId,
        specSourceId: 2,
        panelSpecsId: formData.panelSpecId,
        batterySpecsId: formData.batterySpecId

      });

      console.log("System specs saved:", systemResponse);

      const systemSpecsId = systemResponse.id;


      const inverterResponse = await saveInverterSpecs({
        systemSpecsId,
        inverterSpecId,
        inverterCount: 1,
      });

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
    }
  };

  const handleUpdateSpecs = async () => {
    try {
      if (!selectedSpecId || !selectedSystemSpecsInverterId) {
        console.error("No system specification selected for update!");
        toast.error("Please select a system specification to update.", {
          autoClose: 1000,
          hideProgressBar: true,
        });
        return;
      }

      const systemResponse = await updateSystemSpecs(selectedSpecId, {
        ...formData,
        connectionId,
        specSourceId: 2,
        panelSpecsId: formData.panelSpecId,
        batterySpecsId: formData.batterySpecId,
      });

      console.log("System specs updated:", systemResponse);
      const systemSpecsId = systemResponse.id;

      const inverterResponse = await updateInverterSpecs(selectedSystemSpecsInverterId, {
        systemSpecsId: selectedSpecId,
        inverterSpecId,
        inverterCount: 1,
      });

      console.log("Inverter specs updated:", inverterResponse);

      toast.success("System Specification details updated successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Error updating specs:", error);
      toast.error("Failed to update system specs or inverter specs.", {
        autoClose: 1000,
        hideProgressBar: true,
      });
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


  const handleSelectSpec = (spec) => {
    setIsPrefilling(true);

    setSelectedSpecId(spec.id);
    setSelectedSystemSpecsInverterId(spec.systemSpecsInverterId);

    setFormData({
      ...formData,
      installationSpaceType: spec.installationSpaceType,
      installationStructureType: spec.installationStructureType,
      systemCost: spec.systemCost || 0,
      fabricationCost: spec.fabricationCost || 0,
      totalCost: (spec.systemCost || 0) + (spec.fabricationCost || 0),
      hasWaterSprinkler: spec.hasWaterSprinkler,
      hasHeavydutyRamp: spec.hasHeavydutyRamp,
      hasHeavydutyStairs: spec.hasHeavydutyStairs,
      panelSpecId: spec.panelSpecsId,
      materialOriginId: spec.materialOriginId,
      gridTypeId: spec.gridTypeId,
      inverterSpecId: spec.inverterSpecId,
      batteryBrandId: spec.batteryBrandId,
      batterySpecId: spec.batterySpecsId,
      systemCapacityKw: spec.systemCapacityKw,
      inverterBrandId: spec.inverterBrandId
    });

    setMaterialOriginId(spec.materialOriginId);
    setGridTypeId(spec.gridTypeId);
    setPanelSpecId(spec.panelSpecsId);
    setInverterSpecId(spec.inverterSpecId);
    setBatteryBrandId(spec.batteryBrandId);
    setBatterySpecId(spec.batterySpecsId);
    setInverterBrandId(spec.inverterBrandId);
    setSystemCapacityKw(spec.systemCapacityKw);
  };





  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalCost: (Number(prev.systemCost) || 0) + (Number(prev.fabricationCost) || 0),
    }));
  }, [formData.systemCost, formData.fabricationCost]);


  useEffect(() => {
    if (savedSpecs.length === 1) {
      handleSelectSpec(savedSpecs[0]);
    }
  }, [savedSpecs]);




  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;

    let updatedFormData: any;



    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };


      updatedData.totalCost =
        (Number(updatedData.systemCost) || 0) +
        (Number(updatedData.fabricationCost) || 0);



      updatedFormData = updatedData;
      return updatedData;
    });

    setIsCustomSpecs(true);
    setIsSpecsSaved(false);
    setPriceAlreadySetFromCustomerData(false);
  };





  const handleGenerateQuotation = async () => {
    if (!connectionId) {
      console.error("Connection ID is missing");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Fetching Quotation PDF for Connection ID:", connectionId);

      const pdfBlob = await generateQuotationPDF(connectionId);
      console.log('PDF Blob size:', pdfBlob.size);

      // const fileName = `Quotation_${govIdName}`;
      // const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: "application/pdf" });


      // try {
      //   await uploadDocuments(connectionId, fileName, [pdfFile]);
      //   console.log("PDF uploaded to OneDrive successfully");
      // } catch (uploadError) {
      //   console.error("Error uploading to OneDrive:", uploadError);
      // }


      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `quotation_${connectionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);

      console.log("Quotation PDF downloaded successfully");

    } catch (error) {
      console.error("Error generating quotation PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      if (!connectionId) {
        console.error("Connection ID is missing");
        return;
      }

      console.log("Fetching PDF for Connection ID:", connectionId);

      const pdfBlob = await previewQuotationPDF(connectionId);
      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");
    } catch (err) {
      console.error("Failed to preview the quotation:", err);
    } finally {
      setIsPreviewLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="max-w-4xl mx-auto pt-1 sm:pt-1 pr-4 pl-6 pb-4 sm:pb-6">


      <div className="flex flex-col md:flex-row items-center justify-between md:space-x-4 col-span-1 md:col-span-2">

        <div className="flex items-center w-full md:w-auto">
          <button
            onClick={() =>
              navigate(`/view-connection`, {
                state: { consumerId, customerId, connectionId },
              })
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
      </div>

      <div className="w-full max-w-4xl mx-auto mb-6 mt-4 overflow-x-auto">
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
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-500"
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
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">System Specifications</h3>
          </div>

          {/* Right side: Button */}
          {savedSpecs.length > 0 && (<button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            Add Another System Specs
          </button>)}

        </div>

        <div className="border-b border-gray-200 mb-4" />

        {savedSpecs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {savedSpecs.map((spec) => (
              <div
                key={spec.id}
                onClick={() => handleSelectSpec(spec)}
                className={`cursor-pointer border rounded-lg p-4 shadow hover:shadow-md transition 
          ${selectedSpecId === spec.id ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-200"}`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {spec.panelBrandShortName} ({spec.panelRatedWattageW} W) – {spec.systemCapacityKw} kW
                </h3>


                <p className="text-sm font-medium text-gray-700 mb-1">
                  {spec.inverterBrandName} – {spec.inverterCapacity} kW
                </p>


                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>System Cost: ₹{spec.systemCost.toLocaleString("en-IN")}</span>
                  <span>Fabrication: ₹{spec.fabricationCost?.toLocaleString("en-IN") || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}



        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <button
                    className="absolute top-2 right-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowModal(false)}
                  >
                    ✖
                  </button>

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
          <div className="hidden md:block md:col-span-1"></div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grid Type
            </label>

            <select
              id="gridTypeId"
              name="gridTypeId"
              value={formData.gridTypeId}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setGridTypeId(selectedId);
                handleChange({
                  target: { name: "gridTypeId", value: selectedId },
                });
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material Origin Type
            </label>

            <select
              id="materialOriginId"
              name="materialOriginId"
              value={formData.materialOriginId}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setMaterialOriginId(selectedId);
                handleChange({
                  target: { name: "materialOriginId", value: selectedId },
                });
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

          <div>
            <label className="block text-sm font-medium text-gray-700">PV Panel Brand - Wattage - Model Number</label>
            <select
              id="panelSpecId"
              name="panelSpecId"
              value={formData.panelSpecId}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setPanelSpecId(selectedId);
                handleChange({
                  target: { name: "panelSpecId", value: selectedId },
                });
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


          <div>
            <label className="block text-sm font-medium text-gray-700">PV System Capacity (kW)</label>
            <select
              id="systemCapacityKw"
              name="systemCapacityKw"
              value={formData.systemCapacityKw}
              onChange={(e) => {
                setSystemCapacityKw(e.target.value);
                handleChange(e);
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
              value={formData.inverterBrandId}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setInverterBrandId(selectedId);
                handleChange({
                  target: { name: "inverterBrandId", value: selectedId },
                });
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
            <label className="block text-sm font-medium text-gray-700">Inverter Capacity & Warranty</label>
            <select
              id="inverterSpecId"
              name="inverterSpecId"
              value={formData.inverterSpecId}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setInverterSpecId(selectedId);
                handleChange({
                  target: { name: "inverterSpecId", value: selectedId },
                });
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
                  value={formData.batteryBrandId}
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
                <label className="block text-sm font-medium text-gray-700">Battery Capacity (kW)</label>
                <select
                  id="batterySpecId"
                  name="batterySpecId"
                  value={formData.batterySpecId}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    setBatterySpecId(selectedId);
                    handleChange({
                      target: { name: "batterySpecId", value: selectedId },
                    });
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


            <div className="flex flex-wrap gap-4 justify-center">
              {selectedSpecId ? (
                <button
                  type="button"
                  onClick={handleUpdateButtonClick}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update System Specs
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveButtonClick}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save System Specs
                </button>
              )}

              <button
                type="button"
                onClick={handlePreview}
                disabled={!selectedSpecId || isPreviewLoading}
                className="hidden md:block w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPreviewLoading ? "Previewing..." : "Preview Quotation"}
              </button>

              {(userInfo?.role === "ROLE_ORG_ADMIN" ||
                userInfo?.role === "ROLE_AGENCY_ADMIN" ||
                userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN")) && (
                  <button
                    type="submit"
                    onClick={handleGenerateQuotation}
                    disabled={!selectedSpecId || isLoading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Generating..." : "Generate & Save Quotation"}
                  </button>
                )}
            </div>
          </div>

        </form>

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