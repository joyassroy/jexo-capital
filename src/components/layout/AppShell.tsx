"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import CustomerServiceModal from "@/components/common/CustomerServiceModal";
import LanguageModal from "@/components/common/LanguageModal";
import { useTheme } from "@/context/ThemeContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname === "/login" || pathname === "/register";

  if (isAdmin) {
    return (
      <div className="w-full min-h-screen bg-[#0F172A] text-slate-100">
        {children}
      </div>
    );
  }

  return (
    <main
      className={`mobile-container min-h-screen relative flex flex-col justify-between transition-colors duration-200 ${
        isLight ? "bg-[#f1f5f9] text-[#0f172a]" : "bg-[#020a1f] text-slate-100"
      }`}
    >
      <div className="flex-1 w-full flex flex-col">{children}</div>
      <CustomerServiceModal />
      <LanguageModal />
      {!isAuth && <BottomNav />}
    </main>
  );
}
