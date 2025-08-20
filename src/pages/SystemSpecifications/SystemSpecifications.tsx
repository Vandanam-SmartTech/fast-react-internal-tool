import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCustomerById, getDistrictNameByCode,  getTalukaNameByCode, getVillageNameByCode, fetchInstallationSpaceTypes, fetchInstallationSpaceTypesNames, getConnectionByConsumerId } from '../../services/customerRequisitionService';
import { fetchClaims } from "../../services/jwtService";
import { generateQuotationPDF, previewQuotationPDF, fetchPanelWattages, fetchInverterWattages, fetchRecommendedDetails, getPriceDetails, saveCustomerSpecs, fetchCustomerAgreedDetails} from '../../services/quotationService';
import { uploadDocuments } from "../../services/oneDriveService";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from "react-toastify";
import {
  UserCircleIcon,
  BoltIcon,
  HomeModernIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";



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
  const [connection, setConnection] = useState<any>(null);
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");
  const [govIdName, setGovIdName] = useState("");
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [priceAlreadySetFromCustomerData, setPriceAlreadySetFromCustomerData] = useState(false);

  const [connectionDetails, setConnectionDetails] = useState<any>(null);


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
    solarSystemCost: 0,
    fabricationCost: 0,
    totalCost: 0,
    installationSpaceType: "",
    installationStructureType: "Static",
    dcrNonDcrType:"",
    panelBrand:"",
    Kw:"",
    numberOfGpPipes: 0,
    waterSprinklerSystem: false,       
    heavyDutyRamp: false,        
    heavyDutyStairs: false,
    inversionType:"On-Grid",   
    inverterBrand:"",
    inverterKw:"",  
  });


  const connectionId = location.state?.connectionId; 
  const consumerId = location.state?.consumerId;
  const customerId = location.state?.customerId;

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

// useEffect(() => {
//   const loadConnectionDetails = async () => {
//     if (!connectionId) return;
//     try {
//       const data = await getConnectionByConsumerId(connectionId);
//       setConnectionDetails(data);
//     } catch (error) {
//       console.error("Error fetching connection details:", error);
//     }
//   };

//   loadConnectionDetails();
// }, [connectionId]);
  
useEffect(() => {
  const loadInstallationSpaceDetails = async () => {
    if (!consumerId || Object.keys(installationTypeMap).length === 0) return;

    const installationSpaces = await fetchInstallationSpaceTypes(Number(consumerId));

    const enrichedSpaces = installationSpaces.map((space: any) => ({
      ...space,
      installationSpaceType: installationTypeMap[space.installationSpaceTypeId] || "Unknown",
    }));


    setAvailableSpaceTypes(enrichedSpaces);
  };

  loadInstallationSpaceDetails();
}, [consumerId, installationTypeMap]);
  



useEffect(() => {
  const fetchConnection = async () => {
    if (!consumerId) {
      console.error("Consumer ID not found!");
      return;
    }

    const data = await getConnectionByConsumerId(Number(consumerId));
    setConnectionDetails(data);
  };

  fetchConnection();
}, [consumerId]);

useEffect(() => {
    const fetchLocationNames = async () => {
      if (connection) {
        if (connection.districtCode) {
          const name = await getDistrictNameByCode(connection.districtCode);
          setDistrictName(name);
        }
        if (connection.talukaCode) {
          const name = await getTalukaNameByCode(connection.talukaCode);
          setTalukaName(name);
        }
        if (connection.villageCode) {
          const name = await getVillageNameByCode(connection.villageCode);
          setVillageName(name);
        }
      }
    };

    fetchLocationNames();

  }, [connection]);

    useEffect(() => {
      const fetchCustomer = async () => {
        if (customerId) {
          const data = await getCustomerById(Number(customerId));
          setGovIdName(data?.govIdName || "");
        }
      };
      fetchCustomer();

    }, [customerId]);



