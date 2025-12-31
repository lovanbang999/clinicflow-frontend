/**
 * Maps backend messageCode to i18n error key
 * Example: "AUTH.REGISTER.EMAIL_EXISTS" -> "auth.register.emailExists"
 */
export function getErrorMessageKey(messageCode: string): string {
  if (!messageCode) return 'generic';

  // Split messageCode by dots
  const parts = messageCode.split('.');
  
  if (parts.length < 2) return 'generic';

  // Convert to camelCase for the last part (action/error type)
  const convertToCamelCase = (str: string): string => {
    return str
      .toLowerCase()
      .split('_')
      .map((word, index) => 
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  };

  // Map messageCode to i18n key structure
  const moduleKey = parts[0].toLowerCase(); // AUTH -> auth
  const action = parts[1]?.toLowerCase(); // REGISTER -> register
  const errorType = parts[2] ? convertToCamelCase(parts[2]) : 'failed'; // EMAIL_EXISTS -> emailExists

  return `${moduleKey}.${action}.${errorType}`;
}

/**
 * Common error message keys mapping
 */
export const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Auth errors
  'AUTH.REGISTER.EMAIL_EXISTS': 'auth.register.emailExists',
  'AUTH.LOGIN.INVALID_CREDENTIALS': 'auth.login.invalidCredentials',
  'AUTH.LOGIN.NOT_VERIFIED': 'auth.login.notVerified',
  'AUTH.VERIFY.INVALID_OTP': 'auth.verify.invalidOtp',
  'AUTH.VERIFY.OTP_EXPIRED': 'auth.verify.expiredOtp',
  'AUTH.REFRESH.INVALID_TOKEN': 'auth.refresh.invalidToken',
  'AUTH.REFRESH.TOKEN_EXPIRED': 'auth.refresh.expired',
  
  // User errors
  'USER.NOT_FOUND': 'user.notFound',
  'USER.EMAIL.EXISTS': 'user.emailExists',
  'USER.PHONE.EXISTS': 'user.phoneExists',
  
  // Service errors
  'SERVICE.NOT_FOUND': 'service.notFound',
  'SERVICE.CREATE.NAME_EXISTS': 'service.nameExists',
  'SERVICE.DELETE.HAS_ACTIVE_BOOKINGS': 'service.hasActiveBookings',
  
  // Booking errors
  'BOOKING.NOT_FOUND': 'booking.notFound',
  'BOOKING.CREATE.DUPLICATE': 'booking.duplicate',
  'BOOKING.CREATE.INVALID_DATE': 'booking.invalidDate',
  'BOOKING.UPDATE.INVALID_TRANSITION': 'booking.invalidTransition',
  
  // Queue errors
  'QUEUE.NOT_FOUND': 'queue.notFound',
  'QUEUE.PROMOTE.SLOT_FULL': 'queue.slotFull',
};

/**
 * Get error message key from messageCode with fallback
 */
export function getErrorKey(messageCode?: string, fallback = 'generic'): string {
  if (!messageCode) return fallback;
  
  // Try exact match first
  if (ERROR_MESSAGE_MAP[messageCode]) {
    return ERROR_MESSAGE_MAP[messageCode];
  }
  
  // Try auto-generated key
  const autoKey = getErrorMessageKey(messageCode);
  
  // Return auto-generated key (it will fallback to generic if translation doesn't exist)
  return autoKey;
}
