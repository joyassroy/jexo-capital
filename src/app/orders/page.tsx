"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShoppingBag,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Layers,
  ChevronRight,
  Lock,
  RefreshCw,
  Loader2,
  X,
  Volume2,
} from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { playCoinDropRhythm, playSuccessChime } from "@/lib/soundEffects";

interface OrderUserData {
  vipLevel: number;
  tierName: string;
  balanceUSDT: number;
  balanceBDT: number;
  freezeFundsBDT: number;
  todayCommissionUSDT: number;
  todayCommissionBDT: number;
  todayOrdersCount: number;
  maxOrders: number;
  dailyReturnPercent: number;
  commissionPercent: number;
  estimatedNextCommissionUSDT: number;
  estimatedNextCommissionBDT: number;
  hasReachedLimit: boolean;
  isQualified: boolean;
  minBDTRequired: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrderUserData | null>(null);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [errorMessage, setErrorMessage] = useState("");

  // Animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [animationStep, setAnimationStep] = useState<string>("Connecting to Merchant Node...");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedCommission, setCompletedCommission] = useState<{
    usdt: number;
    bdt: number;
    orderNum: number;
  } | null>(null);

  // Dynamic pool ticker amount (starts around 49,235,712.86)
  const [poolAmount, setPoolAmount] = useState<number>(49235712.86);

  // Sound toggle preference
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrderData = async () => {
    try {
      const res = await fetch("/api/user/orders");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (res.ok && json.user) {
        setData(json.user);
        if (json.usdtRate) setUsdtRate(json.usdtRate);
      } else {
        setErrorMessage(json.error || "Failed to load order info.");
      }
    } catch {
      setErrorMessage("Network error loading orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();

    // Pool ticker micro-increment animation
    const poolInterval = setInterval(() => {
      setPoolAmount((prev) => prev + Math.floor(Math.random() * 25) + 3.14);
    }, 3500);

    return () => {
      clearInterval(poolInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
    };
  }, []);

  // Handle Order Execution with 10-Second Countdown & Sound
  const handleAddToQueue = async () => {
    if (!data) return;

    if (!data.isQualified) {
      alert(
        `Minimum VIP-1 required (Balance ≥ 1,000 Tk / ~${(1000 / usdtRate).toFixed(2)} USDT) to earn commission on daily orders.`
      );
      router.push("/vip");
      return;
    }

    if (data.todayOrdersCount >= data.maxOrders) {
      alert("You have completed all 5 daily orders! New orders reset after midnight (12:00 AM).");
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setCountdown(10);
    setAnimationStep("Connecting to Global Merchant Queue...");
    setErrorMessage("");

    // Trigger initial coin clink
    if (soundEnabled) {
      playCoinDropRhythm();
    }

    // Play periodic "tung-tang" sounds every 1.1s during the 10-second fall
    if (soundEnabled) {
      soundIntervalRef.current = setInterval(() => {
        playCoinDropRhythm();
      }, 1100);
    }

    // Call API in parallel
    let apiResultPromise = fetch("/api/user/orders", { method: "POST" })
      .then((res) => res.json())
      .catch(() => null);

    let currentSec = 10;
    timerRef.current = setInterval(async () => {
      currentSec -= 1;
      setCountdown(currentSec);

      if (currentSec === 8) {
        setAnimationStep("Matching High-Value Daily Necessities Order...");
      } else if (currentSec === 5) {
        setAnimationStep("Processing Commission & Smart Verification...");
      } else if (currentSec === 2) {
        setAnimationStep("Finalizing Settlement to Main Balance...");
      } else if (currentSec <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);

        // Await the API response
        const result = await apiResultPromise;
        if (result && result.success) {
          if (soundEnabled) {
            playSuccessChime();
          }

          setCompletedCommission({
            usdt: result.earnedCommissionUSDT,
            bdt: result.earnedCommissionBDT,
            orderNum: result.todayOrdersCount,
          });

          // Update local data
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  balanceUSDT: result.newBalanceUSDT,
                  balanceBDT: result.newBalanceBDT,
                  todayCommissionUSDT: result.todayCommissionUSDT,
                  todayCommissionBDT: result.todayCommissionBDT,
                  todayOrdersCount: result.todayOrdersCount,
                  hasReachedLimit: result.hasReachedLimit,
                }
              : null
          );

          setShowCompletionModal(true);
        } else {
          alert(result?.error || "Failed to process order. Please try again.");
          fetchOrderData();
        }

        setIsProcessing(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28 relative overflow-x-hidden">
      <div>
        {/* Top Header */}
        <div className="relative flex items-center justify-between px-4 py-3 bg-[#030e28]/95 backdrop-blur-md border-b border-[#f5ba31]/30 shadow-md">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white"
            aria-label="Back"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          {/* Centered Title with Shopping Bag Icon */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f5ba31] to-[#ffd369] text-[#020a1f] flex items-center justify-center shadow-md shadow-amber-500/20">
              <ShoppingBag size={16} className="stroke-[2.5]" />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-[#f5ba31] drop-shadow-[0_0_10px_rgba(245,186,49,0.35)]">
              Daily Necessities
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                soundEnabled
                  ? "bg-amber-500/20 text-[#f5ba31] border border-amber-500/40"
                  : "bg-white/10 text-slate-400 border border-white/10"
              }`}
              title={soundEnabled ? "Sound Effects ON" : "Sound Effects Muted"}
            >
              <Volume2 size={15} />
            </button>
            <ThemeToggle compact />
          </div>
        </div>

        {/* Top Product Category Info Card */}
        <div className="mx-3 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#041235] via-[#071946] to-[#041235] border border-[#f5ba31]/35 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,180,216,0.45)] shrink-0">
              <ClipboardList size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                Daily necessities
              </h2>
              <div className="text-[10px] text-slate-300 font-semibold mt-0.5">
                Daily necessities
              </div>
              <div className="text-[11px] font-black text-[#f5ba31] flex items-center gap-1 mt-0.5">
                <span>
                  Daily return rate:{" "}
                  {data?.dailyReturnPercent ? `${data.dailyReturnPercent.toFixed(2)}%` : "5.00%"}
                </span>
                <span className="text-[9.5px] text-emerald-400 font-bold ml-1">
                  ({data?.commissionPercent ? `${data.commissionPercent.toFixed(2)}%` : "0.5%"} / order)
                </span>
              </div>
            </div>
          </div>

          {/* Trusted Product Badge */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-[#020a1f] flex items-center justify-center shadow-md shadow-amber-500/30">
              <CheckCircle2 size={16} className="stroke-[3]" />
            </div>
            <span className="text-[9px] font-black text-amber-300 uppercase tracking-tight mt-1 text-center">
              Trusted Product
            </span>
          </div>
        </div>

        {/* Product Visual Showcase Area */}
        <div className="relative mx-3 mt-3 rounded-3xl overflow-hidden border border-slate-700/60 bg-gradient-to-b from-[#06153d] via-[#020b22] to-[#01081a] p-4 text-center">
          {/* Luminous Golden Arch Aura */}
          <div className="absolute inset-x-8 top-3 h-44 rounded-full border border-amber-400/25 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none filter blur-sm" />

          {/* Golden Capsule Pool Ticker Floating Overlay */}
          <div
            className="order-pool-capsule relative z-10 inline-flex items-center gap-2.5 px-5 py-2 rounded-full border-2 border-[#f5ba31] shadow-[0_4px_25px_rgba(245,186,49,0.45)] mb-4 transition-all"
            style={{
              background: "linear-gradient(90deg, #181203 0%, #291d05 50%, #181203 100%)",
              borderColor: "#f5ba31",
            }}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 flex items-center justify-center text-[#1a1303] shadow-md shrink-0">
              <Coins size={15} className="stroke-[2.5] text-[#1a1303]" />
            </div>
            <div className="flex items-baseline gap-1 font-mono tracking-tight leading-none">
              <span
                className="order-pool-currency text-sm sm:text-base font-black text-[#f5ba31]"
                style={{ color: "#f5ba31", WebkitTextFillColor: "#f5ba31" }}
              >
                TK
              </span>
              <span
                className="order-pool-value text-base sm:text-lg font-black text-white"
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                  textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                }}
              >
                {poolAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Modern Smart Home Appliances Showcase (matching screenshot) */}
          <div className="relative z-10 flex items-end justify-center gap-2 sm:gap-4 py-2 my-1">
            {/* Cordless Stick Vacuum */}
            <div className="flex flex-col items-center group">
              <div className="w-12 h-28 sm:w-16 sm:h-36 relative flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 140" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  {/* Vacuum head */}
                  <rect x="10" y="125" width="40" height="10" rx="3" fill="#2563eb" />
                  <rect x="18" y="120" width="24" height="6" fill="#1e40af" />
                  {/* Metal rod */}
                  <rect x="27" y="38" width="6" height="84" fill="#a855f7" />
                  {/* Motor cyclone cylinder */}
                  <rect x="22" y="16" width="16" height="24" rx="4" fill="#ef4444" />
                  <circle cx="30" cy="28" r="5" fill="#3b82f6" />
                  {/* Ergonomic handle */}
                  <path d="M 38 20 C 48 20 48 35 38 35" stroke="#ef4444" strokeWidth="4" fill="none" />
                </svg>
              </div>
            </div>

            {/* Smart Robot Vacuum with Laser Dome */}
            <div className="flex flex-col items-center group">
              <div className="w-20 h-24 sm:w-28 sm:h-32 relative flex flex-col items-center justify-end transition-transform group-hover:scale-105">
                {/* Robot dock tower */}
                <div className="w-16 h-18 sm:w-20 sm:h-22 rounded-t-xl bg-gradient-to-b from-[#2d3748] to-[#1a202c] border border-slate-600 shadow-md flex items-center justify-center mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                {/* Robot round vacuum disc */}
                <div className="w-20 h-8 sm:w-24 sm:h-10 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 border-2 border-slate-400 shadow-lg flex items-center justify-center relative">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-sm" />
                </div>
              </div>
            </div>

            {/* Smart Upright Wet/Dry Washer */}
            <div className="flex flex-col items-center group">
              <div className="w-12 h-28 sm:w-16 sm:h-36 relative flex items-center justify-center transition-transform group-hover:scale-105">
                <svg viewBox="0 0 60 140" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  {/* Roller foot */}
                  <rect x="12" y="122" width="36" height="12" rx="4" fill="#1e293b" />
                  <circle cx="30" cy="128" r="4" fill="#00d2ff" />
                  {/* Dual water tanks */}
                  <rect x="22" y="55" width="16" height="65" rx="5" fill="#334155" />
                  <rect x="25" y="62" width="10" height="25" rx="2" fill="#0284c7" opacity="0.8" />
                  {/* Shaft & Handle */}
                  <rect x="27" y="10" width="6" height="45" fill="#64748b" />
                  <path d="M 33 12 C 43 12 43 24 33 24" stroke="#0f172a" strokeWidth="4" fill="none" />
                </svg>
              </div>
            </div>

            {/* Smart Tower Air Purifier */}
            <div className="flex flex-col items-center group">
              <div className="w-14 h-24 sm:w-18 sm:h-32 relative flex items-center justify-center transition-transform group-hover:scale-105">
                <div className="w-12 sm:w-14 h-24 sm:h-28 rounded-2xl bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-300 shadow-lg p-1.5 flex flex-col justify-between items-center">
                  <div className="w-6 h-3 rounded-full bg-black/80 flex items-center justify-center text-[7px] text-cyan-400 font-mono">
                    008
                  </div>
                  <div className="space-y-1 w-full px-1">
                    <div className="h-[1px] bg-slate-300 w-full" />
                    <div className="h-[1px] bg-slate-300 w-full" />
                    <div className="h-[1px] bg-slate-300 w-full" />
                    <div className="h-[1px] bg-slate-300 w-full" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Golden Stage Pedestal Base */}
          <div className="relative mx-auto w-4/5 h-4 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 rounded-full shadow-[0_4px_15px_rgba(245,186,49,0.6)] border-t border-amber-200 opacity-90" />
        </div>

        {/* Queue Status Ribbon Banner */}
        <div className="mx-3 mt-3">
          <div className="relative py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#ffd369] to-amber-500 text-[#020a1f] font-extrabold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2">
            <Zap size={15} className="text-red-600 fill-red-600 shrink-0" />
            <span className="tracking-tight text-sm font-black">
              {isProcessing ? "Processing in Queue (10s)..." : "Order"}
            </span>
            <CheckCircle2 size={15} className="text-emerald-700 stroke-[3] shrink-0" />
          </div>
        </div>

        {/* 3 Stats Rows (Total assets, Today's commission, Today's order) */}
        <div className="order-stats-card mx-3 mt-3 rounded-2xl bg-[#04102e]/90 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg overflow-hidden divide-y divide-white/10 text-xs">
          {/* Row 1: Total Assets */}
          <Link
            href="/vip"
            className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Coins size={18} />
              </div>
              <span className="order-stat-label font-bold text-slate-200 group-hover:text-white">
                Total assets
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm text-[#f5ba31]">
              <span className="order-stat-assets">
                TK {data ? data.balanceBDT.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
              </span>
              <ChevronRight size={15} className="text-slate-400" />
            </div>
          </Link>

          {/* Row 2: Today's Commission */}
          <Link
            href="/records"
            className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <ShieldCheck size={18} />
              </div>
              <span className="order-stat-label font-bold text-slate-200 group-hover:text-white">
                Today&apos;s commission
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm text-emerald-400">
              <span className="order-stat-commission">
                TK {data ? data.todayCommissionBDT.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
              </span>
              <ChevronRight size={15} className="text-slate-400" />
            </div>
          </Link>

          {/* Row 3: Today's Order Count */}
          <Link
            href="/records"
            className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                <ClipboardList size={18} />
              </div>
              <span className="order-stat-label font-bold text-slate-200 group-hover:text-white">
                Today&apos;s order
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm text-white">
              <span className="order-stat-count">{data ? data.todayOrdersCount : 0}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {data ? data.maxOrders : 5}</span>
              <ChevronRight size={15} className="text-slate-400 ml-1" />
            </div>
          </Link>
        </div>

        {/* Action Button: Add to Queue */}
        <div className="mx-3 mt-4">
          {data && !data.isQualified ? (
            <Link
              href="/recharge"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition-all"
            >
              <span>Recharge to Unlock Orders (Min 1,000 Tk)</span>
              <ArrowRight size={18} />
            </Link>
          ) : data && data.todayOrdersCount >= data.maxOrders ? (
            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
            >
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>Daily Limit Completed (5/5) — Resets at Midnight</span>
            </button>
          ) : (
            <button
              onClick={handleAddToQueue}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-base shadow-[0_4px_25px_rgba(245,186,49,0.45)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              <ClipboardList size={20} className="stroke-[2.5]" />
              <span>
                {isProcessing
                  ? `Queueing Order (${countdown}s)...`
                  : `Add to Queue (${data ? data.todayOrdersCount : 0}/5)`}
              </span>
              <ArrowRight size={18} className="stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          10-SECOND BITCOIN FALLING ANIMATION OVERLAY
          ======================================================== */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          {/* Top Status */}
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#f5ba31] text-xs font-black shadow-[0_0_15px_rgba(245,186,49,0.3)]">
              <Sparkles size={14} className="animate-spin" />
              <span>Processing Order Queue</span>
            </div>
            <h3 className="text-xl font-black text-white mt-3 tracking-tight">
              Executing VIP Transaction
            </h3>
            <p className="text-xs text-cyan-300 font-semibold mt-1 animate-pulse">
              {animationStep}
            </p>
          </div>

          {/* Central Falling Bitcoin Animation Container */}
          <div className="relative w-64 h-80 flex flex-col items-center justify-center overflow-hidden">
            {/* Countdown Badge Ring */}
            <div className="absolute top-2 z-10 w-12 h-12 rounded-full bg-[#030e28] border-2 border-[#f5ba31] text-[#f5ba31] font-mono font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,186,49,0.4)]">
              {countdown}s
            </div>

            {/* Glowing Falling Bitcoin Coin */}
            <div
              className="relative transition-all duration-700 ease-out flex items-center justify-center"
              style={{
                transform: `translateY(${(10 - countdown) * 18}px) scale(${1 + (10 - countdown) * 0.03})`,
              }}
            >
              {/* Gold Bitcoin Coin Badge */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-4 border-yellow-200 shadow-[0_0_35px_rgba(245,186,49,0.7)] flex items-center justify-center text-white font-serif font-black text-4xl animate-bounce">
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">₿</span>
              </div>

              {/* Sparkle particles around coin */}
              <div className="absolute -inset-4 rounded-full border border-amber-400/40 animate-ping pointer-events-none" />
            </div>

            {/* Bottom Chest/Pedestal Target */}
            <div className="absolute bottom-2 inset-x-8 h-10 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_25px_rgba(245,186,49,0.5)] border-t-2 border-yellow-200 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#1a1303] uppercase tracking-widest">
                Target Vault
              </span>
            </div>
          </div>

          {/* Sound & Info Footer */}
          <div className="text-center pb-6 space-y-1">
            <div className="text-xs text-slate-300 font-mono">
              Commission: ~{data?.commissionPercent}% of wallet balance
            </div>
            <div className="text-[11px] text-slate-400">
              Please wait while the transaction settles...
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          COMPLETION SUCCESS MODAL (After 10 Seconds)
          ======================================================== */}
      {showCompletionModal && completedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] border-2 border-[#f5ba31] shadow-[0_0_35px_rgba(245,186,49,0.4)] p-6 text-center space-y-4">
            <button
              onClick={() => {
                setShowCompletionModal(false);
                fetchOrderData();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            {/* Checkmark Celebration Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <CheckCircle2 size={32} className="stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Order #{completedCommission.orderNum} Completed!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your daily commission has been successfully added to your balance.
              </p>
            </div>

            {/* Profit Highlight Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Earned Profit
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                +TK {completedCommission.bdt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-bold text-[#f5ba31] font-mono">
                ≈ +{completedCommission.usdt.toFixed(4)} USDT
              </div>
            </div>

            <button
              onClick={() => {
                setShowCompletionModal(false);
                fetchOrderData();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-sm shadow-[0_4px_15px_rgba(245,186,49,0.35)] hover:brightness-105 active:scale-98 transition-all"
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
