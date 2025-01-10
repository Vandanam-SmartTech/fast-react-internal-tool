import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { QuotationData,District,Taluka,Village } from '../types/quotation';
import { generateQuotationPDF, fetchPanelWattages, fetchDistricts, fetchTalukas, fetchVillages } from '../services/api';
import { downloadBlob } from '../utils/downloadHelper';
import { initialFormData } from '../constants/formDefaults';
import { calculateKw, calculateCosts } from '../services/api';

export function QuotationForm() {
  const [formData, setFormData] = useState<QuotationData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kwOptions, setKwOptions] = useState<number[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [villageCode, setVillageCode] = useState<number>(0);
  const [pincode, setPincode] = useState<number>(0);
  const [isMsebConnection, setIsMsebConnection] = useState("Yes");
  const [gridType, setGridType] = useState<string>('');
  const [isBatteryDropdownEnabled, setIsBatteryDropdownEnabled] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    const parsedValue =
      ['monthlyAvgUnit', 'kw', 'subsidy', 'solarCostSystem', 'fabricationCost'].includes(name)
        ? parseFloat(value) || NaN
        : value;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: parsedValue,
      };

      if (['solarCostSystem', 'fabricationCost', 'subsidy'].includes(name)) {
        updatedData.effectiveCost =
          (updatedData.solarCostSystem || 0) +
          (updatedData.fabricationCost || 0) - 
          (updatedData.subsidy || 0);
      }

      return updatedData;
    });
  };

  useEffect(() => {
    const fetchDistrictsData = async () => {
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
  
    fetchDistrictsData();
  }, []);
  
  useEffect(() => {
    const fetchTalukasData = async () => {
      if (districtCode) {
        try {
          const talukaData = await fetchTalukas(districtCode);
          setTalukas(talukaData);
        } catch (err) {
          console.error('Error fetching talukas:', err);
        }
      } else {
        setTalukas([]);
      }
    };
  
    fetchTalukasData();
  }, [districtCode]);
  
  useEffect(() => {
    const fetchVillagesData = async () => {
      if (talukaCode) {
        try {
          const villageData = await fetchVillages(talukaCode);
          setVillages(villageData);
        } catch (err) {
          console.error('Error fetching villages:', err);
        }
      } else {
        setVillages([]);
      }
    };
  
    fetchVillagesData();
  }, [talukaCode]);
  
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setDistrictCode(value);
    setFormData((prev) => ({ ...prev, districtCode: value }));
    // Reset taluka and village if district is changed
    setTalukaCode(0);
    setVillageCode(0);
  };
  
  const handleTalukaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setTalukaCode(value);
    setFormData((prev) => ({ ...prev, talukaCode: value }));
    // Reset village if taluka is changed
    setVillageCode(0);
  };
  
  // Fetch Village and Pincode
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setVillageCode(value);
    setFormData((prev) => ({ ...prev, villageCode: value }));
  };
  
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setPincode(value);
    setFormData((prev) => ({ ...prev, pincode: value }));
  };
  
  const handleMsebChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsMsebConnection(value);
    setFormData((prev) => ({
      ...prev,
      consumerNumber: '',
      isMsebConnection: value,
      gridType: '', // Reset grid type when MSEB connection changes
      batteryWattage: NaN, // Reset battery wattage with NaN (valid number type)
    }));
    setGridType(''); // Reset grid type selection when MSEB changes
    setIsBatteryDropdownEnabled(false); // Reset battery dropdown when MSEB changes
  };

  const handleGridTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGridType(value);
    setFormData((prev) => ({
      ...prev,
      gridType: value,
      batteryWattage: value === 'Hybrid' || value === 'With-Battery' ? prev.batteryWattage : NaN, // Reset battery wattage if not applicable
    }));
    setIsBatteryDropdownEnabled(value === 'Hybrid' || value === 'With-Battery'); // Enable battery dropdown for specific grid types
  };

  useEffect(() => {
    // Fetch districts
    const fetchDistrictsData = async () => {
      try {
        const districtData = await fetchDistricts();
        setDistricts(districtData);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };

    fetchDistrictsData();
  }, []);

  useEffect(() => {
    if (districtCode) {
      fetchTalukas(districtCode);
    } else {
      setTalukas([]);
      setTalukaCode(0);
      setFormData((prev) => ({ ...prev, talukaCode: 0 }));
    }
  }, [districtCode]);

  useEffect(() => {
    if (talukaCode) {
      fetchVillages(talukaCode);
    } else {
      setVillages([]);
      setVillageCode(0);
      setFormData((prev) => ({ ...prev, villageCode: 0 }));
    }
  }, [talukaCode]);

  useEffect(() => {
    if (formData.phase) {
      const fetchWattages = async () => {
        try {
          const wattages = await fetchPanelWattages(formData.phase);
          setKwOptions(wattages);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch KW options');
        }
      };

      fetchWattages();
    }
  }, [formData.phase]);

  useEffect(() => {
    if (
      formData.connectionType &&
      formData.phase &&
      formData.dcrNonDcr &&
      formData.kw > 0
    ) {
      const fetchCostData = async () => {
        try {
          const costData = await calculateCosts({
            connectionType: formData.connectionType,
            phase: formData.phase,
            dcrNonDcr: formData.dcrNonDcr,
            kw: formData.kw,
          });

          setFormData(prev => ({
            ...prev,
            subsidy: costData.subsidy,
            solarCostSystem: costData.solarSystemCost,
            fabricationCost: costData.fabricationCost,
            effectiveCost:
              (costData.solarSystemCost || 0) +
              (costData.fabricationCost || 0) - 
              (costData.subsidy || 0),
          }));
        } catch (err) {
          console.error('Error fetching cost data:', err);
          setError('Failed to fetch cost data');
        }
      };

      fetchCostData();
    }
  }, [formData.connectionType, formData.phase, formData.dcrNonDcr, formData.kw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const pdfBlob = await generateQuotationPDF(formData);
      downloadBlob(pdfBlob, `quotation-${formData.consumerNumber}.pdf`);
    } catch (err) {
      setError('Failed to generate quotation. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewLoading(true); // Start loading indicator for preview
    try {
      const pdfBlob = await generateQuotationPDF(formData);
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Create a new window for the PDF popup
      const popupWindow = window.open('', '_blank', 'width=800,height=600');

      if (popupWindow) {
        popupWindow.document.write('<html><head><title>Quotation Preview</title></head><body>');
        popupWindow.document.write('<embed src="' + pdfUrl + '" type="application/pdf" width="100%" height="100%" />');
        popupWindow.document.write('</body></html>');
      } else {
        setError('Popup blocked. Please allow popups and try again.');
      }
    } catch (err) {
      setError('Failed to preview the quotation. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsPreviewLoading(false); // Reset the loading indicator after the preview is complete
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <FileText className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Vandanam Solar Quotation Generator</h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Grid Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* District Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              name="districtCode"
              value={districtCode}
              onChange={handleDistrictChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={0}>Select District</option>
              {districts.map((district) => (
                <option key={district.nameEnglish} value={district.code}>
                  {district.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          {/* Taluka Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Taluka</label>
            <select
              name="talukaCode"
              value={talukaCode}
              onChange={handleTalukaChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={0}>Select Taluka</option>
              {talukas.map((taluka) => (
                <option key={taluka.nameEnglish} value={taluka.code}>
                  {taluka.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          {/* Village Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Village</label>
            <select
              name="villageCode"
              value={villageCode}
              onChange={handleVillageChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={0}>Select Village</option>
              {villages.map((village) => (
                <option key={village.code} value={village.code}>
                  {village.nameEnglish}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pincode Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={pincode || ''}
            onChange={handlePincodeChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-8">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isPreviewLoading}
            className="py-3 px-4 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
          >
            {isPreviewLoading ? 'Previewing...' : 'Preview Quotation'}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3 px-4 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
          >
            {isLoading ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-500 font-semibold text-center">{error}</div>
        )}
      </div>
    </form>
  );
}
