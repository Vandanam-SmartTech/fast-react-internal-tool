import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPanelWattages, fetchRecommendedDetails, getPriceDetails } from '../services/api';
import { generateQuotationPDF } from '../services/api';

export const SystemSpecifications = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showCostDetails, setShowCostDetails] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSystemSpecificationDetails, setShowSystemSpecificationDetails] = useState(false);
  const [recommendedInstallationSpaceType, setRecommendedInstallationSpaceType] = useState("");
  const [recommendedInstallationStructureType, setRecommendedInstallationStructureType] = useState("");
  const [recommendedKW, setRecommendedKW] = useState("");
  const [dcrNonDcr, setDcrNonDcr] = useState("");
  const [panelBrand, setPanelBrand] = useState("");
  const [phase, setPhase] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [panelWattages, setPanelWattages] = useState([]);
  const [formData, setFormData] = useState({
    solarSystemCost: 0,
    fabricationCost: 0,
    effectiveCost: 0,
    recommendedInstallationSpaceType: "",
    recommendedInstallationStructureType: "",
  });

  const connectionId = location.state?.connectionId; // Ensure connectionId is correctly retrieved

  useEffect(() => {
    const fetchData = async () => {
      if (!connectionId) return;

      try {
        const recommendation = await fetchRecommendedDetails(connectionId);

        setRecommendedInstallationSpaceType(recommendation.recommendedInstallationSpaceType || "");
        setRecommendedInstallationStructureType(recommendation.recommendedInstallationStructureType || "");
        setRecommendedKW(recommendation.recommendedKW || "");
        setDcrNonDcr(recommendation.dcrNonDcr || "");
        setPanelBrand(recommendation.panelBrand || "");
        setPhase(recommendation.phase || "");
        setConnectionType(recommendation.connectionType || "");
        setShowSystemSpecificationDetails(true);

        if (recommendation.phase && recommendation.dcrNonDcr && recommendation.panelBrand) {
          const wattages = await fetchPanelWattages(connectionId, recommendation.phase, recommendation.dcrNonDcr, recommendation.panelBrand);
          setPanelWattages(wattages);
        }
      } catch (error) {
        console.error("Error fetching recommended details:", error);
      }
    };

    fetchData();
  }, [connectionId]);

  const handleGetPrice = async () => {
    try {
      const requestData = {
        customerSelectedInstallationSpaceType: recommendedInstallationSpaceType,
        customerSelectedInstallationStructureType: recommendedInstallationStructureType,
        customerSelectedKW: recommendedKW,
        customerSelectedBrand: panelBrand,
        phase,
        dcrNonDcr,
        connectionType,
      };

      console.log("Request Data:", requestData);

      const priceDetails = await getPriceDetails(requestData);

      if (priceDetails) {
        setFormData((prev) => ({
          ...prev,
          solarSystemCost: priceDetails.solarSystemCost || 0,
          fabricationCost: priceDetails.fabricationCost || 0,
          effectiveCost: (priceDetails.solarSystemCost || 0) + (priceDetails.fabricationCost || 0),
        }));

        setShowCostDetails(true);
      }
    } catch (error) {
      console.error("Error fetching price details:", error);
    }
  };

  const handleGenerateQuotation = async () => {
      try {
          if (!connectionId) {
              console.error("Connection ID is missing");
              return;
          }
  
          setIsLoading(true);
  
          const requestData = {
              customerSelectedInstallationStructureType: recommendedInstallationStructureType,
              customerSelectedKW: recommendedKW,
              customerSelectedBrand: panelBrand,
              customerSelectedInstallationSpaceType: recommendedInstallationSpaceType,
              dcrNonDcr: dcrNonDcr,
              phase: phase,
              connectionType: connectionType,
              inversionType: "On-Grid",
              solarSystemCost: formData.solarSystemCost,  // Added
              fabricationCost: formData.fabricationCost,  // Added
              effectiveCost: formData.effectiveCost,
          };
  
          const pdfBlob = await generateQuotationPDF(connectionId, requestData);
  
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
        customerSelectedInstallationStructureType: recommendedInstallationStructureType,
        customerSelectedKW: recommendedKW,
        customerSelectedBrand: panelBrand,
        customerSelectedInstallationSpaceType: recommendedInstallationSpaceType,
        dcrNonDcr: dcrNonDcr,
        phase: phase,
        connectionType: connectionType,
        inversionType: "On-Grid",
        solarSystemCost: formData.solarSystemCost,  // Added
        fabricationCost: formData.fabricationCost,  // Added
        effectiveCost: formData.effectiveCost,
      };
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
        const updatedData = { 
            ...prev, 
            [name]: value
        };

        // Update effectiveCost whenever solarSystemCost or fabricationCost changes
        updatedData.effectiveCost = 
            (Number(updatedData.solarSystemCost) || 0) + 
            (Number(updatedData.fabricationCost) || 0);

        return updatedData;
    });
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">System Specifications</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Recommended Installation Space Type</label>
          <select
            id="recommendedInstallationSpaceType"
            name="recommendedInstallationSpaceType"
            value={formData.recommendedInstallationSpaceType}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Slab">Slab</option>
            <option value="Clay Tiles">Clay Tiles</option>
            <option value="Metal Sheets">Metal Sheets</option>
            <option value="Plastic Sheets">Plastic Sheets</option>
            <option value="Bathroom Slab">Bathroom Slab</option>
            <option value="Cement Sheets">Cement Sheets</option>
            <option value="On Ground">On Ground</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recommended Installation Structure Type</label>
          <select
            id="recommendedInstallationStructureType"
            name="recommendedInstallationStructureType"
            value={formData.recommendedInstallationStructureType}
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
            value={panelBrand}
            onChange={(e) => setPanelBrand(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Sova">Sova</option>
            <option value="En-Icon">En-Icon</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">DCR/Non-DCR</label>
          <select
            id="dcrNonDcr"
            name="dcrNonDcr"
            value={dcrNonDcr}
            onChange={(e) => setDcrNonDcr(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="DCR">DCR</option>
            <option value="Non-DCR">Non-DCR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recommended KW</label>
          <select
                id="recommendedKW"
                name="recommendedKW"
                value={recommendedKW}
                onChange={(e) => setRecommendedKW(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                {panelWattages.map((wattage) => (
                    <option key={wattage} value={wattage}>
                    {wattage}
                      </option>
                   ))}
              </select>
        </div>

        <div className="col-span-full">
        <button
          type="button"
          onClick={handleGetPrice}
          className="w-64 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"

        >
          Get Price
        </button>
      </div>

        {showCostDetails && (
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
                <label className="block text-sm font-medium text-gray-700">Effective Cost</label>
                <input type="number" name="effectiveCost" value={formData.effectiveCost} onChange={handleChange} 
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

          
        )}
      </form>
    </div>
  );
};
