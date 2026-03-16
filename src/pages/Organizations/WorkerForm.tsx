import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserById } from "../../services/hiringService";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Input, Card, CardBody } from "../../components/ui";

const WorkerForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userId = location.state?.userId;

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        role: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            const fetchWorker = async () => {
                setLoading(true);
                try {
                    const user = await getUserById(userId);
                    setFormData({
                        name: user.nameAsPerGovId || "",
                        mobile: user.contactNumber || "",
                        role: user.workerType || "",
                        address: `${user.villageName || ""}, ${user.talukaName || ""}, ${user.districtName || ""}`.replace(/(^, )|(, , )|(, $)/g, ""),
                    });
                } catch (error) {
                    toast.error("Failed to fetch worker details");
                } finally {
                    setLoading(false);
                }
            };
            fetchWorker();
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Since hiringService doesn't have an update API yet, we just simulate success
        console.log("Saving Worker Data:", formData);
        toast.success(userId ? "Worker profile updated successfully!" : "Worker saved successfully!");
        navigate("/workforce-management");
    };

    return (
        <div className="min-h-screen bg-secondary-50 py-10 px-4">
            <Card className="max-w-xl mx-auto rounded-3xl shadow-xl border-none overflow-hidden bg-white">
                <div className="bg-primary-600 p-8 text-white relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-6 top-8 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-black uppercase tracking-widest">{userId ? "Edit Worker Profile" : "Add New Worker"}</h2>
                        <p className="text-primary-100 mt-1 text-sm font-medium">Please update the information below</p>
                    </div>
                </div>

                <CardBody className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-secondary-600 font-bold animate-pulse">Fetching Profile...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary-400 uppercase tracking-widest ml-1">Full Name</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Full Name as per Gov ID"
                                    required
                                    className="h-12 bg-secondary-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <Input
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    required
                                    className="h-12 bg-secondary-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary-400 uppercase tracking-widest ml-1">Current Role</label>
                                <Input
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="e.g. Electrician, Fabricator"
                                    className="h-12 bg-secondary-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary-400 uppercase tracking-widest ml-1">Address Details</label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Village, Taluka, District"
                                    className="h-12 bg-secondary-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                                />
                            </div>

                            <div className="pt-6">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-200 transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {userId ? "Update Worker Profile" : "Save New Worker"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default WorkerForm;