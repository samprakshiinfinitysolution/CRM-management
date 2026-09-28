import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/types/api.types";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  authMode: "login" | "register";
  selectedRole: "tl" | "exec";
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  authMode: "login",
  selectedRole: "tl",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitialized = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setAuthMode: (state, action: PayloadAction<"login" | "register">) => {
      state.authMode = action.payload;
    },
    setSelectedRole: (state, action: PayloadAction<"tl" | "exec">) => {
      state.selectedRole = action.payload;
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setInitialized,
  setAuthMode,
  setSelectedRole,
} = authSlice.actions;

export default authSlice.reducer;
