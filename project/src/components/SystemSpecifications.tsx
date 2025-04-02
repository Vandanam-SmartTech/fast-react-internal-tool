
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPanelWattages, fetchRecommendedDetails, getPriceDetails, fetchInstallationSpaceTypes } from '../services/api';
import { generateQuotationPDF } from '../services/api';
import { Stepper, Step } from "react-form-stepper";
import { ArrowLeft } from "lucide-react";

export const SystemSpecifications = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showCostDetails, setShowCostDetails] = useState(false);
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

  const installationSpaceTypeMapping: Record<number, string> = {
    1: "Slab",
    2: "Clay Tiles",
    3: "Metal Sheets",
    4: "Plastic Sheets",
    5: "Bathroom Slab",
    6: "Cement Sheets",
    7: "On Ground",
  };

const [availableSpaceTypes, setAvailableSpaceTypes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    solarSystemCost: 0,
    fabricationCost: 0,
    totalCost: 0,
    installationSpaceType: "",
    installationStructureType: "",
    dcrNonDcrType:"",
    panelBrand:"",
    Kw:"",
  });

  const connectionId = location.state?.connectionId; // Ensure connectionId is correctly retrieved
  const consumerId = location.state?.consumerId;
  const customerId = location.state?.customerId;

  useEffect(() => {
    const loadInstallationSpaceTypes = async () => {
        if (!consumerId) return; // Ensure consumerId is valid

        const uniqueIds = await fetchInstallationSpaceTypes(Number(consumerId));

        // Convert to user-friendly names using mapping
        const filteredOptions = uniqueIds
            .map(id => installationSpaceTypeMapping[id])
            .filter(Boolean); // Remove undefined values

        setAvailableSpaceTypes(filteredOptions);
    };


    loadInstallationSpaceTypes();
}, [consumerId]); // Rerun effect when consumerId changes

  useEffect(() => {
    const fetchData = async () => {
      if (!connectionId) return;

      try {
        const recommendation = await fetchRecommendedDetails(connectionId);

        const recommendedKW = recommendation.recommendedKW || "";

        setFormData((prev) => ({
          ...prev,
          installationSpaceType: recommendation.recommendedInstallationSpaceType || "",
          installationStructureType: recommendation.recommendedInstallationStructureType || "",
          Kw: recommendedKW,
          dcrNonDcrType:
          recommendation.dcrNonDcrType?.toLowerCase() === "nonDcr"
            ? "Non-DCR"
            : "DCR",
          panelBrand: recommendation.panelBrand || "",
        }));
        setConnectionType(recommendation.connectionType || "");
        setPhaseType(recommendation.phaseType || "");

        if (recommendation.phaseType && recommendation.dcrNonDcrType && recommendation.panelBrand) {
          const wattages = await fetchPanelWattages(connectionId, recommendation.phaseType, recommendation.dcrNonDcrType, recommendation.panelBrand);
          const uniqueWattages = wattages.filter((w) => w !== recommendedKW);
        setPanelWattages([recommendedKW, ...uniqueWattages]);
        }

      } catch (error) {
        console.error("Error fetching recommended details:", error);
      }
    };

    fetchData();
  }, [connectionId]);





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
  ]);
  


 // Runs when `formData` updates


  const handleGenerateQuotation = async () => {
      try {
          if (!connectionId) {
              console.error("Connection ID is missing");
              return;
          }
  
          setIsLoading(true);
  
          const requestData = {
              customerSelectedInstallationStructureType: formData.installationStructureType,
              customerSelectedKW: formData.Kw,
              customerSelectedBrand: formData.panelBrand,
              customerSelectedInstallationSpaceType: formData.installationSpaceType,
              dcrNonDcrType: formData.dcrNonDcrType,
              phaseType: phaseType,
              connectionType: connectionType,
              inversionType: "On-Grid",
              solarSystemCost: formData.solarSystemCost,  // Added
              fabricationCost: formData.fabricationCost,  // Added
              totalCost: formData.totalCost,
          };
  

          const pdfBlob = await generateQuotationPDF(connectionId, requestData);
          console.log('PDF Blob size:', pdfBlob.size);

  
          // Trigger download
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
          console.error("Error generating quotation:", error);
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
  
      const requestData = {
        customerSelectedInstallationStructureType: formData.installationStructureType,
        customerSelectedKW: formData.Kw,
        customerSelectedBrand: formData.panelBrand,
        customerSelectedInstallationSpaceType: formData.installationSpaceType,
        dcrNonDcrType: formData.dcrNonDcrType,
        phaseType: phaseType,
        connectionType: connectionType,
        inversionType: "On-Grid",
        solarSystemCost: formData.solarSystemCost,  // Added
        fabricationCost: formData.fabricationCost,  // Added
        totalCost: formData.totalCost,
      };
      console.log("Request Data:",requestData);
      const pdfBlob = await generateQuotationPDF(connectionId, requestData);

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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
        const updatedData = { 
            ...prev, 
            [name]: value,
          
        };
        updatedData.totalCost = 
            (Number(updatedData.solarSystemCost) || 0) + 
            (Number(updatedData.fabricationCost) || 0);


        // Correct dcrNonDcrType based on recommendation.phaseType
        if (name === "panelBrand") {
            updatedData.dcrNonDcrType = phaseType === "Three-Phase" && value === "En-Icon"
                ? "Non-DCR"
                : "Non-DCR"; // Default to "DCR"
        }

        return updatedData;
    });

    setIsCustomSpecs(true);

    
    // Fetch panel wattages when relevant fields change
    if (["panelBrand", "dcrNonDcrType"].includes(name)) {
      try {
          const dcrNonDcrValue = name === "dcrNonDcrType" ? value : formData.dcrNonDcrType;
          const panelBrandValue = name === "panelBrand" ? value : formData.panelBrand;
  
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
      } catch (error) {
          console.error("Error fetching panel wattages:", error);
      }
  }
    // Fetch panel wattages when relevant fields change
};




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-3 col-span-1 md:col-span-2 mb-2">
      {/* Backward Arrow Button */}
      <button
        onClick={() => navigate(`/view-connection/${connectionId}`,{ state: { consumerId, customerId, connectionId }})}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
    {isCustomSpecs ? "Customized System Specifications" : "Recommended System Specifications"}
