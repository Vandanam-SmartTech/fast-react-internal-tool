import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, FileText, Plus, Download, Upload, CreditCard } from "lucide-react";
import {
    UserCircleIcon,
    BoltIcon,
    HomeModernIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { getSavedSystemSpecs, generateQuotationPDF, fetchSelectedPanelSpecs, getSystemPackagesWithSpecs } from "../../services/quotationService";
import { uploadDocuments } from "../../services/documentManagerService";
import { toast } from "react-toastify";
import { getConnectionByConnectionId, getCustomerById } from "../../services/customerRequisitionService";

const userInfo = JSON.parse(localStorage.getItem("selectedOrg") || "{}");


interface Inverter {
    inverterBrandName: string;
    inverterCapacity: number;
    inverterCount: number;
    gridTypeName: string;
}

interface Pipe {
    pipeBrandName?: string;
    pipeSize?: string;
    pipeCount?: number;
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

    inverters?: Inverter[];
    pipes?: Pipe[];

    createdAt: string;

    installationSpaceType?: string;
    installationStructureType?: string;
    hasWaterSprinkler?: boolean;
    hasHeavydutyRamp?: boolean;
    hasHeavydutyStairs?: boolean;
}



export const ViewSystemSpecifications = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consumerId, connectionId, customerId } = location.state || {}; // systemSpecsId removed to show all

    const [allSpecs, setAllSpecs] = useState<SystemSpec[]>([]);
    const [selectedSpec, setSelectedSpec] = useState<SystemSpec | null>(null);
    const [loading, setLoading] = useState(true);
    const [requestingQuote, setRequestingQuote] = useState(false);
    const [uploadingQuote, setUploadingQuote] = useState(false);
    const [activeTab, setActiveTab] = useState("System Specifications");
    const [phaseTypeId, setPhaseTypeId] = useState<number | null>(null);
    const [isGharkulCustomer, setIsGharkulCustomer] = useState<boolean | null>(null);
    const [, setConnectionDetails] = useState<any>(null);
    const [connectionType, setConnectionType] = useState("");
    const [orgId, setOrgId] = useState<number | null>(null);
    const [agencyId, setAgencyId] = useState<number | null>(null);
    const [govIdName, setGovIdName] = useState("");

    // New State for System Packages
    const [panelSpecs, setPanelSpecs] = useState<any[]>([]);
    const [selectedPanelSpecId, setSelectedPanelSpecId] = useState<number | null>(null);
    const [stdSpecPackages, setStdSpecPackages] = useState<any[]>([]);

    const tabs = [
        "Customer Details",
        "Connection Details",
        "Installation Details",
        "System Specifications",
    ];

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
                    setPhaseTypeId(data.phaseTypeId);
                    setConnectionType(data.connectionTypeName);
                    setIsGharkulCustomer(!!data?.isGharkulCustomer);
                    console.log("Fetched Phase Type Id, monthly avg unit from API:", data.phaseTypeId, data.avgMonthlyConsumption);
                } else {
                    setPhaseTypeId(null);
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

    // Fetch System Packages when a panel is selected
    useEffect(() => {
        const fetchPackages = async () => {
            if (orgId && selectedPanelSpecId) {
                try {
                    setLoading(true);
                    // Assuming isGharkulCustomer is boolean, default to false if null
                    const isGharkul = !!isGharkulCustomer;

                    // Note: ensure phaseTypeId is passed if needed, otherwise ignore or pass 0/null
                    const packages = await getSystemPackagesWithSpecs(isGharkul, orgId, selectedPanelSpecId);
                    console.log("Params: ", isGharkulCustomer, orgId, selectedPanelSpecId);
                    // Map API response to SystemSpec interface
                    const mappedSpecs: SystemSpec[] = packages.map((pkg: any) => {
                        const specs = pkg.systemSpecs || {};
                        return {
                            id: pkg.id || specs.id || Math.random(), // Use package ID primarily
                            connectionId: Number(connectionId),
                            isRunningCopy: false, // These are templates

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
                                gridTypeName: inv.gridTypeName || ""
                            })) || [],

                            pipes: specs.pipes?.map((p: any) => ({
                                pipeBrandName: p.pipeBrandName,
                                pipeCount: p.pipeCount
                            })) || [],

                            installationStructureType: specs.installationStructureType,
                            createdAt: specs.createdAt || new Date().toISOString(),
                        };
                    });

                    setAllSpecs(mappedSpecs);
                    if (mappedSpecs.length > 0) {
                        setSelectedSpec(mappedSpecs[0]);
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

        if (selectedPanelSpecId) {
            fetchPackages();
        }
    }, [selectedPanelSpecId, orgId, isGharkulCustomer, phaseTypeId, connectionId]);

    const formatIndianNumber = (value?: number) => {
        if (value === undefined || value === null) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
        }).format(value);
    };

    const handleGenerateQuote = async () => {
        if (!selectedSpec) return;
        setRequestingQuote(true);
        try {
            const date = new Date();
            const blob = await generateQuotationPDF(selectedSpec.id, date, "DRAFT-QUOTE");

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quotation_${selectedSpec.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Quotation generated successfully!");
        } catch (error) {
            console.error("Failed to generate quote", error);
            toast.error("Failed to generate quotation.");
        } finally {
            setRequestingQuote(false);
        }
    };

    const handleUploadQuote = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedSpec || !event.target.files || event.target.files.length === 0) return;

        setUploadingQuote(true);
        const file = event.target.files[0];

        try {
            // Document Type: "Signed Quotation" (Using a generic name assumption)
            await uploadDocuments(String(connectionId), "Signed Quotation", file);
            toast.success("Signed quotation uploaded successfully!");
        } catch (error) {
            console.error("Failed to upload quote", error);
            toast.error("Failed to upload signed quotation.");
        } finally {
            setUploadingQuote(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleProceedToBuy = () => {
        if (!selectedSpec) return;

        const amount = (selectedSpec.systemCost || 0) + (selectedSpec.fabricationCost || 0);

        navigate('/payment', {
            state: {
                amount: amount,
                quotationId: `Q-${selectedSpec.id}`, // Mock ID
                connectionId,
                consumerId,
                customerId
            }
        });
    };

    const handleAddPackage = () => {
        // Navigate back to system specs to add a new one. 
        // We might need to ensure the form clears or allows adding new. 
        // SystemSpecifications.tsx handles "isRunningCopy" so it should create a new draft if we save again?
        // Or we just navigate there.
        navigate(`/system-specifications`, {
            state: { consumerId, customerId, connectionId },
        });
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
                        <h1 className="text-xl font-bold text-gray-700">System Configurations</h1>
                    </div>

                    {userInfo?.role === "ROLE_ORG_ADMIN" && <button
                        onClick={handleAddPackage}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Customize Details
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available List of Panels</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={selectedPanelSpecId || ""}
                                onChange={(e) => setSelectedPanelSpecId(Number(e.target.value))}
                            >
                                <option value="" disabled>Select a Panel</option>
                                {panelSpecs.map((spec: any) => (
                                    <option key={spec.id || spec.id} value={spec.id || spec.id}>
                                        {spec.panelBrandName} - {spec.ratedWattageW}W - {spec.modelNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Packages</h3>
                        {allSpecs.length === 0 ? (
                            <div className="bg-white p-8 text-center text-gray-500 rounded-lg border border-dashed border-gray-300">
                                Select a panel to see matching system packages.
                            </div>
                        ) : (
                            allSpecs.map((spec) => (
                                <div
                                    key={spec.id}
                                    onClick={() => setSelectedSpec(spec)}
                                    className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${selectedSpec?.id === spec.id
                                        ? "border-blue-500 ring-2 ring-blue-100"
                                        : "border-gray-200 hover:border-blue-300"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedSpec?.id === spec.id ? "border-blue-600" : "border-gray-400"
                                                }`}>
                                                {selectedSpec?.id === spec.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                            </div>
                                            <div>
                                                <h4 className="text-md font-bold text-gray-800">{spec.title || `${spec.systemCapacityKw} kW System`}</h4>
                                                <p className="text-sm text-gray-500">{spec.panelBrandShortName} • {spec.installationStructureType || "Static"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600">₹ {formatIndianNumber((spec.systemCost || 0) + (spec.fabricationCost || 0))}</p>
                                            <p className="text-xs text-gray-500">System Capacity: {spec.systemCapacityKw} kW</p>
                                        </div>
                                    </div>

                                    {/* Mini Details */}
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs text-gray-600">
                                        <div>
                                            <span className="block text-gray-400">Panel Details</span>
                                            {spec.panelBrandShortName} ({spec.panelCount || 0} x {spec.panelRatedWattageW}W)
                                        </div>
                                        <div>
                                            <span className="block text-gray-400">Inverter Details</span>
                                            {spec.inverters && spec.inverters.length > 0
                                                ? `${spec.inverters[0].inverterBrandName} (${spec.inverters[0].inverterCount})`
                                                : "None"}
                                        </div>
                                        <div>
                                            <span className="block text-gray-400">Battery Details</span>
                                            {spec.batteryBrandName
                                                ? `${spec.batteryBrandName} (${spec.batteryCount || 0})`
                                                : "None"}
                                        </div>
                                        <div>
                                            <span className="block text-gray-400">Pipe Details</span>
                                            {spec.pipes && spec.pipes.length > 0
                                                ? `${spec.pipes[0].pipeBrandName} (${spec.pipes[0].pipeCount})`
                                                : "None"}
                                        </div>
                                        <div>
                                            <span className="block text-gray-400">Costs</span>
                                            System: ₹{formatIndianNumber(spec.systemCost)} | Fab: ₹{formatIndianNumber(spec.fabricationCost)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Checkout / Details */}
                    <div className="w-full lg:w-1/3">
                        {selectedSpec ? (
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Package Summary</h3>

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

                                {/* Actions */}
                                <div className="space-y-3">
                                    {/* Generate Quote */}
                                    <button
                                        onClick={handleGenerateQuote}
                                        disabled={requestingQuote}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        <Download className="w-4 h-4" />
                                        {requestingQuote ? "Generating..." : "Generate Quotation"}
                                    </button>

                                    {/* Upload Quote */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleUploadQuote}
                                            className="hidden"
                                            id="upload-quote"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            disabled={uploadingQuote}
                                        />
                                        <label
                                            htmlFor="upload-quote"
                                            className={`w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-blue-300 rounded-md text-blue-600 hover:bg-blue-50 transition cursor-pointer ${uploadingQuote ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Upload className="w-4 h-4" />
                                            {uploadingQuote ? "Uploading..." : "Upload Signed Quote"}
                                        </label>
                                    </div>

                                    {/* Proceed to Buy */}
                                    <button
                                        onClick={handleProceedToBuy}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold shadow-sm transition mt-4"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Proceed to Buy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                                Select a package to view details and proceed.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
