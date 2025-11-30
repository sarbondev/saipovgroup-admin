"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  useEffect(() => {
    if (token) {
      apiService.setAuthToken(token);
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        setUser(response.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber, password) => {
    try {
      const response = await apiService.login(phoneNumber, password);
      if (response.success) {
        const { token: newToken, user: userData } = response;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("authToken", newToken);
        apiService.setAuthToken(newToken);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    apiService.setAuthToken(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiService.changePassword(
        currentPassword,
        newPassword
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    changePassword,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
