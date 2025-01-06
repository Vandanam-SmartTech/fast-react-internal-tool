// QuotationForm.tsx
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { QuotationData } from '../types/quotation';
import { generateQuotationPDF, fetchPanelWattages } from '../services/api';
import { downloadBlob } from '../utils/downloadHelper';
import { initialFormData } from '../constants/formDefaults';
import {calculateKw, calculateCosts } from '../services/api';

export function QuotationForm() {
  const [formData, setFormData] = useState<QuotationData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kwOptions, setKwOptions] = useState<number[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    const parsedValue =
      ['monthlyAvgUnit', 'kw', 'subsidy', 'solarCostSystem', 'fabricationCost'].includes(name)
        ? parseFloat(value) || 0
        : value;

    setFormData(prev => {
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


  useEffect(() => {
    if (formData.monthlyAvgUnit && formData.phase) {
      const fetchKw = async () => {
        const kw = await calculateKw(formData.phase, formData.monthlyAvgUnit);
        if (kw !== null) {
          setFormData((prev) => ({
            ...prev,
            kw,
          }));
        } else {
          setError('Failed to calculate KW');
        }
      };
  
      fetchKw();
    }
  }, [formData.monthlyAvgUnit, formData.phase]);

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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <FileText className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Vandanam Solar Quotation Generator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Consumer Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
            <input
              type="text"
              name="consumerNumber"
              value={formData.consumerNumber}
              onChange={handleChange}
              placeholder="CN001"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Consumer Name</label>
            <input
              type="text"
              name="consumerName"
              value={formData.consumerName}
              onChange={handleChange}
              placeholder="Om Patil"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="consumerPhoneNumber"
              value={formData.consumerPhoneNumber}
              onChange={handleChange}
              placeholder="1234567890"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="consumerEmail"
              value={formData.consumerEmail}
              onChange={handleChange}
              placeholder="prasad07@example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="consumerAddress1"
              value={formData.consumerAddress1}
              onChange={handleChange}
              placeholder="123 Main St"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="consumerAddress2"
              value={formData.consumerAddress2}
              onChange={handleChange}
              placeholder="Suite 456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Connection Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Connection Type</label>
            <select
              name="connectionType"
              value={formData.connectionType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="PWW">PWW</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phase Type</label>
            <select
              name="phase"
              value={formData.phase}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Phase</option>
              <option value="Single-Phase">Single-Phase</option>
              <option value="Three-Phase">Three-Phase</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">DCR/Non-DCR</label>
            <select
              name="dcrNonDcr"
              value={formData.dcrNonDcr}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="DCR">DCR</option>
              <option value="Non-DCR">Non-DCR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Average Unit</label>
            <input
              type="number"
              name="monthlyAvgUnit"
              value={formData.monthlyAvgUnit}
              onChange={handleChange}
              placeholder="ex. 120"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">KW</label>
            <select
              name="kw"
              value={formData.kw}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select KW</option>
              {kwOptions.map((kw) => (
                <option key={kw} value={kw}>{kw}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700">Cost Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Solar Cost System</label>
              <input
                type="number"
                name="solarCostSystem"
                value={formData.solarCostSystem}
                onChange={handleChange}
                placeholder="Enter Solar Cost System"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subsidy</label>
              <input
                type="number"
                name="subsidy"
                value={formData.subsidy}
                onChange={handleChange}
                placeholder="Enter Subsidy"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
           
            <div>
              <label className="block text-sm font-medium text-gray-700">Fabrication Cost</label>
              <input
                type="number"
                name="fabricationCost"
                value={formData.fabricationCost}
                onChange={handleChange}
                placeholder="Enter Fabrication Cost"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Effective Cost</label>
              <input
                type="number"
                name="effectiveCost"
                value={formData.effectiveCost}
                onChange={handleChange}
                placeholder="Enter Effective Cost"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        {error && (
          <p className="text-red-600 mr-4 self-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Quotation PDF'}
        </button>
      </div>
    </form>
  );
}
