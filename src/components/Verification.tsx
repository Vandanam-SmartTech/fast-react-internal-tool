import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import bgImage from '../assets/Solar_Image.jpg';
import logo from '../assets/Vandanam_Logo.png';
import { verifyOtp, sendOtpToEmail } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Verification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email: string })?.email || '';

  // Redirect if email not found
  useEffect(() => {
    if (!email) navigate('/PasswordReset');
  }, [email, navigate]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      await verifyOtp(email, otp);
      setMessage('OTP verified successfully.');
      toast.success('OTP Verified!', { autoClose: 1000, hideProgressBar:true });
      setTimeout(() => navigate('/ChangePassword', { state: { email } }), 1000);
    } catch {
      setError('Invalid or expired OTP.');
    }
  };

  const handleResend = async () => {
    try {
      await sendOtpToEmail(email);
      toast.success('OTP resent successfully!', { autoClose: 1000, hideProgressBar:true });
      setCountdown(300); 
    } catch {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };




  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-cover bg-center flex justify-center items-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md p-5 sm:p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <img src={logo} alt="Vandanam SmartTech Logo" className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800">OTP Verification</h2>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 border border-green-200 rounded-lg p-2 sm:p-3 mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-2 sm:p-3 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-center">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-4">
              Enter the 6-digit OTP
            </label>

            <div className="flex justify-center gap-x-4">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                isInputNum
                shouldAutoFocus
                renderInput={(props) => (
                  <input
                    {...props}
                    type="password"
                    className="mx-1 w-10 h-10 text-center text-xl border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ aspectRatio: '1 / 1' }}
                  />
                )}
              />
            </div>
          </div>

          {/* <p className="text-center text-sm text-gray-600 mb-4">
            OTP expires in <span className="font-semibold text-blue-700">{formatTime(countdown)}</span>
          </p> */}

          <button
            type="submit"
            className="w-full py-1 sm:py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Verify OTP
          </button>

<div className="flex justify-center items-center gap-x-52 mt-2 mb-3 text-sm text-blue-600 font-medium">
  <button
    type="button"
    onClick={() => navigate('/')}
    className="hover:underline"
  >
    Back to Login
  </button>
  <button
    type="button"
    onClick={handleResend}
    className="hover:underline"
  >
    Resend OTP
  </button>
</div>


        </form>
      </div>
    </div>
  );
};

export default Verification;
