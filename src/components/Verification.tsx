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

  const OTP_EXPIRY_KEY = 'otpExpiryTime';

  const RESEND_ENABLE_KEY = 'resendEnableTime';

  const [resendCountdown, setResendCountdown] = useState<number>(0);

  const [resending, setResending] = useState(false);



  const [countdown, setCountdown] = useState<number>(0);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);



  // Redirect if email not found
  useEffect(() => {
    if (!email) navigate('/PasswordReset');
  }, [email, navigate]);

useEffect(() => {
  const expiryTime = parseInt(localStorage.getItem(OTP_EXPIRY_KEY) || '0');
  const resendTime = parseInt(localStorage.getItem(RESEND_ENABLE_KEY) || '0');
  const now = Date.now();

  const otpTimeLeft = Math.floor((expiryTime - now) / 1000);
  const resendTimeLeft = Math.floor((resendTime - now) / 1000);

  setCountdown(otpTimeLeft > 0 ? otpTimeLeft : 0);
  setResendCountdown(resendTimeLeft > 0 ? resendTimeLeft : 0);

  countdownInterval.current = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) return 0;
      return prev - 1;
    });

    setResendCountdown(prev => {
      if (prev <= 1) return 0;
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(countdownInterval.current!);
}, []);



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

      localStorage.removeItem('otpExpiryTime');
      localStorage.removeItem('resendEnableTime');

      setTimeout(() => navigate('/ChangePassword', { state: { email } }), 1000);
    } catch {
      setError('Invalid or expired OTP.');
    }
  };

const handleResend = async () => {
  setResending(true); // disable button immediately

  try {
    await sendOtpToEmail(email);

    const now = Date.now();
    const newExpiry = now + 5 * 60 * 1000; // 5 minutes
    const enableResendAt = now + 60 * 1000; // 1 minute

    localStorage.setItem(OTP_EXPIRY_KEY, newExpiry.toString());
    localStorage.setItem(RESEND_ENABLE_KEY, enableResendAt.toString());

    setCountdown(300);
    setResendCountdown(60);

    toast.success('OTP resent successfully!', { autoClose: 1000, hideProgressBar: true });
  } catch {
    toast.error('Failed to resend OTP. Please try again.');
  } finally {
    setResending(false); // enable button again regardless of success/failure
  }
};



  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
              Enter the OTP
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


          <button
            type="submit"
            className="w-full py-1 sm:py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Verify OTP
          </button>

          <p className="text-center mb-2 text-sm text-gray-600">
  {countdown > 0 ? `OTP expires in: ${formatCountdown(countdown)}` : 'OTP expired. Please resend OTP.'}
</p>

<div className="flex justify-between items-center flex-wrap gap-2 mt-2 mb-3 text-sm text-blue-600 font-medium">
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
  className={`hover:underline ${
    resendCountdown > 0 || resending ? 'text-gray-400 pointer-events-none' : 'text-blue-600'
  }`}
  disabled={resendCountdown > 0 || resending}
>
  {resending
    ? 'Sending...'
    : resendCountdown > 0
    ? `Resend in ${resendCountdown}s`
    : 'Resend OTP'}
</button>

</div>


        </form>
      </div>
    </div>
  );
};

export default Verification;
