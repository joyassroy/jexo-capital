"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/layout/BottomNav";
import {
  Volume2,
  Download,
  ClipboardList,
  Gift,
  Lock,
  CreditCard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  LogOut,
  Globe,
  ChevronRight,
} from "lucide-react";

interface UserProfile {
  _id: string;
  phone: string;
  nickname: string;
  balance: number;
  totalFund: number;
  fundIncome: number;
  vipLevel: number;
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tickerText, setTickerText] = useState(
    "Zexo Capital is a USA-based International Investment Platform."
  );

  useEffect(() => {
    // Fetch live user info
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    // Fetch settings ticker
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.homeTickerText) {
          setTickerText(data.settings.homeTickerText);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  const gridActions = [
    {
      title: "App Download",
      icon: Download,
      href: "/app-download",
      color: "bg-emerald-500 text-white",
    },
    {
      title: "Records",
      icon: ClipboardList,
      href: "/records",
      color: "bg-red-500 text-white",
    },
    {
      title: "Gift Receive",
      icon: Gift,
      href: "/gift-receive",
      color: "bg-pink-500 text-white",
    },
    {
      title: "password",
      icon: Lock,
      href: "/change-password",
      color: "bg-slate-700 text-white",
    },
    {
      title: "My Bank",
      icon: CreditCard,
      href: "/my-bank",
      color: "bg-blue-500 text-white",
    },
    {
      title: "My team",
      icon: Users,
      href: "/share",
      color: "bg-purple-600 text-white",
    },
    {
      title: "Deposit",
      icon: ArrowDownCircle,
      href: "/recharge",
      color: "bg-blue-600 text-white",
    },
    {
      title: "Withdraw",
      icon: ArrowUpCircle,
      href: "/withdraw",
      color: "bg-amber-500 text-white",
    },
    {
      title: "logout",
      icon: LogOut,
      onClick: handleLogout,
      color: "bg-gray-400 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#d6ebff] pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0066FF] to-[#00A3FF] text-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-white text-lg">
            Z
          </div>
          <span className="font-bold text-lg tracking-tight">Zexo Capital</span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
          <Globe size={13} />
          <span>Language</span>
        </div>
      </div>

      {/* Main Conference/Hero Banner */}
      <div className="relative mx-3 mt-3 rounded-2xl overflow-hidden shadow-lg border-2 border-white/60 bg-blue-900">
        <div className="relative h-44 w-full">
          <Image
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"
            alt="Zexo Capital Conference"
            fill
            className="object-cover opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent flex flex-col justify-end p-4">
            <span className="text-xl font-black text-white drop-shadow-md">
              Zexo Capital
            </span>
            <span className="text-xs font-bold text-blue-200 tracking-wider">
              Invest • Grow • Prosper
            </span>
          </div>
        </div>
      </div>

      {/* Marquee Announcement Ticker */}
      <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-blue-200 shadow-sm text-xs text-blue-900 font-semibold overflow-hidden">
        <Volume2 size={18} className="text-blue-600 flex-shrink-0 animate-pulse" />
        <div className="whitespace-nowrap overflow-hidden">
          <div className="animate-marquee inline-block">{tickerText}</div>
        </div>
      </div>

      {/* Account Balance Summary Card */}
      <div className="mx-3 mt-3 p-4 rounded-2xl bg-white shadow-md border border-blue-100">
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div>
            <div className="text-lg font-black text-blue-900">
              {user ? Number(user.balance).toFixed(2) : "0.00"}
            </div>
            <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
              Balance
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-blue-900">
              {user ? Number(user.totalFund).toFixed(2) : "0.00"}
            </div>
            <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
              Total Fund
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-blue-900">
              {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
            </div>
            <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
              Fund Income
            </div>
          </div>
        </div>
      </div>

      {/* 9-Grid Quick Action Menu */}
      <div className="mx-3 mt-4 grid grid-cols-3 gap-3">
        {gridActions.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all active:scale-95 text-center">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 shadow-sm ${item.color}`}
              >
                <Icon size={22} />
              </div>
              <span className="text-xs font-bold text-gray-700 tracking-tight leading-tight">
                {item.title}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button key={idx} onClick={item.onClick} className="w-full">
                {content}
              </button>
            );
          }

          return (
            <Link key={idx} href={item.href || "#"} className="w-full">
              {content}
            </Link>
          );
        })}
      </div>

      {/* Introduction Divider & Link */}
      <div className="mx-3 mt-5">
        <Link
          href="/company-info"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-white border border-blue-200 shadow-sm hover:border-blue-400 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-sm font-bold text-blue-900">
              Introduction to Zexo Capital
            </span>
          </div>
          <ChevronRight size={18} className="text-blue-500" />
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}

