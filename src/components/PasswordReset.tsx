import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/Solar_Image.jpg';
import logo from '../assets/Vandanam_Logo.png';
import { validateUser, sendOtpToEmail } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PasswordReset: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);  // loading state
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');

// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//   setMessage('');
//   setError('');
//   setLoading(true);

//   try {
//     await sendOtpToEmail(email);
//     toast.success("OTP Sent Successfully!", { 
//       autoClose: 1000,
//       hideProgressBar: true,
//     });
//     localStorage.setItem('resetEmail', email);

//     setTimeout(() => {
//       setLoading(false);
//       navigate('/Verification');
//     }, 1000);

//   } catch (err) {
//     setLoading(false);
//     toast.error("Failed to send OTP. Please try again.", {
//       autoClose: 2000,
//       hideProgressBar: true,
//     });
//     setError('Failed to send OTP. Please try again.');
//   }
// };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');

  try {
    const userEmail = await validateUser(emailInput); // gets plain string
    await sendOtpToEmail(userEmail);
    toast.success('OTP Sent Successfully!', { autoClose: 1000, hideProgressBar: true });
    
    setTimeout(() => {
      setLoading(false);
      navigate('/Verification', { state: { email: userEmail } });
    }, 1000);
  } catch (err: any) {
    setLoading(false);
    const status = err.response?.status;
    const input = emailInput;
    if (status === 404) {
      const msg = `User not found`;
      //setError(msg);
      toast.error(msg, { autoClose: 2000, hideProgressBar: true });
    } else {
      const resp = err.response?.data || err.message;
      //setError(resp);
      toast.error(`Error: ${resp}`, { autoClose: 2000, hideProgressBar: true });
    }
  }
};




  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-cover bg-center flex justify-center items-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md p-5 sm:p-6 bg-white bg-opacity-90 rounded-lg shadow-lg">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <img src={logo} alt="Vandanam SmartTech Logo" className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800">Vandanam SmartTech</h2>
        </div>

        {/* {loading && (
          <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg p-2 sm:p-3 mb-4 text-center">
            Sending OTP...
          </div>
        )} */}

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

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Enter your registered email or phone
            </label>
            <input
              id="email"
              type="text"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              required
              disabled={loading}
              className="w-full p-2 border rounded-lg focus:ring-blue-300"
              placeholder="Email or phone"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 sm:py-3 text-white rounded-lg font-medium transition ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={loading}  
          >
            Send OTP
          </button>

          <div className="text-right mb-3 mt-2 sm:mb-4">
            <button
              type="button"
              onClick={() => navigate('/')}
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
