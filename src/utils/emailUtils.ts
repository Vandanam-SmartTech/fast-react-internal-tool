/**
 * Obfuscates an email address for privacy protection
 * @param email - The email address to obfuscate
 * @returns The obfuscated email address
 * 
 * Examples:
 * - pksutar7588@gmail.com → pk*******88@gmail.com
 * - johnsmith@yahoo.co.in → jo******th@yahoo.co.in
 * - ab@gmail.com → ab@gmail.com (short email, no obfuscation needed)
 */
export const obfuscateEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return email || '';
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return email; // Invalid email format, return as is
  }

  const [localPart, domain] = parts;

  // Don't obfuscate if local part too short
  if (localPart.length <= 4) {
    return email;
  }

  // Keep first 2 and last 2 characters of local part
  const firstTwo = localPart.substring(0, 2);
  const lastTwo = localPart.substring(localPart.length - 2);
  const middleStars = '*'.repeat(localPart.length - 4);
  const obfuscatedLocal = `${firstTwo}${middleStars}${lastTwo}`;

  // Domain remains unchanged
  return `${obfuscatedLocal}@${domain}`;
};
