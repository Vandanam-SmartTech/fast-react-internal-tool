import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PaymentPlaceholder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { amount, quotationId } = location.state || {};

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
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
                    onClick={() => alert('Payment Successful! (Simulation)')}
                >
                    Pay Now
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancel
                </button>
            </div>
        </div>
    );
};
