"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Gift,
  Sparkles,
  Users,
  UserCheck,
  Award,
} from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

interface TeamMember {
  id: string;
  phone: string;
  nickname: string;
  referralCode?: string;
  hasDeposited: boolean;
  isActive: boolean;
  depositAmount: number;
  balance: number;
  joinedAt: string;
}

interface TeamData {
  totalMembers: number;
  activeMembers: number;
  level1: { total: number; active: number; members?: TeamMember[] };
  level2: { total: number; active: number; members?: TeamMember[] };
  level3: { total: number; active: number; members?: TeamMember[] };
  referralRewardsUSDT: number;
  referralRewardsBDT: number;
  cashbackRewardsUSDT: number;
  cashbackRewardsBDT: number;
  milestoneClaimed?: boolean;
  canClaimMilestone?: boolean;
}

/**
 * High-definition Metallic Golden Wing SVG component.
 * Provides luxury 3D wings on both sides of the "My Team" title badge.
 */
function GoldenWing({ flip = false }: { flip?: boolean }) {
  const idPrefix = flip ? "right" : "left";
  return (
    <svg
      width="34"
      height="22"
      viewBox="0 0 40 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_6px_rgba(245,186,49,0.55)] ${
        flip ? "scale-x-[-1]" : ""
      }`}
    >
      <defs>
        <linearGradient
          id={`${idPrefix}GoldGrad1`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fff3a8" />
          <stop offset="45%" stopColor="#f5ba31" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient
          id={`${idPrefix}GoldGrad2`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffd369" />
          <stop offset="50%" stopColor="#f5ba31" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Top Main Feather */}
      <path
        d="M38 4C26 3 14 8 2 20C8 16 16 12 28 10C34 9 38 6 38 4Z"
        fill={`url(#${idPrefix}GoldGrad1)`}
        stroke="#fef08a"
        strokeWidth="0.8"
      />
      {/* Middle Feather */}
      <path
        d="M36 10C26 9 16 13 6 23C11 19 19 16 28 15C33 14 36 12 36 10Z"
        fill={`url(#${idPrefix}GoldGrad2)`}
        stroke="#fef08a"
        strokeWidth="0.6"
      />
      {/* Bottom Feather */}
      <path
        d="M32 16C24 15 17 18 10 25C14 22 20 20 26 19C29 18 32 17 32 16Z"
        fill={`url(#${idPrefix}GoldGrad1)`}
      />
    </svg>
  );
}

