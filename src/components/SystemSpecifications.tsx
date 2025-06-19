import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCustomerById, uploadFileToOneDrive, fetchPanelWattages, fetchRecommendedDetails, getPriceDetails,getDistrictNameByCode, getTalukaNameByCode, getVillageNameByCode, fetchInstallationSpaceTypes, fetchClaims, saveCustomerSpecs, getConnectionByConsumerId } from '../services/api';
import { generateQuotationPDF, previewQuotationPDF } from '../services/api';
import { Stepper, Step } from "react-form-stepper";
import { ArrowLeft } from "lucide-react";
import { Tabs,TabsHeader,TabsBody,Tab,TabPanel } from "@material-tailwind/react";
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
  const [showSystemSpecificationDetails, setShowSystemSpecificationDetails] = useState(false);
  const [installationSpaceType, setInstallationSpaceType] = useState("");
  const [installationStructureType, setInstallationStructureType] = useState("");
  const [Kw, setKw] = useState("");
  const [dcrNonDcrType, setDcrNonDcrType] = useState("");
  const [panelBrand, setPanelBrand] = useState("");
  const [phaseType, setPhaseType] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [panelWattages, setPanelWattages] = useState([]);
  const [isCustomSpecs, setIsCustomSpecs] = useState(false);
  //const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [connection, setConnection] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null)
  const [districtName, setDistrictName] = useState<string>("");
  const [talukaName, setTalukaName] = useState<string>("");
  const [villageName, setVillageName] = useState<string>("");
  const [govIdName, setGovIdName] = useState("");
  const selectedRepresentative = location.state?.selectedRepresentative;
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"error" | "confirm" | "success">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);


  const [activeTab, setActiveTab] = useState("System Specifications");

  const tabs = [
    "Customer Details",
    "Connection Details",
    "Installation Details",
    "System Specifications",
  ];


  const state = "Maharashtra";
  const folderType = "Onboarding Documents";


  const installationSpaceTypeMapping: Record<number, string> = {
    1: "Slab",
    2: "Metal Sheets",
    3: "Plastic Sheets",
    4: "Clay Tiles",
    5: "Bathroom Slab",
    6: "Cement Sheets",
    7: "On Ground",
  };

  const [availableSpaceTypes, setAvailableSpaceTypes] = useState<any[]>([]);


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
    wattage:0,       
  });


  const connectionId = location.state?.connectionId; 
  const consumerId = location.state?.consumerId;
  const customerId = location.state?.customerId;
  
  useEffect(() => {
    const loadInstallationSpaceDetails = async () => {
      if (!consumerId) return;
  
      const installationSpaces = await fetchInstallationSpaceTypes(Number(consumerId));
  
      const enrichedSpaces = installationSpaces.map((space: any) => ({
        ...space,
        installationSpaceType: installationSpaceTypeMapping[space.installationSpaceTypeId] || "Unknown",
        
      }));
  
      console.log("enriched spaces:", enrichedSpaces);
      
      setAvailableSpaceTypes(enrichedSpaces);
    };
  
    loadInstallationSpaceDetails();
  }, [consumerId]);
  



useEffect(() => {
  const fetchConnection = async () => {
    if (!consumerId) {
      console.error("Consumer ID not found!");
      return;
    }

    // Fetch connection details using consumerId
    const data = await getConnectionByConsumerId(Number(consumerId));
    setConnection(data);
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
      setRoles(claims.roles || []);
    } catch (error) {
      console.error("Failed to fetch user claims", error);
    }
  };

  getClaims();
}, []);

// useEffect(() => {
//   const storedRep = localStorage.getItem("selectedRepresentative");
//   if (storedRep) {
//     setSelectedRepresentative(JSON.parse(storedRep));
//   }
// }, []);

const getWattageForBrand = (brand: string): number => {
  switch (brand) {
    case "Sova":
      return 550;
    case "En-Icon":
      return 590;
    case "Adani":
      return 575;
    default:
      return 0;
  }
};


let hasShownError = false;

