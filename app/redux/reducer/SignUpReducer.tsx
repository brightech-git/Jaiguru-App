import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, SignupPayload } from './types.d';
import { registerUser, verifyOtpService } from '../../Services/SignUpService';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  alreadyExists: false,
  otpLoading: false,
  otpVerified: false,
};

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: SignupPayload, thunkAPI) => {
    try {
      const response = await registerUser(userData);
      return response;
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('already exists')) {
        return thunkAPI.rejectWithValue({ alreadyExists: true, message: error.message });
      }
      return thunkAPI.rejectWithValue({ alreadyExists: false, message: error.message || 'Something went wrong' });
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ contactNumber, otp }: { contactNumber: string; otp: string }, thunkAPI) => {
    try {
      const response = await verifyOtpService(contactNumber, otp);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.alreadyExists = false;
      state.otpLoading = false;
      state.otpVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.alreadyExists = false;
        state.message = '';
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isError = !action.payload?.alreadyExists;
        state.alreadyExists = !!action.payload?.alreadyExists;
        state.message = action.payload?.message || 'Something went wrong';
        state.user = null;
      })

      // OTP
      .addCase(verifyOtp.pending, (state) => {
        state.otpLoading = true;
        state.otpVerified = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.otpLoading = false;
        state.otpVerified = true;
        state.user = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action: PayloadAction<any>) => {
        state.otpLoading = false;
        state.otpVerified = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;
