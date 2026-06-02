/**
 * Patient utility functions — shared across printable and display components.
 * Centralizes age/gender calculations to prevent DRY violations.
 */

/**
 * Calculate patient age from dateOfBirth string.
 * Returns the age as a number, or 'N/A' if dateOfBirth is not provided.
 */
export function calcAge(dateOfBirth?: string): number | string {
  if (!dateOfBirth) return 'N/A';
  return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
}

/**
 * Format patient gender string using translation keys.
 * Accepts a translation function and returns the localized gender label.
 */
export function formatGender(
  gender?: string,
  labels?: { male: string; female: string; other: string },
): string {
  const { male = 'Male', female = 'Female', other = 'Other' } = labels ?? {};
  if (gender === 'MALE') return male;
  if (gender === 'FEMALE') return female;
  return other;
}

/**
 * Format patient code with a prefix for display.
 * Returns '--' if patientCode is not provided.
 */
export function formatPatientCode(patientCode?: string): string {
  return patientCode ?? '--';
}
