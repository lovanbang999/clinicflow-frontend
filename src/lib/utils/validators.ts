export const validators = {
  email: {
    required: 'Email là bắt buộc',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Email không hợp lệ',
    },
  },
  password: {
    required: 'Mật khẩu là bắt buộc',
    minLength: {
      value: 6,
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
    },
  },
  fullName: {
    required: 'Họ tên là bắt buộc',
    minLength: {
      value: 2,
      message: 'Họ tên phải có ít nhất 2 ký tự',
    },
  },
  phoneNumber: {
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Số điện thoại phải có 10 chữ số',
    },
  },
  otp: {
    required: 'Mã OTP là bắt buộc',
    pattern: {
      value: /^[0-9]{6}$/,
      message: 'Mã OTP phải có 6 chữ số',
    },
  },
};

export const validateEmail = (email: string): boolean => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePhoneNumber = (phone: string): boolean => {
  return /^[0-9]{10}$/.test(phone);
};

export const validateOTP = (otp: string): boolean => {
  return /^[0-9]{6}$/.test(otp);
};
