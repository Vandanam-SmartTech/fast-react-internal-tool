import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bgImage from '../../assets/Solar_Image.webp';
import { Logo } from '../../components/ui';
import { verifyAndChangePassword } from '../../services/jwtService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { emailToVerify: string })?.emailToVerify || '';
  const identifier = (location.state as { identifier: string })?.identifier || email;
  const msg = (location.state as { msg: string })?.msg || '';
  const msg1 = (location.state as { msg1: string })?.msg1 || '';
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  useEffect(() => {
    if (!identifier && !msg && !msg1) {
      navigate('/verification');
    }
  }, [identifier, msg, msg1, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await verifyAndChangePassword(identifier, newPassword, email);
      setSuccess('Password changed successfully!');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('refreshToken');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const data = err?.response?.data;
      setError(typeof data === 'string' ? data : data?.message || data?.error || 'Failed to change password. Try again.');
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center flex justify-center items-center px-4" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="w-full max-w-sm p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary-400 to-solar-400 rounded-full blur-lg opacity-30 animate-pulse-slow"></div>
            <Logo size="xl" className="relative drop-shadow-lg" />
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-center">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter New Password <span className="text-red-500">*</span></label>
            <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300" placeholder="New password" />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute top-9 right-3 text-gray-500">{showNewPassword ? <FaEye /> : <FaEyeSlash />}</button>
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
            <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300" placeholder="Confirm password" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-9 right-3 text-gray-500">{showConfirmPassword ? <FaEye /> : <FaEyeSlash />}</button>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            <strong>Note</strong>
            <ul className="list-disc ml-5">
              <li>Minimum 8 characters</li>
              <li>At least 1 uppercase letter (A-Z)</li>
              <li>At least 1 lowercase letter (a-z)</li>
              <li>At least 1 number (0-9)</li>
              <li>At least 1 special character (!@#$…)</li>
            </ul>
          </div>

          <button type="submit" className="py-1 px-16 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Submit</button>
          <div className="text-left mb-3 mt-2 sm:mb-3"><button type="button" onClick={() => navigate('/')} className="text-sm text-blue-600 font-medium hover:underline">Back to Login</button></div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
