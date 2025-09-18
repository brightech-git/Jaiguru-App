// utils/validators.ts

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone validation - adjust according to your requirements
  const re = /^[0-9]{10,15}$/; // 10-15 digits
  return re.test(phone);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters
  return password.length >= 8;
};

export const validateName = (name: string): boolean => {
  // At least 2 characters, letters and spaces allowed
  return name.length >= 2 && /^[a-zA-Z ]+$/.test(name);
};

export const validateNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

// Optional: Combined validation function
export const validateSignUpForm = (form: {
  username: string;
  contactNumber: string;
  email: string;
  password: string;
}) => {
  const errors = {
    username: '',
    contactNumber: '',
    email: '',
    password: '',
  };

  if (!validateNotEmpty(form.username)) {
    errors.username = 'Name is required';
  } else if (!validateName(form.username)) {
    errors.username = 'Please enter a valid name';
  }

  if (!validateNotEmpty(form.contactNumber)) {
    errors.contactNumber = 'Mobile number is required';
  } else if (!validatePhoneNumber(form.contactNumber)) {
    errors.contactNumber = 'Please enter a valid mobile number';
  }

  if (!validateNotEmpty(form.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateNotEmpty(form.password)) {
    errors.password = 'Password is required';
  } else if (!validatePassword(form.password)) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    isValid: Object.values(errors).every(error => error === ''),
    errors
  };
};