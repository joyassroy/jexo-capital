"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/common/Logo";
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
  Sparkles,
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
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      src: "/homepage-banner.jpg",
      alt: "Zexo Capital Global Conference",
      tag: "Live Summit",
      badge: "USA Official",
      title: "Zexo Capital International Conference",
      subtitle: "Invest • Grow • Prosper | Keynote Session",
    },
    {
      src: "/homepage-banner-2.jpg",
      alt: "Zexo Capital Global Investor Delegation",
      tag: "500+ Delegates",
      badge: "Global Forum",
      title: "Global Investor Delegation Summit",
      subtitle: "International institutional & retail partners",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

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
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#00A3FF] text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <Logo size={32} showText={false} />
          <span className="font-black text-lg tracking-tight text-white drop-shadow-sm">
            Zexo Capital
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold hover:bg-white/30 transition-all cursor-pointer">
          <Globe size={13} />
          <span>Language</span>
        </div>
      </div>

      {/* Main Conference/Hero Banner Carousel */}
      <div className="relative mx-3 mt-3.5 rounded-[24px] p-[2px] bg-gradient-to-b from-white via-blue-200/60 to-cyan-400/50 shadow-[0_14px_35px_-8px_rgba(0,102,255,0.32),0_4px_12px_rgba(0,0,0,0.06)] group">
        <div className="relative aspect-[825/325] w-full rounded-[22px] overflow-hidden bg-slate-950">
          {bannerSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className={`object-cover transition-transform duration-700 ease-out ${
                  currentSlide === idx ? "scale-100" : "scale-105"
                }`}
                priority={idx === 0}
              />
            </div>
          ))}

          {/* Top-left Live badge */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wide uppercase text-white/95">
              {bannerSlides[currentSlide].tag}
            </span>
          </div>

          {/* Top-right verified badge */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600/70 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold shadow-sm">
            <Sparkles size={11} className="text-amber-300" />
            <span>{bannerSlides[currentSlide].badge}</span>
          </div>

          {/* Bottom title & dots */}
          <div className="absolute inset-x-0 bottom-0 z-20 pt-8 pb-2.5 px-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between pointer-events-auto">
            <div className="text-white pr-2">
              <div className="text-[11px] sm:text-xs font-black tracking-tight text-white drop-shadow-sm leading-tight line-clamp-1">
                {bannerSlides[currentSlide].title}
              </div>
              <div className="text-[9.5px] text-blue-200/90 font-medium line-clamp-1">
                {bannerSlides[currentSlide].subtitle}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 mb-0.5 flex-shrink-0">
              {bannerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === i
                      ? "w-5 h-1.5 bg-white shadow-sm"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Glass sheen highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-10" />
        </div>
      </div>

      {/* Marquee Announcement Ticker (Left to Right) */}
      <div className="mx-3 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-blue-200 shadow-sm text-xs text-[#0a2558] font-bold overflow-hidden">
        <Volume2 size={18} className="text-[#0066FF] flex-shrink-0 animate-pulse" />
        <div className="relative flex-1 overflow-hidden h-5 flex items-center">
          <div className="absolute inset-y-0 flex items-center whitespace-nowrap animate-marquee-ltr select-none">
            {tickerText}
          </div>
        </div>
      </div>

      {/* Account Balance Summary Card */}
      <div className="mx-3 mt-3 p-4 rounded-2xl bg-white shadow-md border border-blue-100">
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div>
            <div className="text-base font-black text-blue-900 flex items-baseline justify-center gap-0.5">
              <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
              <span className="text-[10px] font-bold text-blue-600">USDT</span>
            </div>
            <div className="text-[10px] font-medium text-gray-400">
              ≈ {user ? (Number(user.balance) * 127).toFixed(0) : "0"} Tk
            </div>
            <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
              Balance
            </div>
          </div>
          <div>
            <div className="text-base font-black text-blue-900 flex items-baseline justify-center gap-0.5">
              <span>{user ? Number(user.totalFund).toFixed(2) : "0.00"}</span>
              <span className="text-[10px] font-bold text-blue-600">USDT</span>
            </div>
            <div className="text-[10px] font-medium text-gray-400">
              ≈ {user ? (Number(user.totalFund) * 127).toFixed(0) : "0"} Tk
            </div>
            <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
              Total Fund
            </div>
          </div>
          <div>
            <div className="text-base font-black text-blue-900 flex items-baseline justify-center gap-0.5">
              <span>{user ? Number(user.fundIncome).toFixed(2) : "0.00"}</span>
              <span className="text-[10px] font-bold text-blue-600">USDT</span>
            </div>
            <div className="text-[10px] font-medium text-gray-400">
              ≈ {user ? (Number(user.fundIncome) * 127).toFixed(0) : "0"} Tk
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
    </div>
  );
}

