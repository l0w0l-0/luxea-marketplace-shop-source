"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface BeautyRegisterProps {
  onSubmit: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function BeautyRegister({
  onSubmit,
  onSwitchToLogin,
  isLoading = false,
  error: externalError,
}: BeautyRegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }

    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!agreeTerms) {
      setError("กรุณายอมรับเงื่อนไขการใช้บริการ");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(name, email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = externalError || error;
  const passwordsMatch = confirmPassword && password === confirmPassword;
  const isFormValid = name && email && password && confirmPassword && agreeTerms;

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[rgba(249,245,247,0.95)] via-white to-[rgba(242,220,204,0.92)]">
      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[rgba(183,110,121,0.12)] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[rgba(242,216,201,0.16)] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-[rgba(217,100,131,0.08)] blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="flex items-center justify-center h-20 w-20 rounded-full border-2 border-[var(--color-border)] bg-white/60 backdrop-blur-xl shadow-lg">
                <span className="text-5xl font-black text-[var(--color-primary)]">
                  ✦
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="font-display text-4xl md:text-5xl text-[var(--color-text)]">
                LUXEA
              </h1>
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-[var(--color-text-secondary)]">
                Beauty Studio
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                สมัครสมาชิกใหม่เพื่อเข้าสู่ระบบ
              </p>
            </motion.div>
          </div>

          {/* Form container */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-[32px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,253,252,0.86))] p-8 backdrop-blur-2xl shadow-[0_28px_90px_rgba(120,80,90,0.16)]"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name input */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="นาย/นาง ชื่อ นามสกุล"
                  disabled={isSubmitting || isLoading}
                  className="w-full rounded-[20px] border border-white/70 bg-white/70 px-5 py-4 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[rgba(249,245,247,0.95)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </motion.div>

              {/* Email input */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  disabled={isSubmitting || isLoading}
                  className="w-full rounded-[20px] border border-white/70 bg-white/70 px-5 py-4 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[rgba(249,245,247,0.95)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </motion.div>

              {/* Password input */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.55 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    disabled={isSubmitting || isLoading}
                    className="w-full rounded-[20px] border border-white/70 bg-white/70 px-5 py-4 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[rgba(249,245,247,0.95)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting || isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg transition-opacity hover:opacity-70 disabled:opacity-50"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </motion.div>

              {/* Confirm password input */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="ยำรหัสผ่านอีกครั้ง"
                    disabled={isSubmitting || isLoading}
                    className="w-full rounded-[20px] border border-white/70 bg-white/70 px-5 py-4 text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[rgba(249,245,247,0.95)] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      passwordsMatch
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0 }
                    }
                    transition={{ duration: 0.2 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                  >
                    ✓
                  </motion.span>
                </div>
              </motion.div>

              {/* Terms checkbox */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.65 }}
                className="flex items-start gap-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-primary-50)] p-4"
              >
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    setError("");
                  }}
                  disabled={isSubmitting || isLoading}
                  className="mt-1 h-5 w-5 rounded-md accent-[var(--color-primary)] cursor-pointer disabled:opacity-50"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-xs text-[var(--color-text-secondary)] cursor-pointer leading-relaxed"
                >
                  ฉันยอมรับ
                  <a
                    href="#"
                    className="font-bold text-[var(--color-primary)] hover:underline"
                  >
                    เงื่อนไขการใช้บริการ
                  </a>
                  {" "}และ{" "}
                  <a
                    href="#"
                    className="font-bold text-[var(--color-primary)] hover:underline"
                  >
                    นโยบายความเป็นส่วนตัว
                  </a>
                </label>
              </motion.div>

              {/* Error message */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[18px] border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.1)] p-4"
                  >
                    <p className="text-sm font-medium text-[#dc2626]">
                      ⚠️ {displayError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={
                  isSubmitting || isLoading || !isFormValid || !passwordsMatch
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-[22px] bg-gradient-to-r from-[var(--color-primary)] to-[rgba(217,100,131,0.9)] px-6 py-4 text-sm font-bold text-white shadow-[0_16px_48px_rgba(163,93,106,0.28)] transition-all hover:shadow-[0_20px_60px_rgba(163,93,106,0.32)] disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {isSubmitting || isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                      />
                      <span>กำลังสมัครสมาชิก...</span>
                    </>
                  ) : (
                    <>
                      <span>สมัครสมาชิก</span>
                      <motion.span
                        animate={{ x: 0 }}
                        initial={{ x: -4 }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        →
                      </motion.span>
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            {/* Switch to login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-[var(--color-text-secondary)]">
                มีบัญชีอยู่แล้ว?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  disabled={isSubmitting || isLoading}
                  className="font-bold text-[var(--color-primary)] hover:underline transition-colors disabled:opacity-50"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-center text-xs text-[var(--color-text-secondary)]"
          >
            ข้อมูลการสมัครปลอดภัย · สะสมแต้มสมาชิก · เข้าถึง Wishlist และอื่นๆ
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
