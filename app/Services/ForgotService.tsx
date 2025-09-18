// services/authService.js
import { API_BASE_URL } from "../Config/baseUrl";

const FORGOT_PASSWORD_URL = `${API_BASE_URL}/auth/user/forgot-password`;
const RESET_PASSWORD_URL = `${API_BASE_URL}/auth/user/reset-password`;

export const forgotPassword = async (contactNumber) => {
  try {
    const response = await fetch(FORGOT_PASSWORD_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactNumber }),
    });

    const text = await response.text(); // get raw response
    try {
      return JSON.parse(text); // try parsing JSON
    } catch (e) {
      return { message: text }; // fallback if it's plain text
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    throw error;
  }
};

export const resetPassword = async (contactNumber, otp, newPassword) => {
  try {
    const response = await fetch(RESET_PASSWORD_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactNumber, otp, newPassword }),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { message: text };
    }
  } catch (error) {
    console.error("Reset Password Error:", error);
    throw error;
  }
};
