"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageModal from "@/components/common/LanguageModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
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
  ChevronDown,
  Star,
  Wallet,
  Coins,
  TrendingUp,
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
  const { t, activeLanguageOption, openLangModal } = useLanguage();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isLight = mounted && theme === "light";
  const [tickerText, setTickerText] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banner1, setBanner1] = useState("/homepage-banner.jpg");
  const [banner2, setBanner2] = useState("/homepage-banner-2.jpg");

  const bannerSlides = [
    {
      src: banner1 || "/homepage-banner.jpg",
      alt: "Jexo Capital Global Conference",
      tag: t("live_summit"),
      badge: t("usa_official"),
      title: t("conf_title"),
      subtitle: t("conf_subtitle"),
    },
    {
      src: banner2 || "/homepage-banner-2.jpg",
      alt: "Jexo Capital Global Investor Delegation",
      tag: t("delegates_tag"),
      badge: t("global_forum"),
      title: t("delegates_title"),
      subtitle: t("conf_subtitle"),
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
        if (data?.withdrawable?.usdtRate) setUsdtRate(data.withdrawable.usdtRate);
      })
      .catch(() => {});

    // Fetch settings ticker
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.homeTickerText) {
          setTickerText(data.settings.homeTickerText);
        }
        if (data?.settings?.usdtRateBDT) {
          setUsdtRate(data.settings.usdtRateBDT);
        }
        if (data?.settings?.homeBanner1) {
          setBanner1(data.settings.homeBanner1);
        }
        if (data?.settings?.homeBanner2) {
          setBanner2(data.settings.homeBanner2);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    toast.success("Logged out successfully");
    await fetch("/api/auth/logout", { method: "POST" });
    setTimeout(() => {
      window.location.href = "/login";
    }, 600);
  };

  // 9 White Squircle Cards for Day Mode (Matching media_1795519809893_3008b983.jpg)
  const dayActionCards = [
    {
      title: t("app_download"),
      icon: Download,
      href: "/app-download",
      gradient: "bg-gradient-to-tr from-[#00c853] via-[#00e676] to-[#69f0ae]",
      shadow: "shadow-[0_4px_12px_rgba(0,200,83,0.35)]",
    },
    {
      title: t("records"),
      icon: ClipboardList,
      href: "/records",
      gradient: "bg-gradient-to-tr from-[#ff1744] via-[#f43f5e] to-[#ff5252]",
      shadow: "shadow-[0_4px_12px_rgba(255,23,68,0.35)]",
    },
    {
      title: t("gift_receive"),
      icon: Gift,
      href: "/gift-receive",
      gradient: "bg-gradient-to-tr from-[#d946ef] via-[#c026d3] to-[#a855f7]",
      shadow: "shadow-[0_4px_12px_rgba(217,70,239,0.35)]",
    },
    {
      title: t("password"),
      icon: Lock,
      href: "/change-password",
      gradient: "bg-gradient-to-tr from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]",
      shadow: "shadow-[0_4px_12px_rgba(37,99,235,0.35)]",
    },
    {
      title: t("my_bank"),
      icon: CreditCard,
      href: "/my-bank",
      gradient: "bg-gradient-to-tr from-[#0091ea] via-[#00b0ff] to-[#40c4ff]",
      shadow: "shadow-[0_4px_12px_rgba(0,176,255,0.35)]",
    },
    {
      title: t("my_team"),
      icon: Users,
      href: "/team",
      gradient: "bg-gradient-to-tr from-[#7c3aed] via-[#8b5cf6] to-[#a855f7]",
      shadow: "shadow-[0_4px_12px_rgba(124,58,237,0.35)]",
    },
    {
      title: t("deposit"),
      icon: ArrowDownCircle,
      href: "/recharge",
      gradient: "bg-gradient-to-tr from-[#0066ff] via-[#0080ff] to-[#00b4d8]",
      shadow: "shadow-[0_4px_12px_rgba(0,102,255,0.35)]",
    },
    {
      title: t("withdraw"),
      icon: ArrowUpCircle,
      href: "/withdraw",
      gradient: "bg-gradient-to-tr from-[#ff9100] via-[#ffa726] to-[#ffb74d]",
      shadow: "shadow-[0_4px_12px_rgba(255,145,0,0.35)]",
    },
    {
      title: t("logout"),
      icon: LogOut,
      onClick: handleLogout,
      gradient: "bg-gradient-to-tr from-[#64748b] via-[#78889b] to-[#94a3b8]",
      shadow: "shadow-[0_4px_12px_rgba(100,116,139,0.35)]",
    },
  ];

  // 9 Squircle Action Cards for Dark/Night Mode (Identical design to Day Mode, tuned for dark theme)
  const nightActionCards = [
    {
      title: t("app_download"),
      icon: Download,
      href: "/app-download",
      gradient: "bg-gradient-to-tr from-[#00c853] via-[#00e676] to-[#69f0ae]",
      shadow: "shadow-[0_4px_14px_rgba(0,200,83,0.4)]",
    },
    {
      title: t("records"),
      icon: ClipboardList,
      href: "/records",
      gradient: "bg-gradient-to-tr from-[#ff1744] via-[#f43f5e] to-[#ff5252]",
      shadow: "shadow-[0_4px_14px_rgba(255,23,68,0.4)]",
    },
    {
      title: t("gift_receive"),
      icon: Gift,
      href: "/gift-receive",
      gradient: "bg-gradient-to-tr from-[#d946ef] via-[#c026d3] to-[#a855f7]",
      shadow: "shadow-[0_4px_14px_rgba(217,70,239,0.4)]",
    },
    {
      title: t("password"),
      icon: Lock,
      href: "/change-password",
      gradient: "bg-gradient-to-tr from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]",
      shadow: "shadow-[0_4px_14px_rgba(37,99,235,0.4)]",
    },
    {
      title: t("my_bank"),
      icon: CreditCard,
      href: "/my-bank",
      gradient: "bg-gradient-to-tr from-[#0091ea] via-[#00b0ff] to-[#40c4ff]",
      shadow: "shadow-[0_4px_14px_rgba(0,176,255,0.4)]",
    },
    {
      title: t("my_team"),
      icon: Users,
      href: "/team",
      gradient: "bg-gradient-to-tr from-[#7c3aed] via-[#8b5cf6] to-[#a855f7]",
      shadow: "shadow-[0_4px_14px_rgba(124,58,237,0.4)]",
    },
    {
      title: t("deposit"),
      icon: ArrowDownCircle,
      href: "/recharge",
      gradient: "bg-gradient-to-tr from-[#0066ff] via-[#0080ff] to-[#00b4d8]",
      shadow: "shadow-[0_4px_14px_rgba(0,102,255,0.4)]",
    },
    {
      title: t("withdraw"),
      icon: ArrowUpCircle,
      href: "/withdraw",
      gradient: "bg-gradient-to-tr from-[#ff9100] via-[#ffa726] to-[#ffb74d]",
      shadow: "shadow-[0_4px_14px_rgba(255,145,0,0.4)]",
    },
    {
      title: t("logout"),
      icon: LogOut,
      onClick: handleLogout,
      gradient: "bg-gradient-to-tr from-[#64748b] via-[#78889b] to-[#94a3b8]",
      shadow: "shadow-[0_4px_14px_rgba(100,116,139,0.4)]",
    },
  ];

  return (
    <div
      className={`min-h-screen pb-28 relative overflow-hidden transition-colors duration-300 ${
        isLight
          ? "bg-gradient-to-b from-[#ddecfa] via-[#eef6fc] to-[#dcecfa] text-slate-900"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      {/* Ambient Glows */}
      {isLight ? (
        <>
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
          <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-cyan-300/25 blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full h-40 bg-amber-500/10 blur-[90px] pointer-events-none" />
        </>
      )}

      {/* Top Header Navbar */}
      {isLight ? (
        /* Day Mode Top Header Bar */
        <div className="relative z-10 overflow-hidden bg-gradient-to-r from-[#1738d8] via-[#4338ca] to-[#00d2ff] shadow-sm pb-1.5">
          {/* Radial cyan highlight on top right */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(0,210,255,0.45),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between px-4 pt-2.5 pb-1.5">
            {/* Authentic Speed Z Logo + Jexo Capital Pure White Title */}
            <div className="flex items-center gap-2">
              <Logo size={30} showText={false} />
              <span
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                className="font-black text-xl tracking-wide logo-white-text !text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)] select-none"
              >
                Jexo Capital
              </span>
            </div>

            {/* Top Right: Theme Toggle & Language selector button */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={openLangModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm hover:bg-white/30 transition-all cursor-pointer text-xs font-semibold"
                aria-label="Switch Language"
              >
                <Globe size={13} className="text-white" />
                <span>{activeLanguageOption.nativeName}</span>
                <ChevronDown size={13} className="text-white/80" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dark Mode Top Header */
        <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2.5">
          <div className="flex items-center gap-2">
            <Logo size={34} showText={false} />
            <span className="font-black text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] drop-shadow-[0_2px_12px_rgba(245,186,49,0.35)]">
              Jexo Capital
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={openLangModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-[#05143a]/80 border border-[#f5ba31]/70 shadow-[0_0_12px_rgba(245,186,49,0.25)] text-white hover:border-[#f5ba31] cursor-pointer text-xs font-semibold transition-all"
              aria-label="Switch Language"
            >
              <Globe size={13} className="text-[#ffe58f]" />
              <span>{activeLanguageOption.nativeName}</span>
              <ChevronDown size={13} className="text-white/75" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Conference Banner */}
      {isLight ? (
        /* Day Mode Hero Banner */
        <div className="relative z-10 mx-3 mt-2 rounded-[20px] overflow-hidden shadow-md border border-white/70 bg-slate-950">
          <div className="relative aspect-[825/365] w-full">
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
                  unoptimized
                />
              </div>
            ))}

            {/* Top-left LIVE SUMMIT badge */}
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-white shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[9.5px] font-extrabold tracking-wide uppercase text-white/95">
                {bannerSlides[currentSlide].tag}
              </span>
            </div>

            {/* Top-right USA Official badge */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7c3aed]/85 border border-purple-300/40 text-white text-[10px] font-bold shadow-sm">
              <Star size={10} className="fill-amber-300 text-amber-300" />
              <span>{bannerSlides[currentSlide].badge}</span>
            </div>

            {/* Bottom Title & Pagination Dots */}
            <div className="absolute inset-x-0 bottom-0 z-20 pt-7 pb-2 px-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end justify-between pointer-events-auto">
              <div className="text-white pr-2">
                <div className="text-[11px] sm:text-xs font-black tracking-tight text-white drop-shadow-md leading-tight line-clamp-1">
                  {bannerSlides[currentSlide].title}
                </div>
                <div className="text-[9.5px] text-blue-200/90 font-medium line-clamp-1">
                  {bannerSlides[currentSlide].subtitle}
                </div>
              </div>

              {/* Pagination Indicators */}
              <div className="flex items-center gap-1 mb-0.5 flex-shrink-0">
                {bannerSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === i
                        ? "w-4 h-1.5 bg-[#00d2ff] shadow-[0_0_8px_#00d2ff]"
                        : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dark Mode Hero Conference Banner */
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
                  unoptimized
                />
              </div>
            ))}

            {/* Top-left LIVE SUMMIT badge */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-white shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
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
      )}

      {/* Marquee Announcement Ticker */}
      <div
        className={`relative z-10 mx-3 mt-2.5 flex items-center gap-2.5 px-3.5 py-2 rounded-full overflow-hidden transform-gpu transition-all duration-300 ${
          isLight
            ? "bg-white border border-blue-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            : "bg-[#030e28] border border-[#00d2ff]/80 shadow-[0_0_12px_rgba(0,210,255,0.2)]"
        }`}
      >
        <Volume2
          size={18}
          className={`${
            isLight ? "text-[#6366f1]" : "text-[#f5ba31] animate-pulse drop-shadow-[0_0_6px_rgba(245,186,49,0.7)]"
          } flex-shrink-0`}
        />
        <div className="relative flex-1 overflow-hidden h-5 flex items-center">
          <div
            className={`flex shrink-0 animate-marquee-rtl-loop whitespace-nowrap select-none text-xs font-semibold tracking-wide ${
              isLight ? "text-[#0f172a]" : "text-white"
            }`}
          >
            <span className="flex items-center">
              {tickerText || t("ticker_default")}
              <span className={`mx-6 ${isLight ? "text-blue-500" : "text-[#f5ba31]"} font-bold`}>★</span>
            </span>
          </div>
          <div
            className={`flex shrink-0 animate-marquee-rtl-loop whitespace-nowrap select-none text-xs font-semibold tracking-wide ${
              isLight ? "text-[#0f172a]" : "text-white"
            }`}
            aria-hidden="true"
          >
            <span className="flex items-center">
              {tickerText || t("ticker_default")}
              <span className={`mx-6 ${isLight ? "text-blue-500" : "text-[#f5ba31]"} font-bold`}>★</span>
            </span>
          </div>
        </div>
      </div>

      {/* Account Balance Summary Card */}
      {isLight ? (
        /* Day Mode Clean White Balance Card */
        <div className="relative z-10 mx-3 mt-2.5 rounded-[20px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-blue-50/80 p-3 sm:p-3.5 transition-all">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
            {/* Balance */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#0047cc]">
                  {user ? Number(user.balance).toFixed(2) : "0.00"}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0047cc]">
                  {t("usdt")}
                </span>
              </div>
              <div className="text-[10px] font-medium mt-0.5 text-slate-400">
                ≈ {user ? (Number(user.balance) * usdtRate).toFixed(0) : "0"} Tk
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                <div className="w-5 h-5 rounded-md bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center flex-shrink-0">
                  <Wallet size={12} className="text-[#7c3aed]" />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-slate-900">
                  {t("balance")}
                </span>
              </div>
            </div>

            {/* Total Fund */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#0047cc]">
                  {user ? Number(user.totalFund).toFixed(2) : "0.00"}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0047cc]">
                  {t("usdt")}
                </span>
              </div>
              <div className="text-[10px] font-medium mt-0.5 text-slate-400">
                ≈ {user ? (Number(user.totalFund) * usdtRate).toFixed(0) : "0"} Tk
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                <div className="w-5 h-5 rounded-md bg-[#dcfce7] text-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <Coins size={12} className="text-[#16a34a]" />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-slate-900">
                  {t("total_fund")}
                </span>
              </div>
            </div>

            {/* Fund Income */}
            <div className="px-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#0047cc]">
                  {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0047cc]">
                  {t("usdt")}
                </span>
              </div>
              <div className="text-[10px] font-medium mt-0.5 text-slate-400">
                ≈ {user ? (Number(user.fundIncome) * usdtRate).toFixed(0) : "0"} Tk
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                <div className="w-5 h-5 rounded-md bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={12} className="text-[#7c3aed]" />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-slate-900">
                  {t("fund_income")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dark Mode Account Balance Summary Card */
        <div className="relative z-10 mx-3 mt-3 p-[2px] rounded-[26px] bg-gradient-to-b from-[#f5ba31] via-[#ffd778] to-[#c98600] shadow-[0_0_20px_rgba(245,186,49,0.3)]">
          <div className="rounded-[24px] p-4 sm:p-5 bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c]">
            <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
              {/* Balance */}
              <div className="px-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {user ? Number(user.balance).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                    {t("usdt")}
                  </span>
                </div>
                <div className="text-[11px] font-medium mt-0.5 text-slate-300/80">
                  ≈ {user ? (Number(user.balance) * usdtRate).toFixed(0) : "0"} Tk
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center shadow-[0_4px_12px_rgba(0,180,216,0.45)] border border-cyan-300/40 flex-shrink-0">
                    <Wallet size={16} className="text-white drop-shadow" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-slate-100">
                    {t("balance")}
                  </span>
                </div>
              </div>

              {/* Total Fund */}
              <div className="px-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {user ? Number(user.totalFund).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                    {t("usdt")}
                  </span>
                </div>
                <div className="text-[11px] font-medium mt-0.5 text-slate-300/80">
                  ≈ {user ? (Number(user.totalFund) * usdtRate).toFixed(0) : "0"} Tk
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.45)] border border-emerald-300/40 flex-shrink-0">
                    <Coins size={16} className="text-white drop-shadow" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-slate-100">
                    {t("total_fund")}
                  </span>
                </div>
              </div>

              {/* Fund Income */}
              <div className="px-1">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-[#f5ba31]">
                    {t("usdt")}
                  </span>
                </div>
                <div className="text-[11px] font-medium mt-0.5 text-slate-300/80">
                  ≈ {user ? (Number(user.fundIncome) * usdtRate).toFixed(0) : "0"} Tk
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shadow-[0_4px_12px_rgba(168,85,247,0.45)] border border-purple-300/40 flex-shrink-0">
                    <TrendingUp size={16} className="text-white drop-shadow" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-slate-100">
                    {t("fund_income")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Grid (Full Titles Clearly Visible in Selected Language) */}
      {isLight ? (
        /* Day Mode: 3x3 White Squircle Cards */
        <div className="relative z-10 mx-3 mt-3.5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {dayActionCards.map((item, idx) => {
            const Icon = item.icon;
            const cardInner = (
              <div className="day-action-card w-full bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 py-2.5 px-1 sm:px-1.5 flex flex-col items-center justify-center hover:shadow-md transition-all active:scale-95 group">
                <div
                  className={`day-action-badge w-11 h-11 sm:w-11.5 sm:h-11.5 rounded-xl flex items-center justify-center text-white !text-white ${item.gradient} ${item.shadow} transition-transform group-hover:scale-105 flex-shrink-0`}
                  style={{ color: "#ffffff" }}
                >
                  <Icon
                    size={20}
                    color="#ffffff"
                    stroke="#ffffff"
                    className="stroke-[2.4] text-white !text-white"
                  />
                </div>
                <span
                  style={{ color: "#0f172a", WebkitTextFillColor: "#0f172a" }}
                  className="day-action-label text-[10.5px] sm:text-[11px] font-bold text-slate-900 !text-slate-900 mt-1.5 text-center tracking-tight leading-tight whitespace-nowrap block w-full select-none"
                >
                  {item.title}
                </span>
              </div>
            );

            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full focus:outline-none"
                >
                  {cardInner}
                </button>
              );
            }

            return (
              <Link key={idx} href={item.href || "#"} className="w-full">
                {cardInner}
              </Link>
            );
          })}
        </div>
      ) : (
        /* Night/Dark Mode: 3x3 Dark Squircle Cards (Matching Day Mode Design) */
        <div className="relative z-10 mx-3 mt-3.5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {nightActionCards.map((card, idx) => {
            const Icon = card.icon;
            const cardInner = (
              <div className="w-full bg-[#04102e]/90 backdrop-blur-md rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] border border-white/10 hover:border-[#f5ba31]/40 hover:bg-[#071944] py-2.5 px-1 sm:px-1.5 flex flex-col items-center justify-center transition-all duration-200 active:scale-95 group">
                <div
                  className={`day-action-badge w-11 h-11 sm:w-11.5 sm:h-11.5 rounded-xl flex items-center justify-center text-white !text-white ${card.gradient} ${card.shadow} transition-transform group-hover:scale-105 flex-shrink-0`}
                  style={{ color: "#ffffff" }}
                >
                  <Icon
                    size={20}
                    color="#ffffff"
                    stroke="#ffffff"
                    className="stroke-[2.4] text-white !text-white"
                  />
                </div>
                <span
                  style={{ color: "#f8fafc", WebkitTextFillColor: "#f8fafc" }}
                  className="text-[10.5px] sm:text-[11px] font-bold text-slate-100 !text-slate-100 group-hover:text-white mt-1.5 text-center tracking-tight leading-tight whitespace-nowrap block w-full select-none drop-shadow-sm"
                >
                  {card.title}
                </span>
              </div>
            );

            if (card.onClick) {
              return (
                <button
                  key={idx}
                  onClick={card.onClick}
                  className="w-full focus:outline-none"
                >
                  {cardInner}
                </button>
              );
            }

            return (
              <Link key={idx} href={card.href || "#"} className="w-full">
                {cardInner}
              </Link>
            );
          })}
        </div>
      )}

      {/* Luxury Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title={t("logout")}
        message={t("confirm_logout")}
        confirmText={t("logout")}
        cancelText={t("cancel") || "Cancel"}
        type="danger"
        icon={<LogOut size={24} />}
      />
    </div>
  );
}
