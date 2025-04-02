// QuotationForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';
import { QuotationData, District, Taluka, Village } from '../types/quotation';
import { fetchPanelWattages, fetchDistricts, fetchTalukas, fetchVillages, saveDataToServer } from '../services/api';
//import { downloadBlob } from '../utils/downloadHelper';
import { initialFormData } from '../constants/formDefaults';
import { calculateKw, calculateCosts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useLocation } from "react-router-dom";
import { updateConsumerPersonalDetails, updateConsumerConnectionDetails } from "../services/api";
import { saveCustomer } from '../services/api'; 
import { saveConnection } from '../services/api'; 
import { saveInstallation } from '../services/api'; 
import { fetchRecommendedDetails } from '../services/api';
import { getPriceDetails } from '../services/api';
import { generateQuotationPDF } from '../services/api';


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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [inversionType, setInversionType] = useState<string>('');
  const [isBatteryDropdownEnabled, setIsBatteryDropdownEnabled] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [districtCode, setDistrictCode] = useState<number>(0);
  const [talukaCode, setTalukaCode] = useState<number>(0);
  const [villageCode, setVillageCode] = useState<number>(0);
  const [pincode, setpincode] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [installationId, setInstallationId] = useState<number | null>(null);
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [showInstallationDetails, setShowInstallationDetails] = useState(false);
  const [recommendedInstallationSpaceType, setRecommendedInstallationSpaceType] = useState<string>("");
  const [savedInstallations, setSavedInstallations] = useState([]);
  const [recommendedInstallationStructureType, setRecommendedInstallationStructureType] = useState<string>("");
  const [solarSystemCost, setSolarSystemCost] = useState(0);
  const [fabricationCost, setFabricationCost] = useState(0);
  const [subsidy, setSubsidy] = useState(0);
  const [effectiveCost, setEffectiveCost] = useState(0);
  
  const [recommendedKW, setRecommendedKW] = useState<number>(0);
  const [dcrNonDcr, setDcrNonDcr] = useState<string>("");
  const [panelBrand, setPanelBrand] = useState<string>("");
  const [phase, setPhase] = useState<string>("");
  const [connectionType, setConnectionType] = useState<string>("");
  const [panelWattages, setPanelWattages] = useState<number[]>([]);



  const [showSystemSpecificationDetails, setShowSystemSpecificationDetails] = useState(false);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [isSaveCustomerButtonDisabled, setIsSaveCustomerButtonDisabled] = useState(false);
  const [isSaveConnectionButtonDisabled, setIsSaveConnectionButtonDisabled] = useState(false);
  const [isSaveInstallationButtonDisabled, setIsSaveInstallationButtonDisabled] = useState(false);

  

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

    let updatedValue: string | number = value;

    // Only parse numbers for relevant fields
    if (["monthlyAvgUnit", "solarSystemCost", "fabricationCost"].includes(name)) {
        const parsedValue = parseFloat(value);
        if (name === 'monthlyAvgUnit' && parsedValue < 0) {
            return; // Stops execution if value is negative
        }
        updatedValue = isNaN(parsedValue) ? value : parsedValue;
    }

    setFormData((prev) => {
        const updatedData = { 
            ...prev, 
            [name]: updatedValue
        };

        if (name === "govIdName") {
            updatedData.billedTo = value; // Copy value to "billedTo"
        }

        updatedData.effectiveCost =
            (updatedData.solarSystemCost || 0) +
            (updatedData.fabricationCost || 0);

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

  //   const handleSaveOrUpdate = async (e: React.FormEvent) => {
  //     e.preventDefault();
    
  //     try {
  //       if (isEditing) {
  //         if (!formData.customerId) {
  //           alert("Error: Customer ID is missing.");
  //           return;
  //         }
    
  //         const backendCustomerData = {
  //           govIdName: formData.consumerName, 
  //           mobileNumber: formData.consumerPhoneNumber, 
  //           emailAddress: formData.consumerEmail, 
  //         };
    
  //         console.log("Final data before update:", backendCustomerData); // Log data
    
  //         await updateConsumerPersonalDetails(formData.customerId, backendCustomerData);

  //         const backendConnectionData = {
  //           consumerId: formData.consumerNumber,
  //           connectionType: formData.connectionType,
  //           monthlyAvgConsumptionUnits:formData.monthlyAvgUnit,
  //           district: formData.districtCode,
  //           taluka: formData.talukaCode,
  //           village: formData.villageCode,
  //           postalCode: formData.pincode,
  //           billedTo: formData.billedTo,
  //           isMsebConnection: formData.isMsebConnection === "Yes",
  //           isNameCorrection: formData.isNameCorrection === "Yes", 
  //           phaseTypeId: formData.phase === "Three-Phase" ? 2 : 1,
  //           correctionTypeId: formData.isNameCorrection === "Yes" ? (formData.correctionType === "Spell Correction"   ? 11   : (formData.correctionType === "Transfer Ownership"  ? 12   : null) ) : null
  //         }

  //         console.log("Final data before update:", backendConnectionData);

  //         await updateConsumerConnectionDetails(formData.id, backendConnectionData);

  //         alert("Consumer-Connection details updated successfully!");
  //       } else {
  //         await handleSave();
  //       }
  //     } catch (error) {
  //       console.error("Error in update process:", error);
  //       alert("Failed to process the request");
  //     }
  //   };


  // useEffect(() => {
  //   if (consumer) {
  //     setIsEditing(true);
  //     const hasCorrection = !!consumer.correctionTypeId;

  //     setFormData({


  //       customerId: consumer.customerId,
  //       id: consumer.id,
  //       consumerNumber: consumer.consumerNumber || "",
  //       connectionType: consumer.connectionType || "",
  //       consumerName: consumer.consumerName || "",
  //       consumerEmail: consumer.consumerEmail || "",
  //       consumerPhoneNumber: consumer.consumerPhoneNumber || "",
  //       pincode: consumer.pincode || "",
  //       monthlyAvgUnit: consumer.monthlyAvgUnit || "",
  //       districtCode:consumer.district || "",
  //       talukaCode:consumer.taluka || "",
  //       villageCode:consumer.village || "",
  //       billedTo:consumer.billedTo || "",
  //       isMsebConnection: consumer.isMsebConnection === null ? "" : consumer.isMsebConnection ? "Yes" : "No",
  //       phase: consumer.phaseTypeId === 1   ? "Single-Phase"  : consumer.phaseTypeId === 2   ? "Three-Phase"  : "",
  //       //phase: consumer.phaseTypeName || "",
  //       isNameCorrection: hasCorrection ? "Yes" : "No", 
  //       correctionType: hasCorrection   ? consumer.correctionTypeId === 11     ? "Spell Correction"   : consumer.correctionTypeId === 12     ? "Transfer Ownership"     : null  : null,
  //       //correctionType: hasCorrection ? consumer.correctionName : "",
  // });

  //     setDistrictCode(consumer.district || 0);
  //     setTalukaCode(consumer.taluka || 0);
  //     setVillageCode(consumer.village || 0);
  //   }
  // }, [consumer]);

  const handleUpdateCustomer = async () => {
    if (!customerId) {
      console.error("Customer ID is missing!");
      alert("Customer ID is missing!"); // Show alert if customerId is missing
      return;
    }
  
    const updatedCustomerData = {
      govIdName: formData.govIdName,
      mobileNumber: formData.mobileNumber,
      emailAddress: formData.emailAddress,
    };
  
    try {
      const response = await updateConsumerPersonalDetails(customerId, updatedCustomerData);
      console.log("Customer details updated successfully:", response);
  
      alert("Customer details updated successfully!"); // Success alert
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer."); // Error alert
    }
  };

  const handleUpdateConnection = async () => {
    if (!connectionId) {
      console.error("Connection ID is missing!");
      alert("Connection ID is missing!"); // Show alert if connectionId is missing
      return;
    }
  
    const updatedConnectionData = {
      consumerId: formData.consumerId,
      isMsebConnection: formData.isMsebConnection === "Yes",
      isNameCorrectionRequired:
        formData.isNameCorrection === "Yes"
          ? correctionTypeMapping[formData.correctionType]
          : false,
      phaseTypeId: phaseTypeMapping[formData.phase],
      addressTypeId: addressTypeMapping[formData.addressType],
      connectionTypeId: connectionTypeMapping[formData.connectionType],
      correctionTypeId:
        formData.isNameCorrection === "Yes"
          ? correctionTypeMapping[formData.correctionType]
          : null,
      monthlyAvgConsumptionUnits: formData.monthlyAvgUnit,
      districtCode: formData.districtCode,
      talukaCode: formData.talukaCode,
      villageCode: formData.villageCode,
      postalCode: formData.pincode,
      gstIn: formData.gstIn,
      latitude: formData.latitude,
      longitude: formData.longitude,
      sectionId: formData.sectionId,
      billedTo: formData.billedTo,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
    };
  
    try {
      await updateConsumerConnectionDetails(connectionId, updatedConnectionData);
      console.log("Connection details updated successfully!");
      
      alert("Connection details updated successfully!"); // Success alert
    } catch (error) {
      console.error("Error updating connection details:", error);
      alert("Failed to update connection."); // Error alert
    }
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
    setpincode(value);
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

  // const handleInversionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   setInversionType(value);
  //   setFormData((prev) => ({
  //     ...prev,
  //     inversionType: value,
  //     batteryWattage: value === 'Hybrid' || value === 'With-Battery' ? prev.batteryWattage : NaN, // Reset battery wattage if not applicable
  //   }));
  //   setIsBatteryDropdownEnabled(value === 'Hybrid' || value === 'With-Battery'); // Enable battery dropdown for specific grid types

  // };


  // useEffect(() => {
  //   // Create a fake event that matches the expected event type
  //   const fakeEvent = {
  //     target: {
  //       value: isMsebConnection === 'Yes' ? 'On-Grid' : 'With-Battery',
  //     },
  //   } as React.ChangeEvent<HTMLSelectElement>; // Type assertion to ensure it matches ChangeEvent

  //   handleInversionTypeChange(fakeEvent); // Trigger the onChange handler programmatically
  // }, [isMsebConnection]);


  // useEffect(() => {
  //   if (formData.phase) {
  //     const fetchWattages = async () => {
  //       try {
  //         const wattages = await fetchPanelWattages(formData.phase);
  //         const sortedWattages = wattages.sort((a, b) => a - b); // Sort KW options in ascending order
  //         setKwOptions(sortedWattages);
  //         // Automatically set KW to the first available option, if any
  //         if (sortedWattages.length > 0) {
  //           setFormData((prev) => ({ ...prev, kw: sortedWattages[0] }));
  //         }
  //       } catch (err) {
  //         console.error('Error fetching panel wattages:', err);
  //         setError('Failed to fetch KW options');
  //       }
  //     };

  //     fetchWattages();
  //   }
  // }, [formData.phase]);


  // useEffect(() => {
  //   if (
  //     formData.connectionType &&
  //     formData.phase &&
  //     formData.dcrNonDcr &&
  //     formData.kw > 0
  //   ) {
  //     const fetchCostData = async () => {
  //       try {
  //         const costData = await calculateCosts({
  //           connectionType: formData.connectionType,
  //           phase: formData.phase,
  //           dcrNonDcr: formData.dcrNonDcr,
  //           kw: formData.kw,
  //         });

  //         setFormData(prev => ({
  //           ...prev,
  //           subsidy: costData.subsidy,
  //           solarCostSystem: costData.solarSystemCost,
  //           fabricationCost: costData.fabricationCost,
  //           effectiveCost:
  //             (costData.solarSystemCost || 0) +
  //             (costData.fabricationCost || 0) -
  //             (costData.subsidy || 0),
  //         }));
  //       } catch (err) {
  //         console.error('Error fetching cost data:', err);
  //         setError('Failed to fetch cost data');
  //       }
  //     };

  //     fetchCostData();
  //   }
  // }, [formData.connectionType, formData.phase, formData.dcrNonDcr, formData.kw]);




  // useEffect(() => {
  //   if (formData.monthlyAvgUnit && formData.phase) {
  //     const fetchKw = async () => {
  //       const kw = await calculateKw(formData.phase, formData.monthlyAvgUnit);
  //       if (kw !== null) {
  //         setFormData((prev) => ({
  //           ...prev,
  //           kw,
  //         }));
  //       } else {
  //         setError('Failed to calculate KW');
  //       }
  //     };

  //     fetchKw();
  //   }
  // }, [formData.monthlyAvgUnit, formData.phase]);


  // const handleSave = async () => {
  //   try {
  //     await saveDataToServer(formData); // Call the API
  //     alert('Data saved successfully!');
  //   } catch (error) {
  //     alert('Failed to save data.');
  //   }
  // };

  
  // const handlePreview = async () => {
  //   setIsPreviewLoading(true);
  //   try {
  //     const pdfBlob = await generateQuotationPDF(formData);
  //     const pdfUrl = URL.createObjectURL(pdfBlob);

  //     // Create a new window for the PDF popup
  //     const popupWindow = window.open('', '_blank', 'width=800,height=600');
  //     if (popupWindow) {
  //       popupWindow.document.write('<html><head><title>Quotation Preview</title></head><body>');
  //       popupWindow.document.write('<embed src="' + pdfUrl + '" type="application/pdf" width="100%" height="100%" />');
  //       popupWindow.document.write('</body></html>');
  //     } else {
  //       setError('Popup blocked. Please allow popups and try again.');
  //     }
  //   } catch (err) {
  //     setError('Failed to preview the quotation. Please try again.');
  //     console.error('Error:', err);
  //   } finally {
  //     setIsPreviewLoading(false);
  //   }
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  

  const handleOutOfStation = (event) => {
    const value = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      isOutOfStation: value,
      // Clear distance when "No" is selected
      distance: value === "Yes" ? prevData.distance : ''
    }));
  };
  
  const handleDistanceChange = (event) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      distance: value,
    }));
  };
  
  
  const handleSaveCustomer = async () => {
    
  
    const customerData = {
      govIdName: formData.govIdName,
      mobileNumber: formData.mobileNumber,
      emailAddress: formData.emailAddress,
    };
  
    try {
      const id = await saveCustomer(customerData);
      console.log("Returned customer id:", id); // Should log a valid number if successful
  
      if (id) {
        setCustomerId(id);
        setShowConnectionDetails(true);
        setIsSaveCustomerButtonDisabled(true);
      } else {
        console.error("No valid customer id returned");
        
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      
    }
  };
  
  
  const phaseTypeMapping = {
    'Single-Phase': 1,
    'Three-Phase': 2
  };

  const connectionTypeMapping = {
    'Residential': 1,
    'Commercial': 2,
    'Industrial': 3,
    'PWW': 4
  };

  const addressTypeMapping = {
    'Home': 1,
    'Hotel': 2,
    'Office': 3,
    'Charitable': 4,
    'Non_Commercial_Education': 5,
    'Street_Light': 6,
    'Construction': 7,
    'Public_Water_Works': 8
  };

  const correctionTypeMapping = {
    'Spell Correction': 1,
    'Transfer Ownership': 2,
  };



  

  const handleSaveConnection = async () => {
  

    // Convert "Yes" / "No" to boolean
    const isMsebConnection = formData.isMsebConnection === "Yes";
    const isNameCorrectionRequired = formData.isNameCorrection === "Yes"
      ? correctionTypeMapping[formData.correctionType] // 1 or 2 when "Yes"
      : false;

    const connectionData = {
      customerId, // Assuming customerId is in state
      consumerId: formData.consumerId,
      isMsebConnection, // Now a boolean
      isNameCorrectionRequired,
      phaseTypeId: phaseTypeMapping[formData.phase],
      addressTypeId: addressTypeMapping[formData.addressType],
      connectionTypeId: connectionTypeMapping[formData.connectionType],
      correctionTypeId: formData.isNameCorrection === "Yes"
        ? correctionTypeMapping[formData.correctionType]
        : null,
      monthlyAvgConsumptionUnits: formData.monthlyAvgUnit,
      districtCode: formData.districtCode,
      talukaCode: formData.talukaCode,
      villageCode: formData.villageCode,
      postalCode: formData.pincode,
      gstIn: formData.gstIn,
      latitude: formData.latitude,
      longitude: formData.longitude,
      sectionId: formData.sectionId,
      billedTo: formData.billedTo,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
    };

    try {
        const id = await saveConnection(connectionData);
        console.log("Returned connection id:", id);
        
        if (id) {
            setConnectionId(id);
            setShowInstallationDetails(true);
            setIsSaveConnectionButtonDisabled(true);
        } else {
            console.error("No valid connection id returned");
           
        }
    } catch (error) {
        console.error("Error saving connection:", error);
        
    }
};



  const installationSpaceMapping = {
    'Slab': 1,
    'Clay Tiles': 2,
    'Metal Sheets': 3,
    'Plastic Sheets': 4,
    'Bathroom Slab': 5,
    'Cement Sheets': 6,
    'On Ground': 7,
  };
  

  const handleSaveInstallation = async () => {
    const installationData = {
        connectionId,
        installationSpaceTypeId: installationSpaceMapping[formData.spaceType],
        availableEastWestLengthFt: formData.availableEastWestLengthFt,
        availableSouthNorthLengthFt: formData.availableSouthNorthLengthFt,
        acWireLengthFt: formData.acWireLengthFt,
        dcWireLengthFt: formData.dcWireLengthFt,
        earthingWireLengthFt: formData.earthingWireLengthFt,
        descriptionOfInstallation: formData.descriptionOfInstallation,
        numberOfGpPipes: formData.numberOfGpPipes,
    };

    try {
        const id = await saveInstallation(installationData);
        console.log("Returned installation id:", id);

        if (id) {
            // Add new installation to the list
            setSavedInstallations((prev) => [...prev, installationData]);

            const addAnother = window.confirm("Installation saved! Do you want to add another installation?");
            
            if (addAnother) {
                setIsSaveInstallationButtonDisabled(false); // Enable button for another installation
                return; // Exit function early
            }

            // If user selects "Cancel", fetch recommended details and disable button
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

            setIsSaveInstallationButtonDisabled(true); // Disable button after exiting "add another" loop
        } else {
            console.error("No valid installation id returned");
        }
    } catch (error) {
        console.error("Error saving installation:", error);
    }
};




  
  

  const handleSaveSystemSpecification = () => {
    // You can include any save logic here
    setShowCostDetails(true); // Show the additional div when button is clicked
  };

  const handleGetPrice = async () => {
    try {
      const requestData = {
        customerSelectedInstallationSpaceType: recommendedInstallationSpaceType,
        customerSelectedInstallationStructureType: recommendedInstallationStructureType,
        customerSelectedKW: recommendedKW,
        customerSelectedBrand: panelBrand,
        phase: phase,
        dcrNonDcr: dcrNonDcr,
        connectionType: connectionType,
      };

      console.log("Request Data:", requestData); // Debugging
  
      const priceDetails = await getPriceDetails(requestData);
  
      if (priceDetails) {
        setFormData((prev) => ({
          ...prev,
          solarSystemCost: priceDetails.solarSystemCost || 0,
          fabricationCost: priceDetails.fabricationCost || 0,
          //subsidy: priceDetails.subsidy || 0,
          effectiveCost:
            (priceDetails.solarSystemCost || 0) +
            (priceDetails.fabricationCost || 0),
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


      <h2 className="text-xl font-semibold text-gray-700">Customer Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              id="govIdName"
              name="govIdName"
              value={formData.govIdName}
              onChange={handleChange}
              placeholder="Name As per Gov Id"
              required
              pattern="^[A-Za-z]+\s[A-Za-z]+$" // Ensures it contains only first and last name
              title="Please enter only your first and last name (e.g., John Doe)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Mobile Number</label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="123456789"
              maxLength={10}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>


        </div>
        

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Name(optional)</label>
            <input
              type="text"
              name="preferredName"
              value={formData.preferredName}
              onChange={handleChange}
              placeholder="Enter the preferred name"
              maxLength={50} 
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="emailAddress"
              name="emailAddress"
              value={formData.emailAddress}
              maxLength={35}
              onChange={handleChange}
              placeholder="johndeo@example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

        </div>

        <div className="col-span-full">
  {!customerId ? (
    <button
      type="button"
      onClick={handleSaveCustomer}
      disabled={isSaveCustomerButtonDisabled}
      className={`px-4 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isSaveCustomerButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      Save Customer
    </button>
  ) : (
    <button
      type="button"
      onClick={handleUpdateCustomer}
      className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      Update Customer
    </button>
  )}
</div>



</div>


      {showConnectionDetails &&(<div className="space-y-6 md:col-span-2">
        <h2 className="text-xl font-semibold text-gray-700">Connection Details</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MSEB Connection Radio Buttons */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
            <input
              type="text"
              id="consumerId"
              name="consumerId"
              value={formData.consumerId}
              onChange={handleChange}
              placeholder="000000000000"
              disabled={isMsebConnection === 'No'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
              <input
                type="text"
                id="gstIn"
                name="gstIn"
                value={formData.gstIn}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                required
                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$"
                title="Please enter a valid GSTIN. It should be a 15-character code with a valid format (e.g., 27AAPFU0939F1ZV)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
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

        

          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              maxLength={60}
              onChange={handleChange}
              placeholder="123 Main St"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              maxLength={60}
              onChange={handleChange}
              placeholder="123 Main St"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

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



          <div>
            <label className="block text-sm font-medium text-gray-700">Phase Type</label>
            <select
              name="phase"
              id="phase"
              required
              value={formData.phase}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Single-Phase">Single-Phase</option>
              <option value="Three-Phase">Three-Phase</option>
            </select>
          </div>

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
            <label className="block text-sm font-medium text-gray-700">Address Type</label>
            <select
              name="addressType"
              id="addressType"
              value={formData.addressType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Hotel">Hotel</option>
              <option value="Charitable">Charitable</option>
              <option value="Non_Commercial_Education">Non-Commercial-Education</option>
              <option value="Street_Light">Street Light</option>
              <option value="Construction">Construction</option>
              <option value="Public_Water_Works">Public Water Works</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Average Unit</label>
            <input
              type="number"
              id="monthlyAvgUnit"
              name="monthlyAvgUnit"
              value={formData.monthlyAvgUnit ?? ""}
              onChange={handleChange}
              placeholder="ex. 120"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Section Id</label>
            <input
              type="text"
              id="sectionId"
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              placeholder="1234"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="45.90876"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="45.90876"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
                <option value="Spell Correction">Spell Correction</option>
                <option value="Transfer Ownership">Transfer Ownership</option>
              </select>
            </div>

            
          )}
        </div>

        <div>
  <label className="block text-sm font-medium text-gray-700">
    Is Out of Station?
  </label>
  <div className="mt-2 flex items-center space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="isOutOfStation"
        value="Yes"
        onChange={handleOutOfStation}
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
        checked={formData.isOutOfStation === "Yes"}
      />
      <span className="text-sm text-gray-700">Yes</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="isOutOfStation"
        value="No"
        onChange={handleOutOfStation}
        className="focus:ring-blue-500 text-blue-600 border-gray-300"
        checked={formData.isOutOfStation === "No"}
      />
      <span className="text-sm text-gray-700">No</span>
    </label>
  </div>

  {formData.isOutOfStation === "Yes" && (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">
        Enter Distance (in kms)
      </label>
      <input
        type="number"
        name="distance"
        value={formData.distance || ''}
        onChange={handleDistanceChange}
        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="Enter distance"
      />
    </div>
  )}
</div>


        </div>
        <div className="col-span-full">
  {!isSaveConnectionButtonDisabled ? (
    <button
      type="button"
      onClick={handleSaveConnection}
      disabled={isSaveConnectionButtonDisabled}
      className={`px-4 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isSaveConnectionButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      Save Connection
    </button>
  ) : (
    <button
      type="button"
      onClick={handleUpdateConnection}
      className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      Update Connection
    </button>
  )}
</div>

   </div>
  
  )}

   {showInstallationDetails && (<div className="space-y-6 md:col-span-2">

      <h2 className="text-xl font-semibold text-gray-700">Installation Details</h2>

      {savedInstallations.length > 0 && (
      <div className="border p-4 rounded-md bg-gray-100">
        <h3 className="text-lg font-semibold">Previously Saved Installations:</h3>
        <ul className="list-disc pl-5">
        {savedInstallations.map((installation, index) => {
        // Reverse mapping: Find the space type name from the ID
        const spaceTypeName = Object.keys(installationSpaceMapping).find(
          key => installationSpaceMapping[key] === installation.installationSpaceTypeId
        ) || "Unknown";

        return (
          <li key={index} className="border p-2 my-2 rounded-md bg-white shadow">
            <p><strong>Space Type:</strong> {spaceTypeName}</p>
            <p><strong>East-West Length:</strong> {installation.availableEastWestLengthFt} ft</p>
            <p><strong>South-North Length:</strong> {installation.availableSouthNorthLengthFt} ft</p>
            <p><strong>AC Wire Length:</strong> {installation.acWireLengthFt} ft</p>
            <p><strong>DC Wire Length:</strong> {installation.dcWireLengthFt} ft</p>
            <p><strong>Earthing Length:</strong> {installation.earthingWireLengthFt} ft</p>
            <p><strong>No. Of GP Pipes:</strong> {installation.numberOfGpPipes} </p>
            <p><strong>Description:</strong> {installation.descriptionOfInstallation} </p>
          </li>
        );
      })}
        </ul>
      </div>
    )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
            <label className="block text-sm font-medium text-gray-700">Space Type</label>
            <select
              name="spaceType"
              id="spaceType"
              value={formData.spaceType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">East-West-Length (Feet)</label>
            <input
              type="number"
              id="availableEastWestLengthFt"
              name="availableEastWestLengthFt"
              value={formData.availableEastWestLengthFt}
              placeholder='eg.10'
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">South-North-Length (Feet)</label>
            <input
              type="number"
              id="availableSouthNorthengthFt"
              name="availableSouthNorthLengthFt"
              value={formData.availableSouthNorthLengthFt}
              placeholder='eg.10'
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">AC Wire Length (Feet)</label>
            <input
              type="number"
              id="acWireLengthFt"
              name="acWireLengthFt"
              value={formData.acWireLengthFt}
              placeholder='eg.10'
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">DC Wire Length (Feet)</label>
            <input
              type="number"
              id="dcWireLengthFt"
              name="dcWireLengthFt"
              value={formData.dcWireLengthFt}
              placeholder='eg.10'
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Earthing Wire Length (Feet)</label>
            <input
              type="number"
              id="earthingWireLengthFt"
              name="earthingWireLengthFt"
              value={formData.earthingWireLengthFt}
              placeholder='eg.10'
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">No. of GP Pipes</label>
            <input
              type="number"
              id="numberOfGpPipes"
              name="numberOfGpPipes"
              value={formData.numberOfGpPipes}
              placeholder='eg.10'
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description about Installation</label>
            <input
              type="text"
              id="descriptionOfInstallation"
              name="descriptionOfInstallation"
              value={formData.descriptionOfInstallation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-full">
    <button
      type="button"
      onClick={handleSaveInstallation}
      disabled={isSaveInstallationButtonDisabled} // Disable button when clicked
      className={`px-4 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isSaveInstallationButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      {isSaveInstallationButtonDisabled ? "Save Installation" : "Save Installation"}
    </button>
  </div>
        
      </div>
      </div>)}
            
            
            {showSystemSpecificationDetails &&(
            <div>
          <div className="space-y-6 md:col-span-2">

        <h2 className="text-xl font-semibold text-gray-700">System Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <label className="block text-sm font-medium text-gray-700">Recommended Installation Space Type</label>
            <select
              //type="text"
              id="recommendedInstallationSpaceType"
              name="recommendedInstallationSpaceType"
              value={formData.recommendedInstallationSpaceType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
              //type="text"
              id="recommendedInstallationStructureType"
              name="recommendedInstallationStructureType"
              value={formData.recommendedInstallationStructureType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="Sova">Sova</option>
              <option value="En-Icon">En-Icon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">DCR/Non-DCR</label>
            <select
                id="dcrNonDcr"
                name="dcrNonDcr"
                value={dcrNonDcr} // Set from backend data
                onChange={(e) => setDcrNonDcr(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Get Price
        </button>
      </div>


          {/*<div>
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
          </div>*/}

          {/*<div>
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
          </div>*/}


          {/* Grid Type Dropdown */}
          {/* <div>
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
          </div> */}


          {/* Battery Wattage Dropdown */}
          {/* <div>
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
          </div> */}


        </div>
      </div>
      </div>)}


{showCostDetails &&(
      <div className="space-y-6 md:col-span-2">
        <h2 className="text-xl font-semibold text-gray-700">Cost Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Solar Cost System</label>
            <input
              type="number"
              id="solarSystemCost"
              name="solarSystemCost"
              value={formData.solarSystemCost}
              onChange={handleChange}
              placeholder="Enter Solar Cost System"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700">Fabrication Cost</label>
            <input
              type="number"
              name="fabricationCost"
              id="fabricationCost"
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
              id="effectiveCost"
              value={formData.effectiveCost}
              onChange={handleChange}
              placeholder="Enter Effective Cost"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      

      {/* <h2 className="text-xl font-semibold text-gray-700">Finance Details</h2>

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
      </div> */}
      <div className="flex space-x-4">
  <button
    type="button"
    onClick={handlePreview}
    className="hidden md:block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    disabled={isPreviewLoading}
  >
    {isPreviewLoading ? "Previewing..." : "Preview Quotation"}
  </button>

  <button
    type="submit"
    onClick={handleGenerateQuotation}
    disabled={isLoading}
    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? "Generating..." : "Generate Quotation"}
  </button>
</div>


      </div>
    )}
      
      

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

{/*<button
  type="button"
  onClick={handleSaveOrUpdate}
  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
>
  {isEditing ? "Update" : "Save"}
</button>*/}

        {/*<button
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
        </button>*/}

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