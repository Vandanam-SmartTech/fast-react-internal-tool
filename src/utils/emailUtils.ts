/**
 * Obfuscates an email address for privacy protection
 * @param email - The email address to obfuscate
 * @returns The obfuscated email address
 * 
 * Examples:
 * - pksutar7588@gmail.com → pk******88@gm***.com
 * - johnsmith@yahoo.co.in → jo******th@ya***.co.in
 * - ab@gmail.com → ab@gmail.com (short email, no obfuscation needed)
 */
export const obfuscateEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return email || '';
  }

  // Handle edge cases
  if (email.length <= 4) {
    return email;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return email; // Invalid email format, return as is
  }

  const [localPart, domain] = parts;
  
  // Handle local part (before @)
  let obfuscatedLocal = localPart;
  if (localPart.length > 4) {
    // Keep first 2 and last 2 characters, replace middle with *
    const firstTwo = localPart.substring(0, 2);
    const lastTwo = localPart.substring(localPart.length - 2);
    const middleStars = '*'.repeat(localPart.length - 4);
    obfuscatedLocal = `${firstTwo}${middleStars}${lastTwo}`;
  }

  // Handle domain part (after @)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return `${obfuscatedLocal}@${domain}`; // Invalid domain, return as is
  }

  const provider = domainParts[0]; // gmail, yahoo, etc.
  const tld = domainParts.slice(1).join('.'); // com, co.in, etc.

  let obfuscatedProvider = provider;
  if (provider.length > 2) {
    // Keep first 2 characters, replace rest with *
    const firstTwo = provider.substring(0, 2);
    const stars = '*'.repeat(provider.length - 2);
    obfuscatedProvider = `${firstTwo}${stars}`;
  }

  const obfuscatedDomain = `${obfuscatedProvider}.${tld}`;

  return `${obfuscatedLocal}@${obfuscatedDomain}`;
};
