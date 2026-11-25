"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import ConfirmModal from "@/components/common/ConfirmModal";
import {
  FileText,
  Info,
  HelpCircle,
  ClipboardList,
  Crown,
  Users,
  Share2,
  ArrowDownCircle,
  ArrowUpCircle,
  User,
  Lock,
  Headphones,
  Download,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Camera,
  Loader2,
  Trash2,
} from "lucide-react";

interface UserData {
  phone: string;
  nickname: string;
  avatarUrl?: string;
  balance: number;
  referralCode: string;
  vipLevel: number;
  yesterdayEarnings: number;
  todayEarnings: number;
  totalFund: number;
  fundIncome: number;
}

export default function ProfilePage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [kycStatus, setKycStatus] = useState<string>("not_submitted");
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/user/me")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
        if (data?.kycStatus) setKycStatus(data.kycStatus);
        if (data?.withdrawable?.usdtRate) setUsdtRate(data.withdrawable.usdtRate);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        setLoading(false);
      });
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);

  const isLight = mounted && theme === "light";

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

  const getInitials = (name?: string) => {
    if (!name) return "ZC";
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should not exceed 5MB.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to upload profile picture.");
        return;
      }

      setUser((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : null));
      toast.success("Profile photo updated successfully!");
    } catch {
      toast.error("An unexpected network error occurred while uploading.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveAvatarModal(true);
  };

  const confirmRemoveAvatar = async () => {
    setShowRemoveAvatarModal(false);
    setUploadingAvatar(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, avatarUrl: "" } : null));
        toast.success("Profile photo removed.");
      } else {
        toast.error("Failed to remove profile picture.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const menuItems = [
    { label: t("records"), icon: ClipboardList, href: "/records" },
    { label: t("nav_vip"), icon: Crown, href: "/vip" },
    { label: t("team_details"), icon: Users, href: "/team" },
    { label: t("invite_friends"), icon: Share2, href: "/share" },
    { label: t("recharge_records"), icon: ArrowDownCircle, href: "/recharge-record" },
    { label: t("withdrawal_records"), icon: ArrowUpCircle, href: "/withdraw-record" },
    { label: t("personal_info"), icon: User, href: "/personal-info" },
    { label: t("change_pwd"), icon: Lock, href: "/change-password" },
    { label: t("set_withdraw_pwd"), icon: ShieldCheck, href: "/set-withdraw-password" },
    { label: t("support"), icon: Headphones, href: "/support" },
    { label: t("app_download"), icon: Download, href: "/app-download" },
  ];

  return (
    <div
      className={`min-h-screen pb-32 transition-colors duration-300 relative overflow-hidden ${
        isLight
          ? "bg-gradient-to-b from-[#f4f7fc] via-[#ffffff] to-[#eef3fb] text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      {/* Header Building Image with Avatar */}
      <div className="relative h-36 w-full bg-slate-950 overflow-hidden shadow-inner">
        <Image
          src="/profile-banner.jpg"
          alt="Zexo Capital International Headquarters"
          fill
          className={`object-cover object-center transition-opacity duration-300 ${
            isLight ? "opacity-90" : "opacity-85"
          }`}
          priority
          unoptimized
        />
        {/* Day vs Night Gradient Overlay */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isLight
              ? "bg-gradient-to-t from-[#f4f7fc] via-black/25 to-black/60"
              : "bg-gradient-to-t from-[#020a1f] via-[#020a1f]/60 to-black/60"
          }`}
        />

        {/* Top Bar with Theme Toggle only (Personal Center removed per user request) */}
        <div className="absolute top-3 right-4 z-20 flex items-center justify-end">
          <ThemeToggle compact />
        </div>
      </div>

      {/* User Avatar & Identity Card */}
      <div className="relative px-4 -mt-11">
        <div className="flex flex-col items-center">
          {/* Avatar Container with Upload & Initials fallback */}
          <div className="relative group">
            <div
              className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 overflow-hidden flex items-center justify-center transition-all ${
                isLight
                  ? "bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] shadow-[0_4px_18px_rgba(245,186,49,0.35)] border-2 border-white"
                  : "bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] shadow-[0_0_20px_rgba(245,186,49,0.45)] border-2 border-white/40"
              }`}
            >
              {uploadingAvatar ? (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Loader2 size={24} className="animate-spin text-amber-400" />
                </div>
              ) : user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-black shadow-inner tracking-wider select-none bg-gradient-to-tr from-[#020a1f] to-[#0a235c]">
                  {getInitials(user?.nickname)}
                </div>
              )}
            </div>

            {/* Camera Upload Button Badge */}
            <label
              htmlFor="avatar-file-upload"
              title={t("upload_photo")}
              className={`absolute bottom-0 right-0 p-1.5 rounded-full shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                isLight
                  ? "bg-gradient-to-tr from-[#f5ba31] to-[#d49002] text-[#020a1f] border-2 border-white shadow-md"
                  : "bg-gradient-to-tr from-[#f5ba31] to-[#e69e05] text-[#020a1f] border-2 border-[#020a1f] shadow-md"
              }`}
            >
              <Camera size={13} className="stroke-[3]" />
            </label>

            <input
              ref={fileInputRef}
              id="avatar-file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileSelect}
              disabled={uploadingAvatar}
            />
          </div>

          {/* Remove Photo action if user has photo */}
          {user?.avatarUrl && !uploadingAvatar && (
            <button
              onClick={handleRemoveAvatar}
              className="mt-1 flex items-center gap-1 text-[10.5px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 size={11} />
              <span>{t("remove_photo")}</span>
            </button>
          )}

          {/* User Nickname */}
          <div
            className={`mt-1.5 px-4 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 transition-all ${
              isLight
                ? "bg-white border border-slate-200/90 shadow-sm"
                : "bg-[#05143a]/90 border border-[#f5ba31]/50 shadow-[0_0_12px_rgba(245,186,49,0.2)]"
            }`}
          >
            <User size={13} className="text-amber-500" />
            <span
              className={`font-black text-xs sm:text-sm tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {user?.nickname || "User"}
            </span>
          </div>

          <div
            className={`flex items-center gap-3 mt-1.5 text-[11px] font-bold ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (user?.referralCode) {
                  navigator.clipboard.writeText(user.referralCode);
                  toast.success(`ID ${user.referralCode} copied to clipboard!`);
                }
              }}
              className="hover:underline flex items-center gap-1 active:scale-95 transition-transform"
              title="Click to copy ID"
            >
              <span>ID: {user?.referralCode || "------"}</span>
            </button>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 border border-amber-300 shadow-xs">
              Vip: {user?.vipLevel ?? 0}
            </span>
          </div>
        </div>

        {/* Total Assets Card */}
        {isLight ? (
          /* Day Mode Clean Box */
          <div className="relative mt-3 p-4 sm:p-4.5 rounded-[22px] bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-slate-800">
            {/* Top Row: Title + Balance + Deposit / Withdraw Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="min-w-0 pr-1.5">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 uppercase tracking-tight whitespace-nowrap block">
                  {t("total_assets")}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#020a1f] flex items-baseline gap-1.5 mt-0.5 tracking-tight font-mono whitespace-nowrap">
                  <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
                  <span className="text-xs font-black text-amber-500 font-sans">USDT</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link
                  href="/recharge"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-xs shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-95 transition-all tracking-wide uppercase whitespace-nowrap"
                >
                  {t("deposit")}
                </Link>
                <Link
                  href="/withdraw"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-200 shadow-xs hover:scale-105 active:scale-95 transition-all tracking-wide uppercase whitespace-nowrap"
                >
                  {t("withdraw")}
                </Link>
              </div>
            </div>

            {/* Rate Conversion Row */}
            <div className="pt-2 pb-2 flex items-center justify-between text-[11px] sm:text-xs font-semibold whitespace-nowrap overflow-hidden">
              <span className="text-amber-600 font-black whitespace-nowrap">
                ≈ {user ? (Number(user.balance) * usdtRate).toFixed(2) : "0.00"} BDT
              </span>
              <span className="text-slate-400 font-medium whitespace-nowrap text-[10px] sm:text-[10.5px]">
                (Rate: 1 USDT = {usdtRate} Tk)
              </span>
            </div>

            {/* 3 Columns Earnings Row (Strictly 1 Line on all mobile screens) */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 pt-2.5 border-t border-slate-100 text-center">
              {/* Yesterday */}
              <div className="px-0.5 flex flex-col items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-800 font-mono flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span>{user ? Number(user.yesterdayEarnings).toFixed(2) : "0.00"}</span>
                    <span className="text-[8.5px] font-bold text-slate-400">USDT</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black text-slate-600 font-mono mt-0.5 whitespace-nowrap">
                    ≈ {user ? (Number(user.yesterdayEarnings) * usdtRate).toFixed(2) : "0.00"} ৳
                  </div>
                </div>
                <div className="text-[8px] sm:text-[8.5px] text-slate-500 font-bold mt-1 uppercase tracking-tighter whitespace-nowrap">
                  {t("earnings_yesterday")}
                </div>
              </div>

              {/* Accumulated */}
              <div className="px-0.5 flex flex-col items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black text-amber-600 font-mono flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span>{user ? Number(user.fundIncome).toFixed(2) : "0.00"}</span>
                    <span className="text-[8.5px] font-bold text-amber-500/80">USDT</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black text-amber-600 font-mono mt-0.5 whitespace-nowrap">
                    ≈ {user ? (Number(user.fundIncome) * usdtRate).toFixed(2) : "0.00"} ৳
                  </div>
                </div>
                <div className="text-[8px] sm:text-[8.5px] text-slate-500 font-bold mt-1 uppercase tracking-tighter whitespace-nowrap">
                  {t("accumulated_earnings")}
                </div>
              </div>

              {/* Today */}
              <div className="px-0.5 flex flex-col items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black text-emerald-600 font-mono flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span>{user ? Number(user.todayEarnings).toFixed(2) : "0.00"}</span>
                    <span className="text-[8.5px] font-bold text-emerald-500/80">USDT</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black text-emerald-600 font-mono mt-0.5 whitespace-nowrap">
                    ≈ {user ? (Number(user.todayEarnings) * usdtRate).toFixed(2) : "0.00"} ৳
                  </div>
                </div>
                <div className="text-[8px] sm:text-[8.5px] text-slate-500 font-bold mt-1 uppercase tracking-tighter whitespace-nowrap">
                  {t("today_earnings")}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Dark Mode Clean Box */
          <div className="relative mt-3 p-4 sm:p-4.5 rounded-[22px] bg-[#04102e]/95 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="min-w-0 pr-1.5">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-200/90 uppercase tracking-tight whitespace-nowrap block drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                  {t("total_assets")}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5 mt-0.5 font-mono whitespace-nowrap">
                  <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
                  <span className="text-xs font-black text-[#f5ba31] font-sans">USDT</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link
                  href="/recharge"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-xs shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-95 transition-all tracking-wide uppercase whitespace-nowrap"
                >
                  {t("deposit")}
                </Link>
                <Link
                  href="/withdraw"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs border border-white/30 backdrop-blur-md shadow-xs hover:scale-105 active:scale-95 transition-all tracking-wide uppercase whitespace-nowrap"
                >
                  {t("withdraw")}
                </Link>
              </div>
            </div>

            {/* Rate conversion line */}
            <div className="pt-2 pb-2 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-300 whitespace-nowrap overflow-hidden">
              <span className="text-[#f5ba31] font-black whitespace-nowrap">
                ≈ {user ? (Number(user.balance) * usdtRate).toFixed(2) : "0.00"} BDT
              </span>
              <span className="text-slate-400 font-medium whitespace-nowrap text-[10px] sm:text-[10.5px]">
                (Rate: 1 USDT = {usdtRate} Tk)
              </span>
            </div>

            {/* Earnings summary row (Strictly 1 Line on all mobile screens) */}
            <div className="grid grid-cols-3 divide-x divide-white/10 pt-2.5 border-t border-white/10 text-center">
              {/* Yesterday */}
              <div className="px-0.5 flex flex-col items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black text-white font-mono flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span>{user ? Number(user.yesterdayEarnings).toFixed(2) : "0.00"}</span>
                    <span className="text-[8.5px] font-bold text-slate-400">USDT</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black text-slate-300 font-mono mt-0.5 whitespace-nowrap">
                    ≈ {user ? (Number(user.yesterdayEarnings) * usdtRate).toFixed(2) : "0.00"} ৳
                  </div>
                </div>
                <div className="text-[8px] sm:text-[8.5px] text-slate-400 font-medium mt-1 uppercase tracking-tighter whitespace-nowrap">
                  {t("earnings_yesterday")}
                </div>
              </div>

              {/* Accumulated */}
              <div className="px-0.5 flex flex-col items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black text-[#f5ba31] font-mono flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span>{user ? Number(user.fundIncome).toFixed(2) : "0.00"}</span>
                    <span className="text-[8.5px] font-bold text-amber-300/80">USDT</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black text-[#ffd369] font-mono mt-0.5 whitespace-nowrap">
                    ≈ {user ? (Number(user.fundIncome) * usdtRate).toFixed(2) : "0.00"} ৳
                  </div>
                </div>
                <div className="text-[8px] sm:text-[8.5px] text-slate-400 font-medium mt-1 uppercase tracking-tighter whitespace-nowrap">
                  {t("accumulated_earnings")}
                </div>
              </div>

              {/* Today */}
              <div className="px-0.5 flex flex-col items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono flex items-baseline justify-center gap-0.5 whitespace-nowrap">
                    <span>{user ? Number(user.todayEarnings).toFixed(2) : "0.00"}</span>
                    <span className="text-[8.5px] font-bold text-emerald-400/80">USDT</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black text-emerald-400 font-mono mt-0.5 whitespace-nowrap">
                    ≈ {user ? (Number(user.todayEarnings) * usdtRate).toFixed(2) : "0.00"} ৳
                  </div>
                </div>
                <div className="text-[8px] sm:text-[8.5px] text-slate-400 font-medium mt-1 uppercase tracking-tighter whitespace-nowrap">
                  {t("today_earnings")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Row: Notice, Company Info, FAQ */}
        <div className="grid grid-cols-3 gap-2.5 mt-3.5">
          {/* Notice */}
          <Link
            href="/notice"
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm transition-all group ${
              isLight
                ? "bg-white border-slate-200/90 hover:border-amber-400/70 hover:shadow-md"
                : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/50 hover:bg-[#071944]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                isLight
                  ? "bg-amber-100 text-amber-700 border border-amber-200/60 shadow-xs"
                  : "bg-amber-500/20 text-[#f5ba31] border border-[#f5ba31]/40"
              }`}
            >
              <FileText size={19} />
            </div>
            <span
              className={`text-xs font-bold tracking-tight ${
                isLight ? "text-slate-800 group-hover:text-amber-700" : "text-slate-200"
              }`}
            >
              {t("notice")}
            </span>
          </Link>

          {/* Company Info */}
          <Link
            href="/company-info"
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm transition-all group ${
              isLight
                ? "bg-white border-slate-200/90 hover:border-blue-400/70 hover:shadow-md"
                : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/50 hover:bg-[#071944]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                isLight
                  ? "bg-blue-100 text-blue-700 border border-blue-200/60 shadow-xs"
                  : "bg-blue-500/20 text-cyan-400 border border-cyan-400/40"
              }`}
            >
              <Info size={19} />
            </div>
            <span
              className={`text-xs font-bold tracking-tight ${
                isLight ? "text-slate-800 group-hover:text-blue-700" : "text-slate-200"
              }`}
            >
              {t("company_info")}
            </span>
          </Link>

          {/* FAQ */}
          <Link
            href="/faq"
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm transition-all group ${
              isLight
                ? "bg-white border-slate-200/90 hover:border-emerald-400/70 hover:shadow-md"
                : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/50 hover:bg-[#071944]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                isLight
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-xs"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40"
              }`}
            >
              <HelpCircle size={19} />
            </div>
            <span
              className={`text-xs font-bold tracking-tight ${
                isLight ? "text-slate-800 group-hover:text-emerald-700" : "text-slate-200"
              }`}
            >
              {t("faq")}
            </span>
          </Link>
        </div>

        {/* Complete Now Action Button -> Redirects to NID picture upload page */}
        <div className="mt-3.5">
          <Link
            href="/personal-info"
            className="btn-gold-premium block w-full py-3.5 rounded-2xl text-center font-black text-sm active:scale-98 transition-all uppercase tracking-wider shadow-[0_4px_16px_rgba(245,186,49,0.35)]"
          >
            {kycStatus === "approved"
              ? "Profile Verified ✓"
              : kycStatus === "pending"
              ? "Profile Under Review ⏳"
              : t("complete_now")}
          </Link>
        </div>

        {/* Pill Menu Items List */}
        <div className="mt-4 space-y-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-xs transition-all group active:scale-[0.99] ${
                  isLight
                    ? "bg-white border-slate-200/80 hover:border-amber-300/80 hover:shadow-sm"
                    : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/40 hover:bg-[#071944]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isLight
                        ? "bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-[#020a1f] group-hover:text-amber-300 group-hover:border-[#020a1f]"
                        : "bg-white/5 border border-white/10 text-[#f5ba31] group-hover:bg-[#f5ba31] group-hover:text-[#020a1f]"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isLight
                        ? "text-slate-800 group-hover:text-[#020a1f]"
                        : "text-slate-200 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className={`transition-all group-hover:translate-x-1 ${
                    isLight
                      ? "text-slate-400 group-hover:text-amber-500"
                      : "text-slate-500 group-hover:text-[#f5ba31]"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
          className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 !text-white text-white font-black text-sm shadow-[0_4px_16px_rgba(220,38,38,0.35)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <LogOut size={18} color="#ffffff" stroke="#ffffff" className="!text-white text-white" />
          <span
            style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
            className="!text-white text-white font-black tracking-wider"
          >
            {t("logout")}
          </span>
        </button>
      </div>

      {/* Luxury Confirmation Modals */}
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

      <ConfirmModal
        isOpen={showRemoveAvatarModal}
        onClose={() => setShowRemoveAvatarModal(false)}
        onConfirm={confirmRemoveAvatar}
        title={t("remove_photo") || "Remove Photo"}
        message={(t("remove_photo") || "Remove profile photo") + "?"}
        confirmText="Remove"
        cancelText={t("cancel") || "Cancel"}
        type="warning"
        icon={<Trash2 size={24} />}
      />
    </div>
  );
}
