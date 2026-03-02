import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
    Search,
    Mail,
    Phone,
    RefreshCw,
    Eye,
    Briefcase,
    MapPin,
    Users as UsersIcon,
    XCircle as XCircleIcon,
    X,
    Calendar,
    Home,
    Download,
    FileText,
    Fingerprint,
    CreditCard
} from "lucide-react";
import { getAllUsers, getUserById, downloadDocumentById, getUserCount } from "../../services/hiringService";
import { Card, CardBody, Button, Input } from "../../components/ui";
import ReusableDropdown from "../../components/ReusableDropdown";

interface User {
    id?: number;
    contactNumber: string;
    emailAddress: string | null;
    nameAsPerGovId: string;
    workerType: string;
    workingStyle: string;
    preferredWorkLocations?: { district: string; state: string }[];
    locations?: string[];
    dateOfBirth?: string;
    villageName?: string;
    talukaName?: string;
    districtName?: string;
    pinCode?: string;
    documents?: {
        id: number;
        documentId: string;
        fileName: string;
        documentTypeId: number;
        documentName: string;
    }[];
    rate10kW?: string;
    rate20kW?: string;
    rate25kW?: string;
    rate2_2kw?: string;
    rate3HP?: string;
    rate3_3kw?: string;
    rate5HP?: string;
    rate5_5kw?: string;
    rate7HP?: string;
    teamName?: string;
    teamSize?: number | string;
    gstNumber?: string;
    numberOfInstallationsPerWeek?: number | string;
    jobId?: string;
    aadhaarNumber?: string | number;
    panNumber?: string;
}

