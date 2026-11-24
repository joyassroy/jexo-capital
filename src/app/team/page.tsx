"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Headphones, CheckCircle2, AlertCircle, Gift, Sparkles } from "lucide-react";
import CityFooter from "@/components/common/CityFooter";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

interface TeamData {
  totalMembers: number;
  activeMembers: number;
  level1: { total: number; active: number };
  level2: { total: number; active: number };
  level3: { total: number; active: number };
  referralRewardsUSDT: number;
  referralRewardsBDT: number;
  cashbackRewardsUSDT: number;
  cashbackRewardsBDT: number;
  milestoneClaimed?: boolean;
  canClaimMilestone?: boolean;
}

export default function TeamPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted && theme === "light";

  const [team, setTeam] = useState<TeamData>({
    totalMembers: 0,
    activeMembers: 0,
    level1: { total: 0, active: 0 },
    level2: { total: 0, active: 0 },
    level3: { total: 0, active: 0 },
    referralRewardsUSDT: 0,
    referralRewardsBDT: 0,
    cashbackRewardsUSDT: 0,
    cashbackRewardsBDT: 0,
    milestoneClaimed: false,
    canClaimMilestone: false,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "info"; text: string } | null>(null);

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
        text: `No unclaimed ${type === "referral" ? "Referral" : "Cashback"} commission yet. Share your invite link to build your team!`,
      });
      setTimeout(() => setFeedback(null), 3800);
      return;
    }

    setFeedback({
      type: "success",
      text: `All ${amount.toFixed(2)} BDT commissions are auto-credited to your main balance!`,
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
          text: data.message || "Congratulations! 300 BDT milestone bonus credited to your balance.",
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
          ? "bg-gradient-to-b from-[#bfe4ff] via-[#d6efff] to-[#f0f8ff] text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      {/* Decorative High-Tech Grid & Dot Pattern */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "opacity-35 bg-[radial-gradient(#0066ff_1px,transparent_1px)] [background-size:18px_18px]"
            : "opacity-20 bg-[radial-gradient(#00d2ff_1.5px,transparent_1.5px)] [background-size:20px_20px]"
        }`}
      />

      <div>
        {/* Top Header Navigation Bar */}
        <div className="relative pt-4 pb-2 px-4 flex items-center justify-between z-20 max-w-[460px] mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center active:scale-95 transition-all text-white shadow-md ${
              isLight
                ? "bg-gradient-to-b from-[#0066ff] to-[#0044cc] border-white shadow-blue-500/25"
                : "bg-gradient-to-b from-[#092257] to-[#030e28] border-cyan-400/50 shadow-cyan-500/20"
            }`}
            aria-label="Go Back"
          >
            <ChevronLeft size={24} className="stroke-[3]" />
          </button>

          {/* Title: Stylized "My Team" with Golden Wings */}
          <div className="flex items-center justify-center gap-1.5 flex-1 mx-2">
            {/* Left Golden Wing */}
            <div className="flex items-center -space-x-1 drop-shadow-[0_2px_4px_rgba(245,186,49,0.4)]">
              <span className="w-5 h-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-l-full rotate-[-15deg]" />
              <span className="w-4 h-2 bg-gradient-to-r from-amber-300 to-amber-500 rounded-l-full rotate-[-5deg]" />
            </div>

            {/* Title Capsule */}
            <div
              className={`px-6 py-1.5 rounded-full border-2 shadow-lg flex items-center justify-center ${
                isLight
                  ? "bg-gradient-to-b from-[#004cd8] via-[#0066ff] to-[#003bb5] border-white shadow-[0_4px_16px_rgba(0,80,220,0.4)]"
                  : "bg-gradient-to-b from-[#08225e] via-[#0c3797] to-[#04153d] border-[#00d2ff]/80 shadow-[0_4px_20px_rgba(0,180,255,0.35)]"
              }`}
            >
              <h1 className="text-xl sm:text-2xl font-black text-white italic tracking-wider [text-shadow:_0_2px_10px_rgba(0,0,0,0.6)]">
                My Team
              </h1>
            </div>

            {/* Right Golden Wing */}
            <div className="flex items-center -space-x-1 scale-x-[-1] drop-shadow-[0_2px_4px_rgba(245,186,49,0.4)]">
              <span className="w-5 h-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-l-full rotate-[-15deg]" />
              <span className="w-4 h-2 bg-gradient-to-r from-amber-300 to-amber-500 rounded-l-full rotate-[-5deg]" />
            </div>
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
                  ? "bg-white/95 border-sky-300 shadow-[0_6px_20px_rgba(0,120,255,0.15)] text-slate-800"
                  : "bg-[#04102e]/90 border-cyan-400/40 shadow-[0_0_20px_rgba(0,150,255,0.2)] text-white"
              }`}
            >
              <span
                className={`text-xs font-black tracking-tight uppercase ${
                  isLight ? "text-[#003399]" : "text-cyan-300"
                }`}
              >
                Referral Rewards
              </span>
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight my-1.5 ${
                  isLight ? "text-[#002b80]" : "text-[#ffd369]"
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
                className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-[#9c27b0] via-[#ba68c8] to-[#ab47bc] text-white font-black text-xs shadow-[0_3px_12px_rgba(156,39,176,0.45)] active:scale-95 hover:brightness-105 transition-all border border-white/60 tracking-wide"
              >
                Claim
              </button>
            </div>

            {/* Cashback Rewards Card */}
            <div
              className={`p-4 rounded-3xl border-2 text-center flex flex-col justify-between items-center transition-all ${
                isLight
                  ? "bg-white/95 border-sky-300 shadow-[0_6px_20px_rgba(0,120,255,0.15)] text-slate-800"
                  : "bg-[#04102e]/90 border-cyan-400/40 shadow-[0_0_20px_rgba(0,150,255,0.2)] text-white"
              }`}
            >
              <span
                className={`text-xs font-black tracking-tight uppercase ${
                  isLight ? "text-[#003399]" : "text-cyan-300"
                }`}
              >
                Cashback Rewards
              </span>
              <div
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight my-1.5 ${
                  isLight ? "text-[#002b80]" : "text-[#ffd369]"
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
                className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-[#9c27b0] via-[#ba68c8] to-[#ab47bc] text-white font-black text-xs shadow-[0_3px_12px_rgba(156,39,176,0.45)] active:scale-95 hover:brightness-105 transition-all border border-white/60 tracking-wide"
              >
                Claim
              </button>
            </div>
          </div>

          {/* Middle: Team Members Futuristic Card */}
          <div
            className={`p-4 sm:p-5 rounded-[32px] border-2 shadow-xl backdrop-blur-md space-y-3 transition-all ${
              isLight
                ? "bg-gradient-to-b from-[#ffffff]/95 via-[#f0f9ff]/95 to-[#e0f2fe]/95 border-white shadow-[0_10px_30px_rgba(0,80,220,0.2)]"
                : "bg-gradient-to-b from-[#04102e]/95 via-[#061845]/95 to-[#020b24]/95 border-cyan-400/40 shadow-[0_0_25px_rgba(0,180,255,0.25)]"
            }`}
          >
            {/* Header Pill */}
            <div
              className={`py-2 px-8 mx-auto rounded-full font-black text-sm tracking-wider text-center border shadow-md flex items-center justify-center gap-2 ${
                isLight
                  ? "bg-gradient-to-r from-[#004cd8] via-[#0080ff] to-[#004cd8] border-cyan-200 text-white shadow-blue-500/30"
                  : "bg-gradient-to-r from-[#062669] via-[#0c4ca8] to-[#062669] border-cyan-400 text-cyan-200 shadow-cyan-500/30"
              }`}
            >
              <Sparkles size={16} className="text-amber-300 shrink-0" />
              <span>Team Members</span>
              <Sparkles size={16} className="text-amber-300 shrink-0" />
            </div>

            {/* 5 Row Metrics */}
            <div className="space-y-2.5 pt-1">
              {/* Row 1: Total Members */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#004cd8] via-[#0066ee] to-[#0088ff] border-cyan-300/40 text-white shadow-blue-600/10"
                    : "bg-gradient-to-r from-[#072563] via-[#0b3a91] to-[#0e48af] border-cyan-400/40 text-white shadow-black/40"
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Total Members
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black text-yellow-300 font-black font-mono text-sm sm:text-base border border-yellow-400/50 shadow-inner">
                  {loading ? "..." : team.totalMembers}
                </span>
              </div>

              {/* Row 2: Active Members */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#004cd8] via-[#0066ee] to-[#0088ff] border-cyan-300/40 text-white shadow-blue-600/10"
                    : "bg-gradient-to-r from-[#072563] via-[#0b3a91] to-[#0e48af] border-cyan-400/40 text-white shadow-black/40"
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Active Members
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black text-yellow-300 font-black font-mono text-sm sm:text-base border border-yellow-400/50 shadow-inner">
                  {loading ? "..." : team.activeMembers}
                </span>
              </div>

              {/* Row 3: Level -1 */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#004cd8] via-[#0066ee] to-[#0088ff] border-cyan-300/40 text-white shadow-blue-600/10"
                    : "bg-gradient-to-r from-[#072563] via-[#0b3a91] to-[#0e48af] border-cyan-400/40 text-white shadow-black/40"
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Level -1
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black text-yellow-300 font-black font-mono text-sm sm:text-base border border-yellow-400/50 shadow-inner">
                  {loading ? "..." : `${team.level1.total}/${team.level1.active}`}
                </span>
              </div>

              {/* Row 4: Level -2 */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#004cd8] via-[#0066ee] to-[#0088ff] border-cyan-300/40 text-white shadow-blue-600/10"
                    : "bg-gradient-to-r from-[#072563] via-[#0b3a91] to-[#0e48af] border-cyan-400/40 text-white shadow-black/40"
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Level -2
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black text-yellow-300 font-black font-mono text-sm sm:text-base border border-yellow-400/50 shadow-inner">
                  {loading ? "..." : `${team.level2.total}/${team.level2.active}`}
                </span>
              </div>

              {/* Row 5: Level -3 */}
              <div
                className={`p-2.5 px-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
                  isLight
                    ? "bg-gradient-to-r from-[#004cd8] via-[#0066ee] to-[#0088ff] border-cyan-300/40 text-white shadow-blue-600/10"
                    : "bg-gradient-to-r from-[#072563] via-[#0b3a91] to-[#0e48af] border-cyan-400/40 text-white shadow-black/40"
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Level -3
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black text-yellow-300 font-black font-mono text-sm sm:text-base border border-yellow-400/50 shadow-inner">
                  {loading ? "..." : `${team.level3.total}/${team.level3.active}`}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Rules & Guidelines Card */}
          <div
            className={`p-5 rounded-[28px] border-2 shadow-xl text-xs space-y-3 transition-all ${
              isLight
                ? "bg-white/95 border-white shadow-[0_6px_22px_rgba(0,80,200,0.16)] text-slate-800"
                : "bg-[#04102e]/90 border-cyan-400/30 shadow-[0_0_20px_rgba(0,150,255,0.2)] text-slate-200"
            }`}
          >
            {/* Rule 1 */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-slate-200/60 dark:border-white/10">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                1
              </span>
              <p className="font-bold leading-snug">
                <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
                  10%
                </strong>{" "}
                bonus on Level 1 fast deposits.
              </p>
            </div>

            {/* Rule 2 (with 300 BDT milestone claim button) */}
            <div className="flex flex-col gap-2 pb-2.5 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  2
                </span>
                <p className="font-bold leading-snug">
                  If you refer{" "}
                  <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
                    10
                  </strong>{" "}
                  members, you will receive a bonus of{" "}
                  <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
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
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all animate-pulse"
                  >
                    <Gift size={14} />
                    <span>{claiming ? "Claiming..." : "Claim 300 BDT Milestone Bonus Now! 🎁"}</span>
                  </button>
                </div>
              )}
              {team.milestoneClaimed && (
                <div className="pl-9 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>300 BDT Milestone Bonus Claimed!</span>
                </div>
              )}
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-3 pb-2.5 border-b border-slate-200/60 dark:border-white/10">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                3
              </span>
              <p className="font-bold leading-snug">
                From daily earnings, Level 1 members will receive a{" "}
                <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
                  10%
                </strong>{" "}
                bonus, Level 2 members{" "}
                <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
                  5%
                </strong>
                , and Level 3 members{" "}
                <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
                  3%
                </strong>
                .
              </p>
            </div>

            {/* Rule 4 */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                4
              </span>
              <p className="font-bold leading-snug">
                Click the{" "}
                <strong className={isLight ? "text-rose-600 font-extrabold" : "text-rose-400 font-extrabold"}>
                  &apos;Claim&apos;
                </strong>{" "}
                option to collect the bonus.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Customer Service Button in Bottom Right */}
      <div className="fixed bottom-24 right-4 z-30">
        <Link
          href="/support"
          className="w-14 h-14 rounded-full bg-white border-2 border-blue-400 shadow-[0_4px_16px_rgba(0,100,255,0.4)] flex flex-col items-center justify-center p-1 active:scale-95 hover:scale-105 transition-all text-[#0066ff]"
          title="Customer Service"
        >
          <div className="w-7 h-7 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-xs">
            <Headphones size={16} />
          </div>
          <span className="text-[7.5px] font-black uppercase text-blue-900 leading-none mt-0.5">
            Customer
          </span>
          <span className="text-[7px] font-bold uppercase text-blue-700 leading-none">
            Service
          </span>
        </Link>
      </div>

      <CityFooter />
    </div>
  );
}
