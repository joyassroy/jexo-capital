"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        setLoading(false);
      });
  }, []);

  const isLight = mounted && theme === "light";

  const handleLogout = async () => {
    if (confirm(t("confirm_logout"))) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
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
      alert("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5MB.");
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
        alert(data.error || "Failed to upload profile picture.");
        return;
      }

      setUser((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : null));
    } catch {
      alert("An unexpected network error occurred while uploading.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t("remove_photo") + "?")) return;

    setUploadingAvatar(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, avatarUrl: "" } : null));
      } else {
        alert("Failed to remove profile picture.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const menuItems = [
    { label: t("records"), icon: ClipboardList, href: "/records" },
    { label: t("nav_vip"), icon: Crown, href: "/vip" },
    { label: t("team_details"), icon: Users, href: "/share" },
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
          ? "bg-gradient-to-b from-[#ddecfa] via-[#eef6fc] to-[#dcecfa] text-slate-900"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      {/* Ambient Glows in Day Mode */}
      {isLight ? (
        <>
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
          <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-cyan-300/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-sky-200/20 blur-[130px] pointer-events-none" />
        </>
      ) : null}

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
              ? "bg-gradient-to-t from-[#ddecfa] via-[#1738d8]/35 to-transparent"
              : "bg-gradient-to-t from-[#020a1f] via-[#020a1f]/50 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Bar with Page Title and Theme Toggle */}
        <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between">
          <span className="font-black text-sm tracking-wide text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {t("nav_profile")}
          </span>
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
                  ? "bg-gradient-to-tr from-[#00d2ff] via-[#2563eb] to-[#1d4ed8] shadow-[0_4px_18px_rgba(0,180,255,0.4)] border-2 border-white"
                  : "bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] shadow-[0_0_20px_rgba(245,186,49,0.45)] border-2 border-white/40"
              }`}
            >
              {uploadingAvatar ? (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Loader2 size={24} className={`animate-spin ${isLight ? "text-cyan-300" : "text-[#f5ba31]"}`} />
                </div>
              ) : user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center text-white text-xl font-black shadow-inner tracking-wider select-none ${
                    isLight
                      ? "bg-gradient-to-tr from-[#00b4d8] via-[#0077b6] to-[#023e8a]"
                      : "bg-gradient-to-tr from-[#00b4d8] to-[#0077b6]"
                  }`}
                >
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
                  ? "bg-gradient-to-tr from-[#00d2ff] to-[#2563eb] text-white border-2 border-white shadow-md"
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
                ? "bg-white/95 border border-blue-200/90 shadow-[0_2px_10px_rgba(37,99,235,0.08)]"
                : "bg-[#05143a]/90 border border-[#f5ba31]/50 shadow-[0_0_12px_rgba(245,186,49,0.2)]"
            }`}
          >
            <User size={13} className={isLight ? "text-blue-600" : "text-[#f5ba31]"} />
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
            <span>ID: {user?.referralCode || "------"}</span>
            <span>•</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-all ${
                isLight
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                  : "bg-[#f5ba31]/20 text-[#f5ba31] border border-[#f5ba31]/60 shadow-[0_0_8px_rgba(245,186,49,0.2)]"
              }`}
            >
              Vip: {user?.vipLevel ?? 0}
            </span>
          </div>
        </div>

        {/* Total Assets Card */}
        {isLight ? (
          /* Day Mode Vibrant Electric Blue Wealth Card */
          <div className="relative mt-3 p-4 sm:p-4.5 rounded-[24px] bg-gradient-to-br from-[#1738d8] via-[#2563eb] to-[#0284c7] text-white shadow-[0_8px_25px_rgba(23,56,216,0.28)] border border-blue-300/35 overflow-hidden">
            {/* Top-right Cyan Glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle,rgba(0,210,255,0.35)_0%,transparent_70%)] pointer-events-none" />

            {/* Top Row: Title + Balance + Deposit / Withdraw Actions */}
            <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/20">
              <div>
                <span className="text-[10px] sm:text-[10.5px] font-bold text-blue-100 uppercase tracking-wider block">
                  {t("total_assets")}
                </span>
                <div className="text-2xl sm:text-2xl font-black text-white flex items-baseline gap-1.5 mt-0.5 tracking-tight">
                  <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
                  <span className="text-xs font-bold text-cyan-200">USDT</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link
                  href="/recharge"
                  className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  {t("deposit")}
                </Link>
                <Link
                  href="/withdraw"
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/35 hover:bg-white/30 font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  {t("withdraw")}
                </Link>
              </div>
            </div>

            {/* Rate Conversion Row */}
            <div className="relative z-10 pt-2 pb-1.5 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-blue-100 whitespace-nowrap overflow-hidden">
              <span className="text-white font-black whitespace-nowrap">
                ≈ {user ? (Number(user.balance) * 127).toFixed(2) : "0.00"} BDT
              </span>
              <span className="text-blue-100/90 font-medium whitespace-nowrap text-[10px] sm:text-[10.5px]">
                (Rate: 1 USDT = 127 Tk)
              </span>
            </div>

            {/* 3 Columns Earnings Row */}
            <div className="relative z-10 grid grid-cols-3 divide-x divide-white/20 pt-2 border-t border-white/20 text-center">
              <div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {user ? Number(user.yesterdayEarnings).toFixed(2) : "0.00"}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-blue-100/85 font-medium mt-0.5">
                  {t("earnings_yesterday")}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-blue-100/85 font-medium mt-0.5">
                  {t("accumulated_earnings")}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {user ? Number(user.todayEarnings).toFixed(2) : "0.00"}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-blue-100/85 font-medium mt-0.5">
                  {t("today_earnings")}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Dark Mode Luxury Obsidian Gold Assets Card */
          <div className="mt-3 p-[2px] rounded-[24px] bg-gradient-to-b from-[#f5ba31] via-[#ffd778] to-[#c98600] shadow-[0_0_24px_rgba(245,186,49,0.3)]">
            <div className="p-3 sm:p-3.5 rounded-[22px] bg-gradient-to-b from-[#081944]/95 via-[#04102e]/98 to-[#02091c] backdrop-blur-2xl text-white">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {t("total_assets")}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-1 mt-0.5">
                    <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
                    <span className="text-xs font-bold text-[#f5ba31]">USDT</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    href="/recharge"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:brightness-105 active:scale-95 transition-all"
                  >
                    {t("deposit")}
                  </Link>
                  <Link
                    href="/withdraw"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:brightness-105 active:scale-95 transition-all"
                  >
                    {t("withdraw")}
                  </Link>
                </div>
              </div>

              {/* Rate conversion line */}
              <div className="pt-1.5 pb-1 flex items-center justify-between text-[10.5px] sm:text-xs font-semibold text-slate-300 whitespace-nowrap overflow-hidden">
                <span className="text-[#f5ba31] font-bold whitespace-nowrap">
                  ≈ {user ? (Number(user.balance) * 127).toFixed(2) : "0.00"} BDT
                </span>
                <span className="text-slate-400 font-medium whitespace-nowrap text-[10px] sm:text-[11px]">
                  (Rate: 1 USDT = 127 Tk)
                </span>
              </div>

              {/* Earnings summary row */}
              <div className="grid grid-cols-3 divide-x divide-white/10 pt-2 border-t border-white/10 text-center">
                <div>
                  <div className="text-xs sm:text-sm font-black text-white">
                    {user ? Number(user.yesterdayEarnings).toFixed(2) : "0.00"}
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                    {t("earnings_yesterday")}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-white">
                    {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                    {t("accumulated_earnings")}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-white">
                    {user ? Number(user.todayEarnings).toFixed(2) : "0.00"}
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                    {t("today_earnings")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Row: Notice, Company Info, FAQ */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {/* Notice */}
          <Link
            href="/notice"
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm transition-all group ${
              isLight
                ? "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/50 hover:bg-[#071944]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                isLight
                  ? "bg-gradient-to-tr from-[#ff9100] via-[#ffa726] to-[#ffb74d] text-white shadow-[0_3px_10px_rgba(255,145,0,0.3)]"
                  : "bg-amber-500/20 text-[#f5ba31] border border-[#f5ba31]/40"
              }`}
            >
              <FileText size={18} color="#ffffff" stroke="#ffffff" />
            </div>
            <span
              className={`text-xs font-bold tracking-tight ${
                isLight ? "text-slate-800 group-hover:text-blue-600" : "text-slate-200"
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
                ? "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/50 hover:bg-[#071944]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                isLight
                  ? "bg-gradient-to-tr from-[#0066ff] via-[#0080ff] to-[#00b4d8] text-white shadow-[0_3px_10px_rgba(0,102,255,0.3)]"
                  : "bg-blue-500/20 text-cyan-400 border border-cyan-400/40"
              }`}
            >
              <Info size={18} color="#ffffff" stroke="#ffffff" />
            </div>
            <span
              className={`text-xs font-bold tracking-tight ${
                isLight ? "text-slate-800 group-hover:text-blue-600" : "text-slate-200"
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
                ? "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/50 hover:bg-[#071944]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                isLight
                  ? "bg-gradient-to-tr from-[#00c853] via-[#00e676] to-[#69f0ae] text-white shadow-[0_3px_10px_rgba(0,200,83,0.3)]"
                  : "bg-cyan-500/20 text-teal-400 border border-teal-400/40"
              }`}
            >
              <HelpCircle size={18} color="#ffffff" stroke="#ffffff" />
            </div>
            <span
              className={`text-xs font-bold tracking-tight ${
                isLight ? "text-slate-800 group-hover:text-blue-600" : "text-slate-200"
              }`}
            >
              {t("faq")}
            </span>
          </Link>
        </div>

        {/* Complete Now Action Pill */}
        <div className="mt-3">
          <Link
            href="/vip"
            className={`block w-full py-3 rounded-2xl text-center font-black text-sm active:scale-98 transition-all ${
              isLight
                ? "bg-gradient-to-r from-[#1738d8] via-[#2563eb] to-[#00d2ff] text-white shadow-[0_4px_16px_rgba(23,56,216,0.28)] hover:brightness-105"
                : "border-2 border-[#f5ba31] bg-gradient-to-r from-[#f5ba31]/20 via-[#ffd369]/20 to-[#f5ba31]/20 text-[#f5ba31] shadow-[0_0_15px_rgba(245,186,49,0.25)] hover:bg-[#f5ba31]/30"
            }`}
          >
            {t("complete_now")}
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
                className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-sm transition-all group active:scale-[0.99] ${
                  isLight
                    ? "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                    : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-[#f5ba31]/40 hover:bg-[#071944]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all ${
                      isLight
                        ? "bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white"
                        : "bg-white/5 border border-white/10 text-[#f5ba31] group-hover:bg-[#f5ba31] group-hover:text-[#020a1f]"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isLight
                        ? "text-slate-800 group-hover:text-blue-600"
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
                      ? "text-slate-400 group-hover:text-blue-600"
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
          className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-base shadow-[0_4px_16px_rgba(220,38,38,0.35)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={20} />
          <span>{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}