</h2>

    </div>
<div className="col-span-2 mb-4">
        <Stepper activeStep={2} styleConfig={{ activeBgColor: '#3b82f6', completedBgColor: '#3b82f6' }}>
          <Step label="Customer Details" />
          <Step label="Connection Details" />
          <Step label="Installation Space Details" />
          <Step label="System Specifications" />
        </Stepper>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Installation Space Type</label>
          <select
            id="installationSpaceType"
            name="installationSpaceType"
            value={formData.installationSpaceType || ""}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {availableSpaceTypes.length === 0 ? (
      <option disabled>Loading...</option> // Prevents user selection while loading
    ) : (
      availableSpaceTypes.map((spaceType) => (
        <option key={spaceType} value={spaceType}>
          {spaceType}
        </option>
      ))
    )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Installation Structure Type</label>
          <select
            id="installationStructureType"
            name="installationStructureType"
            value={formData.installationStructureType}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Static">Static</option>
            <option value="Dynamic">Dynamic</option>
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

        {/* <div className="col-span-full">
        <button
          type="button"
          onClick={handleGetPrice}
          className="w-64 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"

        >
          Get Price
        </button>
      </div> */}

          <div className="col-span-full space-y-6">
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

            <div className="flex space-x-12">
    <button
        type="button"
        onClick={handlePreview}
        className="hidden md:block min-w-80 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        disabled={isPreviewLoading}
    >
        {isPreviewLoading ? "Previewing..." : "Preview Quotation"}
    </button>

    <button
        type="submit"
        onClick={handleGenerateQuotation}
        disabled={isLoading}
        className="min-w-80 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {isLoading ? "Generating..." : "Generate Quotation"}
    </button>
</div>

          </div>


          
      </form>
    </div>
  );
};
