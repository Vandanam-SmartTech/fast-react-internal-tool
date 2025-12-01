import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../../assets/Solar_Image.jpg';
import { validateUser } from '../../services/jwtService';
import { sendOtpToEmail } from '../../services/otpService';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../contexts/UserContext';
import { Logo } from '../../components/ui';
import { toast } from 'react-toastify';


const PasswordReset: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const { userClaims } = useUser();

  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);


useEffect(() => {
    if (!userClaims) return;

    if (typeof userClaims.has_password_changed !== "undefined") {
      setIsFirstLogin(!userClaims.has_password_changed);
    }
  }, [userClaims]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');

  const expiryTime = Date.now() + 3 * 60 * 1000; 
  const resendTime = Date.now() + 60 * 1000;     


  navigate('/verification', {
    state: {
      email: emailInput,
      msg: 'If the user is registered, an email has been sent.',
      expiryTime,
      resendTime,
    },
  });

  toast.success(
      'If the user is registered, an email has been sent.',
      {
        autoClose: 1000,
        hideProgressBar: true,
      }
    );

  try {
    const userEmail = await validateUser(emailInput);
    await sendOtpToEmail(userEmail);
  } catch (err) {
    
  } finally {
    setLoading(false);
  }
};



  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-cover bg-center flex justify-center items-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md p-5 sm:p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">

        <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary-400 to-solar-400 rounded-full blur-lg opacity-30 animate-pulse-slow"></div>
                  <Logo
                    size="xl"
                    className="relative drop-shadow-lg"
                  />
                </div>
              </div>


        {message && !loading && (
          <div className="bg-green-100 text-green-700 border border-green-200 rounded-lg p-2 sm:p-3 mb-4 text-center">
            {message}
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-2 sm:p-3 mb-4 text-center">
            {error}
          </div>
        )}

      {isFirstLogin && (
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg p-2 sm:p-3 mb-4 text-center text-sm">
              Let's get you started! Change your password to keep your account secure before proceeding. 
          </div>
      )}



        <form onSubmit={handleSubmit}>

              <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-1">Reset Password</h3>
      <p className="text-sm text-gray-600 mb-2">
        Enter your email or phone number. We'll send you a verification code to respective email to reset your password.
      </p>
    </div>
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-3">
        Email or Phone
      </label>
      <input
        id="email"
        type="text"
        value={emailInput}
        onChange={e => setEmailInput(e.target.value)}
        required
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition mb-3"
        placeholder="Email or Phone"
      />
    </div>

          <button
            type="submit"
            className={`w-full px-2 py-2 text-white rounded-lg font-semibold transition ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}  
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <div className="text-right mb-3 mt-2 sm:mb-4">
            <button
              type="button"
              onClick={() => {
                  localStorage.removeItem('jwtToken');
                  navigate('/login');
              }}
              className="text-sm text-blue-600 font-medium hover:underline"
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
