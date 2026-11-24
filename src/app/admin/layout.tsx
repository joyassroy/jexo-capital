"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Settings,
  Gift,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
  UserCheck,
  CreditCard,
  Crown,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on admin login page, render children directly without dashboard chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (confirm("Log out from Admin Panel?")) {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Deposits Queue", href: "/admin/deposits", icon: ArrowDownCircle },
    { label: "Withdrawals Queue", href: "/admin/withdrawals", icon: ArrowUpCircle },
    { label: "Wallets & Cards", href: "/admin/wallets", icon: CreditCard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "VIP Management", href: "/admin/vip", icon: Crown },
    { label: "KYC Verification", href: "/admin/kyc", icon: UserCheck },
    { label: "Gift Codes", href: "/admin/gift-codes", icon: Gift },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col md:flex-row w-full">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1E293B] border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
            <Shield size={18} />
          </div>
          <span className="font-extrabold text-base tracking-tight">
            Zexo Admin
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1E293B] border-r border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Shield size={24} />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight text-white leading-tight">
                Zexo Capital
              </div>
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Admin Panel
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions: Switch to User App & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 text-cyan-400 text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <span>Open User App</span>
            <ExternalLink size={14} />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