useEffect(() => {
  const fetchData = async () => {
    if (!connectionId) return;

    setIsFetchingRecommendations(true);

    try {
      const recommendation = await fetchRecommendedDetails(connectionId);
      console.log("Recommended Data:", recommendation);

      const recommendedKW = recommendation.recommendedKW || "";

      setFormData((prev) => ({
        ...prev,
        installationSpaceType: recommendation.recommendedInstallationSpaceType || "",
        installationStructureType: recommendation.recommendedInstallationStructureType || "",
        Kw: recommendedKW,
        numberOfGpPipes: recommendation.numberOfGpPipes || 0,
        dcrNonDcrType:
          recommendation.dcrNonDcrType?.toLowerCase() === "nondcr"
            ? "Non-DCR"
            : "DCR",
        panelBrand: recommendation.panelBrand || "",
        wattage: getWattageForBrand(recommendation.panelBrand || ""),
      }));

      setConnectionType(recommendation.connectionType || "");
      setPhaseType(recommendation.phaseType || "");

      if (recommendation.phaseType && recommendation.dcrNonDcrType && recommendation.panelBrand) {
        const wattages = await fetchPanelWattages(
          connectionId,
          recommendation.phaseType,
          recommendation.dcrNonDcrType,
          recommendation.panelBrand
        );
        const uniqueWattages = wattages.filter((w) => w !== recommendedKW);
        setPanelWattages([recommendedKW, ...uniqueWattages]);
      }
    } catch (error: any) {
      console.error("Error fetching recommended details:", error);
            if (!hasShownError) {
        hasShownError = true;
        toast.error("Failed to fetch recommended details. Please try again later.", {
          autoClose: 1000,
          hideProgressBar: true,
        });
      }
    } finally {
      setIsFetchingRecommendations(false);
    }
  };

  fetchData();
}, [connectionId]);


  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type, checked } = e.target;

  let updatedFormData: any;

  setFormData((prev) => {
    const updatedData = {
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    };

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

    // Interdependent panelBrand <-> dcrNonDcrType
if (name === "panelBrand") {
  updatedData.wattage = getWattageForBrand(value);

  if (value === "En-Icon") {
    updatedData.dcrNonDcrType = "Non-DCR";
  }
}

if (name === "dcrNonDcrType") {

  if (value === "Non-DCR") {
    updatedData.panelBrand = "En-Icon";
  }
}


    // if (name === "dcrNonDcrType") {
    //   updatedData.panelBrand = value === "Non-DCR" ? "En-Icon" : "Sova";
    // }


    updatedFormData = updatedData; // assign to outer variable
    return updatedData;
  });

  setIsCustomSpecs(true);
  setIsSpecsSaved(false);

  // Wait a bit for formData to update before fetching wattages
  if (["panelBrand", "dcrNonDcrType"].includes(name)) {
    const dcrNonDcrValue =
      name === "dcrNonDcrType" ? value : formData.dcrNonDcrType;
    const panelBrandValue =
      name === "panelBrand"
        ? value
        : name === "dcrNonDcrType"
        ? value === "Non-DCR"
          ? "En-Icon"
          : "Sova"
        : formData.panelBrand;

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

      // Ensure Kw is valid
      if (!wattages.includes(formData.Kw)) {
        setFormData((prev) => ({
          ...prev,
          Kw: wattages[0] || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching panel wattages:", error);
    }
  }
};





  useEffect(() => {
    const handleGetPrice = async () => {
      try {
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
  
    // Check if all required values are set before fetching price
    if (
      formData.installationStructureType &&
      formData.Kw &&
      formData.panelBrand &&
      formData.dcrNonDcrType &&
      phaseType &&
      connectionType 
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
    connectionType,
    formData.waterSprinklerSystem,        
    formData.heavyDutyRamp,         
    formData.heavyDutyStairs  
  ]);
  

  const handleSaveSpecs = async () => {
    const requestData = {
        customerSelectedInstallationStructureType: formData.installationStructureType,
        customerSelectedKW: formData.Kw,
        customerSelectedBrand: formData.panelBrand,
        customerSelectedInstallationSpaceType: formData.installationSpaceType,
        dcrNonDcrType: formData.dcrNonDcrType,
        phaseType: phaseType,
        connectionType: connectionType,
        inversionType: "On-Grid",
        inverterWattage: 6.4,
        solarSystemCost: formData.solarSystemCost,
        fabricationCost: formData.fabricationCost,
        totalCost: formData.totalCost,
        waterSprinklerSystem: formData.waterSprinklerSystem,
        heavyDutyRamp: formData.heavyDutyRamp,
        heavyDutyStairs: formData.heavyDutyStairs,
        panelCapacity: formData.wattage,
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
        //alert(error.message || "An error occurred while saving.");
        toast.error("Erroe while saving specifications.",{
          autoClose:1000,
          hideProgressBar: true,
        });
    }
};




const handleGenerateQuotation = async () => {
  try {
      if (!connectionId) {
          console.error("Connection ID is missing");
          return;
      }

      setIsLoading(true);

      console.log("Fetching Quotation PDF for Connection ID:", connectionId);

      const pdfBlob = await generateQuotationPDF(connectionId);
      console.log('PDF Blob size:', pdfBlob.size);

      await uploadFileToOneDrive(pdfBlob, consumerId, govIdName, districtName, talukaName, villageName);
      console.log("Quotation uploaded to OneDrive successfully");


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
      console.error("Error generating or uploading quotation:", error);
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
  
      // Open the PDF in a new window
      const popupWindow = window.open("", "_blank", "width=800,height=600");
      if (popupWindow) {
        popupWindow.document.write(`
          <html>
            <head>
              <title>Quotation Preview</title>
            </head>
            <body>
              <embed src="${pdfUrl}" type="application/pdf" width="100%" height="100%" />
            </body>
          </html>
        `);
      } else {
        console.error("Popup blocked. Please allow popups and try again.");
      }
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
    <div className="max-w-4xl mx-auto p-6">
    

<div className="flex flex-col md:flex-row items-center justify-between md:space-x-4 col-span-1 md:col-span-2 mb-4">
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

<div className="w-full max-w-4xl mx-auto mb-14 mt-10 overflow-x-auto">
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
      <span className="text-gray-700 text-lg font-medium">Fetching Recommendation Details...</span>
    </div>
  </div>
)}





      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
  <label className="block text-sm font-medium text-gray-700">Installation Space Type</label>
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
          {space.installationSpaceType}
        </option>
      ))
    )}
  </select>
</div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Installation Structure Type</label>
          <input
            id="installationStructureType"
            name="installationStructureType"
            value={formData.installationStructureType}
            //onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          
          
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
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">DCR/Non-DCR</label>
          <select
            id="dcrNonDcrType"
            name="dcrNonDcrType"
            value={formData.dcrNonDcrType}
            onChange={(e) => {
              setDcrNonDcrType(e.target.value); // Update local state
              handleChange(e); // Also update formData
            }}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DCR">DCR</option>
            <option value="Non-DCR">Non-DCR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">KW</label>
          <select
                id="Kw"
                name="Kw"
                value={formData.Kw}
                onChange={(e) => {
                  setKw(e.target.value); // Update local state
                  handleChange(e); // Also update formData
                }}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                {panelWattages.map((wattage) => (
                    <option key={wattage} value={wattage}>
                    {wattage}
                      </option>
                   ))}
              </select>
        </div>

        <div>
                <label className="block text-sm font-medium text-gray-700">Wattage-wp</label>
                <input type="number" name="wattage" value={formData.wattage} onChange={handleChange} 
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
         </div>

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





        {/* <div className="col-span-full">
        <button
          type="button"
          onClick={handleGetPrice}
          className="w-64 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"

        >
          Get Price
        </button>
      </div> */}

          <div className="col-span-full space-y-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-700">Cost Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Solar Cost System</label>
                <input type="number" name="solarSystemCost" value={formData.solarSystemCost} onChange={handleChange} 
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fabrication Cost</label>
                <input type="number" name="fabricationCost" value={formData.fabricationCost} onChange={handleChange} 
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

    <button
        type="submit"
        onClick={handleGenerateQuotation}
        disabled={!isSpecsSaved || isLoading}
        //disabled={isLoading}
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {isLoading ? "Generating..." : "Generate & Save Quotation"}
    </button>
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
