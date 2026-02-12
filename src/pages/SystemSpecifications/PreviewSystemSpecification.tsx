import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Edit, Download } from "lucide-react";
import {
    getSavedSystemSpecs,
    getMaterialOrigins,
    getGridTypes
} from "../../services/quotationService";
import { getConnectionByConnectionId } from "../../services/customerRequisitionService";
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

    materialOriginId?: number;
    gridTypeId?: number;
}

export const PreviewSystemSpecification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consumerId, connectionId, customerId } = location.state || {};

    const [spec, setSpec] = useState<SystemSpec | null>(null);
    const [loading, setLoading] = useState(true);

    const [connectionDetails, setConnectionDetails] = useState<any>(null);
    const [materialOrigins, setMaterialOrigins] = useState<Record<number, string>>({});
    const [gridTypes, setGridTypes] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Fetch Material Origins
                const originsData = await getMaterialOrigins();
                if (originsData) {
                    const originsMap: Record<number, string> = {};
                    originsData.forEach((item: any) => {
                        originsMap[item.id] = item.originCode;
                    });
                    setMaterialOrigins(originsMap);
                }

                // Fetch Grid Types
                const gridsData = await getGridTypes();
                if (gridsData) {
                    const gridsMap: Record<number, string> = {};
                    gridsData.forEach((item: any) => {
                        gridsMap[item.id] = item.gridType;
                    });
                    setGridTypes(gridsMap);
                }
            } catch (error) {
                console.error("Failed to fetch metadata", error);
            }
        };

        fetchMetadata();
    }, []);

    useEffect(() => {
        const fetchConnection = async () => {
            if (!connectionId) return;
            try {
                const data = await getConnectionByConnectionId(Number(connectionId));
                setConnectionDetails(data);
            } catch (error) {
                console.error("Failed to fetch connection details", error);
            }
        };
        fetchConnection();
    }, [connectionId]);

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
        if (value === undefined || value === null) return "0";
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

    const materialOriginName = spec.materialOriginId ? materialOrigins[spec.materialOriginId] : "N/A";
    const gridTypeName = spec.gridTypeId ? gridTypes[spec.gridTypeId] : "N/A";

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Preview Specification</h1>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{spec.systemCapacityKw} kW Solar System</h2>
                            <p className="opacity-90 mt-1">
                                {connectionDetails?.consumerNumber ? `Consumer: ${connectionDetails.consumerNumber}` : 'New System Specification'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">₹ {formatIndianNumber((spec.systemCost || 0) + (spec.fabricationCost || 0))}</div>
                            <p className="text-sm opacity-80">Total Estimated Cost</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                        {/* Section 1: Connection & General Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Connection Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Phase Type</label>
                                    <p className="font-medium text-gray-800">{connectionDetails?.phaseTypeName || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Sanctioned Load</label>
                                    <p className="font-medium text-gray-800">{connectionDetails?.sanctionedLoadWarningKW || "N/A"} kW</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Avg. Consumption</label>
                                    <p className="font-medium text-gray-800">{connectionDetails?.avgMonthlyConsumption || "N/A"} units</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Connection Type</label>
                                    <p className="font-medium text-gray-800">{connectionDetails?.connectionTypeName || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: System Basics */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">System Basics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Grid Type</label>
                                    <p className="font-medium text-gray-800">{gridTypeName}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Material Origin</label>
                                    <p className="font-medium text-gray-800">{materialOriginName}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Installation Type</label>
                                    <p className="font-medium text-gray-800">{spec.installationSpaceType || "Rooftop"}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Structure</label>
                                    <p className="font-medium text-gray-800">{spec.installationStructureType || "Static"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Solar Panels */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Solar Panels</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Brand</label>
                                    <p className="font-medium text-gray-800">{spec.panelBrandShortName}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-semibold">Wattage</label>
                                    <p className="font-medium text-gray-800">{spec.panelRatedWattageW} W</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Inverters & Battery */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Inverters & Battery</h3>

                            <div>
                                <label className="text-xs uppercase text-gray-500 font-semibold mb-1 block">Inverters</label>
                                <ul className="space-y-1">
                                    {spec.inverters?.map((inv, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block mr-2 mb-1">
                                            <span className="font-bold">{inv.inverterCount}x</span> {inv.inverterBrandName} ({inv.inverterCapacity} kW)
                                        </li>
                                    ))}
                                    {(!spec.inverters || spec.inverters.length === 0) && <p className="text-gray-400 italic">No inverters specified</p>}
                                </ul>
                            </div>

                            <div>
                                <label className="text-xs uppercase text-gray-500 font-semibold">Battery</label>
                                <p className="font-medium text-gray-800">
                                    {spec.batteryBrandName
                                        ? `${spec.batteryBrandName} (${spec.batteryCapacityKw} kW)`
                                        : "None"}
                                </p>
                            </div>
                        </div>

                        {/* Section 5: Structure Extras & Pipes */}
                        <div className="space-y-6 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Structure Extras</h3>
                                <div className="flex flex-wrap gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm border ${spec.hasWaterSprinkler ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        Water Sprinkler {spec.hasWaterSprinkler ? '✓' : '✗'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm border ${spec.hasHeavydutyRamp ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        Heavy Duty Ramp {spec.hasHeavydutyRamp ? '✓' : '✗'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm border ${spec.hasHeavydutyStairs ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        Heavy Duty Stairs {spec.hasHeavydutyStairs ? '✓' : '✗'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Pipes & Cables</h3>
                                {spec.pipes && spec.pipes.length > 0 ? (
                                    <ul className="space-y-2">
                                        {spec.pipes.map((pipe, idx) => (
                                            <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                                                <span className="text-gray-700">{pipe.pipeBrandName} - {pipe.pipeSize}</span>
                                                <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">{pipe.pipeCount}x</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No specific pipe requirements.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown Footer */}
                    <div className="bg-gray-50 border-t border-gray-200 p-6">
                        <div className="max-w-2xl ml-auto space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>System Cost</span>
                                <span>₹ {formatIndianNumber(spec.systemCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Fabrication Cost</span>
                                <span>₹ {formatIndianNumber(spec.fabricationCost)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-300 pt-2 mt-2">
                                <span>Total Cost</span>
                                <span>₹ {formatIndianNumber((spec.systemCost || 0) + (spec.fabricationCost || 0))}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white">
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Specification
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold shadow-sm transition"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Confirm & View Final
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
