"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
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

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
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
    if (!confirm("Remove your profile picture and show name initials?")) return;

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
    { label: "Record", icon: ClipboardList, href: "/records" },
    { label: "VIP Level", icon: Crown, href: "/vip" },
    { label: "Team Details", icon: Users, href: "/share" },
    { label: "Invite Friends", icon: Share2, href: "/share" },
    { label: "Recharge Record", icon: ArrowDownCircle, href: "/recharge-record" },
    { label: "Withdraw Record", icon: ArrowUpCircle, href: "/withdraw-record" },
    { label: "Personal Information", icon: User, href: "/personal-info" },
    { label: "Change Password", icon: Lock, href: "/change-password" },
    { label: "Set Withdrawal Password", icon: ShieldCheck, href: "/set-withdraw-password" },
    { label: "Support", icon: Headphones, href: "/support" },
    { label: "App Download", icon: Download, href: "/app-download" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white pb-32">
      {/* Header Building Image with Avatar */}
      <div className="relative h-36 w-full bg-slate-950 overflow-hidden shadow-inner">
        <Image
          src="/profile-banner.jpg"
          alt="Zexo Capital International Headquarters"
          fill
          className="object-cover object-center opacity-85"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a1f] via-[#020a1f]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* User Avatar & Identity Card */}
      <div className="relative px-4 -mt-11">
        <div className="flex flex-col items-center">
          {/* Avatar Container with Upload & Initials fallback */}
          <div className="relative group">
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] shadow-[0_0_20px_rgba(245,186,49,0.45)] border-2 border-white/40 overflow-hidden flex items-center justify-center">
              {uploadingAvatar ? (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Loader2 size={24} className="animate-spin text-[#f5ba31]" />
                </div>
              ) : user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] flex items-center justify-center text-white text-xl font-black shadow-inner tracking-wider select-none">
                  {getInitials(user?.nickname)}
                </div>
              )}
            </div>

            {/* Camera Upload Button Badge */}
            <label
              htmlFor="avatar-file-upload"
              title="Upload profile picture"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gradient-to-tr from-[#f5ba31] to-[#e69e05] text-[#020a1f] shadow-md border-2 border-[#020a1f] cursor-pointer hover:scale-110 active:scale-95 transition-all"
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
              className="mt-0.5 flex items-center gap-1 text-[10.5px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 size={11} />
              <span>Remove Photo</span>
            </button>
          )}

          {/* User Nickname */}
          <div className="mt-1.5 px-4 py-1 rounded-full bg-[#05143a]/90 backdrop-blur-md border border-[#f5ba31]/50 shadow-[0_0_12px_rgba(245,186,49,0.2)] flex items-center gap-1.5">
            <User size={13} className="text-[#f5ba31]" />
            <span className="font-extrabold text-white text-xs sm:text-sm">
              {user?.nickname || "User"}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-slate-300">
            <span>ID: {user?.referralCode || "------"}</span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f5ba31]/20 text-[#f5ba31] border border-[#f5ba31]/60 text-[10px] shadow-[0_0_8px_rgba(245,186,49,0.2)]">
              Vip: {user?.vipLevel ?? 0}
            </span>
          </div>
        </div>

        {/* Total Assets Card with Glowing Gold Border */}
        <div className="mt-3 p-[2px] rounded-[24px] bg-gradient-to-b from-[#f5ba31] via-[#ffd778] to-[#c98600] shadow-[0_0_24px_rgba(245,186,49,0.3)]">
          <div className="p-3 sm:p-3.5 rounded-[22px] bg-gradient-to-b from-[#081944]/95 via-[#04102e]/98 to-[#02091c] backdrop-blur-2xl text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  My total assets: (USDT)
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
                  Deposit
                </Link>
                <Link
                  href="/withdraw"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:brightness-105 active:scale-95 transition-all"
                >
                  Withdraw
                </Link>
              </div>
            </div>

            {/* Rate conversion line - strictly one line on all devices */}
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
                  Earnings-yesterday
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                  Accumulated earnings
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {user ? Number(user.todayEarnings).toFixed(2) : "0.00"}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                  Today&apos;s earnings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row: Notice, Company Info, FAQ */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <Link
            href="/notice"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#f5ba31]/50 hover:bg-[#071944] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#f5ba31] border border-[#f5ba31]/40 flex items-center justify-center mb-1">
              <FileText size={18} />
            </div>
            <span className="text-xs font-bold text-slate-200">Notice</span>
          </Link>

          <Link
            href="/company-info"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#f5ba31]/50 hover:bg-[#071944] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center mb-1">
              <Info size={18} />
            </div>
            <span className="text-xs font-bold text-slate-200">Company Info</span>
          </Link>

          <Link
            href="/faq"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#f5ba31]/50 hover:bg-[#071944] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-teal-400 border border-teal-400/40 flex items-center justify-center mb-1">
              <HelpCircle size={18} />
            </div>
            <span className="text-xs font-bold text-slate-200">FAQ</span>
          </Link>
        </div>

        {/* Complete Now Action Pill */}
        <div className="mt-3">
          <Link
            href="/vip"
            className="block w-full py-2.5 rounded-full border-2 border-[#f5ba31] bg-gradient-to-r from-[#f5ba31]/20 via-[#ffd369]/20 to-[#f5ba31]/20 text-center font-black text-sm text-[#f5ba31] shadow-[0_0_15px_rgba(245,186,49,0.25)] hover:bg-[#f5ba31]/30 transition-all"
          >
            Complete Now
          </Link>
        </div>

        {/* Pill Menu Items List (Dark Glass Pills with Gold Accents) */}
        <div className="mt-4 space-y-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#f5ba31]/40 hover:bg-[#071944] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-[#f5ba31] flex items-center justify-center group-hover:bg-[#f5ba31] group-hover:text-[#020a1f] transition-all">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-slate-500 group-hover:text-[#f5ba31] group-hover:translate-x-1 transition-all"
                />
              </Link>
            );
          })}
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-base shadow-[0_4px_16px_rgba(220,38,38,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
