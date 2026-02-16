import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, CreditCard, Info } from "lucide-react";
import { generateQuotationPDF } from "../../services/quotationService";
import { toast } from "react-toastify";



export const CheckoutSystemSpecification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedSpec, consumerId, connectionId, customerId } = location.state || {};

    const [flowMode] = useState<"review" | "post-pay">("review");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!selectedSpec) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-4">Invalid Access. No specification selected.</p>
                    <button onClick={() => navigate(-1)} className="text-blue-600 font-bold underline">Go Back</button>
                </div>
            </div>
        );
    }

    const totalCost = (selectedSpec.systemCost || 0) + (selectedSpec.fabricationCost || 0);

    const handleDownloadQuotation = async () => {
        setIsGenerating(true);
        try {
            const date = new Date();
            const blob = await generateQuotationPDF(selectedSpec.id, date, "DRAFT-QUOTE");
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quotation_${selectedSpec.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Quotation downloaded successfully!");
        } catch (error) {
            console.error("Failed to generate quote", error);
            toast.error("Failed to generate quotation.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleProceedToPayment = () => {
        navigate('/payment', {
            state: {
                amount: totalCost,
                quotationId: `Q-${selectedSpec.id}`,
                connectionId,
                consumerId,
                customerId,
                fromCheckout: true
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Checkout Process</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-black">Plan</p>
                                    <p className="font-bold text-gray-800">{selectedSpec.title || `${selectedSpec.systemCapacityKw} kW System`}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-black">Capacity</p>
                                    <p className="font-bold text-gray-800">{selectedSpec.systemCapacityKw} kW</p>
                                </div>
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">System Cost</span>
                                        <span className="font-medium">₹ {selectedSpec.systemCost?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Fabrication Cost</span>
                                        <span className="font-medium">₹ {selectedSpec.fabricationCost?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-2 mt-2">
                                        <span>Total</span>
                                        <span>₹ {totalCost.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interaction Area */}
                    <div className="md:col-span-2">


                        {flowMode === "review" && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-800">Quotation Review</h3>
                                    <button
                                        onClick={handleDownloadQuotation}
                                        disabled={isGenerating}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4" />
                                        {isGenerating ? "Generating..." : "Download PDF"}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-blue-500" />
                                            Terms & Conditions
                                        </h4>
                                        <div className="text-sm text-gray-600 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            <p>1. The quotation is valid for 15 days from the date of issuance.</p>
                                            <p>2. Physical site inspection may lead to minor adjustments in fabrication costs.</p>
                                            <p>3. Standard installation time is 7-10 working days after material delivery.</p>
                                            <p>4. Net metering approval is subject to local utility company regulations.</p>
                                            <p>5. System components (panels, inverters) are covered by manufacturer warranties.</p>
                                            <p>6. Maintenance services are provided as per the selected maintenance package.</p>
                                            <p>7. Cancellation after payment may incur administrative charges.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-2">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="terms" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            I have read the quotation and agree to the Terms and Conditions
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleProceedToPayment}
                                        disabled={!agreedToTerms}
                                        className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Agree & Proceed to Pay
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
