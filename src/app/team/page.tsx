"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Headphones, CheckCircle2 } from "lucide-react";
import CityFooter from "@/components/common/CityFooter";

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
}

export default function TeamPage() {
  const router = useRouter();

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
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [claimFeedback, setClaimFeedback] = useState<string>("");

  useEffect(() => {
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
  }, [router]);

  const handleClaim = (type: "referral" | "cashback") => {
    const amount =
      type === "referral" ? team.referralRewardsBDT : team.cashbackRewardsBDT;

    if (amount <= 0) {
      setClaimFeedback("No claimable rewards at the moment. Invite friends to start earning!");
      setTimeout(() => setClaimFeedback(""), 3500);
      return;
    }

    setClaimFeedback(
      `Congratulations! You have claimed ${amount.toFixed(2)} BDT ${
        type === "referral" ? "Referral" : "Cashback"
      } reward.`
    );
    setTimeout(() => setClaimFeedback(""), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a8cff] via-[#40b0ff] to-[#99d6ff] text-slate-800 flex flex-col justify-between pb-24 relative overflow-x-hidden">
      {/* Background Decorative Tech Dots & Wave Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

      <div>
        {/* Top Header Bar */}
        <div className="relative pt-4 pb-2 px-4 flex items-center justify-between z-20">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-[#0066ff] to-[#0044cc] border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 transition-all text-white"
            aria-label="Go Back"
          >
            <ChevronLeft size={24} className="stroke-[3]" />
          </button>

          {/* Title: Stylized "My Team" with Golden Wings */}
          <div className="flex items-center justify-center gap-1.5 flex-1 pr-10">
            {/* Left Golden Wing */}
            <div className="flex items-center -space-x-1">
              <span className="w-5 h-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-l-full rotate-[-15deg] shadow-sm" />
              <span className="w-4 h-2 bg-gradient-to-r from-amber-300 to-amber-500 rounded-l-full rotate-[-5deg] shadow-sm" />
            </div>

            <div className="px-5 py-1 rounded-2xl bg-gradient-to-b from-[#0044cc] via-[#0066ff] to-[#0033aa] border-2 border-white/90 shadow-[0_4px_12px_rgba(0,50,150,0.5)]">
              <h1 className="text-xl sm:text-2xl font-black text-white italic tracking-wider [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]">
                My Team
              </h1>
            </div>

            {/* Right Golden Wing */}
            <div className="flex items-center -space-x-1 scale-x-[-1]">
              <span className="w-5 h-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-l-full rotate-[-15deg] shadow-sm" />
              <span className="w-4 h-2 bg-gradient-to-r from-amber-300 to-amber-500 rounded-l-full rotate-[-5deg] shadow-sm" />
            </div>
          </div>
        </div>

        {/* Claim Feedback Banner */}
        {claimFeedback && (
          <div className="mx-4 mt-2 p-3 bg-white/95 border-2 border-blue-400 text-blue-900 text-xs font-bold rounded-2xl text-center shadow-lg flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>{claimFeedback}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 space-y-4 max-w-[420px] mx-auto z-10 relative">
          {/* Top 2 Reward Cards (Referral Rewards & Cashback Rewards) */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Referral Rewards Card */}
            <div className="p-4 rounded-3xl bg-white/95 border-2 border-cyan-300 shadow-[0_4px_16px_rgba(0,100,220,0.2)] text-center flex flex-col justify-between items-center space-y-2">
              <span className="text-xs sm:text-[13px] font-black text-[#003399] tracking-tight">
                Referral Rewards
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#002b80] font-mono tracking-tight my-1">
                {loading ? "..." : team.referralRewardsBDT > 0 ? team.referralRewardsBDT.toFixed(0) : "0"}
              </div>
              <button
                type="button"
                onClick={() => handleClaim("referral")}
                className="w-full py-1.5 px-4 rounded-full bg-gradient-to-r from-[#9c27b0] via-[#ba68c8] to-[#ab47bc] text-white font-extrabold text-xs shadow-[0_3px_10px_rgba(156,39,176,0.4)] active:scale-95 hover:brightness-105 transition-all border border-white/50"
              >
                Claim
              </button>
            </div>

            {/* Cashback Rewards Card */}
            <div className="p-4 rounded-3xl bg-white/95 border-2 border-cyan-300 shadow-[0_4px_16px_rgba(0,100,220,0.2)] text-center flex flex-col justify-between items-center space-y-2">
              <span className="text-xs sm:text-[13px] font-black text-[#003399] tracking-tight">
                Cashback Rewards
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#002b80] font-mono tracking-tight my-1">
                {loading ? "..." : team.cashbackRewardsBDT > 0 ? team.cashbackRewardsBDT.toFixed(0) : "0"}
              </div>
              <button
                type="button"
                onClick={() => handleClaim("cashback")}
                className="w-full py-1.5 px-4 rounded-full bg-gradient-to-r from-[#9c27b0] via-[#ba68c8] to-[#ab47bc] text-white font-extrabold text-xs shadow-[0_3px_10px_rgba(156,39,176,0.4)] active:scale-95 hover:brightness-105 transition-all border border-white/50"
              >
                Claim
              </button>
            </div>
          </div>

          {/* Middle: Team Members Card */}
          <div className="p-4 rounded-[32px] bg-gradient-to-b from-[#ffffff]/90 via-[#e6f4ff]/90 to-[#ccebff]/90 border-2 border-white shadow-[0_8px_24px_rgba(0,80,200,0.25)] backdrop-blur-sm space-y-2.5">
            {/* Header Pill */}
            <div className="py-2 px-6 mx-auto rounded-full bg-gradient-to-r from-[#0044cc] via-[#0088ff] to-[#0044cc] border border-cyan-200 text-white font-black text-sm tracking-wide text-center shadow-[0_2px_8px_rgba(0,80,200,0.35)]">
              Team Members
            </div>

            {/* 5 Row Metrics */}
            <div className="space-y-2 pt-1">
              {/* Row 1: Total Members */}
              <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0044cc] via-[#0066ee] to-[#0088ff] border border-cyan-300/40 text-white flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Total Members
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black/90 text-yellow-300 font-black font-mono text-sm border border-yellow-400/40 shadow-inner">
                  {loading ? "..." : team.totalMembers}
                </span>
              </div>

              {/* Row 2: Active Members */}
              <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0044cc] via-[#0066ee] to-[#0088ff] border border-cyan-300/40 text-white flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Active Members
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black/90 text-yellow-300 font-black font-mono text-sm border border-yellow-400/40 shadow-inner">
                  {loading ? "..." : team.activeMembers}
                </span>
              </div>

              {/* Row 3: Level -1 */}
              <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0044cc] via-[#0066ee] to-[#0088ff] border border-cyan-300/40 text-white flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Level -1
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black/90 text-yellow-300 font-black font-mono text-sm border border-yellow-400/40 shadow-inner">
                  {loading ? "..." : `${team.level1.total}/${team.level1.active}`}
                </span>
              </div>

              {/* Row 4: Level -2 */}
              <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0044cc] via-[#0066ee] to-[#0088ff] border border-cyan-300/40 text-white flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Level -2
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black/90 text-yellow-300 font-black font-mono text-sm border border-yellow-400/40 shadow-inner">
                  {loading ? "..." : `${team.level2.total}/${team.level2.active}`}
                </span>
              </div>

              {/* Row 5: Level -3 */}
              <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#0044cc] via-[#0066ee] to-[#0088ff] border border-cyan-300/40 text-white flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  Level -3
                </span>
                <span className="px-5 py-0.5 rounded-full bg-black/90 text-yellow-300 font-black font-mono text-sm border border-yellow-400/40 shadow-inner">
                  {loading ? "..." : `${team.level3.total}/${team.level3.active}`}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Rules & Guidelines Card */}
          <div className="p-5 rounded-[28px] bg-white/95 border-2 border-white shadow-[0_6px_20px_rgba(0,80,200,0.18)] text-xs text-slate-800 space-y-3">
            {/* Rule 1 */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                1
              </span>
              <p className="font-bold text-slate-800 leading-snug">
                <strong className="text-rose-600 font-extrabold">10%</strong> bonus on Level 1 fast deposits.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                2
              </span>
              <p className="font-bold text-slate-800 leading-snug">
                If you refer <strong className="text-rose-600 font-extrabold">10</strong> members, you will receive a bonus of <strong className="text-rose-600 font-extrabold">300 BDT</strong>.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-3 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                3
              </span>
              <p className="font-bold text-slate-800 leading-snug">
                From daily earnings, Level 1 members will receive a <strong className="text-rose-600 font-extrabold">10%</strong> bonus, Level 2 members <strong className="text-rose-600 font-extrabold">5%</strong>, and Level 3 members <strong className="text-rose-600 font-extrabold">3%</strong>.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                4
              </span>
              <p className="font-bold text-slate-800 leading-snug">
                Click the <strong className="text-rose-600 font-extrabold">&apos;Claim&apos;</strong> option to collect the bonus.
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
