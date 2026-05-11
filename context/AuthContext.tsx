"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "@/lib/api";
import Cookies from "js-cookie";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "masyarakat" | "admin_bpbd" | "super_admin";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Check if the user is authenticated on mount.
   */
  const checkAuth = useCallback(async () => {
    try {
      const data = await api.getUser();
      setUser(data.user);
      // Set cookies for Next.js middleware
      Cookies.set("isLoggedIn", "true", { path: "/" });
      Cookies.set("role", data.user.role, { path: "/" });
    } catch {
      setUser(null);
      Cookies.remove("isLoggedIn", { path: "/" });
      Cookies.remove("role", { path: "/" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login and return user data.
   */
  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await api.login(email, password);
    setUser(data.user);
    // Set cookies for Next.js middleware
    Cookies.set("isLoggedIn", "true", { path: "/" });
    Cookies.set("role", data.user.role, { path: "/" });
    return data.user;
  };

  /**
   * Register a new user.
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    await api.register(name, email, password, password_confirmation);
  };

  /**
   * Logout the user.
   */
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("API logout failed, clearing local state...", error);
    } finally {
      setUser(null);
      Cookies.remove("isLoggedIn", { path: "/" });
      Cookies.remove("role", { path: "/" });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
