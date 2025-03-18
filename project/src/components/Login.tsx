import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { login, setAuthToken } from '../services/api';
import bgImage from '../assets/Solar_Image.jpg';
import logo from '../assets/Vandanam_Logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { jwt } = await login({ username, password });
      localStorage.setItem('jwtToken', jwt);
      setAuthToken(jwt);
      navigate('/quotationform'); // Navigate on success
    } catch (err) {
      setError('Invalid username or password.');
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-2 sm:p-3 mb-4 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3 sm:mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter your password"
                required
              />
              <span
                onClick={handleTogglePassword}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 sm:py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
