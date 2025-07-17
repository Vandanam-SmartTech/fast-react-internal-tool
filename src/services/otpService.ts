import axios from 'axios';

const otpAPI = axios.create({
  baseURL: `${import.meta.env.VITE_OTP_API}`,
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
