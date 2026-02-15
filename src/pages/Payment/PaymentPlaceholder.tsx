import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { generateQuotationPDF } from '../../services/quotationService';
import { toast } from "react-toastify";

export const PaymentPlaceholder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { amount, quotationId } = location.state || {}; // amount from state, quotationId as mock
    const [isPaid, setIsPaid] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePayment = () => {
        setIsPaid(true);
        toast.success("Payment Successful!");
    };

    const handleGenerateQuotation = async () => {
        setIsGenerating(true);
        try {
            // Extract spec ID from quotation ID mock (e.g., Q-123)
            const specId = parseInt(quotationId?.split('-')[1] || "0");
            if (specId) {
                const date = new Date();
                const blob = await generateQuotationPDF(specId, date, `FINAL-${specId}`);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Quotation_${specId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success("Quotation generated successfully!");
            }
        } catch (error) {
            console.error("Failed to generate quote", error);
            toast.error("Failed to generate quotation.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                {!isPaid ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">Payment Gateway</h1>
                            <p className="text-gray-500 mt-2">Secure Payment Processing</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md mb-6">
                            <p className="text-sm text-gray-600">Amount to Pay</p>
                            <p className="text-2xl font-bold text-blue-600">₹ {amount?.toLocaleString('en-IN') || '0'}</p>
                        </div>

                        {quotationId && (
                            <p className="text-xs text-gray-400 mb-6">Reference Quotation ID: {quotationId}</p>
                        )}

                        <button
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out transform hover:-translate-y-1"
                            onClick={handlePayment}
                        >
                            Pay Now
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" /> Cancel
                        </button>
                    </>
                ) : (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                            <p className="text-gray-500 mt-2">Your transaction has been processed.</p>
                        </div>

                        <div className="border-t border-b py-4 space-y-3 text-left">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Amount Paid:</span>
                                <span className="font-bold">₹ {amount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Transaction ID:</span>
                                <span className="font-mono">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleGenerateQuotation}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition shadow-md"
                            >
                                <Download className="w-5 h-5" />
                                {isGenerating ? "Generating..." : "Download Quotation"}
                            </button>

                            <button
                                onClick={() => navigate('/representative-dashboard')}
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
