"use client";

import { FormEvent, useState } from "react";
import BeautyLogin from "./BeautyLogin";
import BeautyRegister from "./BeautyRegister";

export interface AuthWrapperProps {
  onLoginSuccess: (email: string, password: string) => Promise<void>;
  onRegisterSuccess: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
}

export default function BeautyAuthWrapper({
  onLoginSuccess,
  onRegisterSuccess,
}: AuthWrapperProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (email: string, password: string) => {
    setError("");
    setIsLoading(true);
    try {
      await onLoginSuccess(email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ"
      );
      setIsLoading(false);
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    setError("");
    setIsLoading(true);
    try {
      await onRegisterSuccess(name, email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ"
      );
      setIsLoading(false);
    }
  };

  return authMode === "login" ? (
    <BeautyLogin
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  ) : (
    <BeautyRegister
      onSubmit={handleRegister}
      onSwitchToLogin={() => {
        setAuthMode("login");
        setError("");
      }}
      isLoading={isLoading}
      error={error}
    />
  );
}
