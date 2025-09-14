import { create } from "zustand";

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api/auth" 
  : "/api/auth";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password, name, department, mobile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, department, mobile })
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error.message || "Error signing up", isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    console.log("Login request payload:", { email, password });

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      console.log("Login response:", data);

      set({ isAuthenticated: true, user: data.user, error: null, isLoading: false });
      
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error("Login error:", error.message || error);
      set({ error: error.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw await response.json();
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
      localStorage.removeItem('user');
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message || "Error verifying email", isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await fetch(`${API_URL}/check-auth`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      set({ user: data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      console.log(error);
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      set({ message: data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw await response.json();
      const data = await response.json();
      set({ message: data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || "Error resetting password",
      });
      throw error;
    }
  },
}));