useEffect(() => {
  const getClaims = async () => {
    try {
      const claims = await fetchClaims();
      const allRoles: string[] = [];

      
      if (Array.isArray(claims.global_roles)) {
        allRoles.push(...claims.global_roles);
      }


      const selectedOrgStr = localStorage.getItem('selectedOrg');
      if (selectedOrgStr) {
        try {
          const selectedOrg = JSON.parse(selectedOrgStr);
          if (selectedOrg.role) {
            allRoles.push(selectedOrg.role);
          }
        } catch {
          console.error("Invalid selectedOrg format in localStorage");
        }
      }

      setRoles(allRoles);
    } catch (error) {
      console.error("Failed to fetch user claims", error);
    }
  };

  getClaims();
}, []);

let hasShownError = false;

useEffect(() => {
 
    if (!connectionId || !connectionDetails) return;

     const fetchData = async () => {

    setIsFetchingRecommendations(true);

    try {
      // Step 1: Try to fetch customer-agreed data
      const customerData = await fetchCustomerAgreedDetails(connectionId);

      const phaseType = connectionDetails?.phaseTypeName || "";


      if (customerData.success === false || customerData.message?.includes("Data not found")) {
        // Fallback to recommendation API if not found
        const recommendation = await fetchRecommendedDetails(connectionId);
        console.log("Recommended Data:", recommendation);

        const recommendedKW = recommendation.recommendedKW || "";

        const inverterWattages = await fetchInverterWattages(
            phaseType,
            recommendation.inverterBrand
        );
        const selectedInverterKw = inverterWattages[0] || "";


        setFormData((prev) => ({
          ...prev,
          installationSpaceType: recommendation.recommendedInstallationSpaceType || "",
          installationStructureType: recommendation.recommendedInstallationStructureType || "",
          Kw: recommendedKW,
          numberOfGpPipes: recommendation.numberOfGpPipes || 0,
          dcrNonDcrType:
            recommendation.dcrNonDcrType?.toLowerCase() === "non-dcr" ? "Non-DCR" : "DCR",
          panelBrand: recommendation.panelBrand || "",
          inverterBrand: recommendation.inverterBrand || "",
          inverterKw: selectedInverterKw,
        }));

        setConnectionType(recommendation.connectionType || "");
        setPhaseType(phaseType);

        if (phaseType && recommendation.dcrNonDcrType && recommendation.panelBrand) {
          const wattages = await fetchPanelWattages(
            connectionId,
            phaseType,
            recommendation.dcrNonDcrType,
            recommendation.panelBrand
          );
          const uniqueWattages = wattages.filter((w) => w !== recommendedKW);
          setPanelWattages([recommendedKW, ...uniqueWattages]);
        }

        if (recommendation.inverterBrand && phaseType) {
          const inverterWattages = await fetchInverterWattages(
            phaseType,
            recommendation.inverterBrand
          );
          setInverterWattages(inverterWattages);
        }
      } else {
        // Use customer-agreed data
        console.log("Customer Agreed Data:", customerData);

        setIsCustomSpecs(true);
        setIsSpecsSaved(true);
        setPriceAlreadySetFromCustomerData(true);

        const customerSelectedKW = customerData.customerSelectedKW || "";
        const inverterCapacity = customerData.inverterCapacity || "";

        setFormData((prev) => ({
          ...prev,
          installationSpaceType: customerData.customerSelectedInstallationSpaceType || "",
          installationStructureType: customerData.customerSelectedInstallationStructureType || "",
          Kw: customerSelectedKW,
          panelBrand: customerData.customerSelectedBrand || "",
          dcrNonDcrType: customerData.dcrNonDcrType || "",
          inverterBrand: customerData.inverterBrand || "",
          inverterKw: inverterCapacity,
          solarSystemCost: customerData.solarSystemCost || 0,
          fabricationCost: customerData.fabricationCost || 0,
          totalCost: customerData.totalCost || 0,
          waterSprinklerSystem: customerData.waterSprinklerSystem || false,
          heavyDutyRamp: customerData.heavyDutyRamp || false,
          heavyDutyStairs: customerData.heavyDutyStairs || false,
          inversionType: customerData.inversionType || "On Grid",
        }));

        setPhaseType(phaseType);

        if (phaseType && customerData.dcrNonDcrType && customerData.customerSelectedBrand) {
          const wattages = await fetchPanelWattages(
            connectionId,
            phaseType,
            customerData.dcrNonDcrType,
            customerData.customerSelectedBrand
          );
          const uniqueWattages = wattages.filter((w) => w !== customerSelectedKW);
          setPanelWattages([customerSelectedKW, ...uniqueWattages]);
        }

        if (customerData.inverterBrand && phaseType) {
          const inverterWattages = await fetchInverterWattages(
            phaseType,
            customerData.inverterBrand
          );
          const uniqueInverterWattages = inverterWattages.filter((iw) => iw !== inverterCapacity);
          setInverterWattages([inverterCapacity, ...uniqueInverterWattages]);
        }
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      if (!hasShownError) {
        hasShownError = true;
        toast.error("Failed to fetch details. Please try again later.", {
          autoClose: 1000,
          hideProgressBar: true,
        });
      }
    } finally {
      setIsFetchingRecommendations(false);
    }
  };

  fetchData();
}, [connectionId, connectionDetails]);



  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type, checked } = e.target;

  let updatedFormData: any;



  setFormData((prev) => {
    const updatedData = {
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    };

    const matchedSpace = availableSpaceTypes.find(
    (space) => space.installationSpaceType === value
  );

  

  if (matchedSpace) {
    setSelectedSpace(matchedSpace);
    setShowModal(true);
  }

    // Auto-update totalCost
    updatedData.totalCost =
      (Number(updatedData.solarSystemCost) || 0) +
      (Number(updatedData.fabricationCost) || 0);

    // Update numberOfGpPipes based on installation space
    if (name === "installationSpaceType") {
      const selectedSpace = availableSpaceTypes.find(
        (space: any) => space.installationSpaceType === value
      );
      if (selectedSpace) {
        updatedData.numberOfGpPipes = selectedSpace.numberOfGpPipes || 0;
      }
    }

if (name === "panelBrand") {

    if (value === "En-Icon") {
    updatedData.dcrNonDcrType = "Non-DCR";
   }
}

if (name === "dcrNonDcrType") {

  if (value === "Non-DCR") {
    updatedData.panelBrand = "En-Icon";
  }
}

if (name === "dcrNonDcrType") {

  if (value === "DCR") {
    updatedData.panelBrand = "Sova";
  }
}

if (name === "inversionType") {
      updatedData.inverterBrand = value === "Hybrid" ? "VSole" : "KSolare"; 
    }

    updatedFormData = updatedData; 
    return updatedData;
  });

  setIsCustomSpecs(true);
  setIsSpecsSaved(false);
  setPriceAlreadySetFromCustomerData(false);

  if (["panelBrand", "dcrNonDcrType", "inverterBrand","inversionType"].includes(name)) {
    const dcrNonDcrValue =
      name === "dcrNonDcrType"
        ? value
        : name === "panelBrand"
        ? value === "En-Icon"
          ? "Non-DCR"
          : "DCR"
        : formData.dcrNonDcrType;

    const panelBrandValue =
      name === "panelBrand"
        ? value
        : name === "dcrNonDcrType"
        ? value === "Non-DCR"
          ? "En-Icon"
          : "Sova"
        : formData.panelBrand;
      
    const inverterBrandValue =
      name === "inverterBrand"
        ? value
        : name === "inversionType"
        ? value === "Hybrid"
          ? "VSole"
          : "KSolare" 
        : formData.inverterBrand;




    try {
      console.log("Fetching panel wattages with:");
      console.log("Connection ID:", connectionId);
      console.log("Phase Type:", phaseType);
      console.log("DCR/Non-DCR Type:", dcrNonDcrValue);
      console.log("Panel Brand:", panelBrandValue);

      const wattages = await fetchPanelWattages(
        connectionId,
        phaseType,
        dcrNonDcrValue,
        panelBrandValue
      );

      console.log("Fetched Wattages:", wattages);
      setPanelWattages(wattages);

     const inverterWattages = await fetchInverterWattages(
      phaseType,
      inverterBrandValue
    );
    console.log("Fetched Inverter Wattages:", inverterWattages);
    setInverterWattages(inverterWattages);
    


      setFormData((prev) => ({
        ...prev,
        Kw: wattages.includes(prev.Kw) ? prev.Kw : wattages[0] || "",
        inverterKw: inverterWattages.includes(prev.inverterKw)
          ? prev.inverterKw
          : inverterWattages[0] || "",
      }));
    } catch (error) {
      console.error("Error fetching panel wattages:", error);
    }
  }
};



  useEffect(() => {
    const handleGetPrice = async () => {
      try {
        const phaseType = connectionDetails?.phaseTypeName || "";

        const requestData = {
          customerSelectedInstallationSpaceType: formData.installationSpaceType || null,
          customerSelectedInstallationStructureType: formData.installationStructureType,
          customerSelectedKW: formData.Kw,
          customerSelectedBrand: formData.panelBrand,
          phaseType,
          dcrNonDcrType: formData.dcrNonDcrType,
          connectionType,
          numberOfGpPipes: formData.numberOfGpPipes || 0,
          waterSprinklerSystem:formData.waterSprinklerSystem,
          heavyDutyRamp:formData.heavyDutyRamp,
          heavyDutyStairs:formData.heavyDutyStairs,
        };
  
        console.log("Request Data:", requestData);
  
        const priceDetails = await getPriceDetails(requestData);
  
        if (priceDetails) {
          setFormData((prev) => ({
            ...prev,
            solarSystemCost: priceDetails.solarSystemCost || 0,
            fabricationCost: priceDetails.fabricationCost || 0,
            totalCost:
              (priceDetails.solarSystemCost || 0) + (priceDetails.fabricationCost || 0),
          }));
  
          setShowCostDetails(true);
        }
      } catch (error) {
        console.error("Error fetching price details:", error);
      }
    };
  
    if (
      !priceAlreadySetFromCustomerData &&
      formData.installationStructureType &&
      formData.Kw &&
      formData.panelBrand &&
      formData.dcrNonDcrType &&
      phaseType 
    ) {
      handleGetPrice();
    }
  }, [
    formData.installationSpaceType,
    formData.installationStructureType,
    formData.Kw,
    formData.panelBrand,
    formData.dcrNonDcrType,
    phaseType,
    formData.waterSprinklerSystem,        
    formData.heavyDutyRamp,         
    formData.heavyDutyStairs  
  ]);

  const handleSaveSpecs = async () => {
    const phaseType = connectionDetails?.phaseTypeName || "";
    const requestData = {
        customerSelectedInstallationStructureType: formData.installationStructureType,
        customerSelectedKW: formData.Kw,
        customerSelectedBrand: formData.panelBrand,
        customerSelectedInstallationSpaceType: formData.installationSpaceType,
        dcrNonDcrType: formData.dcrNonDcrType,
        phaseType: phaseType,
        connectionType: connectionType,
        inversionType: formData.inversionType,
        solarSystemCost: formData.solarSystemCost,
        fabricationCost: formData.fabricationCost,
        totalCost: formData.totalCost,
        waterSprinklerSystem: formData.waterSprinklerSystem,
        heavyDutyRamp: formData.heavyDutyRamp,
        heavyDutyStairs: formData.heavyDutyStairs,
        inverterCapacity: formData.inverterKw,
        inverterBrand: formData.inverterBrand,
    };

    try {
        await saveCustomerSpecs(connectionId, requestData);
        //alert("System specifications saved successfully!");
      toast.success("System specifications saved successfully.",{
        autoClose:1000,
        hideProgressBar: true,
      });
        //////
        setIsSpecsSaved(true);
        ///////
    } catch (error) {

        toast.error("Erroe while saving specifications.",{
          autoClose:1000,
          hideProgressBar: true,
        });
    }
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

    const fileName = `Quotation_${govIdName}`;
    const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: "application/pdf" });


    try {
      await uploadDocuments(connectionId, fileName, [pdfFile]);
      console.log("PDF uploaded to OneDrive successfully");
    } catch (uploadError) {
      console.error("Error uploading to OneDrive:", uploadError);
    }

    // Always download the file regardless of upload success
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
    

