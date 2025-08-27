/**
 * Obfuscates a phone number for privacy protection
 * @param phoneNumber - The phone number to obfuscate (can be string or number)
 * @returns The obfuscated phone number
 * 
 * Examples:
 * - 7249030063 → 72****0063
 * - 9876543210 → 98****3210
 * - 123456789 → 12****6789
 * - 12345 → 12345 (too short, no obfuscation needed)
 */
export const obfuscatePhoneNumber = (phoneNumber: string | number): string => {
  if (!phoneNumber) {
    return '';
  }

  // Convert to string and remove any non-digit characters
  const phoneStr = phoneNumber.toString().replace(/\D/g, '');
  
  // Don't obfuscate if phone number too short (less than 7 digits)
  if (phoneStr.length < 7) {
    return phoneStr;
  }

  // Keep first 2 and last 4 digits
  const firstTwo = phoneStr.substring(0, 2);
  const lastFour = phoneStr.substring(phoneStr.length - 4);
  const middleStars = '*'.repeat(phoneStr.length - 6);
  
  return `${firstTwo}${middleStars}${lastFour}`;
};
