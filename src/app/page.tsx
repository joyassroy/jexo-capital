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
    "Zexo Capital is a USA-based International Investment Platform"
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportUrls, setSupportUrls] = useState({
    whatsapp: "https://wa.me/8801728967166",
    telegramGroup: "https://t.me/zexocapital_group",
    telegramChannel: "https://t.me/zexocapital_channel",
  });

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
    // Fetch live user info
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    // Fetch settings ticker and support links
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.homeTickerText) {
          setTickerText(data.settings.homeTickerText);
        }
        if (data?.settings?.whatsappUrl) {
          setSupportUrls((prev) => ({
            ...prev,
            whatsapp: data.settings.whatsappUrl,
          }));
        }
        if (data?.settings?.telegramGroupUrl) {
          setSupportUrls((prev) => ({
            ...prev,
            telegramGroup: data.settings.telegramGroupUrl,
          }));
        }
        if (data?.settings?.telegramChannelUrl) {
          setSupportUrls((prev) => ({
            ...prev,
            telegramChannel: data.settings.telegramChannelUrl,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const actionCards = [
    {
      title: "App Download",
      icon: Download,
      href: "/app-download",
      gradient: "from-[#00c853] via-[#00b050] to-[#009624]",
      shadow: "shadow-[0_4px_16px_rgba(0,200,83,0.35)]",
    },
    {
      title: "Records",
      icon: ClipboardList,
      href: "/records",
      gradient: "from-[#ff1744] via-[#e52d27] to-[#b31217]",
      shadow: "shadow-[0_4px_16px_rgba(255,23,68,0.35)]",
    },
    {
      title: "Gift Receive",
      icon: Gift,
      href: "/gift-receive",
      gradient: "from-[#e040fb] via-[#c026d3] to-[#9333ea]",
      shadow: "shadow-[0_4px_16px_rgba(224,64,251,0.35)]",
    },
    {
      title: "password",
      icon: Lock,
      href: "/change-password",
      gradient: "from-[#0091ea] via-[#0066ff] to-[#0044cc]",
      shadow: "shadow-[0_4px_16px_rgba(0,145,234,0.35)]",
    },
    {
      title: "My Bank",
      icon: CreditCard,
      href: "/my-bank",
      gradient: "from-[#00b0ff] via-[#0284c7] to-[#0369a1]",
      shadow: "shadow-[0_4px_16px_rgba(0,176,255,0.35)]",
    },
    {
      title: "My team",
      icon: Users,
      href: "/share",
      gradient: "from-[#7c4dff] via-[#7c3aed] to-[#5b21b6]",
      shadow: "shadow-[0_4px_16px_rgba(124,77,255,0.35)]",
    },
    {
      title: "Recharge",
      icon: ArrowDownCircle,
      href: "/recharge",
      gradient: "from-[#2979ff] via-[#1d4ed8] to-[#1e3a8a]",
      shadow: "shadow-[0_4px_16px_rgba(41,121,255,0.35)]",
    },
    {
      title: "Withdraw",
      icon: ArrowUpCircle,
      href: "/withdraw",
      gradient: "from-[#ff9100] via-[#f59e0b] to-[#d97706]",
      shadow: "shadow-[0_4px_16px_rgba(255,145,0,0.35)]",
    },
    {
      title: "Customer Service",
      icon: Headphones,
      onClick: () => setIsSupportOpen(true),
      gradient: "from-[#00bfa5] via-[#0d9488] to-[#0f766e]",
      shadow: "shadow-[0_4px_16px_rgba(0,191,165,0.35)]",
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
          <span className="font-black text-xl tracking-wide bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,186,49,0.35)]">
            Zexo Capital
          </span>
        </div>

        {/* Language Selector Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05143a]/80 backdrop-blur-md border border-[#f5ba31]/70 shadow-[0_0_12px_rgba(245,186,49,0.25)] text-xs font-semibold text-white hover:border-[#f5ba31] transition-all cursor-pointer">
          <Globe size={13} className="text-[#ffe58f]" />
          <span>Language</span>
          <ChevronDown size={13} className="text-white/75" />
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
                className={`object-cover transition-transform duration-700 ease-out ${
                  currentSlide === idx ? "scale-100" : "scale-105"
                }`}
                priority={idx === 0}
              />
            </div>
          ))}

          {/* Top-left LIVE SUMMIT badge */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-wide uppercase text-white/95">
              {bannerSlides[currentSlide].tag}
            </span>
          </div>

          {/* Top-right USA Official badge */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#071d4d]/85 backdrop-blur-md border border-[#f5ba31]/70 text-white text-[10.5px] font-bold shadow-sm">
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
      <div className="relative z-10 mx-3 mt-3 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#030e28]/90 backdrop-blur-md border border-[#00d2ff]/80 shadow-[0_0_16px_rgba(0,210,255,0.25)] overflow-hidden">
        <Volume2
          size={19}
          className="text-[#f5ba31] flex-shrink-0 animate-pulse drop-shadow-[0_0_6px_rgba(245,186,49,0.7)]"
        />
        <div className="relative flex-1 overflow-hidden h-5 flex items-center">
          <div className="absolute inset-y-0 flex items-center whitespace-nowrap animate-marquee-rtl select-none text-xs font-semibold text-white tracking-wide">
            {tickerText}
          </div>
        </div>
        <ChevronRight size={17} className="text-[#f5ba31] flex-shrink-0" />
      </div>

      {/* Account Balance Summary Card (Gold Neon Glowing Card) */}
      <div className="relative z-10 mx-3 mt-3 p-[2px] rounded-[26px] bg-gradient-to-b from-[#f5ba31] via-[#ffd778] to-[#c98600] shadow-[0_0_28px_rgba(245,186,49,0.35),inset_0_0_12px_rgba(245,186,49,0.1)]">
        <div className="rounded-[24px] bg-gradient-to-b from-[#081944]/95 via-[#04102e]/98 to-[#02091c] backdrop-blur-2xl p-4 sm:p-5">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            {/* Balance */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user ? Number(user.balance).toFixed(2) : "0.00"}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                  USDT
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-300/80 mt-0.5">
                ≈ {user ? (Number(user.balance) * 127).toFixed(0) : "0"} Tk
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center shadow-[0_4px_12px_rgba(0,180,216,0.45)] border border-cyan-300/40 flex-shrink-0">
                  <Wallet size={16} className="text-white drop-shadow" />
                </div>
                <span className="text-xs font-bold text-slate-100 tracking-tight">
                  Balance
                </span>
              </div>
            </div>

            {/* Total Fund */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user ? Number(user.totalFund).toFixed(2) : "0.00"}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                  USDT
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-300/80 mt-0.5">
                ≈ {user ? (Number(user.totalFund) * 127).toFixed(0) : "0"} Tk
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.45)] border border-emerald-300/40 flex-shrink-0">
                  <Coins size={16} className="text-white drop-shadow" />
                </div>
                <span className="text-xs font-bold text-slate-100 tracking-tight">
                  Total Fund
                </span>
              </div>
            </div>

            {/* Fund Income */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                  USDT
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-300/80 mt-0.5">
                ≈ {user ? (Number(user.fundIncome) * 127).toFixed(0) : "0"} Tk
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.45)] border border-purple-300/40 flex-shrink-0">
                  <TrendingUp size={16} className="text-white drop-shadow" />
                </div>
                <span className="text-xs font-bold text-slate-100 tracking-tight">
                  Fund Income
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3x3 Action Cards Grid (Vibrant Glossy Pill Buttons) */}
      <div className="relative z-10 mx-3 mt-3.5 grid grid-cols-3 gap-2.5">
        {actionCards.map((card, idx) => {
          const Icon = card.icon;
          const buttonContent = (
            <div
              className={`w-full py-2.5 sm:py-3 px-2 sm:px-2.5 rounded-2xl bg-gradient-to-r ${card.gradient} ${card.shadow} border-t border-white/35 flex items-center justify-between text-white active:scale-95 transition-all duration-200 group relative overflow-hidden`}
            >
              {/* Gloss highlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />

              {/* Left Circular Badge */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/30 text-white shadow-inner">
                <Icon size={14} className="stroke-[2.5]" />
              </div>

              {/* Center Title */}
              <span className="text-[10px] sm:text-[11.5px] font-bold text-white tracking-tight leading-none px-1 text-center flex-1 truncate drop-shadow-sm">
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
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#04102e]/85 to-[#071944]/85 border border-[#f5ba31]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-[#f5ba31] transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f5ba31] shadow-[0_0_8px_#f5ba31] animate-ping" />
            <span className="text-sm font-bold text-slate-100 group-hover:text-[#f5ba31] transition-colors">
              Introduction to Zexo Capital
            </span>
          </div>
          <ChevronRight
            size={18}
            className="text-[#f5ba31] group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Customer Service Dialog Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-[360px] bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] rounded-3xl p-5 shadow-[0_0_35px_rgba(245,186,49,0.3)] border-2 border-[#f5ba31]">
            {/* Close Button */}
            <button
              onClick={() => setIsSupportOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center mt-1 mb-4">
              <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#e69e05] shadow-[0_0_20px_rgba(245,186,49,0.4)] mb-2">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                  <Image
                    src="/support-agent.svg"
                    alt="Customer Support"
                    fill
                    className="object-cover p-1"
                    unoptimized
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#f5ba31] text-[#020a1f] px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow flex items-center gap-1">
                  <Headphones size={10} /> 24/7 Live
                </div>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">
                Zexo Capital Customer Service
              </h3>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Our support team is available 24/7 to assist you
              </p>
            </div>

            {/* Support Channels List */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={supportUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    <MessageCircle size={22} />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-emerald-400">
                    WhatsApp Customer Service
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className="text-slate-400 group-hover:text-emerald-400"
                />
              </a>

              {/* Telegram Official Group */}
              <a
                href={supportUrls.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-sky-400 hover:bg-sky-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,136,204,0.4)]">
                    <Send
                      size={20}
                      className="translate-x-[-1px] translate-y-[1px]"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-sky-400">
                    Telegram Official Group
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className="text-slate-400 group-hover:text-sky-400"
                />
              </a>

              {/* Telegram Official Channel */}
              <a
                href={supportUrls.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,162,255,0.4)]">
                    <Send size={20} />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-400">
                    Telegram Official Channel
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className="text-slate-400 group-hover:text-cyan-400"
                />
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsSupportOpen(false)}
              className="mt-5 w-full py-2.5 rounded-full border border-[#f5ba31] text-[#f5ba31] bg-[#f5ba31]/10 font-bold text-sm shadow-[0_0_12px_rgba(245,186,49,0.2)] hover:bg-[#f5ba31]/20 active:scale-98 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


