export const OTP_LENGTH = 6;
export const RESEND_COUNTDOWN = 60; // seconds

export type Step = 'email' | 'otp' | 'reset' | 'done';

export const STEP_INDEX: Record<Step, number> = {
  email: 0,
  otp: 1,
  reset: 2,
  done: 3,
};
