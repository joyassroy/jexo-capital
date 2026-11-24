"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CityFooter from "@/components/common/CityFooter";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import {
  ChevronLeft,
  Crown,
  Check,
  AlertCircle,
  Loader2,
  Wallet,
  Sparkles,
  ArrowRight,
  Headphones,
  X,
  Zap,
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

interface VipTier {
  id: string;
  level: number;
  name: string;
  dailyReturn: string;
  numberOfOrders: number;
  commissionPerOrder: string;
  minBDT: number;
  maxBDT: number;
  minUSDT: number;
  maxUSDT: number;
}

const DEFAULT_USDT_RATE = 127;

const DEFAULT_VIP_PLANS: VipTier[] = [
  {
    id: "vip-1",
    level: 1,
    name: "Vip-1",
    dailyReturn: "5.00%",
    numberOfOrders: 5,
    commissionPerOrder: "0.5%",
    minBDT: 1000,
    maxBDT: 2999,
    minUSDT: Number((1000 / DEFAULT_USDT_RATE).toFixed(2)),
    maxUSDT: Number((2999 / DEFAULT_USDT_RATE).toFixed(2)),
  },
  {
    id: "vip-2",
    level: 2,
    name: "Vip-2",
    dailyReturn: "6.00%",
    numberOfOrders: 5,
    commissionPerOrder: "0.6%",
    minBDT: 3000,
    maxBDT: 9999,
    minUSDT: Number((3000 / DEFAULT_USDT_RATE).toFixed(2)),
    maxUSDT: Number((9999 / DEFAULT_USDT_RATE).toFixed(2)),
  },
  {
    id: "vip-3",
    level: 3,
    name: "Vip-3",
    dailyReturn: "7.00%",
    numberOfOrders: 5,
    commissionPerOrder: "0.7%",
    minBDT: 10000,
    maxBDT: 49999,
    minUSDT: Number((10000 / DEFAULT_USDT_RATE).toFixed(2)),
    maxUSDT: Number((49999 / DEFAULT_USDT_RATE).toFixed(2)),
  },
  {
    id: "vip-4",
    level: 4,
    name: "Vip-4",
    dailyReturn: "8.00%",
    numberOfOrders: 5,
    commissionPerOrder: "0.8%",
    minBDT: 50000,
    maxBDT: 99999,
    minUSDT: Number((50000 / DEFAULT_USDT_RATE).toFixed(2)),
    maxUSDT: Number((99999 / DEFAULT_USDT_RATE).toFixed(2)),
  },
];

