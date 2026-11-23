"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import CustomerServiceModal from "@/components/common/CustomerServiceModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <main className="mobile-container overflow-hidden min-h-screen relative flex flex-col justify-between bg-[#020a1f] text-slate-100">
      <div className="flex-1 w-full flex flex-col">{children}</div>
      <CustomerServiceModal />
      {!isAuth && <BottomNav />}
    </main>
  );
}
