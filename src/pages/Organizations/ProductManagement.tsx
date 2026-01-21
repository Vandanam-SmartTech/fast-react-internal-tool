import React, { useState, useEffect, useCallback } from "react";
import Card, { CardBody } from "../../components/ui/Card";
import { BatteryCharging, PanelTop, CircuitBoard, Hammer } from 'lucide-react';
import {
  addBatteryBrand, fetchAllBatteryBrands, addBatterySpec, fetchBatterySpecs, getMaterialOrigins,
  updateBatteryBrand, updateBatterySpec, fetchAllInverterBrands, addInverterBrand, addPanelBrand, addPanelType, addPanelSpec,
  fetchAllPanelBrands, fetchPanelTypes, fetchPanelSpecsByBrand, updatePanelBrand, updatePanelType, updatePanelSpec,
  fetchInverterSpecsByBrand, updateInverterSpec, updateInverterBrand, addInverterSpec, getGridTypes,
  addBatterySpecForOrg, addPanelSpecForOrg, addInverterSpecForOrg, fetchAllPipeBrands, addPipeSpec, fetchPipeSpecsByBrand, addPipeBrand, updatePipeBrand,
  updatePipeSpec, addPipeSpecForOrg, fetchSelectedBatterySpecs, fetchSelectedPanelSpecs, fetchInverterBrandCapacities, fetchPipeSpecification, updateSelectedBatterySpec,
  updateSelectedPanelSpec, updateSelectedInverterSpec, updateSelectedPipeSpec
} from "../../services/quotationService";
import { fetchPhaseType } from "../../services/customerRequisitionService";
import { useUser } from "../../contexts/UserContext";

import { toast } from "react-toastify";