export default function VipPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vipPlans, setVipPlans] = useState<VipTier[]>(DEFAULT_VIP_PLANS);
  const [usdtRate, setUsdtRate] = useState<number>(DEFAULT_USDT_RATE);
  const [vipAutoActiveEnabled, setVipAutoActiveEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<VipTier | null>(null);
  const [investBDT, setInvestBDT] = useState<number>(1000);
  const [buying, setBuying] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");

  const isLight = mounted && theme === "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live user profile and dynamic VIP tiers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, tiersRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/vip/tiers"),
        ]);

        if (userRes.status === 401) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        if (userData?.user) {
          setUser(userData.user);
        }

        const tiersData = await tiersRes.json();
        if (tiersData?.tiers && tiersData.tiers.length > 0) {
          setVipPlans(tiersData.tiers);
        }
        if (tiersData?.usdtRate) {
          setUsdtRate(tiersData.usdtRate);
        }
        if (typeof tiersData?.vipAutoActiveEnabled === "boolean") {
          setVipAutoActiveEnabled(tiersData.vipAutoActiveEnabled);
        }
      } catch (err) {
        console.error("Error loading VIP page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const openBuyModal = (plan: VipTier) => {
    setSelectedPlan(plan);
    setInvestBDT(plan.minBDT);
    setPurchaseError("");
    setPurchaseSuccess("");
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan || !user) return;

    setPurchaseError("");
    setPurchaseSuccess("");
    setBuying(true);

    try {
      const res = await fetch("/api/user/vip/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vipLevel: selectedPlan.level,
          amountBDT: investBDT,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPurchaseError(data.error || "Failed to complete purchase.");
        setBuying(false);
        return;
      }

      setPurchaseSuccess(data.message || `${selectedPlan.name} activated successfully!`);
      // Update local user state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              balance: data.newBalance,
              vipLevel: data.vipLevel,
            }
          : null
      );
      setBuying(false);

      // Auto close modal after 1.8 seconds on success
      setTimeout(() => {
        setSelectedPlan(null);
        setPurchaseSuccess("");
      }, 1800);
    } catch {
      setPurchaseError("A network error occurred. Please try again.");
      setBuying(false);
    }
  };

  const currentInvestUSDT = Number((investBDT / usdtRate).toFixed(2));
  const hasEnoughBalance = user ? user.balance >= currentInvestUSDT : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        {/* Top Header with Back button and Title */}
        <div
          className={`relative flex items-center justify-between px-4 py-3 backdrop-blur-md border-b shadow-md transition-colors duration-200 ${
            isLight
              ? "bg-white/95 border-amber-300/40 text-slate-800"
              : "bg-[#030e28]/90 border-[#f5ba31]/30 text-white"
          }`}
        >
          <button
            onClick={() => router.back()}
            className={`w-9 h-9 rounded-full border flex items-center justify-center active:scale-95 transition-all ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
            }`}
            aria-label="Back"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          {/* Centered Title in signature gold */}
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-4 bg-[#f5ba31]/70" />
            <h1
              style={{ color: "#f5ba31", WebkitTextFillColor: "#f5ba31" }}
              className="text-base sm:text-lg font-black tracking-tight !text-[#f5ba31] text-[#f5ba31] drop-shadow-[0_0_10px_rgba(245,186,49,0.35)]"
            >
              Invest and Share the Earnings
            </h1>
            <span className="h-[1px] w-4 bg-[#f5ba31]/70" />
          </div>

          <div className="w-9 flex items-center justify-end">
            <ThemeToggle compact />
          </div>
        </div>

        {/* User Balance & Level Quick Bar */}
        <div className="vip-balance-card mx-3 mt-3 p-3.5 rounded-2xl bg-[#05143a]/90 backdrop-blur-md border border-[#f5ba31]/40 shadow-[0_0_15px_rgba(245,186,49,0.2)] flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,180,216,0.4)]">
              <Wallet size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                My Wallet Balance
              </div>
              <div className="text-sm font-black text-white flex items-baseline gap-1">
                <span>{user ? Number(user.balance).toFixed(2) : "0.00"}</span>
                <span className="text-[10px] font-bold text-[#f5ba31]">USDT</span>
                <span className="text-[10px] text-slate-400 font-semibold ml-1">
                  ≈ {user ? (Number(user.balance) * usdtRate).toFixed(0) : "0"} Tk
                </span>
              </div>
            </div>
          </div>

          {/* Current VIP badge */}
          <div className="vip-badge-pill flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-[#f5ba31] text-[#f5ba31] shadow-[0_0_10px_rgba(245,186,49,0.25)]">
            <Crown size={14} className="text-[#f5ba31]" />
            <span className="text-xs font-black">
              {user && user.vipLevel > 0 ? `VIP-${user.vipLevel}` : "VIP-0"}
            </span>
          </div>
        </div>

        {/* VIP Packages List - Dynamically Loaded */}
        <div className="px-3 py-2 space-y-2.5 max-w-[440px] mx-auto mt-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 size={28} className="animate-spin mx-auto text-[#f5ba31] mb-2" />
              <p className="text-xs font-bold">Loading VIP Plans...</p>
            </div>
          ) : (
            vipPlans.map((item) => {
              const isActive = user?.vipLevel === item.level;
              const isCompleted = user ? user.vipLevel > item.level : false;

              return (
                <div
                  key={item.id || `tier-${item.level}`}
                  className={`p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#07173e] to-[#030e28] border transition-all relative overflow-hidden transform-gpu ${
                    isActive
                      ? "border-[#f5ba31] shadow-[0_0_15px_rgba(245,186,49,0.3)] ring-1 ring-[#f5ba31]/30"
                      : "border-slate-700/70 hover:border-[#f5ba31]/40 shadow-sm"
                  }`}
                >
                  {/* Active Level glowing badge */}
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg shadow-[0_0_8px_rgba(16,185,129,0.5)] flex items-center gap-1">
                      <Sparkles size={9} /> Active
                    </div>
                  )}

                  {/* VIP Title Header with decorative lines */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="h-[1px] w-8 sm:w-10 bg-[#f5ba31]/50" />
                    <h3 className="text-base sm:text-lg font-black bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] bg-clip-text text-transparent tracking-tight">
                      {item.name}
                    </h3>
                    <span className="h-[1px] w-8 sm:w-10 bg-[#f5ba31]/50" />
                  </div>

                  {/* 3 Metrics: Daily return | Number of Order | Commission per order */}
                  <div className="grid grid-cols-3 divide-x divide-white/10 text-center py-1.5">
                    <div>
                      <div className="text-base sm:text-lg font-black text-[#ff4d4f] tracking-tight drop-shadow-sm">
                        {item.dailyReturn}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-300 mt-0.5">
                        Daily return
                      </div>
                    </div>

                    <div>
                      <div className="text-base sm:text-lg font-black text-[#00e676] tracking-tight drop-shadow-sm">
                        {item.numberOfOrders}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-300 mt-0.5">
                        Number of Order
                      </div>
                    </div>

                    <div>
                      <div className="text-base sm:text-lg font-black text-[#38bdf8] tracking-tight drop-shadow-sm">
                        {item.commissionPerOrder}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-300 mt-0.5">
                        Commission per order
                      </div>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="border-t border-white/10 my-1.5" />

                  {/* Investment Amount & Action Button Row */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 leading-tight">
                        Investment amount
                      </div>
                      <div className="text-sm sm:text-base font-black text-white font-mono tracking-tight mt-0.5">
                        {item.minBDT.toLocaleString()}–{item.maxBDT.toLocaleString()} Tk
                      </div>
                      <div className="text-[10px] font-extrabold text-[#f5ba31] flex items-center gap-1 mt-0.5">
                        <span>≈ {item.minUSDT} - {item.maxUSDT} USDT</span>
                      </div>
                    </div>

                    {/* Status / Purchase Button */}
                    <div>
                      {isActive ? (
                        <button
                          disabled
                          className="px-4 py-1.5 rounded-full bg-gradient-to-b from-[#00b040] to-[#008a30] text-white font-black text-[11px] shadow-[0_0_10px_rgba(0,176,64,0.35)] flex items-center gap-1 cursor-default"
                        >
                          <Check size={13} className="stroke-[3]" />
                          <span>Active</span>
                        </button>
                      ) : isCompleted ? (
                        <button
                          disabled
                          className="px-3.5 py-1.5 rounded-full bg-slate-700 text-slate-400 font-bold text-[11px] shadow-sm cursor-default"
                        >
                          Unlocked
                        </button>
                      ) : vipAutoActiveEnabled ? (
                        <Link
                          href="/recharge"
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-b from-[#e52d27] to-[#b31217] text-white font-black text-[11px] shadow-[0_0_10px_rgba(229,45,39,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>Deposit to Unlock</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openBuyModal(item)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-b from-[#e52d27] to-[#b31217] text-white font-black text-[11px] shadow-[0_0_10px_rgba(229,45,39,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Not Active</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manual Buy / Upgrade Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] rounded-3xl shadow-[0_0_35px_rgba(245,186,49,0.35)] border-2 border-[#f5ba31] p-5 space-y-4 overflow-hidden text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f5ba31]/20 border border-[#f5ba31] text-[#f5ba31] flex items-center justify-center font-black text-xs">
                  VIP
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    Activate {selectedPlan.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    Rate: 1 USDT = {usdtRate} BDT
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="w-7 h-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Plan Highlights */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white">
              <div className="grid grid-cols-3 text-center divide-x divide-white/10">
                <div>
                  <div className="font-extrabold text-[#ff4d4f]">
                    {selectedPlan.dailyReturn}
                  </div>
                  <div className="text-[10px] text-slate-400">Daily Return</div>
                </div>
                <div>
                  <div className="font-extrabold text-[#00e676]">
                    {selectedPlan.numberOfOrders}
                  </div>
                  <div className="text-[10px] text-slate-400">Orders/Day</div>
                </div>
                <div>
                  <div className="font-extrabold text-[#38bdf8]">
                    {selectedPlan.commissionPerOrder}
                  </div>
                  <div className="text-[10px] text-slate-400">Commission</div>
                </div>
              </div>
            </div>

            {/* Investment Amount Input (in BDT) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Investment Amount (BDT)</span>
                <span className="text-[11px] text-[#f5ba31]">
                  Range: {selectedPlan.minBDT.toLocaleString()} - {selectedPlan.maxBDT.toLocaleString()} Tk
                </span>
              </label>

              <div className="flex items-center bg-[#020a1f] rounded-2xl border-2 border-slate-700 px-3.5 py-2.5 focus-within:border-[#f5ba31] transition-all">
                <span className="text-sm font-black text-[#f5ba31] mr-2">Tk</span>
                <input
                  type="number"
                  min={selectedPlan.minBDT}
                  max={selectedPlan.maxBDT}
                  value={investBDT}
                  onChange={(e) => setInvestBDT(Number(e.target.value))}
                  className="w-full bg-transparent text-base font-black text-white outline-none font-mono"
                />
              </div>

              {/* USDT Equivalent calculation */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-slate-400 font-medium">Cost in USDT:</span>
                <span className="font-black text-[#f5ba31] font-mono text-sm">
                  {currentInvestUSDT} USDT
                </span>
              </div>
            </div>

            {/* User Wallet Balance Verification */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Your Available Balance:</span>
                <span className="font-black text-white">
                  {user ? Number(user.balance).toFixed(2) : "0.00"} USDT
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">After Purchase Balance:</span>
                <span
                  className={`font-black ${
                    hasEnoughBalance ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {user
                    ? hasEnoughBalance
                      ? `${(user.balance - currentInvestUSDT).toFixed(2)} USDT`
                      : "Insufficient Balance"
                    : "0.00 USDT"}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {purchaseError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle size={17} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{purchaseError}</span>
              </div>
            )}

            {/* Success Message */}
            {purchaseSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-100 text-xs font-bold text-center flex items-center justify-center gap-2">
                <Check size={17} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{purchaseSuccess}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div>
              {!hasEnoughBalance ? (
                <div className="space-y-2">
                  <Link
                    href="/recharge"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Recharge Account First</span>
                    <ArrowRight size={16} />
                  </Link>
                  <p className="text-[10px] text-center text-slate-400">
                    Add USDT / bKash to your account to activate this VIP tier.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={buying || Boolean(purchaseSuccess)}
                  className="btn-gold-premium w-full py-3.5 rounded-2xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {buying ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#020a1f]" />
                      <span>Deducting & Activating...</span>
                    </>
                  ) : purchaseSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Activated!</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Deduct {currentInvestUSDT} USDT</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CityFooter />
    </div>
  );
}
