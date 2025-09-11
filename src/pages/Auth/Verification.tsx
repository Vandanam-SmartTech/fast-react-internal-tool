import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OtpInput from 'react-otp-input';
import bgImage from '../../assets/Solar_Image.jpg';
import logo1 from '../../assets/Vandanam_SmartTech_Logo.png';
import { verifyOtp, sendOtpToEmail } from '../../services/otpService';
import { validateUser } from '../../services/jwtService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_ATTEMPTS = 3;


const Verification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [resending, setResending] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();

  const { email, msg, expiryTime, resendTime } = location.state || {};

  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const tooManyAttemptsMessage = emailToVerify
  ? 'Too many attempts. Please try again by resending the OTP.'
  : 'Too many attempts. Please try again later.';


useEffect(() => {
  if (!email && !msg) {
    navigate('/PasswordReset');
  }
}, [email, msg, navigate]);

useEffect(() => {
  const resolveEmail = async () => {
    try {
      const resolvedEmail = await validateUser(email);
      setEmailToVerify(resolvedEmail);
    } catch (err) {
      
    }
  };

  if (email) resolveEmail();
}, [email]);



  useEffect(() => {
    if (!expiryTime || !resendTime) return;

    const now = Date.now();
    setCountdown(Math.max(0, Math.floor((expiryTime - now) / 1000)));
    setResendCountdown(Math.max(0, Math.floor((resendTime - now) / 1000)));

    countdownInterval.current = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
      setResendCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [expiryTime, resendTime]);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isLocked) {
      setError('Form is locked. Please resend OTP to try again.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      await verifyOtp(emailToVerify, otp);
      toast.success('OTP Verified!', { autoClose: 1000, hideProgressBar: true });

      setTimeout(() => {
        navigate('/ChangePassword', {
          state: { emailToVerify, msg, msg1: 'Otp verified successfully' },
        });
      }, 1000);
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setError(tooManyAttemptsMessage);
      } else {
        setError(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempt(s) left.`);
      }
    }
  };


const handleResend = async () => {
  setResending(true);
  try {
    await sendOtpToEmail(emailToVerify);
  } catch (err){
    
  } finally {
    const now = Date.now();
    const newExpiry = now + 3 * 60 * 1000;
    const newResend = now + 60 * 1000;

    setCountdown(180);         
    setResendCountdown(60);    
    setAttempts(0);
    setIsLocked(false);
    setOtp('');
    setError('');

    toast.success('OTP resent successfully!', {
      autoClose: 1000,
      hideProgressBar: true,
    });

    setResending(false);
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
        <div className="flex items-center justify-center mb-2 sm:mb-1">
          <img src={logo1} alt="Vandanam SmartTech Logo" className="h-16 w-auto mb-1" />
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 border border-green-200 rounded-lg p-2 mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-2 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-center">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-4">
              Enter Verification Code
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
                    disabled={isLocked}
                    className="mx-1 w-10 h-10 text-center text-xl border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ aspectRatio: '1 / 1' }}
                  />
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-1 sm:py-2 rounded-lg font-semibold transition ${
              isLocked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Verify OTP
          </button>

          <p className="text-center my-2 text-sm text-gray-600">
  {countdown > 0 && !isLocked ? (
    `OTP expires in: ${formatCountdown(countdown)}`
  ) : (
    'OTP expired. Please resend OTP.'
  )}
</p>


          <div className="flex justify-between items-center flex-wrap gap-2 mt-2 mb-3 text-sm text-blue-600 font-medium">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:underline"
            >
              Back to Login
            </button>

            {emailToVerify && (
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
)}

          </div>
        </form>
      </div>
    </div>
  );
};


export default Verification;
