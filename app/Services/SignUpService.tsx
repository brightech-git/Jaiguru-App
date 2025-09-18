import { SignupPayload } from '../redux/reducer/types.d';
import { API_BASE_URL } from '../Config/baseUrl';

// Register user
export const registerUser = async (userData: SignupPayload) => {
  const response = await fetch(`${API_BASE_URL}/auth/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  // API may return 200 OK with "Customer already exists"
  if (data?.message?.toLowerCase().includes('already exists')) {
    throw new Error(data.message);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
};

// Verify OTP
export const verifyOtpService = async (contactNumber: string, otp: string) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/user/verify-otp?contactNumber=${encodeURIComponent(contactNumber)}&otp=${encodeURIComponent(otp)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed.');
  }

  return data;
};