<div className="flex flex-col md:flex-row items-center justify-between md:space-x-4 col-span-1 md:col-span-2 mb-2">
  {/* Backward Arrow Button (Before Title on Mobile) */}
  <div className="flex items-center w-full md:w-auto">
    <button
      onClick={() =>
        navigate(`/view-connection/${connectionId}`, {
          state: { consumerId, customerId, connectionId,selectedRepresentative:selectedRepresentative },
        })
      }
      className="p-2 rounded-full hover:bg-gray-200 transition"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>

    {/* Heading - Adjusts Position on Small Screens */}
    <h2 className="text-xl md:text-2xl font-semibold text-gray-700 ml-2 md:ml-0">
    {isCustomSpecs ? "Customized System Specifications" : "Recommended System Specifications"}
    </h2>
  </div>

  {/* Selected Representative - Adjusts for Desktop & Mobile */}
  {roles.includes("ROLE_ADMIN") && selectedRepresentative && (
          <div className="sm:ml-auto text-sm text-gray-600">
            <span className="font-medium text-gray-800">Selected Representative:</span> {selectedRepresentative.name}
          </div>
        )}
</div>

<div className="w-full max-w-4xl mx-auto mb-10 mt-6 overflow-x-auto">
  <div className="relative flex justify-center min-w-[500px] md:min-w-0">
    
    {/* Connector Line: between the first and last icon only */}
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

            const shouldHighlightIcon = tab === "Customer Details" || tab === "Connection Details" || tab=== "Installation Details";


        return (
          <button
      key={tab}
      onClick={() => {
        setActiveTab(tab);
        if (tab === "Customer Details") {
          navigate(`/view-customer/${customerId}`, {
            state: {
              customerId,
              selectedRepresentative: selectedRepresentative || "",
            },
          });
        } else if (tab === "Connection Details") {
          navigate(`/view-connection/${connectionId}`, {
            state: { consumerId, customerId, connectionId, selectedRepresentative: selectedRepresentative },
          });
        }
      }}
      className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
    >
      <div
        className={`rounded-full p-2 transition-all duration-300 ${
          shouldHighlightIcon
            ? "bg-blue-500 text-white"
            : "bg-white border border-gray-300 text-gray-500"
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={`text-xs md:text-sm font-semibold mt-1 ${
          isActive ? "text-gray-700" : "text-gray-700"
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





      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
  <label className="block text-sm font-medium text-gray-700">Installation Space</label>
  <select
    id="installationSpaceType"
    name="installationSpaceType"
    value={formData.installationSpaceType || "Installations Not Available"}
    onChange={handleChange}
    className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
  >
    {availableSpaceTypes.length === 0 ? (
      <option disabled>Installations Not Available</option>
    ) : (
      availableSpaceTypes.map((space) => (
        <option key={space.id} value={space.installationSpaceType}>
          On {space.installationSpaceType} ({space.installationSpaceTitle})
        </option>
      ))
    )}
  </select>

  {/* Display selected space card */}
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
        {/* Square Diagram */}
{(() => {
  const ew = selectedSpace.availableEastWestLengthFt;
  const sn = selectedSpace.availableSouthNorthLengthFt;

  let shapeClass = "w-16 h-16";
  if (ew > sn * 1.3) shapeClass = "w-24 h-16";
  else if (sn > ew * 1.3) shapeClass = "w-16 h-24";

  return (
    <div className="relative w-40 h-36 border border-dashed border-gray-300 flex items-center justify-center">
      

      {/* Top - North Indicator with side arrow */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[11px] text-gray-700 font-bold flex items-center leading-none">
        <span className="mr-1">N</span>
        <span className="text-base">↑</span>
      </div>

      {/* Right - East Indicator with arrow below */}
      <div className="absolute top-1/2 right-1 transform -translate-y-1/2 text-[11px] text-gray-700 font-bold flex flex-col items-center leading-none">
        <span className="mb-[2px]">E</span>
        <span className="text-base">→</span>
      </div>

      {/* Shape Box */}
      <div className={`relative border-2 border-black bg-white ${shapeClass} flex items-center justify-center`}>
  <span className="text-[10px] text-gray-800 font-semibold">
     {ew * sn} ft²
  </span>
</div>


      {/* Bottom - East-West Available Length */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] text-blue-600 font-semibold flex items-center">
        <span className="mr-1">←</span>
        <span>{ew} Ft</span>
        <span className="ml-1">→</span>
      </div>

      {/* Left - South-North Available Length */}
      <div className="absolute top-1/2 left-1 transform -translate-y-1/2 text-[10px] text-green-600 font-semibold flex flex-col items-center space-y-1">
        <span>↑</span>
        <span>{sn} Ft</span>
        <span>↓</span>
      </div>
    </div>
  );
})()}





        {/* Installation Details */}
        <div className="text-s text-gray-600 space-y-2">
          <div><span className="text-lg">🔌</span> <strong>Required AC Wire Length:</strong> {selectedSpace.acWireLengthFt} ft</div>
          <div><span className="text-lg">⚡</span> <strong>Required DC Wire Length:</strong> {selectedSpace.dcWireLengthFt} ft</div>
          <div><span className="text-lg">🧰</span> <strong>Required Earthing Wire Length:</strong> {selectedSpace.earthingWireLengthFt} ft</div>
          <div><span className="text-lg">🛠️</span> <strong>Required GP Pipes:</strong> {selectedSpace.numberOfGpPipes ?? "....."}</div>
          <div><span className="text-lg">📝</span> <strong>Description:</strong> {selectedSpace.descriptionOfInstallation || "....."}</div>
        </div>
      </div>
    </div>
  </div>
)}


</div>




                <div>
          <label className="block text-sm font-medium text-gray-700">Inversion Type</label>
          <select
            id="inversionType"
            name="inversionType"
            value={formData.inversionType}
            onChange={(e) => {
              setInversionType(e.target.value); 
              handleChange(e); 
            }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="On-Grid">On-Grid</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Inverter Brand</label>
          <select
            id="inverterBrand"
            name="inverterBrand"
            value={formData.inverterBrand}
            onChange={(e) => {
              setInverterBrand(e.target.value); 
              handleChange(e); 
            }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Growatt">Growatt</option>
            <option value="KSolare">KSolare</option>
            <option value="VSole">VSole</option>
          </select>
        </div>

                <div>
          <label className="block text-sm font-medium text-gray-700">Inverter kW</label>
          <select
                id="inverterKw"
                name="inverterKw"
                value={formData.inverterKw}
                onChange={(e) => {
                  setInverterKw(e.target.value); 
                  handleChange(e); 
                }}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                {inverterWattages.map((inverterWattages) => (
                    <option key={inverterWattages} value={inverterWattages}>
                    {inverterWattages}
                      </option>
                   ))}
              </select>
        </div>

                <div>
          <label className="block text-sm font-medium text-gray-700">DCR/Non-DCR</label>
          <select
            id="dcrNonDcrType"
            name="dcrNonDcrType"
            value={formData.dcrNonDcrType}
            onChange={(e) => {
              setDcrNonDcrType(e.target.value); 
              handleChange(e); 
            }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DCR">DCR</option>
            <option value="Non-DCR">Non-DCR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Panel Brand</label>
          <select
            id="panelBrand"
            name="panelBrand"
            value={formData.panelBrand}
            onChange={(e) => {
              setPanelBrand(e.target.value); // Update local state
              handleChange(e); // Also update formData
            }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Sova">Sova</option>
            <option value="En-Icon">En-Icon</option>
            <option value="Adani">Adani</option>
            <option value="Renew">Renew</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700">System Capacity (kW)</label>
          <select
                id="Kw"
                name="Kw"
                value={formData.Kw}
                onChange={(e) => {
                  setKw(e.target.value); // Update local state
                  handleChange(e); // Also update formData
                }}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                {panelWattages.map((wattages) => (
                    <option key={wattages} value={wattages}>
                    {wattages}
                      </option>
                   ))}
              </select>
        </div>

        {/* <div>
                <label className="block text-sm font-medium text-gray-700">Wattage-wp</label>
                <input type="number" name="wattage" value={formData.wattage} onChange={handleChange} 
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
         </div> */}

<div className="col-span-full space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-4">
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        name="waterSprinklerSystem"
        checked={formData.waterSprinklerSystem || false}
        onChange={handleChange}
        className="h-5 w-5 text-blue-600"
      />
      <span className="text-base text-gray-800">Water Sprinkler System</span>
    </label>

    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        name="heavyDutyRamp"
        checked={formData.heavyDutyRamp || false}
        onChange={handleChange}
        className="h-5 w-5 text-blue-600"
      />
      <span className="text-base text-gray-800">Heavy Duty Ramp</span>
    </label>

    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        name="heavyDutyStairs"
        checked={formData.heavyDutyStairs || false}
        onChange={handleChange}
        className="h-5 w-5 text-blue-600"
      />
      <span className="text-base text-gray-800">Heavy Duty Stairs</span>
    </label>
  </div>
</div>


          <div className="col-span-full space-y-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-700">Cost Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Solar System Cost</label>
                <input type="number" 
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    name="solarSystemCost" 
                    value={formData.solarSystemCost} 
                    onChange={handleChange} 
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fabrication Cost</label>
                <input type="number" 
                min="0"
                onWheel={(e) => e.currentTarget.blur()}
                name="fabricationCost" value={formData.fabricationCost} onChange={handleChange} 
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                <input type="number" name="effectiveCost" value={formData.totalCost} onChange={handleChange} 
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>

            </div>

            <div className="flex flex-wrap gap-4 justify-center sm:justify-start sm:ml-4 md:ml-24">
            <button
            type="button"
            onClick={handleSaveSpecs}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Save System Specs
        </button>

    <button
        type="button"
        onClick={handlePreview}
        disabled={!isSpecsSaved || isPreviewLoading}
        className="hidden md:block w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        //disabled={isPreviewLoading}
    >
        {isPreviewLoading ? "Previewing..." : "Preview Quotation"}
    </button>

    {/* Generate & Save Quotation Button - Only visible for Super Admin and Org Admin */}
    {(roles.includes("ROLE_SUPER_ADMIN") || roles.includes("ROLE_ORG_ADMIN") || roles.includes("ROLE_AGENCY_ADMIN")) && (
      <button
          type="submit"
          onClick={handleGenerateQuotation}
          disabled={!isSpecsSaved || isLoading}
          //disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>
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
    <Button onClick={() => setDialogOpen(false)} autoFocus>
      OK
    </Button>
  </DialogActions>
</Dialog>

    </div>
  );
};