export default function TeamPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted && theme === "light";

  const [team, setTeam] = useState<TeamData>({
    totalMembers: 0,
    activeMembers: 0,
    level1: { total: 0, active: 0, members: [] },
    level2: { total: 0, active: 0, members: [] },
    level3: { total: 0, active: 0, members: [] },
    referralRewardsUSDT: 0,
    referralRewardsBDT: 0,
    cashbackRewardsUSDT: 0,
    cashbackRewardsBDT: 0,
    milestoneClaimed: false,
    canClaimMilestone: false,
  });

  const [expandedLevels, setExpandedLevels] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
  });

  const toggleLevel = (lvl: number) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [lvl]: !prev[lvl],
    }));
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "info";
    text: string;
  } | null>(null);

  const fetchTeamData = () => {
    fetch("/api/user/team")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.team) {
          setTeam(data.team);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    setMounted(true);
    fetchTeamData();
  }, [router]);

  const handleClaim = (type: "referral" | "cashback") => {
    const amount =
      type === "referral" ? team.referralRewardsBDT : team.cashbackRewardsBDT;

    if (amount <= 0) {
      setFeedback({
        type: "info",
        text: `No unclaimed ${
          type === "referral" ? "Referral" : "Cashback"
        } commission yet. Share your invite link to build your team!`,
      });
      setTimeout(() => setFeedback(null), 3800);
      return;
    }

    setFeedback({
      type: "success",
      text: `All ${amount.toFixed(
        2
      )} BDT commissions are auto-credited to your main balance!`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleClaimMilestone = async () => {
    setClaiming(true);
    try {
      const res = await fetch("/api/user/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim_milestone" }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          text:
            data.message ||
            "Congratulations! 300 BDT milestone bonus credited to your balance.",
        });
        fetchTeamData();
      } else {
        setFeedback({
          type: "info",
          text: data.error || "Unable to claim milestone bonus.",
        });
      }
    } catch {
      setFeedback({
        type: "info",
        text: "Network error while claiming milestone bonus.",
      });
    } finally {
      setClaiming(false);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 relative overflow-x-hidden transition-colors duration-300 ${
        isLight
          ? "bg-gradient-to-b from-[#f4f7fc] via-[#ffffff] to-[#eef3fb] text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        {/* Top Header Navigation Bar */}
        <div className="relative pt-4 pb-2 px-4 flex items-center justify-between z-20 max-w-[460px] mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className={`w-10 h-10 rounded-full border flex items-center justify-center active:scale-95 transition-all shadow-sm ${
              isLight
                ? "bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-slate-200"
                : "bg-[#051338] border-amber-400/40 text-amber-300 hover:text-white shadow-black/40"
            }`}
            aria-label="Go Back"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          {/* Title: Stylized "My Team" with 3D Golden Wings */}
          <div className="flex items-center justify-center gap-1.5 flex-1 mx-2">
            <GoldenWing />

            {/* Title Capsule (Royal Midnight Navy with Golden Border & Golden Text) */}
            <div
              className={`px-6 py-1.5 rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${
                isLight
                  ? "bg-gradient-to-r from-[#020a1f] via-[#0b2559] to-[#020a1f] border-amber-400 shadow-[0_4px_16px_rgba(2,10,31,0.25)]"
                  : "bg-gradient-to-r from-[#020a1f] via-[#081d48] to-[#020a1f] border-amber-400 shadow-[0_0_20px_rgba(245,186,49,0.3)]"
              }`}
            >
              <h1 className="text-lg sm:text-xl font-black text-amber-300 italic tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                My Team
              </h1>
            </div>

            <GoldenWing flip />
          </div>

          {/* Theme Toggle in Header */}
          <div className="w-10 h-10 flex items-center justify-end">
            <ThemeToggle compact />
          </div>
        </div>

        {/* Live Feedback Toast Alert */}
        {feedback && (
          <div className="mx-4 mt-2 max-w-[420px] mx-auto z-30">
            <div
              className={`p-3.5 rounded-2xl border-2 text-xs font-bold text-center shadow-xl flex items-center justify-center gap-2 transition-all animate-in fade-in zoom-in-95 duration-200 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-emerald-500/10"
                  : "bg-blue-50 border-blue-400 text-blue-900 shadow-blue-500/10"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-blue-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          </div>
        )}

        {/* Main Team Card Body */}
        <div className="p-4 space-y-4 max-w-[430px] mx-auto z-10 relative">
          {/* Top 2 Reward Cards: Referral Rewards & Cashback Rewards */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Referral Rewards Card */}
            <div
              className={`p-4 rounded-3xl border-2 text-center flex flex-col justify-between items-center transition-all ${
                isLight
                  ? "bg-white border-amber-200/80 shadow-[0_6px_22px_rgba(2,10,31,0.06)] hover:border-amber-300"
                  : "bg-[#04102e]/95 border-amber-400/30 shadow-[0_0_20px_rgba(245,186,49,0.12)] hover:border-amber-400/50"
              }`}
            >
              <span
                className={`text-[11px] font-black tracking-wider uppercase ${
                  isLight ? "text-slate-600" : "text-amber-200/90"
                }`}
              >
                Referral Rewards
              </span>
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight my-2 ${
                  isLight ? "text-[#020a1f]" : "text-[#ffd369]"
                }`}
              >
                {loading
                  ? "..."
                  : team.referralRewardsBDT > 0
                  ? team.referralRewardsBDT.toFixed(0)
                  : "0"}
              </div>
              <button
                type="button"
                onClick={() => handleClaim("referral")}
                className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-xs shadow-[0_3px_12px_rgba(245,186,49,0.35)] active:scale-95 hover:brightness-105 transition-all border border-amber-200/80 tracking-wide uppercase"
              >
                Claim
              </button>
            </div>

            {/* Cashback Rewards Card */}
            <div
              className={`p-4 rounded-3xl border-2 text-center flex flex-col justify-between items-center transition-all ${
                isLight
                  ? "bg-white border-amber-200/80 shadow-[0_6px_22px_rgba(2,10,31,0.06)] hover:border-amber-300"
                  : "bg-[#04102e]/95 border-amber-400/30 shadow-[0_0_20px_rgba(245,186,49,0.12)] hover:border-amber-400/50"
              }`}
            >
              <span
                className={`text-[11px] font-black tracking-wider uppercase ${
                  isLight ? "text-slate-600" : "text-amber-200/90"
                }`}
              >
                Cashback Rewards
              </span>
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight my-2 ${
                  isLight ? "text-[#020a1f]" : "text-[#ffd369]"
                }`}
              >
                {loading
                  ? "..."
                  : team.cashbackRewardsBDT > 0
                  ? team.cashbackRewardsBDT.toFixed(0)
                  : "0"}
              </div>
              <button
                type="button"
                onClick={() => handleClaim("cashback")}
                className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-xs shadow-[0_3px_12px_rgba(245,186,49,0.35)] active:scale-95 hover:brightness-105 transition-all border border-amber-200/80 tracking-wide uppercase"
              >
                Claim
              </button>
            </div>
          </div>

          {/* Middle: Team Members Futuristic Card */}
          <div
            className={`p-4 sm:p-5 rounded-[30px] border-2 shadow-xl backdrop-blur-md space-y-3.5 transition-all ${
              isLight
                ? "bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(2,10,31,0.08)]"
                : "bg-gradient-to-b from-[#04102e]/95 via-[#061845]/95 to-[#020b24]/95 border-amber-400/30 shadow-[0_0_25px_rgba(245,186,49,0.18)]"
            }`}
          >
            {/* Header Pill */}
            <div
              className={`py-2 px-8 mx-auto rounded-full font-black text-xs sm:text-sm tracking-wider text-center border shadow-md flex items-center justify-center gap-2 w-fit ${
                isLight
                  ? "bg-gradient-to-r from-[#020a1f] via-[#0b2559] to-[#020a1f] border-amber-400/60 text-amber-300 shadow-[0_4px_14px_rgba(2,10,31,0.2)]"
                  : "bg-gradient-to-r from-[#020a1f] via-[#091e4a] to-[#020a1f] border-amber-400/60 text-amber-300 shadow-[0_0_15px_rgba(245,186,49,0.25)]"
              }`}
            >
              <Sparkles size={15} className="text-amber-400 shrink-0" />
              <span className="uppercase tracking-widest">Team Members</span>
              <Sparkles size={15} className="text-amber-400 shrink-0" />
            </div>

            {/* 5 Row Metrics */}
            <div className="space-y-2.5 pt-1">
              {/* Row 1: Total Members */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-xs transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] border-slate-200/90 hover:border-amber-300/80 hover:bg-white text-slate-800"
                    : "bg-gradient-to-r from-[#07193f] via-[#0a2358] to-[#07193f] border-amber-400/20 text-white hover:border-amber-400/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center ${
                      isLight
                        ? "bg-blue-100 text-blue-700"
                        : "bg-blue-900/50 text-blue-300"
                    }`}
                  >
                    <Users size={16} />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                    Total Members
                  </span>
                </div>
                <span className="px-5 py-1 rounded-full bg-[#020a1f] text-amber-300 font-black font-mono text-sm sm:text-base border-2 border-amber-400/70 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                  {loading ? "..." : team.totalMembers}
                </span>
              </div>

              {/* Row 2: Active Members */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-xs transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] border-slate-200/90 hover:border-amber-300/80 hover:bg-white text-slate-800"
                    : "bg-gradient-to-r from-[#07193f] via-[#0a2358] to-[#07193f] border-amber-400/20 text-white hover:border-amber-400/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center ${
                      isLight
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-emerald-950/60 text-emerald-400"
                    }`}
                  >
                    <UserCheck size={16} />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                    Active Members
                  </span>
                </div>
                <span className="px-5 py-1 rounded-full bg-[#020a1f] text-amber-300 font-black font-mono text-sm sm:text-base border-2 border-amber-400/70 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                  {loading ? "..." : team.activeMembers}
                </span>
              </div>

              {/* Row 3: Level -1 (Interactive Accordion) */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleLevel(1)}
                  className={`w-full p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-xs transition-all text-left cursor-pointer active:scale-[0.99] ${
                    isLight
                      ? "bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] border-slate-200/90 hover:border-amber-300/80 hover:bg-white text-slate-800"
                      : "bg-gradient-to-r from-[#07193f] via-[#0a2358] to-[#07193f] border-amber-400/20 text-white hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        isLight
                          ? "bg-amber-100 text-amber-800"
                          : "bg-amber-900/40 text-amber-300"
                      }`}
                    >
                      L1
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                      Level -1
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-5 py-1 rounded-full bg-[#020a1f] text-amber-300 font-black font-mono text-sm sm:text-base border-2 border-amber-400/70 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                      {loading
                        ? "..."
                        : `${team.level1.total}/${team.level1.active}`}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-amber-500 transition-transform duration-200 shrink-0 ${
                        expandedLevels[1] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Level 1 Members List Dropdown */}
                {expandedLevels[1] && (
                  <div className="space-y-2 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {team.level1.members && team.level1.members.length > 0 ? (
                      team.level1.members.map((member) => (
                        <div
                          key={member.id}
                          className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isLight
                              ? "bg-slate-50 border-slate-200/90 hover:bg-white shadow-2xs"
                              : "bg-[#040e2b] border-amber-400/20 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                member.hasDeposited || member.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400/40"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                              }`}
                            >
                              {member.nickname.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                                  {member.nickname}
                                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 ml-0.5">
                                    (ID:{member.referralCode || member.id.slice(-6)})
                                  </span>
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{member.joinedAt ? `Joined: ${member.joinedAt}` : ""}</span>
                                {member.phone && member.phone !== "User" && (
                                  <span className="text-slate-400 font-mono">• {member.phone}</span>
                                )}
                                {member.depositAmount > 0 && (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    • Dep: {member.depositAmount} USDT
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {member.hasDeposited || member.isActive ? (
                              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-2xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 px-3 text-center rounded-2xl bg-slate-50/70 dark:bg-[#040e2b]/70 border border-dashed border-slate-200 dark:border-white/10">
                        <Users size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          No members in Level 1 yet
                        </p>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Share your invite link to build your team!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 4: Level -2 (Interactive Accordion) */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleLevel(2)}
                  className={`w-full p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-xs transition-all text-left cursor-pointer active:scale-[0.99] ${
                    isLight
                      ? "bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] border-slate-200/90 hover:border-amber-300/80 hover:bg-white text-slate-800"
                      : "bg-gradient-to-r from-[#07193f] via-[#0a2358] to-[#07193f] border-amber-400/20 text-white hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        isLight
                          ? "bg-slate-200 text-slate-700"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      L2
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                      Level -2
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-5 py-1 rounded-full bg-[#020a1f] text-amber-300 font-black font-mono text-sm sm:text-base border-2 border-amber-400/70 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                      {loading
                        ? "..."
                        : `${team.level2.total}/${team.level2.active}`}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-amber-500 transition-transform duration-200 shrink-0 ${
                        expandedLevels[2] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Level 2 Members List Dropdown */}
                {expandedLevels[2] && (
                  <div className="space-y-2 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {team.level2.members && team.level2.members.length > 0 ? (
                      team.level2.members.map((member) => (
                        <div
                          key={member.id}
                          className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isLight
                              ? "bg-slate-50 border-slate-200/90 hover:bg-white shadow-2xs"
                              : "bg-[#040e2b] border-amber-400/20 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                member.hasDeposited || member.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400/40"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                              }`}
                            >
                              {member.nickname.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                                  {member.nickname}
                                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 ml-0.5">
                                    (ID:{member.referralCode || member.id.slice(-6)})
                                  </span>
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{member.joinedAt ? `Joined: ${member.joinedAt}` : ""}</span>
                                {member.phone && member.phone !== "User" && (
                                  <span className="text-slate-400 font-mono">• {member.phone}</span>
                                )}
                                {member.depositAmount > 0 && (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    • Dep: {member.depositAmount} USDT
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {member.hasDeposited || member.isActive ? (
                              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-2xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 px-3 text-center rounded-2xl bg-slate-50/70 dark:bg-[#040e2b]/70 border border-dashed border-slate-200 dark:border-white/10">
                        <Users size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          No members in Level 2 yet
                        </p>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Members referred by your Level 1 will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 5: Level -3 (Interactive Accordion) */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleLevel(3)}
                  className={`w-full p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-xs transition-all text-left cursor-pointer active:scale-[0.99] ${
                    isLight
                      ? "bg-gradient-to-r from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] border-slate-200/90 hover:border-amber-300/80 hover:bg-white text-slate-800"
                      : "bg-gradient-to-r from-[#07193f] via-[#0a2358] to-[#07193f] border-amber-400/20 text-white hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        isLight
                          ? "bg-amber-100 text-amber-900"
                          : "bg-amber-950/40 text-amber-400"
                      }`}
                    >
                      L3
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                      Level -3
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-5 py-1 rounded-full bg-[#020a1f] text-amber-300 font-black font-mono text-sm sm:text-base border-2 border-amber-400/70 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                      {loading
                        ? "..."
                        : `${team.level3.total}/${team.level3.active}`}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-amber-500 transition-transform duration-200 shrink-0 ${
                        expandedLevels[3] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Level 3 Members List Dropdown */}
                {expandedLevels[3] && (
                  <div className="space-y-2 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {team.level3.members && team.level3.members.length > 0 ? (
                      team.level3.members.map((member) => (
                        <div
                          key={member.id}
                          className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isLight
                              ? "bg-slate-50 border-slate-200/90 hover:bg-white shadow-2xs"
                              : "bg-[#040e2b] border-amber-400/20 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                member.hasDeposited || member.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-400/40"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                              }`}
                            >
                              {member.nickname.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                                  {member.nickname}
                                  <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 ml-0.5">
                                    (ID:{member.referralCode || member.id.slice(-6)})
                                  </span>
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{member.joinedAt ? `Joined: ${member.joinedAt}` : ""}</span>
                                {member.phone && member.phone !== "User" && (
                                  <span className="text-slate-400 font-mono">• {member.phone}</span>
                                )}
                                {member.depositAmount > 0 && (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    • Dep: {member.depositAmount} USDT
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {member.hasDeposited || member.isActive ? (
                              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-2xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 px-3 text-center rounded-2xl bg-slate-50/70 dark:bg-[#040e2b]/70 border border-dashed border-slate-200 dark:border-white/10">
                        <Users size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          No members in Level 3 yet
                        </p>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Members referred by your Level 2 will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Rules & Guidelines Card */}
          <div
            className={`p-5 rounded-[28px] border-2 shadow-xl text-xs space-y-3 transition-all ${
              isLight
                ? "bg-white border-slate-200/90 shadow-[0_6px_22px_rgba(2,10,31,0.06)] text-slate-700"
                : "bg-[#04102e]/95 border-amber-400/30 shadow-[0_0_20px_rgba(245,186,49,0.15)] text-slate-200"
            }`}
          >
            {/* Rule 1 */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-slate-200/70 dark:border-white/10">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#020a1f] to-[#0a1f4d] border border-amber-400/60 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                1
              </span>
              <p className="font-bold leading-snug">
                <strong
                  className={
                    isLight
                      ? "text-amber-600 font-black"
                      : "text-amber-400 font-black"
                  }
                >
                  10%
                </strong>{" "}
                bonus on Level 1 fast deposits.
              </p>
            </div>

            {/* Rule 2 (with 300 BDT milestone claim button) */}
            <div className="flex flex-col gap-2 pb-2.5 border-b border-slate-200/70 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#020a1f] to-[#0a1f4d] border border-amber-400/60 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  2
                </span>
                <p className="font-bold leading-snug">
                  If you refer{" "}
                  <strong
                    className={
                      isLight
                        ? "text-amber-600 font-black"
                        : "text-amber-400 font-black"
                    }
                  >
                    10
                  </strong>{" "}
                  members, you will receive a bonus of{" "}
                  <strong
                    className={
                      isLight
                        ? "text-amber-600 font-black"
                        : "text-amber-400 font-black"
                    }
                  >
                    300 BDT
                  </strong>
                  .
                </p>
              </div>

              {/* Milestone Claim Button if qualified */}
              {team.canClaimMilestone && (
                <div className="pl-9">
                  <button
                    type="button"
                    onClick={handleClaimMilestone}
                    disabled={claiming}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all animate-pulse"
                  >
                    <Gift size={14} className="text-[#020a1f]" />
                    <span>
                      {claiming
                        ? "Claiming..."
                        : "Claim 300 BDT Milestone Bonus Now! 🎁"}
                    </span>
                  </button>
                </div>
              )}
              {team.milestoneClaimed && (
                <div className="pl-9 text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>300 BDT Milestone Bonus Claimed!</span>
                </div>
              )}
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-3 pb-2.5 border-b border-slate-200/70 dark:border-white/10">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#020a1f] to-[#0a1f4d] border border-amber-400/60 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                3
              </span>
              <p className="font-bold leading-snug">
                From daily earnings, Level 1 members will receive a{" "}
                <strong
                  className={
                    isLight
                      ? "text-amber-600 font-black"
                      : "text-amber-400 font-black"
                  }
                >
                  10%
                </strong>{" "}
                bonus, Level 2 members{" "}
                <strong
                  className={
                    isLight
                      ? "text-amber-600 font-black"
                      : "text-amber-400 font-black"
                  }
                >
                  5%
                </strong>
                , and Level 3 members{" "}
                <strong
                  className={
                    isLight
                      ? "text-amber-600 font-black"
                      : "text-amber-400 font-black"
                  }
                >
                  3%
                </strong>
                .
              </p>
            </div>

            {/* Rule 4 */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#020a1f] to-[#0a1f4d] border border-amber-400/60 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                4
              </span>
              <p className="font-bold leading-snug">
                Click the{" "}
                <strong
                  className={
                    isLight
                      ? "text-amber-600 font-black"
                      : "text-amber-400 font-black"
                  }
                >
                  &apos;Claim&apos;
                </strong>{" "}
                option to collect the bonus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
