"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BeautyAuthWrapper from "@/src/components/BeautyAuthWrapper";
import BeautyShopApp from "./BeautyShopApp";

// Type definitions
type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  tier: "Member" | "VIP";
  points: number;
};

export default function BeautyShopAppWrapper() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const DEMO_ADMIN_EMAIL =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ADMIN === "true"
      ? "admin@luxea.test"
      : null;

  const handleLoginSuccess = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const isDemoAdmin =
      DEMO_ADMIN_EMAIL !== null && normalizedEmail === DEMO_ADMIN_EMAIL;
    
    const mockUser: User = {
      id: isDemoAdmin ? "admin-01" : `user-${Date.now()}`,
      name: isDemoAdmin ? "LUXEA Admin" : "Customer",
      email: email.trim(),
      role: isDemoAdmin ? "admin" : "customer",
      tier: "VIP",
      points: 1200,
    };
    
    setUser(mockUser);
  };

  const handleRegisterSuccess = async (
    name: string,
    email: string,
    password: string
  ) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.trim(),
      role: "customer",
      tier: "Member",
      points: 0,
    };
    
    setUser(newUser);
  };

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-neutral)]"
          >
            <div className="text-center">
              <div className="loader mx-auto mb-8">
                <div className="circle"></div>
              </div>
              <h2 className="font-display text-2xl text-[var(--color-primary)]">
                LOADING LUXEA...
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show auth or main app based on user state */}
      {!loading && !user ? (
        <BeautyAuthWrapper
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
        />
      ) : (
        <BeautyShopApp initialUser={user} onLogout={() => setUser(null)} />
      )}
    </>
  );
}
