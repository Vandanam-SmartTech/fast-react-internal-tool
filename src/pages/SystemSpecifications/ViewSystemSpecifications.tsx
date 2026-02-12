import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, FileText, Plus, Download, Upload, CreditCard } from "lucide-react";
import {
    UserCircleIcon,
    BoltIcon,
    HomeModernIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { getSavedSystemSpecs, generateQuotationPDF } from "../../services/quotationService";
import { uploadDocuments } from "../../services/documentManagerService";
import { toast } from "react-toastify";

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

    if (allSpecs.length === 0) return <div className="p-8 text-center">No system specifications found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-4 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                navigate(`/system-specifications`, {
                                    state: { consumerId, customerId, connectionId },
                                })
                            }
                            className="p-2 rounded-full hover:bg-gray-200 transition"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-700">Select System Package</h1>
                    </div>

                    <button
                        onClick={handleAddPackage}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Solar Product
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="w-full max-w-4xl mx-auto mb-6 mt-2 overflow-x-auto no-scrollbar bg-transparent border-none shadow-none">
                    <div className="relative flex justify-center min-w-[500px] md:min-w-0">
                        {/* Connector Line */}
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
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Column: Package List */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Packages</h3>
                        {allSpecs.map((spec) => (
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
                                            <h4 className="text-md font-bold text-gray-800">{spec.systemCapacityKw} kW System</h4>
                                            <p className="text-sm text-gray-500">{spec.panelBrandShortName} • {spec.installationStructureType || "Static"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-600">₹ {formatIndianNumber((spec.systemCost || 0) + (spec.fabricationCost || 0))}</p>
                                    </div>
                                </div>

                                {/* Mini Details */}
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                                    <div>
                                        <span className="block text-gray-400">Panel Wattage</span>
                                        {spec.panelRatedWattageW} W
                                    </div>
                                    <div>
                                        <span className="block text-gray-400">Inverters</span>
                                        {spec.inverters?.length || 0} Units
                                    </div>
                                    <div>
                                        <span className="block text-gray-400">Battery</span>
                                        {spec.batteryBrandName || "None"}
                                    </div>
                                    <div>
                                        <span className="block text-gray-400">Created</span>
                                        {new Date(spec.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
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