const UserCard = ({ user, onViewDetails }: { user: User; onViewDetails: (id: number) => void }) => (
    <Card
        className="relative cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-secondary-100 hover:border-primary-300 group bg-white rounded-2xl overflow-hidden active:scale-[0.98]"
        onClick={() => user.id && onViewDetails(user.id)}
    >
        <div className="absolute top-4 right-4 p-2 rounded-xl bg-primary-50 text-primary-600 shadow-sm border border-primary-100 z-10 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
            <Eye className="w-4 h-4" />
        </div>
        <CardBody className="p-4">
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                        <h3 className="font-bold text-secondary-900 group-hover:text-primary-700 transition-colors truncate text-lg leading-tight pr-8">
                            {user.nameAsPerGovId || "NA"}
                        </h3>
                        <p className="text-xs font-bold text-primary-500 mt-1 uppercase tracking-wider">
                            {user.workingStyle === "Team"
                                ? user.workerType === "Both" ? "Team of Electricians & Fabricators" : `Team of ${user.workerType}s`
                                : user.workerType}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-2 space-y-2.5 pt-4 border-t border-secondary-50">
                <div className="flex items-center gap-3 text-secondary-600 group-hover:text-secondary-900 transition-colors">
                    <div className="p-1.5 rounded-lg bg-secondary-50 group-hover:bg-primary-50 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm truncate font-medium">{user.emailAddress || "No Email Provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600 group-hover:text-secondary-900 transition-colors">
                    <div className="p-1.5 rounded-lg bg-secondary-50 group-hover:bg-primary-50 transition-colors">
                        <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold tracking-wide">{user.contactNumber || "No Mobile Provided"}</span>
                </div>
            </div>
        </CardBody>
    </Card>
);

const WorkforceManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [userCache, setUserCache] = useState<Record<number, User[]>>({});
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(false);
    const [workingStyle, setWorkingStyle] = useState("");
    const [workerType, setWorkerType] = useState("");
    const [totalUserCount, setTotalUserCount] = useState<number | null>(null);
    const PAGE_SIZE = 9;

    const workingStyleOptions = [
        { value: "", label: "All Styles" },
        { value: "Individual", label: "Individual" },
        { value: "Team", label: "Team" },
    ];

    const workerTypeOptions = useMemo(() => {
        const defaultOption = { value: "", label: "All Types" };
        if (workingStyle === "Individual") {
            return [
                defaultOption,
                { value: "Electrician", label: "Electrician" },
                { value: "Helper", label: "Helper" },
            ];
        }
        if (workingStyle === "Team") {
            return [
                defaultOption,
                { value: "Electrician", label: "Electrician" },
                { value: "Fabricator", label: "Fabricator" },
                { value: "Both", label: "Both" },
            ];
        }
        return [defaultOption];
    }, [workingStyle]);

    const handleDownload = async (documentId: number, fileName: string) => {
        try {
            const blob = await downloadDocumentById(documentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading document:", error);
            toast.error("Error while downloading the file");
        }
    };

    const handleViewDetails = async (userId: number) => {
        try {
            setFetchingUser(true);
            setShowDetailModal(true);
            const userDetails = await getUserById(userId);
            setSelectedUser(userDetails);
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setFetchingUser(false);
        }
    };

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const count = await getUserCount();
                setTotalUserCount(count);
            } catch (error) {
                console.error("Error fetching user count:", error);
            }
        };
        fetchCount();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setUserCache({});
        setCurrentPage(1);
    }, [debouncedSearchTerm, workingStyle, workerType]);

    useEffect(() => {
        const loadData = async () => {
            if (!userCache[currentPage]) {
                setLoading(true);
                try {
                    const data = await getAllUsers(currentPage - 1, PAGE_SIZE, debouncedSearchTerm, workingStyle, workerType);
                    const users = Array.isArray(data) ? data : [];
                    setUserCache((prev) => ({ ...prev, [currentPage]: users }));
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoading(false);
                }
            }

            const nextPage = currentPage + 1;
            const currentData = userCache[currentPage];

            if (currentData && currentData.length === PAGE_SIZE && !userCache[nextPage]) {
                getAllUsers(nextPage - 1, PAGE_SIZE, debouncedSearchTerm, workingStyle, workerType)
                    .then((data) => {
                        const users = Array.isArray(data) ? data : [];
                        setUserCache((prev) => ({ ...prev, [nextPage]: users }));
                    })
                    .catch((err) => console.error("Prefetch error:", err));
            }
        };

        loadData();
    }, [currentPage, debouncedSearchTerm, userCache[currentPage], PAGE_SIZE, workingStyle, workerType]);

    const currentUsers = useMemo(
        () => userCache[currentPage] || [],
        [userCache, currentPage]
    );

    const isNextDisabled = useMemo(() => {
        if (loading) return true;
        if (currentUsers.length < PAGE_SIZE) return true;
        const nextCached = userCache[currentPage + 1];
        if (nextCached !== undefined && nextCached.length === 0) return true;
        return false;
    }, [loading, currentUsers.length, PAGE_SIZE, userCache, currentPage]);

    return (
        <div className="p-4 max-w-7xl mx-auto py-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="font-bold text-2xl text-secondary-900">Workforce Management</h1>
                    </div>
                    {totalUserCount !== null && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-secondary-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="p-2 bg-secondary-900 group-hover:bg-primary-600 rounded-xl shadow-sm transition-colors duration-300">
                                <UsersIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-secondary-400 uppercase leading-none tracking-widest">Total Users</span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-lg font-black text-secondary-900 leading-none">{totalUserCount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center">
                        <ReusableDropdown
                            value={workingStyle}
                            onChange={(val) => {
                                setWorkingStyle(val as string);
                                setWorkerType(""); // Reset worker type
                            }}
                            options={workingStyleOptions}
                            placeholder="Select Style"
                            className="w-full sm:w-44"
                        />

                        <ReusableDropdown
                            value={workerType}
                            onChange={(val) => setWorkerType(val as string)}
                            options={workerTypeOptions}
                            placeholder="Select Type"
                            className="w-full sm:w-44"
                            disabled={!workingStyle || workingStyle === ""}
                        />
                    </div>
                    <Input
                        placeholder="Search users by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="w-5 h-5 text-secondary-400" />}
                        containerClassName="w-full sm:w-64"
                    />
                </div>
            </div>

            {loading && currentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary-500 mb-4" />
                    <p>Loading workforce data...</p>
                </div>
            ) : (
                <>
                    {currentUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="text-lg font-bold">No workers found</h3>
                            {currentPage > 1 && (
                                <p className="text-secondary-500 mt-2">Please go back to the previous page.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentUsers.map((user, index) => (
                                <UserCard key={user.id || index} user={user} onViewDetails={handleViewDetails} />
                            ))}
                        </div>
                    )}

                    {(currentPage > 1 || currentUsers.length > 0) && (
                        <div className="flex justify-center gap-3 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1 || loading}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                Previous
                            </Button>

                            <span className="text-sm flex items-center px-4 font-medium h-9 bg-white border border-secondary-200 rounded-lg shadow-sm">
                                Page {currentPage}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isNextDisabled}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {showDetailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-secondary-900">User Details</h2>
                            <div className="flex items-center gap-2">
                                {selectedUser?.jobId && !fetchingUser && (
                                    <div className="px-3 py-1 bg-secondary-100 text-secondary-600 text-[10px] font-black rounded-lg border border-secondary-200 shadow-sm hidden sm:block">
                                        {selectedUser.jobId}
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-500 hover:text-secondary-900"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-gray-200 mb-2" />

                        <div className="overflow-y-auto p-2">
                            {fetchingUser ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-primary-50 border-t-primary-600 animate-spin"></div>
                                        <RefreshCw className="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <p className="mt-4 text-secondary-600 font-medium animate-pulse">Loading detailed profile...</p>
                                </div>
                            ) : selectedUser ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2">
                                            <div>
                                                <h2 className="text-xl font-black text-secondary-900 tracking-tight">{selectedUser.nameAsPerGovId}</h2>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-primary-600 uppercase tracking-wide">{selectedUser.workingStyle === "Team"
                                                        ? selectedUser.workerType === "Both" ? "Team of Electricians & Fabricators" : `Team of ${selectedUser.workerType}s`
                                                        : selectedUser.workerType}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div className="p-3 bg-white border border-secondary-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                <h3 className="text-sm font-black text-secondary-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                    Personal Details
                                                </h3>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 group">
                                                        <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                            <Mail className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-secondary-400 font-bold mb-0.5">Email Address</p>
                                                            <p className="text-sm font-bold text-secondary-900 truncate">{selectedUser.emailAddress || "Private"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 group">
                                                        <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                            <Phone className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold mb-0.5">Contact Number</p>
                                                            <p className="text-sm font-black text-secondary-900 leading-none">{selectedUser.contactNumber}</p>
                                                        </div>
                                                    </div>
                                                    {selectedUser.workingStyle === "Individual" && (
                                                        <div className="flex items-center gap-3 group">
                                                            <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                                <Calendar className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary-400 font-bold mb-0.5">Date of Birth</p>
                                                                <p className="text-sm font-bold text-secondary-900 leading-none">
                                                                    {selectedUser.dateOfBirth
                                                                        ? new Date(selectedUser.dateOfBirth).toLocaleDateString("en-GB", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })
                                                                        : "NA"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3 group border-t border-secondary-50 pt-2.5">
                                                        <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                            <Fingerprint className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold mb-0.5">Aadhaar Number</p>
                                                            <p className="text-sm font-black text-secondary-900 leading-none">{selectedUser.aadhaarNumber || "NA"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 group">
                                                        <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                            <CreditCard className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold mb-0.5">PAN Number</p>
                                                            <p className="text-sm font-black text-secondary-900 leading-none">{selectedUser.panNumber || "NA"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-white border border-secondary-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                <h3 className="text-sm font-black text-secondary-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                    {selectedUser.workingStyle === "Team" ? "Business Details" : "Residential Address"}
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedUser.workingStyle === "Team" ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                                            <div className="flex items-center gap-3 group">
                                                                <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                                    <Briefcase className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">Team Name</p>
                                                                    <p className="text-sm font-bold text-secondary-900 truncate">{selectedUser.teamName || "NA"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 group">
                                                                <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                                    <UsersIcon className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">Team Size</p>
                                                                    <p className="text-sm font-black text-secondary-900 leading-none">{selectedUser.teamSize || "NA"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 group">
                                                                <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                                    <Briefcase className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">GST Number</p>
                                                                    <p className="text-sm font-bold text-secondary-900 leading-none">{selectedUser.gstNumber || "NA"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 group">
                                                                <div className="p-2.5 bg-primary-50 rounded-xl group-hover:bg-primary-500 transition-colors">
                                                                    <RefreshCw className="w-5 h-5 text-primary-600 group-hover:text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">Installations / Week</p>
                                                                    <p className="text-sm font-bold text-secondary-900 leading-none">{selectedUser.numberOfInstallationsPerWeek || "NA"}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                                    <Home className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">Village</p>
                                                                    <p className="text-sm font-bold text-secondary-900 truncate">{selectedUser.villageName || "NA"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                                    <MapPin className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">Taluka</p>
                                                                    <p className="text-sm font-bold text-secondary-900 truncate">{selectedUser.talukaName || "NA"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                                    <MapPin className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">District</p>
                                                                    <p className="text-sm font-bold text-secondary-900 truncate">{selectedUser.districtName || "NA"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                                    <MapPin className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs text-secondary-400 font-bold mb-0.5">Pin Code</p>
                                                                    <p className="text-sm font-bold text-secondary-900 truncate">{selectedUser.pinCode || "NA"}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedUser.workingStyle === "Team" && (
                                            <div className="p-5 bg-white border border-secondary-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-6">
                                                <h3 className="text-sm font-black text-secondary-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                    Residential Address
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                            <Home className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold">Village</p>
                                                            <p className="text-sm font-bold text-secondary-900">{selectedUser.villageName || "NA"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold">Taluka</p>
                                                            <p className="text-sm font-bold text-secondary-900">{selectedUser.talukaName || "NA"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold">District</p>
                                                            <p className="text-sm font-bold text-secondary-900">{selectedUser.districtName || "NA"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary-400 font-bold">Pin Code</p>
                                                            <p className="text-sm font-bold text-secondary-900">{selectedUser.pinCode || "NA"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-5 bg-white border border-secondary-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-6">
                                            <h3 className="text-sm font-black text-secondary-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                Rate Expectations
                                            </h3>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div>
                                                    <h4 className="text-xs font-bold text-secondary-900 mb-3 border-l-2 border-primary-500 pl-2">Single Phase</h4>
                                                    <div className="space-y-2">
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 2.2kW</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate2_2kw || "NA"}</p>
                                                        </div>
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 3.3kW</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate3_3kw || "NA"}</p>
                                                        </div>
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 5.5kW</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate5_5kw || "NA"}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-secondary-900 mb-3 border-l-2 border-primary-500 pl-2">Three Phase</h4>
                                                    <div className="space-y-2">
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 10kW</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate10kW || "NA"}</p>
                                                        </div>
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 20kW</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate20kW || "NA"}</p>
                                                        </div>
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 25kW</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate25kW || "NA"}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-secondary-900 mb-3 border-l-2 border-primary-500 pl-2">Solar Water Pump</h4>
                                                    <div className="space-y-2">
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 3HP</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate3HP || "NA"}</p>
                                                        </div>
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 5HP</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate5HP || "NA"}</p>
                                                        </div>
                                                        <div className="p-3 bg-secondary-50 rounded-xl flex justify-between items-center">
                                                            <p className="text-xs text-secondary-400 font-bold">Rate 7HP</p>
                                                            <p className="text-sm font-black text-secondary-900">₹{selectedUser.rate7HP || "NA"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedUser.locations && selectedUser.locations.length > 0 && (
                                            <div className="p-5 bg-secondary-900 rounded-2xl shadow-xl shadow-secondary-200 mb-6">
                                                <h3 className="text-sm font-black text-secondary-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <MapPin className="w-3 h-3 text-primary-400" />
                                                    Preferred Work Locations
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUser.locations.map((loc: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-secondary-800 text-white rounded-xl text-xs font-bold border border-secondary-700 hover:border-primary-500 transition-colors cursor-default">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                                                            {loc}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedUser.documents && selectedUser.documents.length > 0 && (
                                            <div className="p-5 bg-white border border-secondary-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-6">
                                                <h3 className="text-sm font-black text-secondary-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                    Uploaded Documents
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedUser.documents.map((doc: any) => (
                                                        <div key={doc.id} className="group relative flex flex-col p-4 bg-secondary-50 hover:bg-white border border-transparent hover:border-primary-100 rounded-xl transition-all duration-300">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="p-2 bg-white group-hover:bg-primary-50 rounded-lg text-secondary-400 group-hover:text-primary-500 transition-colors shadow-sm">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDownload(doc.id, doc.fileName)}
                                                                    className="p-1.5 bg-white border border-secondary-100 text-secondary-600 hover:bg-primary-500 hover:text-white hover:border-primary-500 rounded-lg transition-all shadow-sm"
                                                                    title="Download Document"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-black text-secondary-900 truncate mb-0.5">
                                                                    {doc.documentName}
                                                                </p>
                                                                <p className="text-[10px] text-secondary-400 font-bold truncate">
                                                                    {doc.fileName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* <div className="flex justify-end pt-8 pb-2">
                                            <Button
                                                variant="primary"
                                                className="px-4 font-black uppercase tracking-widest text-xs h-10 rounded-xl"
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    setSelectedUser(null);
                                                }}
                                            >
                                                Onboard
                                            </Button>
                                        </div> */}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4">
                                    <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-error-100">
                                        <XCircleIcon className="w-8 h-8 text-error-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-secondary-900">Profile Unavailable</h3>
                                    <p className="text-secondary-500 mt-2">The requested worker profile could not be retrieved at this time.</p>
                                    <Button
                                        variant="primary"
                                        className="mt-6 px-8"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            setSelectedUser(null);
                                        }}
                                    >
                                        Return to List
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkforceManagement;
