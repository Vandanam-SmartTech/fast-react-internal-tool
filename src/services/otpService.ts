import axios from 'axios';
import { getConfig } from '../config';

export type OtpChannel = 'EMAIL' | 'SMS';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_DIGITS_REGEX = /^\d{10,15}$/;

export const getOtpAPI = () => {
  const { VITE_OTP_API } = getConfig();

  return axios.create({
    baseURL: VITE_OTP_API,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const normalizeMobileNumber = (value: string): string => value.replace(/[^\d]/g, '');

export const detectOtpChannel = (identifier: string): OtpChannel | null => {
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  if (EMAIL_REGEX.test(trimmed)) return 'EMAIL';

  const digits = normalizeMobileNumber(trimmed);
  if (MOBILE_DIGITS_REGEX.test(digits)) return 'SMS';

  return null;
};

const buildOtpPayload = (identifier: string, otp?: string) => {
  const trimmed = identifier.trim();
  const channel = detectOtpChannel(trimmed);

  if (!channel) {
    throw new Error('Enter a valid email address or mobile number.');
  }

  const payload: Record<string, string> = {
    identifier: trimmed,
    channel,
    clientRequestId: `forgot-password-${Date.now()}`,
  };

  if (channel === 'EMAIL') {
    payload.email = trimmed;
    payload.emailAddress = trimmed;
  } else {
    payload.mobileNumber = normalizeMobileNumber(trimmed);
  }

  if (otp) {
    payload.otp = otp;
  }

  return payload;
};

export const sendOtpToIdentifier = async (identifier: string): Promise<void> => {
  const otpAPI = getOtpAPI();
  await otpAPI.post('/api/otp/send', buildOtpPayload(identifier));
};

export const verifyOtpForIdentifier = async (identifier: string, otp: string): Promise<void> => {
  const otpAPI = getOtpAPI();
  await otpAPI.post('/api/otp/verify', buildOtpPayload(identifier, otp));
};
