"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin";
}

interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
  error?: string;
  user?: AdminUser;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMFA: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setUser(data.session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      // Check if MFA is required
      if (data.mfaRequired) {
        setPendingUser(data.user);
        return { success: true, mfaRequired: true, user: data.user };
      }

      // No MFA required - login complete
      setUser(data.user);
      setPendingUser(null);
      return { success: true, mfaRequired: false, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async (code: string, isBackupCode = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: pendingUser?.email, 
          code, 
          isBackupCode 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return false;
      }

      // MFA verified - complete login
      setUser(data.user);
      setPendingUser(null);
      return true;
    } catch (error) {
      console.error("MFA verification error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyMFA,
        logout,
        checkSession,
      }}
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
