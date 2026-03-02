import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, CreditCard, Info, Plus, X as CloseIcon } from "lucide-react";
import {
    BoltIcon,
    HomeModernIcon,
    CalendarDaysIcon,
    ChatBubbleBottomCenterTextIcon,
    WrenchIcon,
    ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";
import { getSavedSystemSpecs, fetchSelectedPanelSpecs, getSystemPackagesWithSpecs, getRunningCopySystemSpec, saveSystemSpecs, saveInverterSpecs, savePipeSpecs } from "../../services/quotationService";
import { toast } from "react-toastify";
import { getConnectionByConnectionId, getCustomerById } from "../../services/customerRequisitionService";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { useUser } from "../../contexts/UserContext";

const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");


interface Inverter {
    inverterBrandName: string;
    inverterCapacity: number;
    inverterCount: number;
    gridTypeName: string;
    productWarranty?: number;
}

interface Pipe {
    pipeBrandName?: string;
    pipeSize?: string;
    pipeCount?: number;
    pipeWidth?: number;
    pipeHeight?: number;
    pipeThickness?: number;
    pipeLength?: number;
}

interface SystemSpec {
    id: number;
    connectionId: number;
    isRunningCopy: boolean;

    panelBrandShortName?: string;
    panelRatedWattageW?: number;
    systemCapacityKw?: number;

    systemCost?: number;
    fabricationCost?: number;
    totalCost?: number; // Added total cost

    batteryBrandName?: string;
    batteryCapacityKw?: number;
    batteryCount?: number; // Added

    title?: string; // Added
    panelCount?: number; // Added
    description?: string; // Added

    inverters?: Inverter[];
    pipes?: Pipe[];

    createdAt: string;

    installationSpaceType?: string;
    installationStructureType?: string;
    hasWaterSprinkler?: boolean;
    hasHeavydutyRamp?: boolean;
    hasHeavydutyStairs?: boolean;
    validFrom?: string;
    validThru?: string;
    systemSpecsId?: number;

    // Added for Order Creation
    orgPanelSpecId?: number;
    orgBatterySpecId?: number;
    bosSpecsId?: number;
    specSourceId?: number;
    userId?: number;
    orgId?: number;
    finalInverters?: any[];
    finalPipes?: any[];
}



export const ViewSystemSpecifications = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consumerId, connectionId, customerId } = location.state || {}; // systemSpecsId removed to show all

    const [allSpecs, setAllSpecs] = useState<SystemSpec[]>([]);
    const [selectedSpec, setSelectedSpec] = useState<SystemSpec | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { userClaims } = useUser();
    const [isGharkulCustomer, setIsGharkulCustomer] = useState<boolean | null>(null);
    const [, setConnectionDetails] = useState<any>(null);
    const [, setConnectionType] = useState("");
    const [orgId, setOrgId] = useState<number | null>(null);
    const [, setAgencyId] = useState<number | null>(null);
    const [, setGovIdName] = useState("");

    // New State for System Packages
    const [panelSpecs, setPanelSpecs] = useState<any[]>([]);
    const [selectedPanelSpecId, setSelectedPanelSpecId] = useState<number | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingSpec, setViewingSpec] = useState<SystemSpec | null>(null);

    useEffect(() => {
        const fetchSpecs = async () => {
            if (!connectionId) return;
            try {
                const data = await getSavedSystemSpecs(connectionId);
                // Show all specs that are active/runnning copies
                // Filter out any invalid ones if necessary, for now showing all
                setAllSpecs(data);

                // Default select the latest one
                if (data.length > 0) {
                    // Sort by ID descending to get latest
                    const sorted = [...data].sort((a, b) => b.id - a.id);
                    setSelectedSpec(sorted[0]);
                }
            } catch (error) {
                console.error("Failed to fetch system specs", error);
                toast.error("Failed to load system specifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchSpecs();
    }, [connectionId]);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (customerId) {
                const data = await getCustomerById(Number(customerId));
                setGovIdName(data?.govIdName || "");
                setOrgId(data?.organizationId || null);
                setAgencyId(data?.agencyId || null);
            }
        };
        fetchCustomer();
    }, [customerId]);

    useEffect(() => {
        const fetchConnection = async () => {
            if (!connectionId) {
                console.error("Connection ID not found!");
                return;
            }

            try {
                const data = await getConnectionByConnectionId(Number(connectionId));
                setConnectionDetails(data);

                if (data?.phaseTypeId !== null && data?.phaseTypeId !== null && data?.connectionTypeName && data?.isGharkulCustomer !== null) {
                    setConnectionType(data.connectionTypeName);
                    setIsGharkulCustomer(!!data?.isGharkulCustomer);
                    console.log("Fetched Phase Type Id, monthly avg unit from API:", data.phaseTypeId, data.avgMonthlyConsumption);
                } else {
                    setConnectionType("");
                    setIsGharkulCustomer(false);
                }
            } catch (error) {
                console.error("Failed to fetch connection details", error);
            }
        };

        fetchConnection();
        fetchConnection();
    }, [connectionId]);

    // Fetch Panel Specs when Org ID is available
    useEffect(() => {
        const loadPanelSpecs = async () => {
            if (orgId) {
                try {
                    const specs = await fetchSelectedPanelSpecs(orgId);
                    setPanelSpecs(specs || []);
                } catch (error) {
                    console.error("Failed to fetch panel specs", error);
                }
            }
        };
        loadPanelSpecs();
    }, [orgId]);

    // Fetch System Packages when orgId or panel is selected
    useEffect(() => {
        const fetchPackages = async () => {
            if (orgId && isGharkulCustomer !== null) {
                try {
                    setLoading(true);
                    // Assuming isGharkulCustomer is boolean, default to false if null
                    const isGharkul = !!isGharkulCustomer;

                    // Note: ensure phaseTypeId is passed if needed, otherwise ignore or pass 0/null
                    // If selectedPanelSpecId is null, it will fetch all packages for the org
                    const packages = await getSystemPackagesWithSpecs(isGharkul, orgId, selectedPanelSpecId || undefined);
                    console.log("Params: ", isGharkul, orgId, selectedPanelSpecId);

                    // Map API response to SystemSpec interface
                    const mappedSpecs: SystemSpec[] = packages.map((pkg: any) => {
                        const specs = pkg.systemSpecs || {};
                        return {
                            id: pkg.id || specs.id || Math.random(), // Use package ID primarily
                            connectionId: Number(connectionId),
                            isRunningCopy: false, // These are templates
                            systemSpecsId: specs.id,

                            title: pkg.title,
                            panelBrandShortName: specs.panelBrandShortName,
                            panelRatedWattageW: specs.panelRatedWattageW || specs.panelRatedWattage,
                            systemCapacityKw: specs.systemCapacityKw,
                            panelCount: specs.panelCount,

                            systemCost: specs.systemCost,
                            fabricationCost: specs.fabricationCost,
                            totalCost: (specs.systemCost || 0) + (specs.fabricationCost || 0),

                            batteryBrandName: specs.batteryBrandName,
                            batteryCount: specs.batteryCount,
                            batteryCapacityKw: specs.batteryCapacityKw,

                            inverters: specs.inverters?.map((inv: any) => ({
                                inverterBrandName: inv.inverterBrandName,
                                inverterCount: inv.inverterCount,
                                inverterCapacity: inv.inverterCapacity || 0,
                                gridTypeName: inv.gridTypeName || "",
                                productWarranty: inv.productWarranty
                            })) || [],

                            pipes: specs.pipes?.map((p: any) => ({
                                pipeBrandName: p.pipeBrandName,
                                pipeCount: p.pipeCount,
                                pipeWidth: p.pipeWidth,
                                pipeHeight: p.pipeHeight,
                                pipeThickness: p.pipeThickness,
                                pipeLength: p.pipeLength
                            })) || [],

                            installationStructureType: specs.installationStructureType,
                            hasWaterSprinkler: specs.hasWaterSprinkler,
                            hasHeavydutyRamp: specs.hasHeavydutyRamp,
                            hasHeavydutyStairs: specs.hasHeavydutyStairs,
                            validFrom: pkg.validFrom,
                            validThru: pkg.validThru,
                            description: pkg.description,
                            createdAt: specs.createdAt || new Date().toISOString(),

                            // IDs for Order Creation
                            orgPanelSpecId: specs.orgPanelSpecId,
                            orgBatterySpecId: specs.orgBatterySpecId,
                            bosSpecsId: specs.bosSpecsId || 1, // Defaulting if not present
                            specSourceId: specs.specSourceId || 1, // Defaulting if not present

                            // Raw Inverters/Pipes for re-saving
                            finalInverters: specs.inverters || [],
                            finalPipes: specs.pipes || []
                        };
                    });

                    // Fetch customized system spec (running copy)
                    let finalSpecs = [...mappedSpecs];
                    try {
                        const runningCopy = await getRunningCopySystemSpec(Number(connectionId));
                        if (runningCopy) {
                            const specs = runningCopy.systemSpecs || runningCopy; // Adjust based on API structure
                            const customizedSpec: SystemSpec = {
                                id: runningCopy.id || Math.random(),
                                connectionId: Number(connectionId),
                                isRunningCopy: true, // Mark as customized
                                systemSpecsId: specs.id,

                                title: "Your Customized Plan",
                                panelBrandShortName: specs.panelBrandShortName,
                                panelRatedWattageW: specs.panelRatedWattageW || specs.panelRatedWattage,
                                systemCapacityKw: specs.systemCapacityKw,
                                panelCount: specs.panelCount,

                                systemCost: specs.systemCost,
                                fabricationCost: specs.fabricationCost,
                                totalCost: (specs.systemCost || 0) + (specs.fabricationCost || 0),

                                batteryBrandName: specs.batteryBrandName,
                                batteryCount: specs.batteryCount,
                                batteryCapacityKw: specs.batteryCapacityKw,

                                inverters: specs.inverters?.map((inv: any) => ({
                                    inverterBrandName: inv.inverterBrandName,
                                    inverterCount: inv.inverterCount,
                                    inverterCapacity: inv.inverterCapacity || 0,
                                    gridTypeName: inv.gridTypeName || "",
                                    productWarranty: inv.productWarranty
                                })) || [],

                                pipes: specs.pipes?.map((p: any) => ({
                                    pipeBrandName: p.pipeBrandName,
                                    pipeCount: p.pipeCount,
                                    pipeWidth: p.pipeWidth,
                                    pipeHeight: p.pipeHeight,
                                    pipeThickness: p.pipeThickness,
                                    pipeLength: p.pipeLength
                                })) || [],

                                installationStructureType: specs.installationStructureType,
                                hasWaterSprinkler: specs.hasWaterSprinkler,
                                hasHeavydutyRamp: specs.hasHeavydutyRamp,
                                hasHeavydutyStairs: specs.hasHeavydutyStairs,
                                validFrom: runningCopy.validFrom,
                                validThru: runningCopy.validThru,
                                description: "This is your customized system configuration.",
                                createdAt: specs.createdAt || new Date().toISOString(),

                                // IDs for Order Creation
                                orgPanelSpecId: specs.orgPanelSpecId,
                                orgBatterySpecId: specs.orgBatterySpecId,
                                bosSpecsId: specs.bosSpecsId || 1,
                                specSourceId: specs.specSourceId || 1,

                                // Raw Inverters/Pipes for re-saving
                                finalInverters: specs.inverters || [],
                                finalPipes: specs.pipes || []
                            };

                            // Remove duplicate if it was already in the list
                            finalSpecs = [customizedSpec, ...mappedSpecs.filter(s => s.systemSpecsId !== customizedSpec.systemSpecsId)];
                        }
                    } catch (err) {
                        console.error("Failed to fetch running copy", err);
                    }

                    setAllSpecs(finalSpecs);
                    if (finalSpecs.length > 0) {
                        setSelectedSpec(finalSpecs[0]);
                    } else {
                        setSelectedSpec(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch system packages", error);
                    toast.error("Failed to load system packages.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPackages();
    }, [selectedPanelSpecId, orgId, isGharkulCustomer, connectionId]);

    const formatIndianNumber = (value?: number) => {
        if (value === undefined || value === null) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
        }).format(value);
    };



    const handleConfirmOrder = async () => {
        if (!selectedSpec) return;

        setIsSaving(true);
        try {
            // 1. Save System Spec
            const payload = {
                installationSpaceType: selectedSpec.installationSpaceType || null,
                installationStructureType: selectedSpec.installationStructureType || "Static",
                systemCost: selectedSpec.systemCost || 0,
                fabricationCost: selectedSpec.fabricationCost || 0,
                connectionId: Number(connectionId),
                hasWaterSprinkler: !!selectedSpec.hasWaterSprinkler,
                hasHeavydutyRamp: !!selectedSpec.hasHeavydutyRamp,
                hasHeavydutyStairs: !!selectedSpec.hasHeavydutyStairs,
                orgPanelSpecId: selectedSpec.orgPanelSpecId,
                orgBatterySpecId: selectedSpec.orgBatterySpecId,
                batteryCount: selectedSpec.batteryCount || (selectedSpec.orgBatterySpecId ? 1 : null),
                bosSpecsId: selectedSpec.bosSpecsId || 1,
                specSourceId: selectedSpec.specSourceId || 1,
                userId: userClaims?.id,
                orgId: orgId,
                systemCapacityKw: selectedSpec.systemCapacityKw,
                isRunningCopy: true
            };

            const systemResponse = await saveSystemSpecs(payload);
            const newSystemSpecsId = systemResponse.id;

            // 2. Save Inverters if any
            if (selectedSpec.finalInverters && selectedSpec.finalInverters.length > 0) {
                const inverterList = selectedSpec.finalInverters.map((inv: any) => ({
                    systemSpecsId: newSystemSpecsId,
                    orgInverterSpecId: inv.orgInverterSpecId || inv.id, // Fallback if necessary
                    inverterCount: inv.inverterCount || 1,
                }));
                await saveInverterSpecs(inverterList);
            }

            // 3. Save Pipes if any
            if (selectedSpec.finalPipes && selectedSpec.finalPipes.length > 0) {
                const pipeList = selectedSpec.finalPipes.map((p: any) => ({
                    systemSpecsId: newSystemSpecsId,
                    orgPipeSpecId: p.orgPipeSpecId || p.id,
                    pipeCount: p.pipeCount || 1,
                }));
                await savePipeSpecs(pipeList);
            }

            toast.success("Order confirmed successfully!");

            // 4. Navigate to Checkout with the NEW ID
            navigate('/checkout-system-specification', {
                state: {
                    selectedSpec: { ...selectedSpec, id: newSystemSpecsId },
                    connectionId,
                    consumerId,
                    customerId
                }
            });

        } catch (error) {
            console.error("Failed to confirm order", error);
            toast.error("Failed to confirm order. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleProceedToBuy = () => {
        // This is now replaced by handleConfirmOrder
        handleConfirmOrder();
    };

    const handleAddPackage = () => {
        navigate(`/system-specifications`, {
            state: {
                consumerId,
                customerId,
                connectionId,
                prefillSystemSpecId: selectedSpec?.systemSpecsId
            },
        });
    };

    const handleOpenModal = (spec: SystemSpec, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewingSpec(spec);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setViewingSpec(null);
    };


    if (loading) return <div className="p-8 text-center">Loading...</div>;


    return (
        <div className="min-h-screen bg-gray-50 py-4 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                navigate(-1)
                            }
                            className="p-2 rounded-full hover:bg-gray-200 transition"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-700">Confirm & Pay</h1>
                    </div>

                    {(userInfo?.role === "ROLE_ORG_ADMIN" ||
                        userInfo?.role === "ROLE_BDO") && <button
                            onClick={handleAddPackage}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Customize Your Plan
                        </button>}
                </div>

                {/* Progress Steps */}
                {/*<div className="w-full max-w-4xl mx-auto mb-6 mt-2 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
                    <div className="relative flex justify-center min-w-[500px] md:min-w-0">
                   
                        <div className="absolute top-5 left-[16%] right-[18%] h-0.5 bg-gray-300 z-0 md:left-[18%] md:right-[20%]" />

                        <div className="flex justify-between w-full px-4 md:w-[80%] z-10 min-w-[500px]">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab;
                                const Icon =
                                    tab === "Customer Details"
                                        ? UserCircleIcon
                                        : tab === "Connection Details"
                                            ? BoltIcon
                                            : tab === "Installation Details"
                                                ? HomeModernIcon
                                                : Cog6ToothIcon;

                                const shouldHighlightIcon = true;

                                return (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            let path = "";
                                            if (tab === "Customer Details") path = "/view-customer";
                                            if (tab === "Connection Details") path = "/view-connection";
                                            if (tab === "Installation Details") path = "/view-installation";
                                            if (tab === "System Specifications") path = "/view-system-specifications";

                                            if (path) {
                                                navigate(path, { state: { consumerId, customerId, connectionId } });
                                            }
                                        }}
                                        className="flex flex-col items-center gap-1 min-w-[80px] md:min-w-0 z-10"
                                    >
                                        <div
                                            className={`rounded-full p-2 transition-all duration-300 ${shouldHighlightIcon
                                                ? "bg-blue-500 text-white border border-transparent"
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
                </div>*/}

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Column: Package List */}
                    <div className="w-full lg:w-2/3 space-y-4">

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Choose Your Solar Panels</label>
                                {selectedPanelSpecId && (
                                    <button
                                        onClick={() => setSelectedPanelSpecId(null)}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition"
                                    >
                                        <CloseIcon className="w-3 h-3" />
                                        SHOW ALL PACKAGES
                                    </button>
                                )}
                            </div>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                value={selectedPanelSpecId || ""}
                                onChange={(e) => setSelectedPanelSpecId(e.target.value === "" ? null : Number(e.target.value))}
                            >
                                <option value="">All Panels (Show All Packages)</option>
                                {panelSpecs.map((spec: any) => (
                                    <option key={spec.id} value={spec.id}>
                                        {spec.panelBrandName} - {spec.ratedWattageW}W - {spec.modelNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-4 px-1">Our Solar Plans</h3>
                        {allSpecs.length === 0 ? (
                            <div className="bg-white p-12 text-center text-gray-500 rounded-xl border-2 border-dashed border-gray-200 shadow-inner">
                                <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg">Select a panel to see matching system packages.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allSpecs.map((spec) => (
                                    <div
                                        key={spec.id}
                                        onClick={() => setSelectedSpec(spec)}
                                        className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all duration-200 group relative ${selectedSpec?.id === spec.id
                                            ? spec.isRunningCopy
                                                ? "border-amber-500 ring-4 ring-amber-50 bg-amber-50/10"
                                                : "border-blue-500 ring-4 ring-blue-50 bg-blue-50/10"
                                            : spec.isRunningCopy
                                                ? "border-amber-100 hover:border-amber-200 hover:shadow-md bg-amber-50/5"
                                                : "border-gray-100 hover:border-blue-200 hover:shadow-md"
                                            }`}
                                    >
                                        {spec.isRunningCopy && (
                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm z-10 animate-pulse">
                                                CUSTOMIZED
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSpec?.id === spec.id
                                                    ? spec.isRunningCopy ? "border-amber-600 bg-amber-600" : "border-blue-600 bg-blue-600"
                                                    : "border-gray-300 group-hover:border-blue-400"
                                                    }`}>
                                                    {selectedSpec?.id === spec.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className={`text-base font-extrabold transition-colors ${spec.isRunningCopy ? "text-amber-900 group-hover:text-amber-700" : "text-gray-900 group-hover:text-blue-700"}`}>
                                                            {spec.title || `${spec.systemCapacityKw} kW System`}
                                                        </h4>
                                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${spec.isRunningCopy ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                                            {spec.systemCapacityKw} kW
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-500 mb-1.5 capitalize">
                                                        {spec.panelBrandShortName} Solar Panels
                                                    </p>

                                                    {spec.description && (
                                                        <p className="text-[11px] text-gray-500 line-clamp-1 mb-2 bg-gray-50/50 p-1 rounded italic">
                                                            "{spec.description}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-blue-600 mb-0">
                                                    ₹{formatIndianNumber((spec.systemCost || 0) + (spec.fabricationCost || 0))}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Key Features Grid & Action */}
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-end gap-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 flex-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Panels</span>
                                                    <span className="text-xs font-bold text-gray-800">
                                                        {spec.panelCount || 0} x {spec.panelRatedWattageW}W
                                                    </span>
                                                </div>
                                                {spec.inverters && spec.inverters.length > 0 && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Inverter</span>
                                                        <span className="text-xs font-bold text-gray-800 truncate" title={spec.inverters[0].inverterBrandName}>
                                                            {spec.inverters[0].inverterBrandName}
                                                        </span>
                                                    </div>
                                                )}
                                                {spec.batteryBrandName && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Battery</span>
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {spec.batteryBrandName}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Structure</span>
                                                    <span className="text-xs font-bold text-gray-800 truncate" title={spec.pipes && spec.pipes.length > 0 ? spec.pipes[0].pipeBrandName : "Structure"}>
                                                        {spec.pipes && spec.pipes.length > 0 ? spec.pipes[0].pipeBrandName : (spec.installationStructureType || "Static")}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handleOpenModal(spec, e)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-[10px] font-black text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
                                            >
                                                <Info className="w-3 h-3" />
                                                VIEW ALL SPECS
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Checkout / Details */}
                    <div className="w-full lg:w-1/3">
                        {selectedSpec ? (
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Details</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">System Cost</span>
                                        <span className="font-medium">₹ {formatIndianNumber(selectedSpec.systemCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Fabrication Cost</span>
                                        <span className="font-medium">₹ {formatIndianNumber(selectedSpec.fabricationCost)}</span>
                                    </div>
                                    <div className="border-t border-dashed border-gray-300 my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-gray-800">Total</span>
                                        <span className="text-blue-600">₹ {formatIndianNumber((selectedSpec.systemCost || 0) + (selectedSpec.fabricationCost || 0))}</span>
                                    </div>
                                </div>

                                {/* Confirm Order */}
                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold shadow-sm transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    {isSaving ? "Processing..." : "Confirm Order"}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                                Select a package to view details and proceed.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Package Details Modal */}
            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    className: "rounded-2xl overflow-hidden shadow-2xl"
                }}
            >
                {viewingSpec && (
                    <>
                        <DialogTitle className="bg-blue-600 text-white flex justify-between items-center p-6">
                            <div className="flex items-center gap-3">
                                <Info className="w-6 h-6" />
                                <div>
                                    <h2 className="text-xl font-black leading-tight">{viewingSpec.title || "Package Details"}</h2>
                                    <p className="text-blue-100 text-[11px] font-bold uppercase tracking-widest mt-0.5">Technical Specifications & Warranty</p>
                                </div>
                            </div>
                            <IconButton onClick={handleCloseModal} className="text-white hover:bg-blue-700 transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent className="p-0 bg-gray-50">
                            <div className="p-6 space-y-8">

                                {/* Header Section: Overview & Validity */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 flex items-center gap-1.5">
                                                <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                                                Description
                                            </h3>
                                            <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-gray-100 italic">
                                                {viewingSpec.description || "No detailed description available for this package."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 flex items-center gap-1.5">
                                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                                            Offer Validity
                                        </h3>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                                            <div className="pb-3 flex justify-between items-center">
                                                <span className="text-[11px] font-bold text-gray-400">Valid From</span>
                                                <span className="text-sm font-black text-gray-800">{viewingSpec.validFrom || "N/A"}</span>
                                            </div>
                                            <div className="pt-3 flex justify-between items-center">
                                                <span className="text-[11px] font-bold text-gray-400">Valid Through</span>
                                                <span className="text-sm font-black text-red-500">{viewingSpec.validThru || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Specs Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Column 1: Power & Inverter */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 flex items-center gap-1.5">
                                                <BoltIcon className="w-3.5 h-3.5" />
                                                Inverter & Electricals
                                            </h3>
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                                                {viewingSpec.inverters?.map((inv, idx) => (
                                                    <div key={idx} className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-gray-500">Brand & Count</span>
                                                            <span className="text-sm font-extrabold text-gray-900">{inv.inverterBrandName} ({inv.inverterCount})</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-gray-500">Capacity</span>
                                                            <span className="text-sm font-extrabold text-blue-600">{inv.inverterCapacity} kW</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-gray-500">Grid Type</span>
                                                            <span className="text-sm font-extrabold text-gray-900">{inv.gridTypeName}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                                            <span className="text-xs font-black text-green-700 uppercase tracking-tighter">Product Warranty</span>
                                                            <span className="text-sm font-black text-green-700">{inv.productWarranty || "Standard"} Years</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!viewingSpec.inverters || viewingSpec.inverters.length === 0) && (
                                                    <p className="text-xs text-gray-400 italic">No inverter details found.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 flex items-center gap-1.5">
                                                <HomeModernIcon className="w-3.5 h-3.5" />
                                                Installation Assets
                                            </h3>
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] uppercase font-black text-gray-400 mb-1">Sprinkler</span>
                                                    {viewingSpec.hasWaterSprinkler ?
                                                        <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                        <CloseIcon className="w-5 h-5 text-gray-300" />
                                                    }
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] uppercase font-black text-gray-400 mb-1">HD Ramp</span>
                                                    {viewingSpec.hasHeavydutyRamp ?
                                                        <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                        <CloseIcon className="w-5 h-5 text-gray-300" />
                                                    }
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-center col-span-2">
                                                    <span className="text-[10px] uppercase font-black text-gray-400 mb-1">HD Stairs</span>
                                                    {viewingSpec.hasHeavydutyStairs ?
                                                        <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                        <CloseIcon className="w-5 h-5 text-gray-300" />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Structure & Meta */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 flex items-center gap-1.5">
                                                <WrenchIcon className="w-3.5 h-3.5" />
                                                Structure (Pipe Specifications)
                                            </h3>
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                                                {viewingSpec.pipes?.map((pipe, idx) => (
                                                    <div key={idx} className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-gray-500">Brand</span>
                                                            <span className="text-sm font-extrabold text-gray-900">{pipe.pipeBrandName}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                                <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Width x Height</span>
                                                                <span className="text-xs font-extrabold">{pipe.pipeWidth || 0} x {pipe.pipeHeight || 0} mm</span>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                                <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Thickness</span>
                                                                <span className="text-xs font-extrabold">{pipe.pipeThickness || 0} mm</span>
                                                            </div>
                                                            <div className="bg-blue-50 p-3 rounded-xl col-span-2 flex justify-between items-center">
                                                                <span className="text-[10px] font-black text-blue-600 uppercase">Length per pipe</span>
                                                                <span className="text-xs font-black text-blue-700">{pipe.pipeLength || 0} Meters</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!viewingSpec.pipes || viewingSpec.pipes.length === 0) && (
                                                    <p className="text-xs text-gray-400 italic">No structure pipe details found.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3 flex items-center gap-1.5">
                                                <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                                                System Information
                                            </h3>
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-500">Total System Capacity</span>
                                                    <span className="text-sm font-extrabold text-blue-600">{viewingSpec.systemCapacityKw} kW</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-500">Panel Configuration</span>
                                                    <span className="text-sm font-black text-gray-900">{viewingSpec.panelCount} x {viewingSpec.panelRatedWattageW}W</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-500">Structure Type</span>
                                                    <span className="text-sm font-black text-gray-900">{viewingSpec.installationStructureType || "Static Structure"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </div>
    );
};
