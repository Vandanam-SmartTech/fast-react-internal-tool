import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Edit, Download } from "lucide-react";
import { getSavedSystemSpecs } from "../../services/quotationService";
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
    totalCost?: number;

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

export const PreviewSystemSpecification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consumerId, connectionId, customerId } = location.state || {};

    const [spec, setSpec] = useState<SystemSpec | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestSpec = async () => {
            if (!connectionId) return;
            try {
                const data = await getSavedSystemSpecs(connectionId);
                if (data && data.length > 0) {
                    // Get the latest one (assuming sorting by ID logic or similar)
                    const latest = data.sort((a: any, b: any) => b.id - a.id)[0];
                    setSpec(latest);
                }
            } catch (error) {
                console.error("Failed to fetch spec", error);
                toast.error("Failed to load specification.");
            } finally {
                setLoading(false);
            }
        };
        fetchLatestSpec();
    }, [connectionId]);

    const formatIndianNumber = (value?: number) => {
        if (value === undefined || value === null) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2,
        }).format(value);
    };

    const handleEdit = () => {
        navigate('/system-specifications', {
            state: { consumerId, connectionId, customerId, isEdit: true } // Pass flag to trigger prefill if needed
        });
    };

    const handleConfirm = () => {
        navigate('/view-system-specifications', {
            state: { consumerId, connectionId, customerId }
        });
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!spec) return <div className="p-8 text-center">No specification found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Preview Specification</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-blue-600 p-6 text-white">
                        <h2 className="text-xl font-bold">{spec.systemCapacityKw} kW Solar System</h2>
                        <p className="opacity-90 mt-1">Review the details below</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 block">Panel Brand</label>
                                <p className="font-medium text-gray-800">{spec.panelBrandShortName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Panel Wattage</label>
                                <p className="font-medium text-gray-800">{spec.panelRatedWattageW} W</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Structure Type</label>
                                <p className="font-medium text-gray-800">{spec.installationStructureType || "Standard"}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Installation Space</label>
                                <p className="font-medium text-gray-800">{spec.installationSpaceType || "Rooftop"}</p>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 block">Inverters</label>
                                <ul className="list-disc pl-5 text-gray-800">
                                    {spec.inverters?.map((inv, idx) => (
                                        <li key={idx}>
                                            {inv.inverterCount}x {inv.inverterBrandName} ({inv.inverterCapacity} kW)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Battery</label>
                                <p className="font-medium text-gray-800">
                                    {spec.batteryBrandName
                                        ? `${spec.batteryBrandName} (${spec.batteryCapacityKw} kW)`
                                        : "None"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Estimated Cost</label>
                                <p className="text-xl font-bold text-blue-600">
                                    ₹ {formatIndianNumber((spec.systemCost || 0) + (spec.fabricationCost || 0))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                        >
                            <Edit className="w-5 h-5" />
                            Edit Specification
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold shadow-sm transition"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Use This Specification
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
