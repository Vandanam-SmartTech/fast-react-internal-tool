import axios from 'axios';
import { getConfig } from '../config';

export const getOtpAPI = () => {
  const { VITE_OTP_API } = getConfig();

  const otpAPI = axios.create({
    baseURL: VITE_OTP_API,
    headers: { 'Content-Type': 'application/json' },
  });


  return otpAPI;
};

export const sendOtpToEmail = async (email: string): Promise<void> => {
  const otpAPI = getOtpAPI();
  await otpAPI.post('/api/otp/send', { email });
};

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  const otpAPI = getOtpAPI();
  await otpAPI.post('/api/otp/verify', { email, otp });
};