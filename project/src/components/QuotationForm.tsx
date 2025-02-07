// QuotationForm.tsx
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { QuotationData, District, Taluka, Village } from '../types/quotation';
import { generateQuotationPDF, fetchPanelWattages, fetchDistricts, fetchTalukas, fetchVillages, saveDataToServer } from '../services/api';
import { downloadBlob } from '../utils/downloadHelper';
import { initialFormData } from '../constants/formDefaults';
import { calculateKw, calculateCosts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useLocation } from "react-router-dom";
import { updateConsumerPersonalDetails, updateConsumerConnectionDetails } from "../services/api";

export function QuotationForm() {
  const [formData, setFormData] = useState<QuotationData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kwOptions, setKwOptions] = useState<number[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);


  const [isMsebConnection, setIsMsebConnection] = useState("Yes");
  const [isNameCorrecction, setIsNameCorrection] = useState("No");
  const [isEmailCorrection, setIsEmailCorrection] = useState("Yes");
  const [isLoanRequired, setIsLoanRequired] = useState("No");
  const [inversionType, setInversionType] = useState<string>('');
  const [isBatteryDropdownEnabled, setIsBatteryDropdownEnabled] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [villageCode, setVillageCode] = useState<number>(0);
  const [pincode, setPincode] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  const location = useLocation();
  const consumer = location.state?.consumer as QuotationData; 
  

  
  //logout functinality
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Clear JWT
    navigate('/login'); // Redirect to login
  };

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

  const handleSave = async () => {
    try {
      await saveDataToServer(formData); // Call the API

      navigate("/quotationform"); // Redirect after save
    } catch (error) {
      alert("Failed to save consumer data");
    }
  };

  // useEffect(() => {
  //     if (consumer) {
  //       setIsEditing(true);
  //       const hasCorrection = !!consumer.correctionTypeId;

  //       setFormData({


  //         customerId: consumer.customerId,
  //         id: consumer.id,
  //         consumerNumber: consumer.consumerNumber || "",
  //         connectionType: consumer.connectionType || "",
  //         consumerName: consumer.consumerName || "",
  //         consumerEmail: consumer.consumerEmail || "",
  //         consumerPhoneNumber: consumer.consumerPhoneNumber || "",
  //         pincode: consumer.pincode || "",
  //         monthlyAvgUnit: consumer.monthlyAvgUnit || "",
  //         districtCode:consumer.district || "",
  //         talukaCode:consumer.taluka || "",
  //         villageCode:consumer.village || "",
  //         billedTo:consumer.billedTo || "",
  //         isMsebConnection: consumer.isMsebConnection === null ? "" : consumer.isMsebConnection ? "Yes" : "No",
  //         isNameCorrection: hasCorrection ? "Yes" : "No", 
  //         phase: consumer.phaseTypeId === 1 ? "Single-Phase" : consumer.phaseTypeId === 2 ? "Three-Phase" : "",
  //         correctionType: hasCorrection 
  //       ? (consumer.correctionTypeId === 11 ? "spell_correction" : 
  //          (consumer.correctionTypeId === 12 ? "transfer_ownership" : ""))
  //       : "", 
  //       });

  //       setDistrictCode(consumer.district || 0);
  //       setTalukaCode(consumer.taluka || 0);
  //       setVillageCode(consumer.village || 0);
  //     }
  //   }, [consumer]);

    const handleSaveOrUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
    
      try {
        if (isEditing) {
          if (!formData.customerId) {
            alert("Error: Customer ID is missing.");
            return;
          }
    
          const backendCustomerData = {
            govIdName: formData.consumerName, 
            mobileNumber: formData.consumerPhoneNumber, 
            emailAddress: formData.consumerEmail, 
          };
    
          console.log("Final data before update:", backendCustomerData); // Log data
    
          await updateConsumerPersonalDetails(formData.customerId, backendCustomerData);

          const backendConnectionData = {
            consumerId: formData.consumerNumber,
            connectionType: formData.connectionType,
            monthlyAvgConsumptionUnits:formData.monthlyAvgUnit,
            district: formData.districtCode,
            taluka: formData.talukaCode,
            village: formData.villageCode,
            postalCode: formData.pincode,
            billedTo: formData.billedTo,
            isMsebConnection: formData.isMsebConnection === "Yes",
            isNameCorrection: formData.isNameCorrection === "Yes", 
            phaseTypeId: formData.phase === "Single-Phase" ? 1 : formData.phase === "Three-Phase" ? 2 : null,
            correctionTypeId: formData.isNameCorrection === "Yes" ? (formData.correctionType === "spell_correction"   ? 11   : (formData.correctionType === "transfer_ownership"  ? 12   : null) ) : null
          }

          console.log("Final data before update:", backendConnectionData);

          await updateConsumerConnectionDetails(formData.id, backendConnectionData);

          alert("Consumer-Connection details updated successfully!");
        } else {
          await handleSave();
        }
      } catch (error) {
        console.error("Error in update process:", error);
        alert("Failed to process the request");
      }
    };
    
    


  /////////////////////////////////////////
  useEffect(() => {
    const initializePhaseAndKw = async () => {
      const defaultPhase = 'Single-Phase';
      setFormData((prev) => ({ ...prev, phase: defaultPhase })); // Set the initial phase value
      try {
        const wattages = await fetchPanelWattages(defaultPhase);
        const sortedWattages = wattages.sort((a, b) => a - b); // Sort KW options in ascending order
        setKwOptions(sortedWattages);
        // Call handleChange logic for updating formData.kw
        if (sortedWattages.length > 0) {
          const firstKwOption = sortedWattages[0];
          setFormData((prev) => ({ ...prev, kw: firstKwOption }));
        }
      } catch (err) {
        console.error('Error fetching panel wattages for default phase:', err);
      }
    };

    initializePhaseAndKw();
  }, []);


  useEffect(() => {
    if (consumer) {
      setIsEditing(true);
      const hasCorrection = !!consumer.correctionTypeId;

      setFormData({


        customerId: consumer.customerId,
        id: consumer.id,
        consumerNumber: consumer.consumerNumber || "",
        connectionType: consumer.connectionType || "",
        consumerName: consumer.consumerName || "",
        consumerEmail: consumer.consumerEmail || "",
        consumerPhoneNumber: consumer.consumerPhoneNumber || "",
        pincode: consumer.pincode || "",
        monthlyAvgUnit: consumer.monthlyAvgUnit || "",
        districtCode:consumer.district || "",
        talukaCode:consumer.taluka || "",
        villageCode:consumer.village || "",
        billedTo:consumer.billedTo || "",
        isMsebConnection: consumer.isMsebConnection === null ? "" : consumer.isMsebConnection ? "Yes" : "No",
        phase: consumer.phaseTypeName || "",
        isNameCorrection: hasCorrection ? "Yes" : "No", 
        correctionType: hasCorrection ? consumer.correctionName : "",
      });

      setDistrictCode(consumer.district || 0);
      setTalukaCode(consumer.taluka || 0);
      setVillageCode(consumer.village || 0);
    }
  }, [consumer]);


  

  useEffect(() => {
    if (kwOptions.length > 1) {
      setFormData((prev) => ({ ...prev, kw: kwOptions[1] }));
    }
  }, [kwOptions]);

  ///////////////////////////

  ////////////////////////////////////handle the dist,tal,vill,pin



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



  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const selectedVillage = villages.find((village) => village.code === value);

    if (selectedVillage) {
      // Set village code and pincode from the selected village
      setVillageCode(value);
      setFormData((prev) => ({
        ...prev,
        villageCode: value,
        pincode: selectedVillage.pincode, // Ensure the pincode is set
      }));
    }
  };


  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setPincode(value);
    setFormData((prev) => ({ ...prev, pincode: value }));
  };
 
  

  /////////////////////////////////////////////////////////////////////////////


  const handleMsebChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsMsebConnection(value);
    setFormData((prev) => ({
      ...prev,
      consumerNumber: '',
      isMsebConnection: value,
      inversionType: '', // Reset grid type when MSEB connection changes
      batteryWattage: NaN, // Reset battery wattage with NaN (valid number type)
    }));
    setInversionType(''); // Reset grid type selection when MSEB changes
    setIsBatteryDropdownEnabled(false); // Reset battery dropdown when MSEB changes
  };

  //////////////////////////////////////////////////////////////////////////////


  const handleNameCorrection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsNameCorrection(value);
    setFormData((prev) => ({
      ...prev,
      isNameCorrection: value,
      inversionType: '',
      batteryWattage: NaN,
    }));
    setInversionType('');
    setIsBatteryDropdownEnabled(false);
  };

  const handleCorrectionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      correctionType: value,
    }));
  };
  ////////////////////////////////////////////////////////////////////////////////

  const handleEmailCorrection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsEmailCorrection(value);
    setFormData((prev) => ({
      ...prev,
      isEmailCorrection: value,
      inversionType: '',
      batteryWattage: NaN,
    }));
    setInversionType('');
    setIsBatteryDropdownEnabled(false);
  };

  ///////////////////////////////////////////////////////////////////////////////

  const handleIsLoanRequired = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsLoanRequired(value);
    setFormData((prev) => ({
      ...prev,
      isLoanRequired: value,
      inversionType: '',
      batteryWattage: NaN,
    }));
    setInversionType('');
    setIsBatteryDropdownEnabled(false);
  };

  //////////////////////////////////////////////////////////////////////////////////

  const handleInversionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInversionType(value);
    setFormData((prev) => ({
      ...prev,
      inversionType: value,
      batteryWattage: value === 'Hybrid' || value === 'With-Battery' ? prev.batteryWattage : NaN, // Reset battery wattage if not applicable
    }));
    setIsBatteryDropdownEnabled(value === 'Hybrid' || value === 'With-Battery'); // Enable battery dropdown for specific grid types

  };


  useEffect(() => {
    // Create a fake event that matches the expected event type
    const fakeEvent = {
      target: {
        value: isMsebConnection === 'Yes' ? 'On-Grid' : 'With-Battery',
      },
    } as React.ChangeEvent<HTMLSelectElement>; // Type assertion to ensure it matches ChangeEvent

    handleInversionTypeChange(fakeEvent); // Trigger the onChange handler programmatically
  }, [isMsebConnection]);


  useEffect(() => {
    if (formData.phase) {
      const fetchWattages = async () => {
        try {
          const wattages = await fetchPanelWattages(formData.phase);
          const sortedWattages = wattages.sort((a, b) => a - b); // Sort KW options in ascending order
          setKwOptions(sortedWattages);
          // Automatically set KW to the first available option, if any
          if (sortedWattages.length > 0) {
            setFormData((prev) => ({ ...prev, kw: sortedWattages[0] }));
          }
        } catch (err) {
          console.error('Error fetching panel wattages:', err);
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


  // const handleSave = async () => {
  //   try {
  //     await saveDataToServer(formData); // Call the API
  //     alert('Data saved successfully!');
  //   } catch (error) {
  //     alert('Failed to save data.');
  //   }
  // };

  
  const handlePreview = async () => {
    setIsPreviewLoading(true);
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
      setIsPreviewLoading(false);
    }
  };

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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // Automatically dismiss error after 5 seconds
      }, 5000);
      return () => clearTimeout(timer); // Cleanup the timer when error is cleared
    }
  }, [error]);

  // Generate options for battery wattage in multiples of 2.4, up to 2.4 * 50
  const batteryKwOptions = Array.from({ length: 50 }, (_, index) => ((index + 1) * 2.4).toFixed(1));

  


  return (

    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <FileText className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Vandanam Solar Quotation Generator</h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Grid Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-0 gap-6">
          {/* MSEB Connection Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700"> Does the customer currently have an active grid connection with the local electricity provider.(e.g., MSEB or BESCOM)?</label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="msebConnection"
                  value="Yes"
                  onChange={handleMsebChange}
                  className="focus:ring-blue-500 text-blue-600 border-gray-300"
                  checked={formData.isMsebConnection === "Yes"} // Bind to formData state
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="msebConnection"
                  value="No"
                  onChange={handleMsebChange}
                  className="focus:ring-blue-500 text-blue-600 border-gray-300"
                  checked={formData.isMsebConnection === "No"} // Bind to formData state
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>



        </div>
      </div>


      <h2 className="text-xl font-semibold text-gray-700">Consumer Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
            <input
              type="text"
              id="consumerNumber"
              name="consumerNumber"
              value={formData.consumerNumber}
              onChange={handleChange}
              placeholder="CN001"
              disabled={isMsebConnection === 'No'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Consumer Name</label>
            <input
              type="text"
              id="consumerName"
              name="consumerName"
              value={formData.consumerName}
              onChange={handleChange}
              placeholder="Name As per Gov Id"
              required
              pattern="^[A-Za-z]+\s[A-Za-z]+$" // Ensures it contains only first and last name
              title="Please enter only your first and last name (e.g., John Doe)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {/* Billed To */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Billed To</label>
            <input
              type="text"
              name="billedTo"
              value={formData.billedTo}
              onChange={handleChange}
              placeholder="Enter the name of the billed person or company"
              maxLength={50} // Adjust based on your requirements
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* GST Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">GST Number</label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              placeholder="22AAAAA0000A1Z5" // Example GST number format
              maxLength={15} // GST numbers typically have 15 characters
              required
              pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[0-9A-Z]{1}$" // Valid GST format
              title="Enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
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
              maxLength={10}
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
              maxLength={35}
              onChange={handleChange}
              placeholder="devompatil@example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Does the connection require a name correction?
          </label>
          <div className="mt-2 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="nameCorrection"
                value="Yes"
                onChange={handleNameCorrection}
                className="focus:ring-blue-500 text-blue-600 border-gray-300"
                checked={formData.isNameCorrection === "Yes"}
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="nameCorrection"
                value="No"
                onChange={handleNameCorrection}
                className="focus:ring-blue-500 text-blue-600 border-gray-300"
                checked={formData.isNameCorrection === "No"}
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>

          {formData.isNameCorrection === "Yes" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Correction Type
              </label>
              <select
                name="correctionType"
                value={formData.correctionType || ''}
                onChange={handleCorrectionTypeChange}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="spell_correction">Spell Correction</option>
                <option value="transfer_ownership">Transfer Ownership</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Does the mseb email is updated on grid connection?</label>
          <div className="mt-2 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="emailCorrection"
                value="Yes"
                onChange={handleEmailCorrection}
                className="focus:ring-blue-500 text-blue-600 border-gray-300"
                checked={formData.isEmailCorrection === "Yes"} // Bind to formData state
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="emailCorrection"
                value="No"
                onChange={handleEmailCorrection}
                className="focus:ring-blue-500 text-blue-600 border-gray-300"
                checked={formData.isEmailCorrection === "No"} // Bind to formData state
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
      </div>


      <div className="space-y-6 md:col-span-2">
        <h2 className="text-xl font-semibold text-gray-700">Connection Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Connection Type</label>
            <select
              name="connectionType"
              id="connectionType"
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
              id="phase"
              // required
              value={formData.phase}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Single-Phase">Single-Phase</option>
              <option value="Three-Phase">Three-Phase</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Average Unit</label>
            <input
              type="number"
              id="monthlyAvgUnit"
              name="monthlyAvgUnit"
              value={formData.monthlyAvgUnit}
              onChange={handleChange}
              placeholder="ex. 120"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>


      {/* ///////////////////adding alignment//////////////// */}

      <h2 className="text-xl font-semibold text-gray-700">Address Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">

          {/* //dist,vill,tal,pincode/////// */}

          {/* District Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              name="distrct"
              id="district"
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
              id="taluka"
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
              id="village"
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              name="consumerAddress1"
              value={formData.consumerAddress1}
              maxLength={60}
              onChange={handleChange}
              placeholder="123 Main St"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode || ''}  // Ensure it uses formData.pincode
              onChange={handlePincodeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

        </div>



      </div>

      <div className="space-y-6 md:col-span-2">

        <h2 className="text-xl font-semibold text-gray-700">System Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Panel Wattage</label>
            <select
              name="kw"
              value={formData.kw}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >

              {kwOptions.map((kw) => (
                <option key={kw} value={kw}>{kw}</option>
              ))}
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


          {/* Grid Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Inversion Type</label>
            <select
              name="inversionType"
              value={inversionType}
              onChange={handleInversionTypeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {isMsebConnection === 'Yes' ? (
                <>
                  <option value="On-Grid">On-Grid</option>
                  <option value="Hybrid">Hybrid</option>
                </>
              ) : (
                <>
                  <option value="With-Battery">With-Battery</option>
                  <option value="Panel-Only">Panel-Only</option>
                </>
              )
              }
            </select>
          </div>


          {/* Battery Wattage Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Battery Capacity</label>
            <select
              name="batteryWattage"
              value={formData.batteryWattage}
              disabled={!isBatteryDropdownEnabled}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Battery Wattage</option>
              {batteryKwOptions.map((batteryKwOption, index) => (
                <option key={index} value={batteryKwOption}>
                  {batteryKwOption} KW
                </option>
              ))}
            </select>
          </div>
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

      <h2 className="text-xl font-semibold text-gray-700">Finance Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Does the customer require a loan?</label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="loanRequirement"
                  value="Yes"
                  onChange={handleIsLoanRequired}
                  className="focus:ring-blue-500 text-blue-600 border-gray-300"
                  checked={formData.isLoanRequired === "Yes"} // Bind to formData state
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="loanRequirement"
                  value="No"
                  onChange={handleIsLoanRequired}
                  className="focus:ring-blue-500 text-blue-600 border-gray-300"
                  checked={formData.isLoanRequired === "No"} // Bind to formData state
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>




      <div className="mt-8 flex justify-end space-x-4">
        {/* Error Toast Notification */}
        {error && (
          <div className="fixed bottom-5 right-5 p-4 bg-red-600 text-white rounded-lg shadow-lg transition-all duration-300 transform translate-y-8 opacity-0 show-toast">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-lg font-semibold focus:outline-none"
            >
              ×
            </button>
          </div>
        )}

<button
  type="button"
  onClick={handleSaveOrUpdate}
  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
>
  {isEditing ? "Update" : "Save"}
</button>


        <button
          type="button"
          onClick={handlePreview}
          className="hidden md:block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          disabled={isPreviewLoading}
        >
          {isPreviewLoading ? 'Previewing...' : 'Preview Quotation'}
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Quotation PDF'}
        </button>

      </div>
      <style>
        {`
          .show-toast {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.3s ease-in-out;
          }
        `}
      </style>
    </form>
  );
}