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
    <div className="min-h-screen bg-gradient-to-b from-[#bce0ff] via-[#e9f4ff] to-[#cfe7fe] pb-24">
      {/* Header Building Image with Avatar */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden shadow-inner">
        <Image
          src="/profile-banner.jpg"
          alt="Zexo Capital International Headquarters"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b3e] via-[#0d1b3e]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
      </div>

      {/* User Avatar & Identity Card */}
      <div className="relative px-4 -mt-14">
        <div className="flex flex-col items-center">
          {/* Avatar Container with Upload & Initials fallback */}
          <div className="relative group">
            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#00C6FF] via-[#0072FF] to-blue-800 shadow-xl border-2 border-white overflow-hidden flex items-center justify-center">
              {uploadingAvatar ? (
                <div className="w-full h-full rounded-full bg-blue-900/80 flex items-center justify-center text-white">
                  <Loader2 size={28} className="animate-spin text-cyan-300" />
                </div>
              ) : user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-inner tracking-wider select-none">
                  {getInitials(user?.nickname)}
                </div>
              )}
            </div>

            {/* Camera Upload Button Badge */}
            <label
              htmlFor="avatar-file-upload"
              title="Upload profile picture"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md border-2 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all"
            >
              <Camera size={14} className="stroke-[2.5]" />
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
              className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
            >
              <Trash2 size={12} />
              <span>Remove Photo</span>
            </button>
          )}

          {/* User Nickname */}
          <div className="mt-2 px-6 py-1 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 shadow-sm flex items-center gap-1.5">
            <User size={14} className="text-blue-600" />
            <span className="font-extrabold text-blue-950 text-sm">
              {user?.nickname || "User"}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs font-bold text-blue-900">
            <span>ID: {user?.referralCode || "------"}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Vip: {user?.vipLevel ?? 0}
            </span>
          </div>
        </div>

        {/* Total Assets Card with Deposit & Withdraw Buttons */}
        <div className="mt-4 p-4 rounded-2xl bg-white shadow-md border border-blue-100">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-500">
                My total assets: (USDT)
              </span>
              <div className="text-2xl font-black text-blue-950 flex items-baseline gap-1">
                <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
                <span className="text-xs font-bold text-blue-600">USDT</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-400 mt-0.5">
                ≈ {user ? (Number(user.balance) * 127).toFixed(2) : "0.00"} BDT (Rate: 1$ = 127 Tk)
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/recharge"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
              >
                Deposit
              </Link>
              <Link
                href="/withdraw"
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs shadow-sm hover:bg-red-600 active:scale-95 transition-all"
              >
                Withdraw
              </Link>
            </div>
          </div>

          {/* Earnings summary row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 pt-3 text-center">
            <div>
              <div className="text-sm font-extrabold text-blue-900">
                {user ? Number(user.yesterdayEarnings).toFixed(2) : "0.00"}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                Earnings-yesterday
              </div>
            </div>
            <div>
              <div className="text-sm font-extrabold text-blue-900">
                {user ? Number(user.fundIncome).toFixed(2) : "0.00"}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                Accumulated earnings
              </div>
            </div>
            <div>
              <div className="text-sm font-extrabold text-blue-900">
                {user ? Number(user.todayEarnings).toFixed(2) : "0.00"}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                Today&apos;s earnings
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row: Notice, Company Info, FAQ */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Link
            href="/notice"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-blue-100 shadow-sm hover:border-blue-300 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
              <FileText size={18} />
            </div>
            <span className="text-xs font-bold text-gray-700">Notice</span>
          </Link>

          <Link
            href="/company-info"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-blue-100 shadow-sm hover:border-blue-300 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
              <Info size={18} />
            </div>
            <span className="text-xs font-bold text-gray-700">Company Info</span>
          </Link>

          <Link
            href="/faq"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-blue-100 shadow-sm hover:border-blue-300 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-1">
              <HelpCircle size={18} />
            </div>
            <span className="text-xs font-bold text-gray-700">FAQ</span>
          </Link>
        </div>

        {/* Complete Now Action Pill */}
        <div className="mt-3">
          <Link
            href="/vip"
            className="block w-full py-2.5 rounded-full border-2 border-blue-400 bg-white text-center font-bold text-sm text-blue-800 shadow-sm hover:bg-blue-50 transition-all"
          >
            Complete Now
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
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500" />
              </Link>
            );
          })}
        </div>

        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-base shadow-[0_4px_16px_rgba(239,68,68,0.35)] hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