const ProductManagement: React.FC = () => {

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { userClaims } = useUser();
  const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");

  const handleSectionClick = async (section: string) => {
    setActiveSection(section);

    // Battery Section
    if (section === "battery") {
      const data = await fetchAllBatteryBrands();
      if (data) setBatteryBrands(data);
    }

    // Inverter Section
    if (section === "inverter") {
      const inverterData = await fetchAllInverterBrands();
      if (inverterData) setInverterBrands(inverterData);
    }

    // Panel Section (NEW)
    if (section === "panel") {
      const brandData = await fetchAllPanelBrands();
      if (brandData) setPanelBrands(brandData);

      const typeData = await fetchPanelTypes();
      if (typeData) setPanelTypes(typeData);
    }

    if (section === "pipe") {
      const pipeData = await fetchAllPipeBrands();
      if (pipeData) setPipes(pipeData);
    }
  };

  {/*-------------------------------Battery Operations------------------------------------------*/ }
  const [brandName, setBrandName] = React.useState("");
  const [batteryBrands, setBatteryBrands] = React.useState<any[]>([]);
  const [, setShowFormForBrand] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecId, setEditingSpecId] = useState<number | null>(null);
  const [expandedBrandId, setExpandedBrandId] = useState<number | null>(null);
  const [showSpecModal, setShowSpecModal] = useState(false);

  const [isEditingBatteryBrand, setIsEditingBatteryBrand] = useState(false);
  const [currentBrandId, setCurrentBrandId] = useState<number | null>(null);
  const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null);

  const isSuperAdmin =
    userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN");

  const isOrgAdmin =
    userInfo?.role === "ROLE_ORG_ADMIN";

  const isOrgAdminSelectMode =
    isOrgAdmin && selectedSpecId !== null;

  const [newSpec, setNewSpec] = useState({
    wattage: "",
    voltage: "",
    totalAh: "",
    chargingCurrent: "",
    dischargingCurrent: "",
    productWarranty: "",
    modelNumber: "",
    basePrice: "",
    description: "",
    mfgMonthYear: "",
  });

  const resetBatteryBrandForm = () => {
    setIsEditingBatteryBrand(false);
    setCurrentBrandId(null);
    setBrandName("");
    setEditingBrandId(null);
    setEditedName("");
  };


  const openAddSpecForm = (brandId: number) => {
    setExpandedBrandId(brandId);
    setShowFormForBrand(brandId);
    setEditingSpecId(null);
    resetSpecForm();
    setShowSpecModal(true);
  };


  const resetSpecForm = () => {
    setNewSpec({
      wattage: "",
      voltage: "",
      totalAh: "",
      chargingCurrent: "",
      dischargingCurrent: "",
      productWarranty: "",
      modelNumber: "",
      description: "",
      basePrice: "",
      mfgMonthYear: "",
    });
  };

  const [brandSpecs, setBrandSpecs] = useState<Record<number, any[]>>({});
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");


  const handleEditBrand = (brand: any) => {
    setIsEditingBatteryBrand(true);     // editing
    setCurrentBrandId(brand.id);        // store ID
    setBrandName(brand.brandName);      // prefill
    setShowAddModal(true);              // open modal
  };

  const handleAddBrand = async () => {
    if (!brandName.trim()) {
      toast.error("Brand name is required", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    const payload = { brandName };

    const result = await addBatteryBrand(payload);

    if (result) {


      const data = await fetchAllBatteryBrands();
      if (data) setBatteryBrands(data);

      toast.success("Battery brand added", {
        autoClose: 1000,
        hideProgressBar: true
      });

      setBrandName("");
      setShowAddModal(false);
    }
  };

  const handleSaveBrand = async (brandId: number) => {
    if (!brandName.trim()) {
      toast.error("Brand name is required", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    const res = await updateBatteryBrand(String(brandId), brandName);

    if (res) {
      const data = await fetchAllBatteryBrands();
      if (data) setBatteryBrands(data);

      toast.success("Battery brand updated!", {
        autoClose: 1000,
        hideProgressBar: true
      });

      setShowAddModal(false);
      setBrandName("");
      setCurrentBrandId(null);
      setIsEditingBatteryBrand(false);
    }
  };

  const handleUpdateBrand = async () => {
    const res = await updatePanelBrand(
      editingPanelBrandId!,
      brandFullname,
      brandShortname
    );

    if (res) {
      toast.success("Panel brand updated!", { autoClose: 1000, hideProgressBar: true });


      const brandData = await fetchAllPanelBrands();
      if (brandData) setPanelBrands(brandData);

      setShowPanelBrandModal(false);
      setIsEditingBrand(false);
    }
  };

  const numberFields = [
    "wattage",
    "voltage",
    "totalAh",
    "chargingCurrent",
    "dischargingCurrent",
    "basePrice",
    "inverterCapacity",
    "minPvVoltage",
    "maxPvVoltage",
    "numMppts",
    "numStringsPerMppt",
    "minBatteryVoltage",
    "maxBatteryVoltage",
    "maxPvInputCurrentAmps",
    "batteryChargingCurrentAmps",
    "maxOutputCurrentAmps",
    "overallEfficiencyPercent",
    "mpptEfficiencyPercent",
  ];

  const dateFields = [
    "mfgMonthYear",
  ];

  const handleSpecInputChange = (key: string, value: string) => {
    if (value === "") {
      setNewSpec((prev) => ({ ...prev, [key]: value }));
      return;
    }

    if (dateFields.includes(key)) {
      setNewSpec((prev) => ({ ...prev, [key]: value }));
      return;
    }

    if (numberFields.includes(key)) {
      const num = Number(value);

      if (Number.isNaN(num) || num < 0) return;

      setNewSpec((prev) => ({ ...prev, [key]: num }));
      return;
    }

    setNewSpec((prev) => ({ ...prev, [key]: value }));
  };




  const handleEditSpec = (spec: any) => {
    setEditingSpecId(spec.id);
    setNewSpec({ ...spec });   // Autofill form
  };

  const validateSpecForm = () => {
    const requiredNumberFields = [
      "wattage",
      "voltage",
      "totalAh",
      "chargingCurrent",
      "dischargingCurrent",
    ];

    const requiredTextFields = [
      "modelNumber",
      "productWarranty",
    ];

    // Check numeric fields
    for (const field of requiredNumberFields) {
      const value = Number(newSpec[field as keyof typeof newSpec]);
      if (!value || value < 0) {
        toast.error(`${field} must be 0 or greater than 0`);
        return false;
      }
    }

    // Check text fields
    for (const field of requiredTextFields) {
      const value = newSpec[field as keyof typeof newSpec];
      if (!value || String(value).trim() === "") {
        toast.error(`${field} is required`);
        return false;
      }
    }

    return true;
  };


  const handleAddNewSpec = async (brandId: number) => {

    if (!validateSpecForm()) return;

    const payload = {
      wattage: Number(newSpec.wattage),
      voltage: Number(newSpec.voltage),
      totalAh: Number(newSpec.totalAh),
      chargingCurrent: Number(newSpec.chargingCurrent),
      dischargingCurrent: Number(newSpec.dischargingCurrent),
      productWarranty: newSpec.productWarranty,
      modelNumber: newSpec.modelNumber,
      description: newSpec.description,
    };

    const res = await addBatterySpec(brandId, payload);

    if (res) {
      toast.success("New battery specification added!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      const updated = await fetchBatterySpecs(brandId);
      setBrandSpecs((prev) => ({ ...prev, [brandId]: updated }));

      resetSpecForm();
      setShowSpecModal(false);
    }
  };


  const handleUpdateSpec = async (specId: number, brandId: number) => {

    if (!validateSpecForm()) return;

    const payload = {
      ...newSpec,
      wattage: Number(newSpec.wattage),
      voltage: Number(newSpec.voltage),
      totalAh: Number(newSpec.totalAh),
      chargingCurrent: Number(newSpec.chargingCurrent),
      dischargingCurrent: Number(newSpec.dischargingCurrent),
      productWarranty: newSpec.productWarranty,
      modelNumber: newSpec.modelNumber,
    };

    const res = await updateBatterySpec(specId, brandId, payload);

    if (res) {
      toast.success("Battery specification updated!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

      const updated = await fetchBatterySpecs(brandId);
      setBrandSpecs((prev) => ({ ...prev, [brandId]: updated }));

      setEditingSpecId(null);
      resetSpecForm();
      setShowSpecModal(false);
    }
  };

  const handleSelectBatterySpecs = async () => {
    if (!selectedSpecId) {
      toast.error("No battery specification selected");
      return;
    }

    // 🔒 Validation
    if (!newSpec.basePrice || Number(newSpec.basePrice) < 0) {
      toast.error("Base price must be greater than 0");
      return;
    }

    const payload = {
      batterySpecsId: selectedSpecId,
      orgId: userInfo.orgId,
      basePrice: Number(newSpec.basePrice),
      mfgMonthYear: newSpec.mfgMonthYear,
    };

    const response = await addBatterySpecForOrg(payload);

    if (response) {
      toast.success("Battery specification selected successfully", {
        autoClose: 1200,
        hideProgressBar: true,
      });

      await loadSelectedBatteries();

      setShowSpecModal(false);
      setSelectedSpecId(null);
    }
  };


  const [selectedBatterySpecs, setSelectedBatterySpecs] = useState<any[]>([]);
  const [expandedSelectedBrand, setExpandedSelectedBrand] = useState<string | null>(null);
  const [showSelectedBrands, setShowSelectedBrands] = useState(true);



  const groupByBrand = (data: any[]) => {
    return data.reduce((acc: any, item: any) => {
      if (!acc[item.brandName]) {
        acc[item.brandName] = {
          brandId: item.brandId,
          brandName: item.brandName,
          selectedSpecs: [],
        };
      }
      acc[item.brandName].selectedSpecs.push(item);
      return acc;
    }, {});
  };

  const loadSelectedBatteries = async () => {
    const data = await fetchSelectedBatterySpecs(userInfo.orgId);
    setSelectedBatterySpecs(data);
  };

  useEffect(() => {
    if (userInfo.orgId) {
      loadSelectedBatteries();
    }
  }, [userInfo.orgId]);


  const hasSelectedBatteries = selectedBatterySpecs.length > 0;

  const [editingSelectedSpecId, setEditingSelectedSpecId] = useState<number | null>(null);
  const [selectedOrgBatterySpecId, setSelectedOrgBatterySpecId] = useState<number | null>(null);
  const [showSelectedSpecModal, setShowSelectedSpecModal] = useState(false);

  const handleEditSelectedSpec = (spec: any) => {
    setEditingSelectedSpecId(spec.id);
    setSelectedOrgBatterySpecId(spec.batterySpecsId);
    setNewSpec({ ...spec });   // Autofill form
  };

  const validateSelectedSpecUpdate = () => {
    if (!editingSelectedSpecId) {
      toast.error("No specification selected for update");
      return false;
    }

    if (!userInfo?.orgId) {
      toast.error("Organization not found");
      return false;
    }

    if (!newSpec.basePrice || Number(newSpec.basePrice) < 0) {
      toast.error("Base price must be greater than 0");
      return false;
    }


    if (!selectedOrgBatterySpecId) {
      toast.error("Battery specification not selected");
      return false;
    }

    return true;
  };


  const buildSelectedSpecUpdatePayload = () => ({
    selectedBatterySpecId: editingSelectedSpecId,
    orgId: userInfo?.orgId,
    basePrice: Number(newSpec.basePrice),
    mfgMonthYear: newSpec.mfgMonthYear,
    batterySpecsId: selectedOrgBatterySpecId,
  });




  {/*--------------------------Inverter Operations----------------------------------------*/ }

  const [inverterBrands, setInverterBrands] = React.useState<any[]>([]);
  const [inverterBrandName, setInverterBrandName] = React.useState("");
  const [, setShowFormForInverterBrand] = useState<number | null>(null);
  const [showAddModalForInverterBrand, setShowAddModalForInverterBrand] = useState(false);
  const [isEditingInverterBrand, setIsEditingInverterBrand] = useState(false);
  const [expandedInverterBrandId, setExpandedInverterBrandId] = useState<number | null>(null);
  const [editingInverterBrandId, setEditingInverterBrandId] = useState<number | null>(null);
  const [editingInverterSpecId, setEditingInverterSpecId] = useState<string | null>(null);
  const [showInverterSpecModal, setShowInverterSpecModal] = useState(false);
  const [inverterBrandSpecs, setInverterBrandSpecs] = useState<Record<number, any[]>>({});
  const [phases, setPhases] = useState<any[]>([]);
  const [grids, setGrids] = useState<any[]>([]);
  const [selectedInverterSpecId, setSelectedInverterSpecId] = useState<number | null>(null);

  const isOrgAdminSelectModeForInverter =
    isOrgAdmin && selectedInverterSpecId !== null;
  const resetInverterSpecForm = () => {
    setNewInverterSpec({
      inverterBrandId: "",
      inverterCapacity: "",
      phaseTypeId: "",
      gridTypeId: "",
      almmModelNumber: "",
      minPvVoltage: "",
      numMppts: "",
      maxPvVoltage: "",
      numStringsPerMppt: "",
      minBatteryVoltage: "",
      maxBatteryVoltage: "",
      maxPvInputCurrentAmps: "",
      batteryChargingCurrentAmps: "",
      maxOutputCurrentAmps: "",
      overallEfficiencyPercent: "",
      mpptEfficiencyPercent: "",
      basePrice: "",
      productWarranty: "",
    });
  };

  const [newInverterSpec, setNewInverterSpec] = useState({
    inverterBrandId: "",
    inverterCapacity: "",
    phaseTypeId: "",
    gridTypeId: "",
    almmModelNumber: "",
    minPvVoltage: "",
    numMppts: "",
    maxPvVoltage: "",
    numStringsPerMppt: "",
    minBatteryVoltage: "",
    maxBatteryVoltage: "",
    maxPvInputCurrentAmps: "",
    batteryChargingCurrentAmps: "",
    maxOutputCurrentAmps: "",
    overallEfficiencyPercent: "",
    mpptEfficiencyPercent: "",
    basePrice: "",
    productWarranty: "",
  });

  const handleAddInverterBrand = async () => {
    if (!inverterBrandName) {
      toast.error("Please fill all fields", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    const payload = {
      inverterBrandName
    };

    const res = await addInverterBrand(payload);

    if (res) {

      setInverterBrandName("");
      setShowAddModalForInverterBrand(false);

      const data = await fetchAllInverterBrands();
      if (data) setInverterBrands(data);

      toast.success("Inverter brand added!", {
        autoClose: 1000,
        hideProgressBar: true
      });
    }
  };

  const handleUpdateInverterBrand = async () => {
    const res = await updateInverterBrand(
      editingInverterBrandId!,
      inverterBrandName
    );

    if (res) {
      toast.success("Inverter brand updated!", { autoClose: 1000, hideProgressBar: true });


      const inverterData = await fetchAllInverterBrands();
      if (inverterData) setInverterBrands(inverterData);

      setInverterBrandName("");
      setShowAddModalForInverterBrand(false);

      setIsEditingInverterBrand(false);
    }
  };

  const openAddInverterSpecForm = (inverterBrandId: number) => {
    setExpandedInverterBrandId(inverterBrandId);
    setShowFormForInverterBrand(inverterBrandId);
    setEditingInverterSpecId(null);
    resetInverterSpecForm();
    setShowInverterSpecModal(true);
  };

  const handleInverterSpecInputChange = (key: string, value: string) => {
    if (value === "") {
      setNewInverterSpec((prev) => ({ ...prev, [key]: value }));
      return;
    }

    if (numberFields.includes(key)) {
      const num = Number(value);

      if (Number.isNaN(num) || num < 0) return;

      setNewInverterSpec((prev) => ({ ...prev, [key]: num }));
      return;
    }
    setNewInverterSpec((prev) => ({ ...prev, [key]: value }));
  };



  const handleEditInverterSpec = (inverterSpec: any) => {
    setEditingInverterSpecId(inverterSpec.id);
    setNewInverterSpec({ ...inverterSpec });   // Autofill form
  };

  const validateInverterSpecForm = () => {
    const requiredNumberFields = [
      "inverterCapacity",
      "minPvVoltage",
      "maxPvVoltage",
      "numMppts",
      "numStringsPerMppt",
      "maxPvInputCurrentAmps",
      "maxOutputCurrentAmps",
      "overallEfficiencyPercent",
      "mpptEfficiencyPercent",
    ];

    const requiredTextFields = [
      "almmModelNumber",
      "productWarranty",
    ];

    // Check numeric fields
    for (const field of requiredNumberFields) {
      const value = Number(newInverterSpec[field as keyof typeof newInverterSpec]);
      if (!value || value < 0) {
        toast.error(`${field} must be 0 or greater than 0`);
        return false;
      }
    }

    // Check text fields
    for (const field of requiredTextFields) {
      const value = newInverterSpec[field as keyof typeof newInverterSpec];
      if (!value || String(value).trim() === "") {
        toast.error(`${field} is required`);
        return false;
      }
    }

    return true;
  };

  const handleUpdateInverterSpec = async (inverterSpecId: number, inverterBrandId: number) => {

    if (!validateInverterSpecForm()) return;

    const payload = {
      inverterBrandId: inverterBrandId,
      inverterCapacity: Number(newInverterSpec.inverterCapacity),
      phaseTypeId: Number(newInverterSpec.phaseTypeId),
      gridTypeId: Number(newInverterSpec.gridTypeId),
      almmModelNumber: newInverterSpec.almmModelNumber,
      minPvVoltage: Number(newInverterSpec.minPvVoltage),
      numMppts: Number(newInverterSpec.numMppts),
      maxPvVoltage: Number(newInverterSpec.maxPvVoltage),
      numStringsPerMppt: Number(newInverterSpec.numStringsPerMppt),
      minBatteryVoltage: Number(newInverterSpec.minBatteryVoltage),
      maxBatteryVoltage: Number(newInverterSpec.maxBatteryVoltage),
      maxPvInputCurrentAmps: Number(newInverterSpec.maxPvInputCurrentAmps),
      batteryChargingCurrentAmps: Number(newInverterSpec.batteryChargingCurrentAmps),
      maxOutputCurrentAmps: Number(newInverterSpec.maxOutputCurrentAmps),
      overallEfficiencyPercent: Number(newInverterSpec.overallEfficiencyPercent),
      mpptEfficiencyPercent: Number(newInverterSpec.mpptEfficiencyPercent),
      productWarranty: newInverterSpec.productWarranty,
    };

    const res = await updateInverterSpec(inverterSpecId, payload);

    if (res) {
      const updated = await fetchInverterSpecsByBrand(inverterBrandId);
      setInverterBrandSpecs((prev) => ({ ...prev, [inverterBrandId]: updated }));

      setEditingInverterSpecId(null);
      resetInverterSpecForm();
      setShowInverterSpecModal(false)

      toast.success("Specification updated!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  };


  const handleAddNewInverterSpec = async (inverterBrandId: number) => {

    if (!validateInverterSpecForm()) return;
    
    const payload = {
      inverterBrandId: inverterBrandId,
      inverterCapacity: Number(newInverterSpec.inverterCapacity),
      phaseTypeId: Number(newInverterSpec.phaseTypeId),
      gridTypeId: Number(newInverterSpec.gridTypeId),
      almmModelNumber: newInverterSpec.almmModelNumber,
      minPvVoltage: Number(newInverterSpec.minPvVoltage),
      numMppts: Number(newInverterSpec.numMppts),
      maxPvVoltage: Number(newInverterSpec.maxPvVoltage),
      numStringsPerMppt: Number(newInverterSpec.numStringsPerMppt),
      minBatteryVoltage: Number(newInverterSpec.minBatteryVoltage),
      maxBatteryVoltage: Number(newInverterSpec.maxBatteryVoltage),
      maxPvInputCurrentAmps: Number(newInverterSpec.maxPvInputCurrentAmps),
      batteryChargingCurrentAmps: Number(newInverterSpec.batteryChargingCurrentAmps),
      maxOutputCurrentAmps: Number(newInverterSpec.maxOutputCurrentAmps),
      overallEfficiencyPercent: Number(newInverterSpec.overallEfficiencyPercent),
      mpptEfficiencyPercent: Number(newInverterSpec.mpptEfficiencyPercent),
      productWarranty: newInverterSpec.productWarranty
    };

    const res = await addInverterSpec(payload);

    if (res) {
      const updated = await fetchInverterSpecsByBrand(inverterBrandId);
      setInverterBrandSpecs((prev) => ({ ...prev, [inverterBrandId]: updated }));

      resetInverterSpecForm();
      setShowInverterSpecModal(false)

      toast.success("New inverter specification added!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  };

  const handleSelectInverterSpecs = async () => {
    if (!selectedInverterSpecId) {
      toast.error("No inverter specification selected");
      return;
    }

    const payload = {
      inverterSpecsId: selectedInverterSpecId,
      orgId: userInfo.orgId,
      basePrice: newInverterSpec.basePrice,
    };

    const response = await addInverterSpecForOrg(payload);

    await loadSelectedInverters();

    if (response) {
      toast.success("Inverter specification selected successfully", {
        autoClose: 1200,
        hideProgressBar: true,
      });

      setShowInverterSpecModal(false);
      setSelectedInverterSpecId(null);
    }
  };


  const [selectedInverterSpecs, setSelectedInverterSpecs] = useState<any[]>([]);
  const [expandedSelectedInverterBrand, setExpandedSelectedInverterBrand] =
    useState<number | null>(null);

  const [showSelectedInverterBrands, setShowSelectedInverterBrands] = useState(true);


  const groupByInverterBrand = (data: any[]) => {
    return data.reduce((acc: any, item: any) => {
      const brandId = item.inverterBrandId;

      if (!acc[brandId]) {
        acc[brandId] = {
          inverterBrandId: brandId,
          inverterBrandName: item.inverterBrandName,
          selectedInverterSpecs: [],
        };
      }

      acc[brandId].selectedInverterSpecs.push(item);
      return acc;
    }, {});
  };


  const loadSelectedInverters = useCallback(async () => {
    if (!userInfo?.orgId) return;

    const data = await fetchInverterBrandCapacities(
      undefined,      // inverterBrandId
      userInfo.orgId  // orgId
    );
    setSelectedInverterSpecs(data);
  }, [userInfo?.orgId]);

  useEffect(() => {
    loadSelectedInverters();
  }, [loadSelectedInverters]);


  const hasSelectedInverters = selectedInverterSpecs.length > 0;


  const [editingSelectedInverterSpecId, setEditingSelectedInverterSpecId] = useState<number | null>(null);
  const [selectedOrgInverterSpecId, setSelectedOrgInverterSpecId] = useState<number | null>(null);
  const [showSelectedInverterSpecModal, setShowSelectedInverterSpecModal] = useState(false);

  const handleEditSelectedInverterSpec = (inverterSpec: any) => {
    setEditingSelectedInverterSpecId(inverterSpec.id);
    setSelectedOrgInverterSpecId(inverterSpec.inverterSpecsId);
    setNewInverterSpec({ ...inverterSpec });   // Autofill form
  };

  const buildSelectedInverterSpecUpdatePayload = () => ({
    selectedInverterSpecId: editingSelectedInverterSpecId,
    orgId: userInfo?.orgId,
    basePrice: Number(newInverterSpec.basePrice),
    inverterSpecsId: selectedOrgInverterSpecId,
  });



  {/*---------------------------Panel Type Operations----------------------------------------*/ }
  const [panelTypes, setPanelTypes] = useState<
    {
      id: number;
      typeName: string;
      typeDescription: string;
      typicalEfficiency: string;
      yearIntroduced: string;
    }[]
  >([]);

  const [showPanelTypes, setShowPanelTypes] = useState(false);
  const [showAddPanelTypeModal, setShowAddPanelTypeModal] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [typicalEfficiency, setTypicalEfficiency] = useState("");
  const [yearIntroduced, setYearIntroduced] = useState("");
  const [editingPanelType, setEditingPanelType] = useState<{
    id: number;
    typeName: string;
    typeDescription: string;
    typicalEfficiency: string;
    yearIntroduced: string;
  } | null>(null);

  useEffect(() => {
    const fetchPhaseTypes = async () => {
      const data = await fetchPhaseType();
      if (data) setPhases(data);
    };

    fetchPhaseTypes();
  }, []);

  useEffect(() => {
    const fetchGridTypes = async () => {
      const data = await getGridTypes();
      if (data) setGrids(data);
    };

    fetchGridTypes();
  }, []);


  const handleAddPanelType = async () => {
    if (!typeName || !typicalEfficiency || !yearIntroduced) {
      toast.error("Please fill required fields", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    const payload = {
      typeName,
      typeDescription,
      typicalEfficiency: Number(typicalEfficiency),
      yearIntroduced: Number(yearIntroduced),
    };

    const res = await addPanelType(payload);

    const typeData = await fetchPanelTypes();
    if (typeData) setPanelTypes(typeData);

    if (res) {
      toast.success("Panel type added!", {
        autoClose: 1000,
        hideProgressBar: true
      });
      setTypeName("");
      setTypeDescription("");
      setTypicalEfficiency("");
      setYearIntroduced("");

      setShowAddPanelTypeModal(false);
    }
  };

  const handleUpdatePanelType = async () => {
    if (!editingPanelType) return;

    const result = await updatePanelType(
      editingPanelType.id,
      typeName,
      typeDescription,
      typicalEfficiency,
      yearIntroduced
    );

    if (!result) return;

    toast.success("Panel type updated", {
      autoClose: 1000,
      hideProgressBar: true
    });

    // Refresh list
    const typeData = await fetchPanelTypes();
    if (typeData) setPanelTypes(typeData);

    // Reset form
    setEditingPanelType(null);
    setTypeName("");
    setTypeDescription("");
    setTypicalEfficiency("");
    setYearIntroduced("");

    setShowAddPanelTypeModal(false);
  };


  {/*---------------------------Panel Brand Operations----------------------------------------*/ }
  const [panelBrands, setPanelBrands] = React.useState<any[]>([]);
  const [showPanelBrandModal, setShowPanelBrandModal] = useState(false);
  const [brandFullname, setBrandFullname] = useState("");
  const [brandShortname, setBrandShortname] = useState("");
  const [expandedPanelBrandId, setExpandedPanelBrandId] = useState<number | null>(null);
  const [panelBrandSpecs, setPanelBrandSpecs] = useState<Record<number, any[]>>({});
  const [, setShowFormForPanelBrand] = useState<number | null>(null);
  const [editingPanelSpecId, setEditingPanelSpecId] = useState<number | null>(null);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editingPanelBrandId, setEditingPanelBrandId] = useState<number | null>(null);
  const [showPanelSpecModal, setShowPanelSpecModal] = useState(false);
  const [origins, setOrigins] = useState<any[]>([]);

  const [selectedPanelSpecId, setSelectedPanelSpecId] = useState<number | null>(null);

  const isOrgAdminSelectModeForPanel =
    isOrgAdmin && selectedPanelSpecId !== null;

  const [newPanelSpec, setNewPanelSpec] = useState({
    ratedWattageW: "",
    productWarrantyYrs: "",
    efficiencyWarrantyYrs: "",
    panelBrandId: "",
    panelTypeId: "",
    materialOriginId: "",
    basePrice: "",
    annualYieldUnitsPerKw: "",
    openCircuitVolts: "",
    shortCircuitAmps: "",
    maxPowerVolts: "",
    maxPowerAmps: "",
    modelNumber: "",
    efficiencyPercentage: "",
  });

  const openAddPanelSpecForm = (panelBrandId: number) => {
    setExpandedPanelBrandId(panelBrandId);
    setShowFormForPanelBrand(panelBrandId);
    setEditingPanelSpecId(null);
    setShowPanelSpecModal(true);
    resetPanelSpecForm();
  };

  const resetPanelSpecForm = () => {
    setNewPanelSpec({
      ratedWattageW: "",
      productWarrantyYrs: "",
      efficiencyWarrantyYrs: "",
      panelBrandId: "",
      panelTypeId: "",
      materialOriginId: "",
      basePrice: "",
      annualYieldUnitsPerKw: "",
      openCircuitVolts: "",
      shortCircuitAmps: "",
      maxPowerVolts: "",
      maxPowerAmps: "",
      modelNumber: "",
      efficiencyPercentage: "",

    });
  };


  const handlePanelSpecInputChange = (key: string, value: string | number) => {
    setNewPanelSpec((prev) => ({ ...prev, [key]: value }));
  };


  const handleEditPanelSpec = (spec: any) => {
    setEditingPanelSpecId(spec.id);
    setNewPanelSpec({ ...spec });   // Autofill form
  };

  const handleAddNewPanelSpec = async (panelBrandId: number) => {
    const payload = {
      ratedWattageW: Number(newPanelSpec.ratedWattageW),
      productWarrantyYrs: Number(newPanelSpec.productWarrantyYrs),
      efficiencyWarrantyYrs: Number(newPanelSpec.efficiencyWarrantyYrs),
      panelBrandId: Number(panelBrandId),
      panelTypeId: Number(newPanelSpec.panelTypeId),
      materialOriginId: Number(newPanelSpec.materialOriginId),
      annualYieldUnitsPerKw: Number(newPanelSpec.annualYieldUnitsPerKw),
      openCircuitVolts: Number(newPanelSpec.openCircuitVolts),
      shortCircuitAmps: Number(newPanelSpec.shortCircuitAmps),
      maxPowerVolts: Number(newPanelSpec.maxPowerVolts),
      maxPowerAmps: Number(newPanelSpec.maxPowerAmps),
      modelNumber: newPanelSpec.modelNumber,
      efficiencyPercentage: Number(newPanelSpec.efficiencyPercentage),
    };

    const res = await addPanelSpec(panelBrandId, payload);

    if (res) {
      const updated = await fetchPanelSpecsByBrand(panelBrandId);
      setPanelBrandSpecs((prev) => ({ ...prev, [panelBrandId]: updated }));
      resetPanelSpecForm();

      setShowPanelSpecModal(false);

      toast.success("New specification added!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

    }
  };

  const handleUpdatePanelSpec = async (specId: number, panelBrandId: number) => {
    const payload = {
      ratedWattageW: Number(newPanelSpec.ratedWattageW),
      productWarrantyYrs: Number(newPanelSpec.productWarrantyYrs),
      efficiencyWarrantyYrs: Number(newPanelSpec.efficiencyWarrantyYrs),
      panelBrandId: Number(newPanelSpec.panelBrandId),
      panelTypeId: Number(newPanelSpec.panelTypeId),
      materialOriginId: Number(newPanelSpec.materialOriginId),
      annualYieldUnitsPerKw: Number(newPanelSpec.annualYieldUnitsPerKw),
      openCircuitVolts: Number(newPanelSpec.openCircuitVolts),
      shortCircuitAmps: Number(newPanelSpec.shortCircuitAmps),
      maxPowerVolts: Number(newPanelSpec.maxPowerVolts),
      maxPowerAmps: Number(newPanelSpec.maxPowerAmps),
      modelNumber: newPanelSpec.modelNumber,
      efficiencyPercentage: Number(newPanelSpec.efficiencyPercentage),
    };

    const res = await updatePanelSpec(specId, payload);

    if (res) {

      const updated = await fetchPanelSpecsByBrand(panelBrandId);
      setPanelBrandSpecs((prev) => ({ ...prev, [panelBrandId]: updated }));
      setEditingPanelSpecId(null);
      resetPanelSpecForm();

      setShowPanelSpecModal(false);

      toast.success("Specification updated!", {
        autoClose: 1000,
        hideProgressBar: true,
      });

    }
  };

  useEffect(() => {
    const fetchOrigins = async () => {
      const data = await getMaterialOrigins();
      if (data) setOrigins(data);
    };

    fetchOrigins();
  }, []);



  const handleAddPanelBrand = async () => {
    if (!brandFullname || !brandShortname) {
      toast.error("Please fill all fields", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    const payload = {
      brandFullname,
      brandShortname,
    };

    const res = await addPanelBrand(payload);

    const brandData = await fetchAllPanelBrands();
    if (brandData) setPanelBrands(brandData);

    if (res) {
      toast.success("Panel brand added!", {
        autoClose: 1000,
        hideProgressBar: true
      });
      setBrandFullname("");
      setBrandShortname("");
      setShowPanelBrandModal(false);
    }
  };


  const handleSelectPanelSpecs = async () => {
    if (!selectedPanelSpecId) {
      toast.error("No panel specification selected");
      return;
    }

    const payload = {
      panelSpecsId: selectedPanelSpecId,
      orgId: userInfo.orgId,
      basePrice: newPanelSpec.basePrice,
    };

    const response = await addPanelSpecForOrg(payload);

    await loadSelectedPanels();

    if (response) {
      toast.success("panel specification selected successfully", {
        autoClose: 1200,
        hideProgressBar: true,
      });

      setShowPanelSpecModal(false);
      setSelectedPanelSpecId(null);
    }
  };

  const [selectedPanelSpecs, setSelectedPanelSpecs] = useState<any[]>([]);
  const [expandedSelectedPanelBrand, setExpandedSelectedPanelBrand] = useState<string | null>(null);
  const [showSelectedPanelBrands, setShowSelectedPanelBrands] = useState(true);


  const groupByPanelBrand = (data: any[]) => {
    return data.reduce((acc: any, item: any) => {
      if (!acc[item.panelBrandName]) {
        acc[item.panelBrandName] = {
          panelBrandId: item.panelBrandId,
          panelBrandName: item.panelBrandName,
          selectedPanelSpecs: [],
        };
      }
      acc[item.panelBrandName].selectedPanelSpecs.push(item);
      return acc;
    }, {});
  };


  const loadSelectedPanels = async () => {
    const data = await fetchSelectedPanelSpecs(userInfo.orgId);
    setSelectedPanelSpecs(data);
  };

  useEffect(() => {
    if (userInfo.orgId) {
      loadSelectedPanels();
    }
  }, [userInfo.orgId]);

  const hasSelectedPanels = selectedPanelSpecs.length > 0;

  const [editingSelectedPanelSpecId, setEditingSelectedPanelSpecId] = useState<number | null>(null);
  const [selectedOrgPanelSpecId, setSelectedOrgPanelSpecId] = useState<number | null>(null);
  const [showSelectedPanelSpecModal, setShowSelectedPanelSpecModal] = useState(false);

  const handleEditSelectedPanelSpec = (panelSpec: any) => {
    setEditingSelectedPanelSpecId(panelSpec.id);
    setSelectedOrgPanelSpecId(panelSpec.panelSpecsId);
    setNewPanelSpec({ ...panelSpec });   // Autofill form
  };

  const buildSelectedPanelSpecUpdatePayload = () => ({
    selectedPanelSpecId: editingSelectedPanelSpecId,
    orgId: userInfo?.orgId,
    basePrice: Number(newPanelSpec.basePrice),
    panelSpecsId: selectedOrgPanelSpecId,
  });

  {/*----------------------------------------Pipe Operations----------------------------------------------*/ }

  const [pipes, setPipes] = React.useState<any[]>([]);

  const [name, setName] = React.useState("");
  const [, setShowFormForPipeBrand] = useState<number | null>(null);
  const [showAddModalForPipeBrand, setShowAddModalForPipeBrand] = useState(false);
  const [isEditingPipeBrand, setIsEditingPipeBrand] = useState(false);
  const [expandedPipeBrandId, setExpandedPipeBrandId] = useState<number | null>(null);
  const [editingPipeBrandId, setEditingPipeBrandId] = useState<number | null>(null);
  const [editingPipeSpecId, setEditingPipeSpecId] = useState<string | null>(null);
  const [showPipeSpecModal, setShowPipeSpecModal] = useState(false);
  const [pipeBrandSpecs, setPipeBrandSpecs] = useState<Record<number, any[]>>({});
  const [selectedPipeSpecId, setSelectedPipeSpecId] = useState<number | null>(null);

  const isOrgAdminSelectModeForPipe =
    isOrgAdmin && selectedPipeSpecId !== null;
  const resetPipeSpecForm = () => {
    setNewPipeSpec({
      pipeBrandId: "",
      name: "",
      lengthMeters: "",
      widthMm: "",
      heightMm: "",
      thicknessMm: "",
      weightKg: "",
      description: "",
      basePrice: "",
    });
  };

  const [newPipeSpec, setNewPipeSpec] = useState({
    pipeBrandId: "",
    name: "",
    lengthMeters: "",
    widthMm: "",
    heightMm: "",
    thicknessMm: "",
    weightKg: "",
    description: "",
    basePrice: "",
  });

  const handleAddPipeBrand = async () => {
    if (!name) {
      toast.error("Please fill all fields", {
        autoClose: 1000,
        hideProgressBar: true
      });
      return;
    }

    const payload = {
      name
    };

    const res = await addPipeBrand(payload);

    if (res) {

      setName("");
      setShowAddModalForPipeBrand(false);

      const data = await fetchAllPipeBrands();
      if (data) setPipes(data);

      toast.success("Pipe brand added!", {
        autoClose: 1000,
        hideProgressBar: true
      });
    }
  };

  const handleUpdatePipeBrand = async () => {
    const res = await updatePipeBrand(
      editingPipeBrandId!,
      name
    );

    if (res) {
      toast.success("Pipe brand updated!", { autoClose: 1000, hideProgressBar: true });


      const pipeData = await fetchAllPipeBrands();
      if (pipeData) setPipes(pipeData);

      setName("");
      setShowAddModalForPipeBrand(false);

      setIsEditingPipeBrand(false);
    }
  };

  const openAddPipeSpecForm = (pipeBrandId: number) => {
    setExpandedPipeBrandId(pipeBrandId);
    setShowFormForPipeBrand(pipeBrandId);
    setEditingPipeSpecId(null);
    resetPipeSpecForm();
    setShowPipeSpecModal(true);
  };

  const handlePipeSpecInputChange = (key: string, value: string | number) => {
    setNewPipeSpec((prev) => ({ ...prev, [key]: value }));
  };



  const handleEditPipeSpec = (pipeSpec: any) => {
    setEditingPipeSpecId(pipeSpec.id);
    setNewPipeSpec({ ...pipeSpec });   // Autofill form
  };

  const handleUpdatePipeSpec = async (
    pipeSpecId: number,
    pipeBrandId: number
  ) => {
    const payload = {
      name: newPipeSpec.name,
      lengthMeters: Number(newPipeSpec.lengthMeters),
      widthMm: Number(newPipeSpec.widthMm),
      heightMm: Number(newPipeSpec.heightMm),
      thicknessMm: Number(newPipeSpec.thicknessMm),
      weightKg: Number(newPipeSpec.weightKg),
      description: newPipeSpec.description,
    };

    const res = await updatePipeSpec(pipeSpecId, pipeBrandId, payload);

    if (res) {

      const updated = await fetchPipeSpecsByBrand(pipeBrandId);
      setPipeBrandSpecs((prev) => ({
        ...prev,
        [pipeBrandId]: updated,
      }));

      setEditingPipeSpecId(null);
      resetPipeSpecForm();

      toast.success("Specification updated!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  };



  const handleAddNewPipeSpec = async (pipeBrandId: number) => {
    const payload = {
      name: newPipeSpec.name,
      lengthMeters: Number(newPipeSpec.lengthMeters),
      widthMm: Number(newPipeSpec.widthMm),
      heightMm: Number(newPipeSpec.heightMm),
      thicknessMm: Number(newPipeSpec.thicknessMm),
      weightKg: Number(newPipeSpec.weightKg),
      description: newPipeSpec.description,
    };

    const res = await addPipeSpec(pipeBrandId, payload);

    if (res) {
      const updated = await fetchPipeSpecsByBrand(pipeBrandId);
      setPipeBrandSpecs((prev) => ({
        ...prev,
        [pipeBrandId]: updated,
      }));

      resetPipeSpecForm();

      toast.success("New pipe specification added!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
  };


  const handleSelectPipeSpecs = async () => {
    if (!selectedPipeSpecId) {
      toast.error("No pipe specification selected");
      return;
    }

    const payload = {
      pipeSpecsId: selectedPipeSpecId,
      orgId: userInfo.orgId,
      basePrice: newPipeSpec.basePrice,
    };

    const response = await addPipeSpecForOrg(payload);

    await loadSelectedPipes();

    if (response) {
      toast.success("Pipe specification selected successfully", {
        autoClose: 1200,
        hideProgressBar: true,
      });

      setShowPipeSpecModal(false);
      setSelectedPipeSpecId(null);
    }
  };

  const [selectedPipeSpecs, setSelectedPipeSpecs] = useState<any[]>([]);
  const [expandedSelectedPipeBrand, setExpandedSelectedPipeBrand] = useState<string | null>(null);
  const [showSelectedPipeBrands, setShowSelectedPipeBrands] = useState(true);


  const groupByPipeBrand = (data: any[]) => {
    return data.reduce((acc: any, item: any) => {
      if (!acc[item.pipeBrandName]) {
        acc[item.pipeBrandName] = {
          pipeBrandId: item.pipeBrandId,
          pipeBrandName: item.pipeBrandName,
          selectedPipeSpecs: [],
        };
      }
      acc[item.pipeBrandName].selectedPipeSpecs.push(item);
      return acc;
    }, {});
  };

  const loadSelectedPipes = useCallback(async () => {
    if (!userInfo?.orgId) return;

    const data = await fetchPipeSpecification(userInfo.orgId);
    setSelectedPipeSpecs(data);
  }, [userInfo?.orgId]);

  useEffect(() => {
    loadSelectedPipes();
  }, [loadSelectedPipes]);


  const hasSelectedPipes = selectedPipeSpecs.length > 0;

  const [editingSelectedPipeSpecId, setEditingSelectedPipeSpecId] = useState<number | null>(null);
  const [selectedOrgPipeSpecId, setSelectedOrgPipeSpecId] = useState<number | null>(null);
  const [showSelectedPipeSpecModal, setShowSelectedPipeSpecModal] = useState(false);

  const handleEditSelectedPipeSpec = (pipeSpec: any) => {
    setEditingSelectedPipeSpecId(pipeSpec.id);
    setSelectedOrgPipeSpecId(pipeSpec.pipeSpecsId);
    setNewPipeSpec({ ...pipeSpec });
  };

  const buildSelectedPipeSpecUpdatePayload = () => ({
    selectedPipeSpecId: editingSelectedPipeSpecId,
    orgId: userInfo?.orgId,
    basePrice: Number(newPipeSpec.basePrice),
    pipeSpecsId: selectedOrgPipeSpecId,
  });

  {/*------------------------------------------------------------------------------------------------------------------*/ }

  return (

    <div className="p-4">

      <h1 className="text-2xl font-bold mb-6">Product Management</h1>

      {/* 4 Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Battery */}
        <Card
          onClick={() => handleSectionClick("battery")}
          className="bg-gradient-to-r from-success-50 to-success-100 
          dark:from-success-900/20 dark:to-success-800/20 
          border-success-200 dark:border-success-700 
          hover:shadow-medium transition-all duration-200 cursor-pointer"
        >
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                <BatteryCharging className="h-8 w-8 text-success-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Battery</h2>
                <p className="text-sm text-secondary-700 dark:text-secondary-300">
                  Manage all battery-related products here.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Panel */}
        <Card
          onClick={() => handleSectionClick("panel")}
          className="bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700 hover:shadow-medium transition-all duration-200 cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                <PanelTop className="h-8 w-8 text-warning-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-1">Panel</h2>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Manage all panel-related products here.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Inverter */}
        <Card
          onClick={() => handleSectionClick("inverter")}
          className="bg-gradient-to-r from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 border-error-200 dark:border-error-700 hover:shadow-medium transition-all duration-200 cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                <CircuitBoard className="h-8 w-8 text-error-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-1">Inverter</h2>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Manage all inverter-related products here.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pipes */}
        <Card
          onClick={() => handleSectionClick("pipe")}
          className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700 hover:shadow-medium transition-all duration-200 cursor-pointer">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
                <Hammer className="h-8 w-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-1">Pipes</h2>
                <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                  Manage all pipe-related products here.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/*------------------------------------Battery Section---------------------------------------------------------*/}
      {activeSection === "battery" && (

        <div className="mt-4 space-y-4">

          {isOrgAdmin && (<div className="mt-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            {/* HEADER */}
            <div
              className="flex items-center justify-between mb-2 cursor-pointer pr-2"
              onClick={() => setShowSelectedBrands(!showSelectedBrands)}
            >
              <h2 className="text-lg font-semibold">
                Selected Battery Brands
              </h2>

              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSelectedBrands ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>


            {showSelectedBrands && (
              hasSelectedBatteries ? (
                <div className="border rounded-lg">
                  {Object.values(groupByBrand(selectedBatterySpecs)).map(
                    (brand: any) => (
                      <div key={brand.brandId} className="border-b">

                        {/* BRAND HEADER */}
                        <div
                          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setExpandedSelectedBrand(
                              expandedSelectedBrand === brand.brandId
                                ? null
                                : brand.brandId
                            )
                          }
                        >
                          <h3 className="font-semibold text-lg">
                            {brand.brandName}
                          </h3>

                          <span className="text-primary-600 text-sm">
                            {expandedSelectedBrand === brand.brandId
                              ? "Hide Specs"
                              : "View Specs"}
                          </span>
                        </div>

                        {/* SPECS TABLE */}
                        {expandedSelectedBrand === brand.brandId && (
                          <div className="p-4 bg-gray-50">
                            <table className="min-w-full text-left mb-4 border rounded bg-white">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="p-2 border">Wattage</th>
                                  <th className="p-2 border">Voltage</th>
                                  <th className="p-2 border">Base Price</th>
                                  <th className="p-2 border">MFG Date</th>
                                  <th className="p-2 border">Model Number</th>
                                  <th className="p-2 border text-center">Action</th>
                                </tr>
                              </thead>

                              <tbody>
                                {brand.selectedSpecs.map((spec: any) => (
                                  <tr key={spec.id}>
                                    <td className="p-2 border">{spec.wattage} W</td>
                                    <td className="p-2 border">{spec.voltage} V</td>
                                    <td className="p-2 border">₹ {spec.basePrice}</td>
                                    <td className="p-2 border">{spec.mfgMonthYear}</td>
                                    <td className="p-2 border">{spec.modelNumber}</td>

                                    <td className="p-2 border text-center flex gap-3 justify-center">
                                      <button
                                        className="text-yellow-600 hover:underline"
                                        onClick={() => {
                                          handleEditSelectedSpec(spec);
                                          setShowFormForBrand(null);
                                          setShowSelectedSpecModal(true);
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 italic">
                  No battery brands selected yet
                </div>
              )
            )}

            {showSelectedSpecModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">

                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      Edit Selected Specification
                    </h2>

                    <button
                      className="text-red-600 text-lg font-bold"
                      onClick={() => {
                        setShowSelectedSpecModal(false);
                        setEditingSelectedSpecId(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* FORM CONTENT (MOVE YOUR EXISTING FORM HERE) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Wattage */}
                    <div>
                      <label className="block text-sm font-medium">Wattage (W) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newSpec.wattage}
                        disabled
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => handleSpecInputChange("wattage", e.target.value)}
                      />
                    </div>

                    {/* Voltage */}
                    <div>
                      <label className="block text-sm font-medium">Voltage (V) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newSpec.voltage}
                        disabled
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => handleSpecInputChange("voltage", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Total Ah <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newSpec.totalAh}
                        disabled
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => handleSpecInputChange("totalAh", e.target.value)}
                      />
                    </div>

                    {/* Charging Current */}
                    <div>
                      <label className="block text-sm font-medium">Charging Current (A) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        disabled
                        value={newSpec.chargingCurrent}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          handleSpecInputChange("chargingCurrent", e.target.value)
                        }
                      />
                    </div>

                    {/* Discharging Current */}
                    <div>
                      <label className="block text-sm font-medium">Discharging Current (A) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newSpec.dischargingCurrent}
                        disabled
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          handleSpecInputChange("dischargingCurrent", e.target.value)
                        }
                      />
                    </div>

                    {/* Model Number */}
                    <div>
                      <label className="block text-sm font-medium">Model Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={newSpec.modelNumber}
                        disabled
                        onChange={(e) =>
                          handleSpecInputChange("modelNumber", e.target.value)
                        }
                      />
                    </div>


                    <div>
                      <label className="block text-sm font-medium">Product Warranty <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={newSpec.productWarranty}
                        disabled
                        onChange={(e) =>
                          handleSpecInputChange("productWarranty", e.target.value)
                        }
                      />
                    </div>


                    {isOrgAdmin && (
                      <div>
                        <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          className="border p-2 rounded w-full"
                          value={newSpec.basePrice}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) =>
                            handleSpecInputChange("basePrice", e.target.value)
                          }
                        />
                      </div>
                    )}

                    {isOrgAdmin && (
                      <div>
                        <label className="block text-sm font-medium">MFG Date</label>
                        <input
                          type="date"
                          className="border p-2 rounded w-full"
                          value={newSpec.mfgMonthYear}
                          onChange={(e) =>
                            handleSpecInputChange("mfgMonthYear", e.target.value)
                          }
                        />
                      </div>
                    )}


                    {/* ... all remaining fields SAME as before ... */}

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium">Description</label>
                      <textarea
                        className="border p-2 rounded w-full"
                        rows={3}
                        value={newSpec.description}
                        disabled
                        onChange={(e) => handleSpecInputChange("description", e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                      if (!validateSelectedSpecUpdate()) return;

                      const payload = buildSelectedSpecUpdatePayload();

                      try {
                        await updateSelectedBatterySpec(Number(editingSelectedSpecId), payload);
                        await loadSelectedBatteries();

                        toast.success("Specification updated successfully", {
                          autoClose: 1000,
                          hideProgressBar: true
                        });

                        setShowSelectedSpecModal(false);
                        setEditingSelectedSpecId(null);
                      } catch (error: any) {
                        console.error(error);

                        toast.error(
                          error?.response?.data?.message ||
                          "Failed to update specification", {
                          autoClose: 1000,
                          hideProgressBar: true
                        }
                        );
                      }
                    }}
                  >
                    Update Selected Specification
                  </button>

                </div>
              </div>
            )}


          </div>)}


          <div className="mt-6 p-5 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Battery Brands</h2>

              {(userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN") && <button
                onClick={() => setShowAddModal(true)}
                className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
              >
                + Add New Battery
              </button>)}
            </div>

            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-[450px]">

                  <h3 className="text-lg font-semibold mb-4">
                    {isEditingBatteryBrand ? "Edit Battery Brand" : "Add Battery Brand"}
                  </h3>

                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter battery brand name"
                    className="border p-2 rounded w-full mb-4"
                  />

                  <div className="flex justify-end gap-3">

                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        resetBatteryBrandForm();
                        setShowAddModal(false);
                      }}

                    >
                      Cancel
                    </button>

                    {isEditingBatteryBrand ? (
                      <button
                        onClick={() => {
                          if (currentBrandId) {
                            handleSaveBrand(currentBrandId);
                          }
                        }}
                        className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                      >
                        Update
                      </button>

                    ) : (
                      <button
                        onClick={handleAddBrand}
                        className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                      >
                        Add
                      </button>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* Brand List */}
            <div className="border rounded-lg">
              {batteryBrands.map((brand) => (
                <div key={brand.id} className="border-b">

                  {/* Brand Header */}
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                    onClick={async () => {
                      setExpandedBrandId(expandedBrandId === brand.id ? null : brand.id);

                      if (!brandSpecs[brand.id]) {
                        const specs = await fetchBatterySpecs(brand.id);
                        setBrandSpecs((prev) => ({ ...prev, [brand.id]: specs }));
                      }
                    }}
                  >
                    {/* Brand Name or Editable Input */}
                    {editingBrandId === brand.id ? (
                      <input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="border px-2 py-1 rounded w-48"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="font-semibold text-lg">{brand.brandName}</h3>
                    )}

                    <div className="flex items-center gap-4">

                      {editingBrandId === brand.id ? (
                        <>
                          {/* Save */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveBrand(brand.id);
                            }}
                            className="text-green-600 text-sm hover:underline"
                          >
                            Save
                          </button>

                          {/* Cancel */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetBatteryBrandForm();
                            }}

                            className="text-red-600 text-sm hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Edit Brand */}
                          {(userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN") && <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBrand(brand);
                            }}
                            className="text-yellow-600 text-sm hover:underline"
                          >
                            Edit Brand
                          </button>)}

                          {(userClaims?.global_roles?.includes("ROLE_SUPER_ADMIN") && <button
                            className="text-green-600 text-sm hover:underline"
                            onClick={() => openAddSpecForm(brand.id)}
                          >
                            Add Specs
                          </button>)}

                          <span
                            className="text-primary-600 text-sm cursor-pointer"
                            onClick={() => {
                              if (expandedBrandId === brand.id) {
                                setExpandedBrandId(null);
                                setShowFormForBrand(null);
                                setEditingSpecId(null);
                              } else {
                                setExpandedBrandId(brand.id);
                                setShowFormForBrand(null);
                              }
                            }}
                          >
                            {expandedBrandId === brand.id ? "Hide Specs" : "View Available Specs"}
                          </span>

                        </>
                      )}

                    </div>
                  </div>


                  {expandedBrandId === brand.id && (
                    <div className="p-4 bg-gray-50">

                      {/* Existing Specs Table */}
                      <table className="min-w-full text-left mb-4 border rounded bg-white">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-2 border">Wattage</th>
                            <th className="p-2 border">Voltage</th>
                            <th className="p-2 border">Warranty</th>
                            <th className="p-2 border">Charging Current</th>
                            <th className="p-2 border">Discharging Current</th>
                            <th className="p-2 border">Model</th>
                            {/* <th className="p-2 border">Price</th> */}
                            <th className="p-2 border text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {brandSpecs[brand.id]?.map((spec: any) => (
                            <tr key={spec.id} className="border-b">

                              <td className="p-2 border">{spec.wattage}W</td>
                              <td className="p-2 border">{spec.voltage}V</td>
                              <td className="p-2 border">{spec.productWarranty}</td>
                              <td className="p-2 border font-medium">{spec.chargingCurrent}</td>
                              <td className="p-2 border font-medium">{spec.dischargingCurrent}</td>
                              <td className="p-2 border font-medium">{spec.modelNumber}</td>
                              {/* <td className="p-2 border">₹ {spec.basePrice}</td> */}

                              <td className="p-2 border text-center flex gap-3 justify-center">
                                {userInfo?.role === "ROLE_ORG_ADMIN" ? (
                                  <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => {
                                      // prefill spec data
                                      setNewSpec({
                                        ...spec,
                                        basePrice: "",
                                        mfgMonthYear: "",
                                      });

                                      setSelectedSpecId(spec.id);
                                      setEditingSpecId(null);
                                      setShowFormForBrand(brand.id);
                                      setShowSpecModal(true);
                                    }}
                                  >
                                    Select Specification
                                  </button>
                                ) : (
                                  <>
                                    {/* EDIT */}
                                    <button
                                      className="text-yellow-600 hover:underline"
                                      onClick={() => {
                                        handleEditSpec(spec);
                                        setShowFormForBrand(brand.id);
                                        setShowSpecModal(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* === SPEC MODAL === */}
                      {showSpecModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold">
                                {isOrgAdminSelectMode
                                  ? "Select Specification for Organization"
                                  : editingSpecId
                                    ? "Edit Specification"
                                    : "Add New Specification"}
                              </h2>

                              <button
                                className="text-red-600 text-lg font-bold"
                                onClick={() => {
                                  setShowSpecModal(false);
                                  setShowFormForBrand(null);
                                  setEditingSpecId(null);
                                }}
                              >
                                ✕
                              </button>
                            </div>

                            {/* FORM CONTENT (MOVE YOUR EXISTING FORM HERE) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Wattage */}
                              <div>
                                <label className="block text-sm font-medium">Wattage (W) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newSpec.wattage}
                                  disabled={isOrgAdminSelectMode}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  required
                                  onChange={(e) => handleSpecInputChange("wattage", e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              {/* Voltage */}
                              <div>
                                <label className="block text-sm font-medium">Voltage (V) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newSpec.voltage}
                                  disabled={isOrgAdminSelectMode}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  required
                                  onChange={(e) => handleSpecInputChange("voltage", e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Total Ah <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newSpec.totalAh}
                                  disabled={isOrgAdminSelectMode}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  required
                                  onChange={(e) => handleSpecInputChange("totalAh", e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              {/* Charging Current */}
                              <div>
                                <label className="block text-sm font-medium">Charging Current (A) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  disabled={isOrgAdminSelectMode}
                                  value={newSpec.chargingCurrent}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  required
                                  onChange={(e) =>
                                    handleSpecInputChange("chargingCurrent", e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              {/* Discharging Current */}
                              <div>
                                <label className="block text-sm font-medium">Discharging Current (A) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newSpec.dischargingCurrent}
                                  disabled={isOrgAdminSelectMode}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  required
                                  onChange={(e) =>
                                    handleSpecInputChange("dischargingCurrent", e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              {/* Model Number */}
                              <div>
                                <label className="block text-sm font-medium">Model Number <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  className="border p-2 rounded w-full"
                                  value={newSpec.modelNumber}
                                  disabled={isOrgAdminSelectMode}
                                  required
                                  onChange={(e) =>
                                    handleSpecInputChange("modelNumber", e.target.value)
                                  }
                                />
                              </div>


                              <div>
                                <label className="block text-sm font-medium">Product Warranty <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  className="border p-2 rounded w-full"
                                  value={newSpec.productWarranty}
                                  disabled={isOrgAdminSelectMode}
                                  required
                                  onChange={(e) =>
                                    handleSpecInputChange("productWarranty", e.target.value)
                                  }
                                />
                              </div>


                              {isOrgAdmin && (
                                <div>
                                  <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    className="border p-2 rounded w-full"
                                    value={newSpec.basePrice}
                                    onChange={(e) =>
                                      handleSpecInputChange("basePrice", e.target.value)
                                    }
                                    required
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onKeyDown={(e) => {
                                      if (e.key === "-" || e.key === "e") e.preventDefault();
                                    }}
                                  />
                                </div>
                              )}

                              {isOrgAdmin && (
                                <div>
                                  <label className="block text-sm font-medium">MFG Date</label>
                                  <input
                                    type="date"
                                    className="border p-2 rounded w-full"
                                    value={newSpec.mfgMonthYear}
                                    onChange={(e) =>
                                      handleSpecInputChange("mfgMonthYear", e.target.value)
                                    }
                                  />
                                </div>
                              )}


                              {/* ... all remaining fields SAME as before ... */}

                              {/* Description */}
                              <div className="col-span-2">
                                <label className="block text-sm font-medium">Description</label>
                                <textarea
                                  className="border p-2 rounded w-full"
                                  rows={3}
                                  value={newSpec.description}
                                  disabled={isOrgAdminSelectMode}
                                  onChange={(e) => handleSpecInputChange("description", e.target.value)}
                                />
                              </div>
                            </div>

                            {/* BUTTONS */}
                            {isOrgAdminSelectMode ? (
                              <button
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleSelectBatterySpecs}
                              >
                                Select Specification
                              </button>
                            ) : editingSpecId ? (
                              <button
                                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleUpdateSpec(editingSpecId, brand.id);
                                  //setShowSpecModal(false);
                                }}
                              >
                                Update Specification
                              </button>
                            ) : (
                              <button
                                className="mt-4 bg-success-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleAddNewSpec(brand.id);
                                  //setShowSpecModal(false);
                                }}
                              >
                                Save Specification
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/*---------------------------------------------------------------------------------------------------------------------------*/}


      {/*-----------------------------------------------Inverter Section-----------------------------------------------------------*/}


      {activeSection === "inverter" && (

        <div className="mt-4 space-y-4">

          {/*----------------------------------------------------Selected Inverter Specification---------------------------------------*/}

          {isOrgAdmin && (<div className="mt-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            {/* HEADER */}
            <div
              className="flex items-center justify-between mb-2 cursor-pointer pr-2"
              onClick={() => setShowSelectedInverterBrands(!showSelectedInverterBrands)}
            >
              <h2 className="text-lg font-semibold">
                Selected Inverter Brands
              </h2>

              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSelectedInverterBrands ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>


            {showSelectedInverterBrands && (
              hasSelectedInverters ? (
                <div className="border rounded-lg">
                  {Object.values(groupByInverterBrand(selectedInverterSpecs)).map(
                    (inverterBrand: any) => (
                      <div key={inverterBrand.inverterBrandId} className="border-b">

                        {/* BRAND HEADER */}
                        <div
                          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setExpandedSelectedInverterBrand(
                              expandedSelectedInverterBrand === inverterBrand.inverterBrandId
                                ? null
                                : inverterBrand.inverterBrandId
                            )
                          }
                        >
                          <h3 className="font-semibold text-lg">
                            {inverterBrand.inverterBrandName}
                          </h3>

                          <span className="text-primary-600 text-sm">
                            {expandedSelectedInverterBrand === inverterBrand.inverterBrandId
                              ? "Hide Specs"
                              : "View Specs"}
                          </span>
                        </div>

                        {/* SPECS TABLE */}
                        {expandedSelectedInverterBrand === inverterBrand.inverterBrandId && (
                          <div className="p-4 bg-gray-50">
                            <table className="min-w-full text-left mb-4 border rounded bg-white">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="p-2 border">Phase Type - Grid Type</th>
                                  <th className="p-2 border">Inverter Capacity</th>
                                  <th className="p-2 border">Base Price</th>
                                  <th className="p-2 border">ALMM Model Number</th>
                                  <th className="p-2 border text-center">Action</th>
                                </tr>
                              </thead>

                              <tbody>
                                {inverterBrand.selectedInverterSpecs.map((inverterSpec: any) => (
                                  <tr key={inverterSpec.id}>
                                    <td className="p-2 border">({inverterSpec.phaseTypeName}) - ({inverterSpec.gridTypeName})</td>
                                    <td className="p-2 border">{inverterSpec.inverterCapacity}</td>
                                    <td className="p-2 border">₹ {inverterSpec.basePrice}</td>
                                    <td className="p-2 border">{inverterSpec.almmModelNumber}</td>

                                    <td className="p-2 border text-center flex gap-3 justify-center">
                                      <button
                                        className="text-yellow-600 hover:underline"
                                        //onClick={() => handleEditSelectedInverterSpec(inverterSpec)}
                                        onClick={() => {
                                          handleEditSelectedInverterSpec(inverterSpec);
                                          setShowFormForInverterBrand(null);
                                          setShowSelectedInverterSpecModal(true);
                                        }}
                                      >
                                        Edit
                                      </button>

                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 italic">
                  No inverter brands selected yet
                </div>
              )
            )}

            {showSelectedInverterSpecModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">

                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      Edit Selected Specification
                    </h2>

                    <button
                      className="text-red-600 text-lg font-bold"
                      onClick={() => {
                        setShowSelectedInverterSpecModal(false);
                        setEditingSelectedInverterSpecId(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium">
                        Phase Type <span className="text-red-500">*</span>
                      </label>

                      <select
                        className="border p-2 rounded w-full h-[44px]"
                        value={newInverterSpec.phaseTypeId}
                        disabled
                        onChange={(e) => {
                          const numericValue = e.target.value ? Number(e.target.value) : "";
                          handleInverterSpecInputChange("phaseTypeId", numericValue);
                        }}
                      >
                        <option value="">Select Phase Type</option>

                        {phases.map((phase) => (
                          <option key={phase.id} value={phase.id}>
                            {phase.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Grid Type <span className="text-red-500">*</span></label>

                      <select
                        className="border p-2 rounded w-full h-[44px]"
                        value={newInverterSpec.gridTypeId}
                        disabled
                        onChange={(e) => {
                          const numericValue = e.target.value ? Number(e.target.value) : "";
                          handleInverterSpecInputChange("gridTypeId", numericValue);
                        }}
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
                      <label className="block text-sm font-medium">Inverter Capacity (kW) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.inverterCapacity}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("inverterCapacity", e.target.value)
                        }
                      />
                    </div>


                    <div>
                      <label className="block text-sm font-medium">Minimun PV Voltage <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.minPvVoltage}
                        disabled
                        onChange={(e) => handleInverterSpecInputChange("minPvVoltage", e.target.value)}
                      />
                    </div>

                    {/* Charging Current */}
                    <div>
                      <label className="block text-sm font-medium">Maximum PV Voltage <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.maxPvVoltage}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("maxPvVoltage", e.target.value)
                        }
                      />
                    </div>

                    {/* Discharging Current */}
                    <div>
                      <label className="block text-sm font-medium">Number of MPPTs <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.numMppts}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("numMppts", e.target.value)
                        }
                      />
                    </div>

                    {/* Warranty */}
                    <div>
                      <label className="block text-sm font-medium">Number of Strings per MPPT <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.numStringsPerMppt}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("numStringsPerMppt", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Minimun Battery Voltage</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.minBatteryVoltage}
                        disabled
                        onChange={(e) => handleInverterSpecInputChange("minBatteryVoltage", e.target.value)}
                      />
                    </div>

                    {/* Charging Current */}
                    <div>
                      <label className="block text-sm font-medium">Maximum Battery Voltage</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.maxBatteryVoltage}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("maxBatteryVoltage", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Maximum PV Input Current Amperes <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.maxPvInputCurrentAmps}
                        disabled
                        onChange={(e) => handleInverterSpecInputChange("maxPvInputCurrentAmps", e.target.value)}
                      />
                    </div>

                    {/* Charging Current */}
                    <div>
                      <label className="block text-sm font-medium">Battery Charging Current Amperes</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.batteryChargingCurrentAmps}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("batteryChargingCurrentAmps", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Maximum Output Current Amperes <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.maxOutputCurrentAmps}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("maxOutputCurrentAmps", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Overall Efficiency % <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.overallEfficiencyPercent}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("overallEfficiencyPercent", e.target.value)
                        }
                      />
                    </div>

                    {/* Model Number */}
                    <div>
                      <label className="block text-sm font-medium">MPPT Efficiency % <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.mpptEfficiencyPercent}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("mpptEfficiencyPercent", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">ALMM Model Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.almmModelNumber}
                        disabled
                        onChange={(e) =>
                          handleInverterSpecInputChange("almmModelNumber", e.target.value)
                        }
                      />
                    </div>

                    {/* Base Price */}
                    {isOrgAdmin && (<div>
                      <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.basePrice}
                        onChange={(e) =>
                          handleInverterSpecInputChange("basePrice", e.target.value)
                        }
                      />
                    </div>)}

                    <div>
                      <label className="block text-sm font-medium">Product Warranty <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={newInverterSpec.productWarranty}
                        disabled
                        onChange={(e) => handleInverterSpecInputChange("productWarranty", e.target.value)}
                      />
                    </div>

                  </div>

                  <button
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                      if (!editingSelectedInverterSpecId || !userInfo?.orgId) return;

                      const payload = buildSelectedInverterSpecUpdatePayload();

                      await updateSelectedInverterSpec(editingSelectedInverterSpecId, payload);
                      await loadSelectedInverters();

                      setShowSelectedInverterSpecModal(false);
                      setEditingSelectedInverterSpecId(null);
                    }}
                  >
                    Update Selected Specification
                  </button>

                </div>
              </div>
            )}
          </div>)}


          <div className="mt-6 p-5 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Inverter Brands</h2>

              {isSuperAdmin && (<button
                onClick={() => setShowAddModalForInverterBrand(true)}
                className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
              >
                + Add New Inverter
              </button>)}
            </div>


            {showAddModalForInverterBrand && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-[450px]">

                  <h3 className="text-lg font-semibold mb-4">
                    {isEditingInverterBrand ? "Edit Inverter Brand" : "Add Inverter Brand"}
                  </h3>

                  <input
                    type="text"
                    value={inverterBrandName}
                    onChange={(e) => setInverterBrandName(e.target.value)}
                    placeholder="Enter Inverter brand name"
                    className="border p-2 rounded w-full mb-4"
                  />

                  <div className="flex justify-end gap-3">

                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setShowAddModalForInverterBrand(false)
                        setEditingInverterBrandId(null);
                        setInverterBrandName("")
                        setIsEditingInverterBrand(false);
                      }}
                    >
                      Cancel
                    </button>

                    {isEditingInverterBrand ? (
                      <button
                        onClick={handleUpdateInverterBrand}
                        className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                      >
                        Update
                      </button>
                    ) : (
                      <button
                        onClick={handleAddInverterBrand}
                        className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                      >
                        Add
                      </button>
                    )}


                  </div>
                </div>
              </div>
            )}


            {/* Brand List */}
            <div className="border rounded-lg">
              {inverterBrands.map((inverterBrand) => (
                <div key={inverterBrand.id} className="border-b">

                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                    onClick={async () => {
                      setExpandedInverterBrandId(expandedInverterBrandId === inverterBrand.id ? null : inverterBrand.id);

                      if (!inverterBrandSpecs[inverterBrand.id]) {
                        const inverterSpecs = await fetchInverterSpecsByBrand(inverterBrand.id);
                        setInverterBrandSpecs((prev) => ({ ...prev, [inverterBrand.id]: inverterSpecs }));
                      }
                    }}
                  >
                    {/* Brand Name or Editable Input */}
                    <h3 className="font-semibold text-lg">{inverterBrand.inverterBrandName}</h3>


                    <div className="flex items-center gap-4">

                      {/* Edit Brand (always modal only) */}
                      {isSuperAdmin && (<button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingInverterBrandId(inverterBrand.id);
                          setInverterBrandName(inverterBrand.inverterBrandName)
                          setIsEditingInverterBrand(true);
                          setShowAddModalForInverterBrand(true);
                        }}
                        className="text-yellow-600 text-sm hover:underline"
                      >
                        Edit Brand
                      </button>)}

                      {isSuperAdmin && (<button
                        className="text-green-600 text-sm hover:underline"
                        onClick={() => openAddInverterSpecForm(inverterBrand.id)}
                      >
                        Add Specs
                      </button>)}

                      <span
                        className="text-primary-600 text-sm cursor-pointer"
                        onClick={() => {
                          if (expandedInverterBrandId === inverterBrand.id) {
                            setExpandedInverterBrandId(null);
                            setShowFormForInverterBrand(null);
                            setEditingInverterSpecId(null);
                          } else {
                            setExpandedInverterBrandId(inverterBrand.id);
                            setShowFormForInverterBrand(null);
                          }
                        }}
                      >
                        {expandedInverterBrandId === inverterBrand.id ? "Hide Specs" : "View Available Specs"}
                      </span>

                    </div>

                  </div>



                  {expandedInverterBrandId === inverterBrand.id && (
                    <div className="p-4 bg-gray-50">

                      {/* Existing Specs Table */}
                      <table className="min-w-full text-left mb-4 border rounded bg-white">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-2 border">Phase Type - Grid Type</th>
                            <th className="p-2 border">Inverter Capacity</th>
                            <th className="p-2 border">Model Number</th>
                            <th className="p-2 border text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {inverterBrandSpecs[inverterBrand.id]?.map((inverterSpec: any) => (
                            <tr key={inverterSpec.id} className="border-b">

                              <td className="p-2 border">({inverterSpec.phaseTypeName}) - ({inverterSpec.gridTypeName})</td>
                              <td className="p-2 border">{inverterSpec.inverterCapacity} kW</td>
                              <td className="p-2 border font-medium">{inverterSpec.almmModelNumber}</td>

                              <td className="p-2 border text-center flex gap-3 justify-center">
                                {userInfo?.role === "ROLE_ORG_ADMIN" ? (
                                  <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => {
                                      // prefill spec data
                                      setNewInverterSpec({
                                        ...inverterSpec,
                                        basePrice: "",
                                        yearOfManufacturing: "",
                                      });

                                      setSelectedInverterSpecId(inverterSpec.id);
                                      setEditingInverterSpecId(null);
                                      setShowFormForInverterBrand(inverterBrand.id);
                                      setShowInverterSpecModal(true);
                                    }}
                                  >
                                    Select Specification
                                  </button>
                                ) : (
                                  <>
                                    {/* EDIT */}
                                    <button
                                      className="text-yellow-600 hover:underline"
                                      onClick={() => {
                                        handleEditInverterSpec(inverterSpec);
                                        setShowFormForInverterBrand(inverterBrand.id);
                                        setShowInverterSpecModal(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {showInverterSpecModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold">
                                {isOrgAdminSelectModeForInverter
                                  ? "Select Specification for Organization"
                                  : editingInverterSpecId
                                    ? "Edit Specification"
                                    : "Add New Specification"}
                              </h2>


                              <button
                                className="text-red-600 text-lg font-bold"
                                onClick={() => {
                                  setShowInverterSpecModal(false);
                                  setShowFormForInverterBrand(null);
                                  setEditingInverterSpecId(null);
                                }}
                              >
                                ✕
                              </button>
                            </div>

                            {/* FORM CONTENT (MOVE YOUR EXISTING FORM HERE) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                              <div>
                                <label className="block text-sm font-medium">
                                  Phase Type <span className="text-red-500">*</span>
                                </label>

                                <select
                                  className="border p-2 rounded w-full h-[44px]"
                                  value={newInverterSpec.phaseTypeId}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) => {
                                    const numericValue = e.target.value ? Number(e.target.value) : "";
                                    handleInverterSpecInputChange("phaseTypeId", numericValue);
                                  }}
                                  required
                                >
                                  <option value="">Select Phase Type</option>

                                  {phases.map((phase) => (
                                    <option key={phase.id} value={phase.id}>
                                      {phase.nameEn}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Grid Type <span className="text-red-500">*</span></label>

                                <select
                                  className="border p-2 rounded w-full h-[44px]"
                                  value={newInverterSpec.gridTypeId}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) => {
                                    const numericValue = e.target.value ? Number(e.target.value) : "";
                                    handleInverterSpecInputChange("gridTypeId", numericValue);
                                  }}
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
                                <label className="block text-sm font-medium">Inverter Capacity (kW) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.inverterCapacity}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("inverterCapacity", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>


                              <div>
                                <label className="block text-sm font-medium">Minimun PV Voltage <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.minPvVoltage}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) => handleInverterSpecInputChange("minPvVoltage", e.target.value)}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              {/* Charging Current */}
                              <div>
                                <label className="block text-sm font-medium">Maximum PV Voltage <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.maxPvVoltage}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("maxPvVoltage", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              {/* Discharging Current */}
                              <div>
                                <label className="block text-sm font-medium">Number of MPPTs <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.numMppts}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("numMppts", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              {/* Warranty */}
                              <div>
                                <label className="block text-sm font-medium">Number of Strings per MPPT <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.numStringsPerMppt}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("numStringsPerMppt", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Minimun Battery Voltage</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.minBatteryVoltage}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) => handleInverterSpecInputChange("minBatteryVoltage", e.target.value)}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              {/* Charging Current */}
                              <div>
                                <label className="block text-sm font-medium">Maximum Battery Voltage</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.maxBatteryVoltage}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("maxBatteryVoltage", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Maximum PV Input Current Amperes <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.maxPvInputCurrentAmps}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) => handleInverterSpecInputChange("maxPvInputCurrentAmps", e.target.value)}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              {/* Charging Current */}
                              <div>
                                <label className="block text-sm font-medium">Battery Charging Current Amperes</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.batteryChargingCurrentAmps}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("batteryChargingCurrentAmps", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Maximum Output Current Amperes <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.maxOutputCurrentAmps}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("maxOutputCurrentAmps", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Overall Efficiency % <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.overallEfficiencyPercent}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("overallEfficiencyPercent", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              {/* Model Number */}
                              <div>
                                <label className="block text-sm font-medium">MPPT Efficiency % <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.mpptEfficiencyPercent}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("mpptEfficiencyPercent", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">ALMM Model Number <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.almmModelNumber}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("almmModelNumber", e.target.value)
                                  }
                                />
                              </div>

                              {/* Base Price */}
                              {isOrgAdmin && (<div>
                                <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.basePrice}
                                  onChange={(e) =>
                                    handleInverterSpecInputChange("basePrice", e.target.value)
                                  }
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e") e.preventDefault();
                                  }}
                                  required
                                />
                              </div>)}

                              <div>
                                <label className="block text-sm font-medium">Product Warranty <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  className="border p-2 rounded w-full"
                                  value={newInverterSpec.productWarranty}
                                  disabled={isOrgAdminSelectModeForInverter}
                                  onChange={(e) => handleInverterSpecInputChange("productWarranty", e.target.value)}
                                />
                              </div>

                            </div>

                            {isOrgAdminSelectModeForInverter ? (
                              <button
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleSelectInverterSpecs}
                              >
                                Select Specification
                              </button>
                            ) : editingInverterSpecId ? (
                              <button
                                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleUpdateInverterSpec(Number(editingInverterSpecId), inverterBrand.id);
                                  //setShowInverterSpecModal(false);
                                }}
                              >
                                Update Specification
                              </button>
                            ) : (
                              <button
                                className="mt-4 bg-success-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleAddNewInverterSpec(inverterBrand.id);
                                  //setShowInverterSpecModal(false);
                                }}
                              >
                                Save Specification
                              </button>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*-----------------------------------------------------------------------------------------------------------------*/}


      {/*--------------------------------------Panel Section--------------------------------------------------------------*/}

      {activeSection === "panel" && (
        <div className="mt-6 space-y-8">

          {/* ------------------------------------------ PANEL TYPES CARD --------------------------------------------------- */}


          {(isSuperAdmin && <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Panel Types</h2>

              <div className="flex gap-4">

                <button
                  onClick={() => {
                    setShowPanelTypes((prev) => !prev);
                    setShowAddPanelTypeModal(false);
                  }}
                  className="px-4 py-2 rounded border border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  {showPanelTypes ? "Hide Types" : "View Types"}
                </button>

                <button
                  onClick={() => {
                    setEditingPanelType(null);      // ensure it's NOT edit mode
                    setTypeName("");                // clear old values
                    setTypeDescription("");
                    setTypicalEfficiency("");
                    setYearIntroduced("");
                    setShowAddPanelTypeModal(true);
                    setShowPanelTypes(false);
                  }}
                  className="px-4 py-2 rounded bg-success-600 hover:bg-success-700 text-white"
                >
                  + Add Panel Type
                </button>

              </div>
            </div>

            {showPanelTypes && (
              <div className="mb-8 border rounded p-4 bg-gray-50 dark:bg-secondary-800">
                {panelTypes?.length > 0 ? (
                  <table className="min-w-full border rounded bg-white dark:bg-secondary-900">
                    <thead className="bg-gray-200 dark:bg-secondary-700">
                      <tr>
                        <th className="p-2 border">Type Name</th>
                        <th className="p-2 border">Efficiency (%)</th>
                        <th className="p-2 border">Year</th>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border text-center">Action</th>

                      </tr>
                    </thead>
                    <tbody>
                      {panelTypes.map((type) => (
                        <tr key={type.id} className="border-b">
                          <td className="p-2 border">{type.typeName}</td>
                          <td className="p-2 border">{type.typicalEfficiency}</td>
                          <td className="p-2 border">{type.yearIntroduced}</td>
                          <td className="p-2 border">{type.typeDescription}</td>
                          <td className="p-2 border text-center flex gap-3 justify-center">

                            {/* EDIT */}
                            <button
                              className="text-yellow-600 hover:underline"
                              onClick={() => {
                                setEditingPanelType(type); // store selected type for edit mode

                                // prefill modal fields
                                setTypeName(type.typeName);
                                setTypeDescription(type.typeDescription);
                                setTypicalEfficiency(type.typicalEfficiency);
                                setYearIntroduced(type.yearIntroduced);

                                setShowPanelTypes(false); // hide table while editing
                                setShowAddPanelTypeModal(true); // open modal
                              }}
                            >
                              Edit
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-secondary-600">No panel types available.</p>
                )}
              </div>
            )}

            {/* Panel Type Modal */}
            {showAddPanelTypeModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-[700px]">

                  <h3 className="text-lg font-semibold mb-4">
                    {editingPanelType ? "Edit Panel Type" : "Add Panel Type"}
                  </h3>


                  <div className="grid grid-cols-2 gap-4">

                    {/* Type Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Panel Type Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={typeName}
                        onChange={(e) => setTypeName(e.target.value)}
                        placeholder="Type Name (e.g. Mono Perc)"
                        required
                        className="border p-2 rounded w-full"
                      />
                    </div>

                    {/* Typical Efficiency */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Typical Efficiency (%)
                      </label>
                      <input
                        type="number"
                        value={typicalEfficiency}
                        onChange={(e) => setTypicalEfficiency(e.target.value)}
                        placeholder="Typical Efficiency (%)"
                        className="border p-2 rounded w-full"
                      />
                    </div>

                    {/* Year Introduced */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Year Introduced</label>
                      <input
                        type="number"
                        value={yearIntroduced}
                        onChange={(e) => setYearIntroduced(e.target.value)}
                        placeholder="Year Introduced"
                        className="border p-2 rounded w-full"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={typeDescription}
                        onChange={(e) => setTypeDescription(e.target.value)}
                        placeholder="Description"
                        required
                        className="border p-2 rounded w-full"
                      />
                    </div>


                  </div>

                  <div className="flex justify-end gap-3 mt-5">
                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      onClick={() => setShowAddPanelTypeModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        if (editingPanelType) {
                          handleUpdatePanelType();
                        } else {
                          handleAddPanelType();
                        }
                        setShowPanelTypes(true);
                      }}
                      className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                    >
                      {editingPanelType ? "Update Panel Type" : "Save Panel Type"}
                    </button>

                  </div>

                </div>
              </div>
            )}

          </div>)}

          {/*------------------------------------------------------Selected Panel Specification---------------------------------------------*/}

          {isOrgAdmin && (<div className="mt-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            {/* HEADER */}
            <div
              className="flex items-center justify-between mb-2 cursor-pointer pr-2"
              onClick={() => setShowSelectedPanelBrands(!showSelectedPanelBrands)}
            >
              <h2 className="text-lg font-semibold">
                Selected Panel Brands
              </h2>

              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSelectedPanelBrands ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>


            {showSelectedPanelBrands && (
              hasSelectedPanels ? (
                <div className="border rounded-lg">
                  {Object.values(groupByPanelBrand(selectedPanelSpecs)).map(
                    (panelBrand: any) => (
                      <div key={panelBrand.panelBrandId} className="border-b">

                        {/* BRAND HEADER */}
                        <div
                          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setExpandedSelectedPanelBrand(
                              expandedSelectedPanelBrand === panelBrand.panelBrandId
                                ? null
                                : panelBrand.panelBrandId
                            )
                          }
                        >
                          <h3 className="font-semibold text-lg">
                            {panelBrand.panelBrandName}
                          </h3>

                          <span className="text-primary-600 text-sm">
                            {expandedSelectedPanelBrand === panelBrand.panelBrandId
                              ? "Hide Specs"
                              : "View Specs"}
                          </span>
                        </div>

                        {/* SPECS TABLE */}
                        {expandedSelectedPanelBrand === panelBrand.panelBrandId && (
                          <div className="p-4 bg-gray-50">
                            <table className="min-w-full text-left mb-4 border rounded bg-white">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="p-2 border">Panel Wattage</th>
                                  <th className="p-2 border">Material Origin & Panel Type</th>
                                  <th className="p-2 border">Base Price</th>
                                  <th className="p-2 border">Model Number</th>
                                  <th className="p-2 border text-center">Action</th>
                                </tr>
                              </thead>

                              <tbody>
                                {panelBrand.selectedPanelSpecs.map((panelSpec: any) => (
                                  <tr key={panelSpec.id}>
                                    <td className="p-2 border">{panelSpec.ratedWattageW} W</td>
                                    <td className="p-2 border">{panelSpec.materialOriginCode} ({panelSpec.panelTypeName})</td>
                                    <td className="p-2 border">₹ {panelSpec.basePrice}</td>
                                    <td className="p-2 border">{panelSpec.modelNumber}</td>

                                    <td className="p-2 border text-center flex gap-3 justify-center">
                                      <button
                                        className="text-yellow-600 hover:underline"
                                        //onClick={() => handleEditSelectedPanelSpec(panelSpec)}
                                        onClick={() => {
                                          handleEditSelectedPanelSpec(panelSpec);
                                          setShowFormForPanelBrand(null);
                                          setShowSelectedPanelSpecModal(true);
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>


              ) : (
                <div className="text-center text-gray-500 italic">
                  No panel brands selected yet
                </div>
              )
            )}

            {showSelectedPanelSpecModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">

                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      Edit Selected Specification
                    </h2>



                    <button
                      className="text-red-600 text-lg font-bold"
                      onClick={() => {
                        setShowSelectedPanelSpecModal(false);
                        //setShowFormForPanelBrand(null);
                        setEditingSelectedPanelSpecId(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium">
                        Material Origin Type
                      </label>

                      <select
                        className="border p-2 rounded w-full h-[44px]"
                        value={newPanelSpec.materialOriginId}
                        disabled
                        onChange={(e) => {
                          const numericValue = e.target.value ? Number(e.target.value) : "";
                          handlePanelSpecInputChange("materialOriginId", numericValue);
                        }}
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
                      <label className="block text-sm font-medium">Panel Type</label>

                      <select
                        className="border p-2 rounded w-full h-[44px]"
                        value={newPanelSpec.panelTypeId}
                        disabled
                        onChange={(e) => {
                          const numericValue = e.target.value ? Number(e.target.value) : "";
                          handlePanelSpecInputChange("panelTypeId", numericValue);
                        }}
                      >
                        <option value="">Select Panel Type</option>

                        {panelTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.typeName}
                          </option>
                        ))}
                      </select>
                    </div>



                    {/* Wattage */}
                    <div>
                      <label className="block text-sm font-medium">Panel Wattage (W)</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.ratedWattageW}
                        disabled
                        onChange={(e) => handlePanelSpecInputChange("ratedWattageW", e.target.value)}
                      />
                    </div>

                    {/* Voltage */}
                    <div>
                      <label className="block text-sm font-medium">Product Warranty (Yrs)</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.productWarrantyYrs}
                        disabled
                        onChange={(e) => handlePanelSpecInputChange("productWarrantyYrs", e.target.value)}
                      />
                    </div>

                    {/* Total Ah */}
                    <div>
                      <label className="block text-sm font-medium">Efficient Warranty (Yrs)</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.efficiencyWarrantyYrs}
                        disabled
                        onChange={(e) => handlePanelSpecInputChange("efficiencyWarrantyYrs", e.target.value)}
                      />
                    </div>

                    {/* Charging Current */}
                    <div>
                      <label className="block text-sm font-medium">Annual Yield Units Per kW</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.annualYieldUnitsPerKw}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("annualYieldUnitsPerKw", e.target.value)
                        }
                      />
                    </div>

                    {/* Discharging Current */}
                    <div>
                      <label className="block text-sm font-medium">Open Circuit Volts</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.openCircuitVolts}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("openCircuitVolts", e.target.value)
                        }
                      />
                    </div>

                    {/* Warranty */}
                    <div>
                      <label className="block text-sm font-medium">Short Circuit Amps</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.shortCircuitAmps}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("shortCircuitAmps", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Max Power Volts</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.maxPowerVolts}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("maxPowerVolts", e.target.value)
                        }
                      />
                    </div>

                    {/* Warranty */}
                    <div>
                      <label className="block text-sm font-medium">Max Power Amps</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.maxPowerAmps}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("maxPowerAmps", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Model Number</label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.modelNumber}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("modelNumber", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Efficiency Percentage %</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.efficiencyPercentage}
                        disabled
                        onChange={(e) =>
                          handlePanelSpecInputChange("efficiencyPercentage", e.target.value)
                        }
                      />
                    </div>

                    {/* Base Price */}
                    {isOrgAdmin && (<div>
                      <label className="block text-sm font-medium">Base Price (₹)</label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPanelSpec.basePrice}
                        onChange={(e) =>
                          handlePanelSpecInputChange("basePrice", e.target.value)
                        }
                      />
                    </div>)}

                  </div>

                  <button
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                      if (!editingSelectedPanelSpecId || !userInfo?.orgId) return;

                      const payload = buildSelectedPanelSpecUpdatePayload();

                      await updateSelectedPanelSpec(editingSelectedPanelSpecId, payload);
                      await loadSelectedPanels();

                      setShowSelectedPanelSpecModal(false);
                      setEditingSelectedPanelSpecId(null);
                    }}
                  >
                    Update Selected Specification
                  </button>


                </div>
              </div>
            )}


          </div>)}

          {/* -------------------------------------- PANEL BRANDS CARD --------------------------------------- */}
          <div className="p-5 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Panel Brands</h2>

              {isSuperAdmin && (
                <button
                  onClick={() => setShowPanelBrandModal(true)}
                  className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                >
                  + Add New Panel Brand
                </button>
              )}

            </div>

            {/* Panel Brand Modal */}
            {showPanelBrandModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-[450px]">

                  <h3 className="text-lg font-semibold mb-4">
                    {isEditingBrand ? "Update Panel Brand" : "Add Panel Brand"}
                  </h3>


                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={brandFullname}
                      onChange={(e) => setBrandFullname(e.target.value)}
                      placeholder="Enter brand full name"
                      required
                      className="border p-2 rounded w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Short Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={brandShortname}
                      onChange={(e) => setBrandShortname(e.target.value)}
                      placeholder="Enter brand short name"
                      required
                      className="border p-2 rounded w-full"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setShowPanelBrandModal(false);
                        setIsEditingBrand(false);
                        setEditingPanelBrandId(null);
                        setBrandFullname("");
                        setBrandShortname("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={isEditingBrand ? handleUpdateBrand : handleAddPanelBrand}
                      className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                    >
                      {isEditingBrand ? "Update" : "Add Brand"}
                    </button>

                  </div>

                </div>
              </div>
            )}

            {/* Brand List */}
            <div className="border rounded-lg">
              {panelBrands.map((panelBrand) => (
                <div key={panelBrand.id} className="border-b">

                  {/* Brand Header */}
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                    onClick={async () => {
                      setExpandedPanelBrandId(expandedPanelBrandId === panelBrand.id ? null : panelBrand.id);

                      if (!panelBrandSpecs[panelBrand.id]) {
                        const specs = await fetchPanelSpecsByBrand(panelBrand.id);
                        setPanelBrandSpecs((prev) => ({ ...prev, [panelBrand.id]: specs }));
                      }
                    }}
                  >
                    {/* Brand Name or Editable Input */}
                    <h3 className="font-semibold text-lg">{panelBrand.brandFullname}</h3>


                    <div className="flex items-center gap-4">

                      {/* Edit Brand (always modal only) */}
                      {isSuperAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPanelBrandId(panelBrand.id);
                            setBrandFullname(panelBrand.brandFullname);
                            setBrandShortname(panelBrand.brandShortname);
                            setIsEditingBrand(true);
                            setShowPanelBrandModal(true);
                          }}
                          className="text-yellow-600 text-sm hover:underline"
                        >
                          Edit Brand
                        </button>
                      )}


                      {(isSuperAdmin && <button
                        className="text-green-600 text-sm hover:underline"
                        onClick={() => openAddPanelSpecForm(panelBrand.id)}
                      >
                        Add Specs
                      </button>)}

                      <span
                        className="text-primary-600 text-sm cursor-pointer"
                        onClick={() => {
                          if (expandedPanelBrandId === panelBrand.id) {
                            setExpandedPanelBrandId(null);
                            setShowFormForPanelBrand(null);
                            setEditingPanelSpecId(null);
                          } else {
                            setExpandedPanelBrandId(panelBrand.id);
                            setShowFormForPanelBrand(null);
                          }
                        }}
                      >
                        {expandedPanelBrandId === panelBrand.id ? "Hide Specs" : "View Available Specs"}
                      </span>

                    </div>

                  </div>


                  {expandedPanelBrandId === panelBrand.id && (
                    <div className="p-4 bg-gray-50">

                      {/* Existing Specs Table */}
                      <table className="min-w-full text-left mb-4 border rounded bg-white">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-2 border">Panel Wattage</th>
                            <th className="p-2 border">Material Origin & Panel Type</th>
                            <th className="p-2 border">Product + Efficiency Warranty</th>
                            <th className="p-2 border">Model</th>
                            {/* <th className="p-2 border">Price</th> */}
                            <th className="p-2 border text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {panelBrandSpecs[panelBrand.id]?.map((panelSpec: any) => (
                            <tr key={panelSpec.id} className="border-b">

                              <td className="p-2 border">{panelSpec.ratedWattageW} W</td>
                              <td className="p-2 border">{panelSpec.materialOriginCode} ({panelSpec.panelTypeName})</td>
                              <td className="p-2 border">
                                {panelSpec.productWarrantyYrs} yrs (Product) + {panelSpec.efficiencyWarrantyYrs} yrs (Efficiency)
                              </td>

                              <td className="p-2 border font-medium">{panelSpec.modelNumber}</td>
                              {/* <td className="p-2 border">₹ {panelSpec.basePrice}</td> */}

                              <td className="p-2 border text-center flex gap-3 justify-center">
                                {userInfo?.role === "ROLE_ORG_ADMIN" ? (
                                  <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => {
                                      // prefill spec data
                                      setNewPanelSpec({
                                        ...panelSpec,
                                        basePrice: "",
                                      });

                                      setSelectedPanelSpecId(panelSpec.id);
                                      setEditingPanelSpecId(null);
                                      setShowFormForPanelBrand(panelBrand.id);
                                      setShowPanelSpecModal(true);

                                    }}
                                  >
                                    Select Specification
                                  </button>
                                ) : (
                                  <>
                                    {/* EDIT */}
                                    <button
                                      className="text-yellow-600 hover:underline"
                                      onClick={() => {
                                        handleEditPanelSpec(panelSpec);
                                        setShowFormForPanelBrand(panelBrand.id);
                                        setShowPanelSpecModal(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>


                      {showPanelSpecModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                          <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold">
                                {isOrgAdminSelectModeForPanel
                                  ? "Select Specification for Organization"
                                  : editingPanelSpecId
                                    ? "Edit Specification"
                                    : "Add New Specification"}
                              </h2>


                              <button
                                className="text-red-600 text-lg font-bold"
                                onClick={() => {
                                  setShowPanelSpecModal(false);
                                  setShowFormForPanelBrand(null);
                                  setEditingPanelSpecId(null);
                                }}
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                              <div>
                                <label className="block text-sm font-medium">
                                  Material Origin Type <span className="text-red-500">*</span>
                                </label>

                                <select
                                  className="border p-2 rounded w-full h-[44px]"
                                  value={newPanelSpec.materialOriginId}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) => {
                                    const numericValue = e.target.value ? Number(e.target.value) : "";
                                    handlePanelSpecInputChange("materialOriginId", numericValue);
                                  }}
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
                                <label className="block text-sm font-medium">Panel Type <span className="text-red-500">*</span></label>

                                <select
                                  className="border p-2 rounded w-full h-[44px]"
                                  value={newPanelSpec.panelTypeId}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) => {
                                    const numericValue = e.target.value ? Number(e.target.value) : "";
                                    handlePanelSpecInputChange("panelTypeId", numericValue);
                                  }}
                                >
                                  <option value="">Select Panel Type</option>

                                  {panelTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.typeName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {/* Wattage */}
                              <div>
                                <label className="block text-sm font-medium">Panel Wattage (W) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.ratedWattageW}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) => handlePanelSpecInputChange("ratedWattageW", e.target.value)}
                                />
                              </div>

                              {/* Voltage */}
                              <div>
                                <label className="block text-sm font-medium">Product Warranty (Yrs) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.productWarrantyYrs}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) => handlePanelSpecInputChange("productWarrantyYrs", e.target.value)}
                                />
                              </div>

                              {/* Total Ah */}
                              <div>
                                <label className="block text-sm font-medium">Efficient Warranty (Yrs) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.efficiencyWarrantyYrs}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) => handlePanelSpecInputChange("efficiencyWarrantyYrs", e.target.value)}
                                />
                              </div>

                              {/* Charging Current */}
                              <div>
                                <label className="block text-sm font-medium">Annual Yield Units Per kW</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.annualYieldUnitsPerKw}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("annualYieldUnitsPerKw", e.target.value)
                                  }
                                />
                              </div>

                              {/* Discharging Current */}
                              <div>
                                <label className="block text-sm font-medium">Open Circuit Volts</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.openCircuitVolts}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("openCircuitVolts", e.target.value)
                                  }
                                />
                              </div>

                              {/* Warranty */}
                              <div>
                                <label className="block text-sm font-medium">Short Circuit Amps</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.shortCircuitAmps}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("shortCircuitAmps", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Max Power Volts</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.maxPowerVolts}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("maxPowerVolts", e.target.value)
                                  }
                                />
                              </div>

                              {/* Warranty */}
                              <div>
                                <label className="block text-sm font-medium">Max Power Amps</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.maxPowerAmps}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("maxPowerAmps", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Model Number</label>
                                <input
                                  type="text"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.modelNumber}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("modelNumber", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Efficiency Percentage %</label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.efficiencyPercentage}
                                  disabled={isOrgAdminSelectModeForPanel}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("efficiencyPercentage", e.target.value)
                                  }
                                />
                              </div>

                              {/* Base Price */}
                              {isOrgAdmin && (<div>
                                <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPanelSpec.basePrice}
                                  onChange={(e) =>
                                    handlePanelSpecInputChange("basePrice", e.target.value)
                                  }
                                />
                              </div>)}

                            </div>

                            {isOrgAdminSelectModeForPanel ? (
                              <button
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleSelectPanelSpecs}
                              >
                                Select Specification
                              </button>
                            ) : editingPanelSpecId ? (
                              <button
                                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleUpdatePanelSpec(editingPanelSpecId, panelBrand.id);
                                  //setShowPanelSpecModal(false);
                                }}
                              >
                                Update Specification
                              </button>
                            ) : (
                              <button
                                className="mt-4 bg-success-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleAddNewPanelSpec(panelBrand.id);
                                  //setShowPanelSpecModal(false);
                                }}
                              >
                                Save Specification
                              </button>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              ))}
            </div>

          </div>

        </div>
      )}

      {/*-----------------------------------------------------------------------------------------------------------------*/}


      {/*--------------------------------------Pipe Section---------------------------------------------------------------*/}

      {activeSection === "pipe" && (

        <div className="mt-4 space-y-4">

          {/*----------------------------------------------------Selected Inverter Specification---------------------------------------*/}

          {isOrgAdmin && (<div className="mt-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            {/* HEADER */}
            <div
              className="flex items-center justify-between mb-2 cursor-pointer pr-2"
              onClick={() => setShowSelectedPipeBrands(!showSelectedPipeBrands)}
            >
              <h2 className="text-lg font-semibold">
                Selected Pipe Brands
              </h2>

              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSelectedPipeBrands ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>


            {showSelectedPipeBrands && (
              hasSelectedPipes ? (
                <div className="border rounded-lg">
                  {Object.values(groupByPipeBrand(selectedPipeSpecs)).map(
                    (pipeBrand: any) => (
                      <div key={pipeBrand.pipeBrandId} className="border-b">

                        {/* BRAND HEADER */}
                        <div
                          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setExpandedSelectedPipeBrand(
                              expandedSelectedPipeBrand === pipeBrand.pipeBrandId
                                ? null
                                : pipeBrand.pipeBrandId
                            )
                          }
                        >
                          <h3 className="font-semibold text-lg">
                            {pipeBrand.pipeBrandName}
                          </h3>

                          <span className="text-primary-600 text-sm">
                            {expandedSelectedPipeBrand === pipeBrand.pipeBrandId
                              ? "Hide Specs"
                              : "View Specs"}
                          </span>
                        </div>

                        {/* SPECS TABLE */}
                        {expandedSelectedPipeBrand === pipeBrand.pipeBrandId && (
                          <div className="p-4 bg-gray-50">
                            <table className="min-w-full text-left mb-4 border rounded bg-white">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="p-2 border">Dimensions (L × W × H)</th>
                                  <th className="p-2 border">Thickness</th>
                                  <th className="p-2 border">Weight</th>
                                  <th className="p-2 border">Base Price</th>
                                  <th className="p-2 border text-center">Action</th>
                                </tr>
                              </thead>

                              <tbody>
                                {pipeBrand.selectedPipeSpecs.map((pipeSpec: any) => (
                                  <tr key={pipeSpec.id}>
                                    <td className="p-2 border">
                                      {pipeSpec.lengthMeters} m × {pipeSpec.widthMm} mm × {pipeSpec.heightMm} mm
                                    </td>

                                    <td className="p-2 border">
                                      {pipeSpec.thicknessMm} mm
                                    </td>
                                    <td className="p-2 border">
                                      {pipeSpec.weightKg} kg
                                    </td>
                                    <td className="p-2 border">₹ {pipeSpec.basePrice}</td>

                                    <td className="p-2 border text-center flex gap-3 justify-center">
                                      <button
                                        className="text-yellow-600 hover:underline"
                                        onClick={() => {
                                          handleEditSelectedPipeSpec(pipeSpec);
                                          setShowFormForPipeBrand(null);
                                          setShowSelectedPipeSpecModal(true);
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 italic">
                  No pipe brands selected yet
                </div>
              )
            )}

            {/* === SPEC MODAL === */}
            {showSelectedPipeSpecModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">

                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      Edit Selected Specification
                    </h2>

                    <button
                      className="text-red-600 text-lg font-bold"
                      onClick={() => {
                        setShowSelectedPipeSpecModal(false);
                        setEditingSelectedPipeSpecId(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* FORM CONTENT (MOVE YOUR EXISTING FORM HERE) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium">Length in Meters <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPipeSpec.lengthMeters}
                        disabled
                        onChange={(e) =>
                          handlePipeSpecInputChange("lengthMeters", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Width in MM <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPipeSpec.widthMm}
                        disabled
                        onChange={(e) =>
                          handlePipeSpecInputChange("widthMm", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Height in MM <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPipeSpec.heightMm}
                        disabled
                        onChange={(e) =>
                          handlePipeSpecInputChange("heightMm", e.target.value)
                        }
                      />
                    </div>


                    <div>
                      <label className="block text-sm font-medium">Thickness in MM <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPipeSpec.thicknessMm}
                        disabled
                        onChange={(e) =>
                          handlePipeSpecInputChange("thicknessMm", e.target.value)
                        }
                      />
                    </div>

                    {/* Charging Current */}
                    <div>
                      <label className="block text-sm font-medium">Weight in Kg <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPipeSpec.weightKg}
                        disabled
                        onChange={(e) =>
                          handlePipeSpecInputChange("weightKg", e.target.value)
                        }
                      />
                    </div>



                    {/* Base Price */}
                    {isOrgAdmin && (<div>
                      <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="border p-2 rounded w-full"
                        value={newPipeSpec.basePrice}
                        onChange={(e) =>
                          handlePipeSpecInputChange("basePrice", e.target.value)
                        }
                      />
                    </div>)}

                    <div className="col-span-2">
                      <label className="block text-sm font-medium">Description</label>
                      <textarea
                        className="border p-2 rounded w-full"
                        rows={3}
                        value={newPipeSpec.description}
                        disabled
                        onChange={(e) => handlePipeSpecInputChange("description", e.target.value)}
                      />
                    </div>

                  </div>

                  <button
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                      if (!editingSelectedPipeSpecId || !userInfo?.orgId) return;

                      const payload = buildSelectedPipeSpecUpdatePayload();

                      await updateSelectedPipeSpec(editingSelectedPipeSpecId, payload);
                      await loadSelectedPipes();

                      setShowSelectedPipeSpecModal(false);
                      setEditingSelectedPipeSpecId(null);
                    }}
                  >
                    Update Selected Specification
                  </button>

                </div>
              </div>
            )}


          </div>)}


          <div className="mt-6 p-5 border rounded-lg shadow-sm bg-white dark:bg-secondary-900">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pipe Brands</h2>

              {isSuperAdmin && (<button
                onClick={() => setShowAddModalForPipeBrand(true)}
                className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
              >
                + Add New Pipe
              </button>)}
            </div>


            {showAddModalForPipeBrand && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-[450px]">

                  <h3 className="text-lg font-semibold mb-4">
                    {isEditingPipeBrand ? "Edit Pipe Brand" : "Add Pipe Brand"}
                  </h3>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Pipe brand name"
                    className="border p-2 rounded w-full mb-4"
                  />

                  <div className="flex justify-end gap-3">

                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setShowAddModalForPipeBrand(false)
                        setEditingPipeBrandId(null);
                        setName("")
                        setIsEditingPipeBrand(false);

                      }}
                    >
                      Cancel
                    </button>

                    {isEditingPipeBrand ? (
                      <button
                        onClick={handleUpdatePipeBrand}
                        className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                      >
                        Update
                      </button>
                    ) : (
                      <button
                        onClick={handleAddPipeBrand}
                        className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded"
                      >
                        Add
                      </button>
                    )}


                  </div>
                </div>
              </div>
            )}


            {/* Brand List */}
            <div className="border rounded-lg">
              {pipes.map((pipeBrand) => (
                <div key={pipeBrand.id} className="border-b">

                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                    onClick={async () => {
                      setExpandedPipeBrandId(expandedPipeBrandId === pipeBrand.id ? null : pipeBrand.id);

                      if (!pipeBrandSpecs[pipeBrand.id]) {
                        const pipeSpecs = await fetchPipeSpecsByBrand(pipeBrand.id);
                        setPipeBrandSpecs((prev) => ({ ...prev, [pipeBrand.id]: pipeSpecs }));
                      }
                    }}
                  >
                    {/* Brand Name or Editable Input */}
                    <h3 className="font-semibold text-lg">{pipeBrand.name}</h3>


                    <div className="flex items-center gap-4">

                      {/* Edit Brand (always modal only) */}
                      {isSuperAdmin && (<button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPipeBrandId(pipeBrand.id);
                          setName(pipeBrand.name)
                          setIsEditingPipeBrand(true);
                          setShowAddModalForPipeBrand(true);
                        }}
                        className="text-yellow-600 text-sm hover:underline"
                      >
                        Edit Brand
                      </button>)}

                      {isSuperAdmin && (<button
                        className="text-green-600 text-sm hover:underline"
                        onClick={() => openAddPipeSpecForm(pipeBrand.id)}
                      >
                        Add Specs
                      </button>)}

                      <span
                        className="text-primary-600 text-sm cursor-pointer"
                        onClick={() => {
                          if (expandedPipeBrandId === pipeBrand.id) {
                            setExpandedPipeBrandId(null);
                            setShowFormForPipeBrand(null);
                            setEditingPipeSpecId(null);
                          } else {
                            setExpandedPipeBrandId(pipeBrand.id);
                            setShowFormForPipeBrand(null);
                          }
                        }}
                      >
                        {expandedPipeBrandId === pipeBrand.id ? "Hide Specs" : "View Available Specs"}
                      </span>

                    </div>

                  </div>



                  {expandedPipeBrandId === pipeBrand.id && (
                    <div className="p-4 bg-gray-50">

                      {/* Existing Specs Table */}
                      <table className="min-w-full text-left mb-4 border rounded bg-white">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="p-2 border">Dimensions (L × W × H)</th>
                            <th className="p-2 border">Thickness</th>
                            <th className="p-2 border">Weight</th>
                            <th className="p-2 border text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {pipeBrandSpecs[pipeBrand.id]?.map((pipeSpec: any) => (
                            <tr key={pipeSpec.id} className="border-b">

                              <td className="p-2 border">
                                {pipeSpec.lengthMeters} m × {pipeSpec.widthMm} mm × {pipeSpec.heightMm} mm
                              </td>

                              <td className="p-2 border">
                                {pipeSpec.thicknessMm} mm
                              </td>
                              <td className="p-2 border">
                                {pipeSpec.weightKg} kg
                              </td>


                              <td className="p-2 border text-center flex gap-3 justify-center">
                                {userInfo?.role === "ROLE_ORG_ADMIN" ? (
                                  <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => {
                                      // prefill spec data
                                      setNewPipeSpec({
                                        ...pipeSpec,
                                        basePrice: "",
                                      });

                                      setSelectedPipeSpecId(pipeSpec.id);
                                      setEditingPipeSpecId(null);
                                      setShowFormForPipeBrand(pipeBrand.id);
                                      setShowPipeSpecModal(true);
                                    }}
                                  >
                                    Select Specification
                                  </button>
                                ) : (
                                  <>
                                    {/* EDIT */}
                                    <button
                                      className="text-yellow-600 hover:underline"
                                      onClick={() => {
                                        handleEditPipeSpec(pipeSpec);
                                        setShowFormForPipeBrand(pipeBrand.id);
                                        setShowPipeSpecModal(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>


                      {/* === SPEC MODAL === */}
                      {showPipeSpecModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                              <h2 className="text-xl font-semibold">
                                {isOrgAdminSelectModeForPipe
                                  ? "Select Specification for Organization"
                                  : editingPipeSpecId
                                    ? "Edit Specification"
                                    : "Add New Specification"}
                              </h2>


                              <button
                                className="text-red-600 text-lg font-bold"
                                onClick={() => {
                                  setShowPipeSpecModal(false);
                                  setShowFormForPipeBrand(null);
                                  setEditingPipeSpecId(null);
                                }}
                              >
                                ✕
                              </button>
                            </div>

                            {/* FORM CONTENT (MOVE YOUR EXISTING FORM HERE) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                              <div>
                                <label className="block text-sm font-medium">Length in Meters <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPipeSpec.lengthMeters}
                                  disabled={isOrgAdminSelectModeForPipe}
                                  onChange={(e) =>
                                    handlePipeSpecInputChange("lengthMeters", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Width in MM <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPipeSpec.widthMm}
                                  disabled={isOrgAdminSelectModeForPipe}
                                  onChange={(e) =>
                                    handlePipeSpecInputChange("widthMm", e.target.value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Height in MM <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPipeSpec.heightMm}
                                  disabled={isOrgAdminSelectModeForPipe}
                                  onChange={(e) =>
                                    handlePipeSpecInputChange("heightMm", e.target.value)
                                  }
                                />
                              </div>


                              <div>
                                <label className="block text-sm font-medium">Thickness in MM <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPipeSpec.thicknessMm}
                                  disabled={isOrgAdminSelectModeForPipe}
                                  onChange={(e) =>
                                    handlePipeSpecInputChange("thicknessMm", e.target.value)
                                  }
                                />
                              </div>

                              {/* Charging Current */}
                              <div>
                                <label className="block text-sm font-medium">Weight in Kg <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPipeSpec.weightKg}
                                  disabled={isOrgAdminSelectModeForPipe}
                                  onChange={(e) =>
                                    handlePipeSpecInputChange("weightKg", e.target.value)
                                  }
                                />
                              </div>



                              {/* Base Price */}
                              {isOrgAdmin && (<div>
                                <label className="block text-sm font-medium">Base Price (₹) <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  className="border p-2 rounded w-full"
                                  value={newPipeSpec.basePrice}
                                  onChange={(e) =>
                                    handlePipeSpecInputChange("basePrice", e.target.value)
                                  }
                                />
                              </div>)}

                              <div className="col-span-2">
                                <label className="block text-sm font-medium">Description</label>
                                <textarea
                                  className="border p-2 rounded w-full"
                                  rows={3}
                                  value={newPipeSpec.description}
                                  disabled={isOrgAdminSelectModeForPipe}
                                  onChange={(e) => handlePipeSpecInputChange("description", e.target.value)}
                                />
                              </div>

                            </div>

                            {isOrgAdminSelectModeForPipe ? (
                              <button
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleSelectPipeSpecs}
                              >
                                Select Specification
                              </button>
                            ) : editingPipeSpecId ? (
                              <button
                                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleUpdatePipeSpec(Number(editingPipeSpecId), pipeBrand.id);
                                  setShowPipeSpecModal(false);
                                }}
                              >
                                Update Specification
                              </button>
                            ) : (
                              <button
                                className="mt-4 bg-success-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                  handleAddNewPipeSpec(pipeBrand.id);
                                  setShowPipeSpecModal(false);
                                }}
                              >
                                Save Specification
                              </button>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
