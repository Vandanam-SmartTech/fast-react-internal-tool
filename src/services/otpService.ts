import axios from 'axios';

const otpAPI = axios.create({
  baseURL: `http://${import.meta.env.VITE_DOMAIN_NAME}:${import.meta.env.VITE_OTP_PROD_API_PORT}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendOtpToEmail = async (email: string): Promise<void> => {
  await otpAPI.post('/api/otp/send', { email });
};

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  await otpAPI.post('/api/otp/verify', { email, otp });
};
