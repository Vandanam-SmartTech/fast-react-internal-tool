import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateUser } from '../../services/jwtService';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // User claims object
    onUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nameAsPerGovId: '',
        emailAddress: '',
        contactNumber: '',
        preferredName: '',
    });

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                nameAsPerGovId: user.nameAsPerGovId || '',
                emailAddress: user.emailAddress || '',
                contactNumber: user.contactNumber || '',
                preferredName: user.preferredName || '',
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (formData.nameAsPerGovId.length < 2) {
            toast.error('Name must be at least 2 characters');
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(formData.contactNumber)) {
            toast.error('Invalid mobile number');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
            toast.error('Invalid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {


            const updatePayload = {
                id: user.id,
                nameAsPerGovId: formData.nameAsPerGovId,
                emailAddress: formData.emailAddress,
                contactNumber: formData.contactNumber,
                preferredName: formData.preferredName,
                username: user.username || user.sub,
                isActive: user.isActive,
                userCode: user.userCode,
                alternateContactNumber: user.alternateContactNumber,
                pinCode: user.pinCode,
                addressLine1: user.addressLine1,
                addressLine2: user.addressLine2,
            };

            await updateUser(user.id, updatePayload);

            toast.success('Profile updated successfully', {
                autoClose: 2000,
                hideProgressBar: true
            });
            onUpdate(); // Refresh parent
            onClose();
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 ml-1">
                            Name
                        </label>
                        <input
                            type="text"
                            name="nameAsPerGovId"
                            value={formData.nameAsPerGovId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none font-medium text-gray-800 placeholder:text-gray-400"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 ml-1">
                            Preferred Name
                        </label>
                        <input
                            type="text"
                            name="preferredName"
                            value={formData.preferredName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none font-medium text-gray-800 placeholder:text-gray-400"
                            placeholder="Enter preferred name"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="emailAddress"
                            value={formData.emailAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none font-medium text-gray-800 placeholder:text-gray-400"
                            placeholder="Enter email"
                        />
                    </div>

                    {/* Mobile Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 ml-1">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none font-medium text-gray-800 placeholder:text-gray-400"
                            placeholder="Enter mobile"
                            maxLength={10}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
