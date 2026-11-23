"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
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
  Headphones,
  Globe,
  ChevronRight,
  ChevronDown,
  Star,
  Wallet,
  Coins,
  TrendingUp,
  X,
  MessageCircle,
  Send,
  ExternalLink,
  Megaphone,
  Building2,
  HelpCircle,
  CloudDownload,
  Smartphone,
  ArrowLeftRight,
  Layers,
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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const isLight = mounted && theme === "light";
  const [tickerText, setTickerText] = useState(
    "Zexo Capital is a USA-based International Investment Platform"
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      src: "/homepage-banner.jpg",
      alt: "Zexo Capital Global Conference",
      tag: "LIVE SUMMIT",
      badge: "USA Official",
      title: "Zexo Capital International Conference",
      subtitle: "Invest • Grow • Prosper | Keynote Session",
    },
    {
      src: "/homepage-banner-2.jpg",
      alt: "Zexo Capital Global Investor Delegation",
      tag: "500+ DELEGATES",
      badge: "Global Forum",
      title: "Global Investor Delegation Summit",
      subtitle: "Invest • Grow • Prosper | Keynote Session",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  useEffect(() => {
    setMounted(true);
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

  const actionCards = [
    {
      title: "App Download",
      icon: Download,
      href: "/app-download",
      gradient: "from-[#22c55e] via-[#16a34a] to-[#15803d]",
      shadow: "shadow-[0_4px_14px_rgba(34,197,94,0.35)]",
    },
    {
      title: "Records",
      icon: ClipboardList,
      href: "/records",
      gradient: "from-[#ef4444] via-[#dc2626] to-[#b91c1c]",
      shadow: "shadow-[0_4px_14px_rgba(239,68,68,0.35)]",
    },
    {
      title: "Gift Receive",
      icon: Gift,
      href: "/gift-receive",
      gradient: "from-[#d946ef] via-[#c026d3] to-[#9333ea]",
      shadow: "shadow-[0_4px_14px_rgba(217,70,239,0.35)]",
    },
    {
      title: "password",
      icon: Lock,
      href: "/change-password",
      gradient: "from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]",
      shadow: "shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
    },
    {
      title: "My Bank",
      icon: CreditCard,
      href: "/my-bank",
      gradient: "from-[#0ea5e9] via-[#0284c7] to-[#0369a1]",
      shadow: "shadow-[0_4px_14px_rgba(14,165,233,0.35)]",
    },
    {
      title: "My team",
      icon: Users,
      href: "/share",
      gradient: "from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]",
      shadow: "shadow-[0_4px_14px_rgba(139,92,246,0.35)]",
    },
    {
      title: "Recharge",
      icon: ArrowDownCircle,
      href: "/recharge",
      gradient: "from-[#2563eb] via-[#1d4ed8] to-[#1e40af]",
      shadow: "shadow-[0_4px_14px_rgba(37,99,235,0.35)]",
    },
    {
      title: "Withdraw",
      icon: ArrowUpCircle,
      href: "/withdraw",
      gradient: "from-[#f97316] via-[#ea580c] to-[#c2410c]",
      shadow: "shadow-[0_4px_14px_rgba(249,115,22,0.35)]",
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      gradient: "from-[#14b8a6] via-[#0d9488] to-[#0f766e]",
      shadow: "shadow-[0_4px_14px_rgba(20,184,166,0.35)]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white pb-32 relative overflow-hidden">
      {/* Ambient Top & Bottom Gold Glows */}
      <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full h-40 bg-amber-500/10 blur-[90px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <Logo size={34} showText={false} />
          <span
            className={`font-black text-xl tracking-wide bg-clip-text text-transparent transition-all duration-300 ${
              mounted && theme === "light"
                ? "bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f5ba31] drop-shadow-sm"
                : "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] drop-shadow-[0_2px_12px_rgba(245,186,49,0.35)]"
            }`}
          >
            Zexo Capital
          </span>
        </div>

        {/* Top Right Actions: Day/Night Theme Mode & Language */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer text-xs font-semibold ${
              isLight
                ? "bg-white border border-amber-400/80 shadow-[0_2px_8px_rgba(245,186,49,0.2)] text-slate-800 hover:bg-amber-50"
                : "bg-[#05143a]/80 border border-[#f5ba31]/70 shadow-[0_0_12px_rgba(245,186,49,0.25)] text-white hover:border-[#f5ba31]"
            }`}
          >
            <Globe
              size={13}
              className={isLight ? "text-amber-600" : "text-[#ffe58f]"}
            />
            <span>Language</span>
            <ChevronDown
              size={13}
              className={isLight ? "text-slate-600" : "text-white/75"}
            />
          </div>
        </div>
      </div>

      {/* Hero Conference Banner with Gold Neon Border */}
      <div className="relative z-10 mx-3 mt-1.5 p-[2px] rounded-[24px] bg-gradient-to-r from-[#f5ba31] via-[#ffe899] to-[#d49002] shadow-[0_0_24px_rgba(245,186,49,0.45)]">
        <div className="relative aspect-[825/365] w-full rounded-[22px] overflow-hidden bg-slate-950">
          {bannerSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                currentSlide === idx
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}

          {/* Top-left LIVE SUMMIT badge */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-white shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wide uppercase text-white/95">
              {bannerSlides[currentSlide].tag}
            </span>
          </div>

          {/* Top-right USA Official badge */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#071d4d] border border-[#f5ba31]/70 text-white text-[10.5px] font-bold shadow-sm">
            <Star size={11} className="fill-[#f5ba31] text-[#f5ba31]" />
            <span>{bannerSlides[currentSlide].badge}</span>
          </div>

          {/* Bottom Title & Pagination Dots */}
          <div className="absolute inset-x-0 bottom-0 z-20 pt-8 pb-2.5 px-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between pointer-events-auto">
            <div className="text-white pr-2">
              <div className="text-[11px] sm:text-xs font-black tracking-tight text-white drop-shadow-md leading-tight line-clamp-1">
                {bannerSlides[currentSlide].title}
              </div>
              <div className="text-[9.5px] text-blue-200/90 font-medium line-clamp-1">
                {bannerSlides[currentSlide].subtitle}
              </div>
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5 mb-0.5 flex-shrink-0">
              {bannerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === i
                      ? "w-5 h-1.5 bg-[#f5ba31] shadow-[0_0_8px_#f5ba31]"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Gloss sheen highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-10" />
        </div>
      </div>

      {/* Marquee Announcement Ticker (Pill with Neon Blue Outline) */}
      <div
        className={`relative z-10 mx-3 mt-3 flex items-center gap-2.5 px-3.5 py-2 rounded-full overflow-hidden transform-gpu transition-all duration-300 ${
          isLight
            ? "bg-white border border-sky-400 shadow-[0_2px_12px_rgba(56,189,248,0.2)]"
            : "bg-[#030e28] border border-[#00d2ff]/80 shadow-[0_0_12px_rgba(0,210,255,0.2)]"
        }`}
      >
        <Volume2
          size={19}
          className={`${
            isLight ? "text-amber-500" : "text-[#f5ba31]"
          } flex-shrink-0 animate-pulse drop-shadow-[0_0_6px_rgba(245,186,49,0.7)]`}
        />
        <div className="relative flex-1 overflow-hidden h-5 flex items-center">
          <div
            className={`flex shrink-0 animate-marquee-ltr-loop whitespace-nowrap select-none text-xs font-semibold tracking-wide ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            <span className="flex items-center">
              {tickerText}
              <span className="mx-6 text-[#f5ba31] font-bold">★</span>
            </span>
          </div>
          <div
            className={`flex shrink-0 animate-marquee-ltr-loop whitespace-nowrap select-none text-xs font-semibold tracking-wide ${
              isLight ? "text-slate-900" : "text-white"
            }`}
            aria-hidden="true"
          >
            <span className="flex items-center">
              {tickerText}
              <span className="mx-6 text-[#f5ba31] font-bold">★</span>
            </span>
          </div>
        </div>
        <ChevronRight
          size={17}
          className={`${
            isLight ? "text-amber-500" : "text-[#f5ba31]"
          } flex-shrink-0`}
        />
      </div>

      {/* Account Balance Summary Card (Gold Neon Glowing Card) */}
      <div className="relative z-10 mx-3 mt-3 p-[2px] rounded-[26px] bg-gradient-to-b from-[#f5ba31] via-[#ffd778] to-[#c98600] shadow-[0_0_20px_rgba(245,186,49,0.3)]">
        <div
          className={`rounded-[24px] p-4 sm:p-5 transform-gpu transition-all duration-300 ${
            isLight
              ? "bg-white shadow-inner"
              : "bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c]"
          }`}
        >
          <div
            className={`grid grid-cols-3 divide-x text-center ${
              isLight ? "divide-slate-200" : "divide-white/10"
            }`}
          >
            {/* Balance */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {user ? Number(user.balance).toFixed(2) : "0.00"}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                  USDT
                </span>
              </div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  isLight ? "text-slate-500" : "text-slate-300/80"
                }`}
              >
                ≈ {user ? (Number(user.balance) * 127).toFixed(0) : "0"} Tk
              </div>
              <div
                className={`flex items-center justify-center gap-1.5 mt-3 pt-2 border-t ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center shadow-[0_4px_12px_rgba(0,180,216,0.45)] border border-cyan-300/40 flex-shrink-0">
                  <Wallet size={16} className="text-white drop-shadow" />
                </div>
                <span
                  className={`text-xs font-bold tracking-tight ${
                    isLight ? "text-slate-800" : "text-slate-100"
                  }`}
                >
                  Balance
                </span>
              </div>
            </div>

            {/* Total Fund */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {user ? Number(user.totalFund).toFixed(2) : "0.00"}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                  USDT
                </span>
              </div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  isLight ? "text-slate-500" : "text-slate-300/80"
                }`}
              >
                ≈ {user ? (Number(user.totalFund) * 127).toFixed(0) : "0"} Tk
              </div>
              <div
                className={`flex items-center justify-center gap-1.5 mt-3 pt-2 border-t ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.45)] border border-emerald-300/40 flex-shrink-0">
                  <Coins size={16} className="text-white drop-shadow" />
                </div>
                <span
                  className={`text-xs font-bold tracking-tight ${
                    isLight ? "text-slate-800" : "text-slate-100"
                  }`}
                >
                  Total Fund
                </span>
              </div>
            </div>

            {/* Fund Income */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                  USDT
                </span>
              </div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  isLight ? "text-slate-500" : "text-slate-300/80"
                }`}
              >
                ≈ {user ? (Number(user.fundIncome) * 127).toFixed(0) : "0"} Tk
              </div>
              <div
                className={`flex items-center justify-center gap-1.5 mt-3 pt-2 border-t ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.45)] border border-purple-300/40 flex-shrink-0">
                  <TrendingUp size={16} className="text-white drop-shadow" />
                </div>
                <span
                  className={`text-xs font-bold tracking-tight ${
                    isLight ? "text-slate-800" : "text-slate-100"
                  }`}
                >
                  Fund Income
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Grid (Glossy Pill Buttons Matching Reference Image) */}
      <div className="relative z-10 mx-3 mt-3.5 grid grid-cols-3 gap-2.5">
        {actionCards.map((card, idx) => {
          const Icon = card.icon;
          const buttonContent = (
            <div
              className={`w-full py-2.5 sm:py-3 px-2 sm:px-2.5 rounded-[18px] bg-gradient-to-r ${card.gradient} ${card.shadow} border-t border-white/35 flex items-center justify-between text-white active:scale-95 transition-all duration-200 group relative overflow-hidden`}
            >
              {/* Gloss highlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none rounded-[18px]" />

              {/* Left Circular Badge */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 border border-white/30 text-white shadow-inner">
                <Icon size={13} className="stroke-[2.5]" />
              </div>

              {/* Center Title */}
              <span className="text-[10.5px] sm:text-[11.5px] font-bold text-white tracking-tight leading-none px-1 text-center flex-1 truncate drop-shadow-sm">
                {card.title}
              </span>

              {/* Right Chevron */}
              <ChevronRight
                size={13}
                className="text-white/85 flex-shrink-0 stroke-[2.5]"
              />
            </div>
          );

          if (card.onClick) {
            return (
              <button
                key={idx}
                onClick={card.onClick}
                className="w-full focus:outline-none"
              >
                {buttonContent}
              </button>
            );
          }

          return (
            <Link key={idx} href={card.href || "#"} className="w-full">
              {buttonContent}
            </Link>
          );
        })}
      </div>

      {/* Bottom Glowing Golden Ribbon Waves (matching reference design) */}
      <div className="relative z-0 mt-5 px-3 pointer-events-none">
        <svg
          viewBox="0 0 440 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full opacity-85 drop-shadow-[0_0_18px_rgba(245,186,49,0.55)]"
        >
          <path
            d="M-20 35 Q 110 5, 220 28 T 460 18"
            stroke="url(#goldRibbon1)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M-20 44 Q 130 14, 240 38 T 460 26"
            stroke="url(#goldRibbon2)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.75"
          />
          <defs>
            <linearGradient id="goldRibbon1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f5ba31" stopOpacity="0" />
              <stop offset="25%" stopColor="#ffe58f" stopOpacity="1" />
              <stop offset="75%" stopColor="#f5ba31" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#d49002" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldRibbon2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f5ba31" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f5ba31" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Introduction to Zexo Capital (Luxury Glass Pill) */}
      <div className="relative z-10 mx-3 mt-1">
        <Link
          href="/company-info"
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 group ${
            isLight
              ? "bg-white border-amber-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_0_12px_rgba(245,186,49,0.15)] hover:border-amber-500"
              : "bg-gradient-to-r from-[#04102e]/85 to-[#071944]/85 border-[#f5ba31]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-[#f5ba31]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full animate-ping ${
                isLight
                  ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                  : "bg-[#f5ba31] shadow-[0_0_8px_#f5ba31]"
              }`}
            />
            <span
              className={`text-sm font-bold transition-colors ${
                isLight
                  ? "text-slate-900 group-hover:text-amber-600"
                  : "text-slate-100 group-hover:text-[#f5ba31]"
              }`}
            >
              Introduction to Zexo Capital
            </span>
          </div>
          <ChevronRight
            size={18}
            className={`transition-transform group-hover:translate-x-1 ${
              isLight ? "text-amber-600" : "text-[#f5ba31]"
            }`}
          />
        </Link>
      </div>
    </div>
  );
}


