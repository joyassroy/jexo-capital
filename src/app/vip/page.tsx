"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CityFooter from "@/components/common/CityFooter";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
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
  TrendingUp,
  ShoppingBag,
  Percent,
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
    id: "vip-0",
    level: 0,
    name: "Vip-0",
    dailyReturn: "2.50%",
    numberOfOrders: 5,
    commissionPerOrder: "0.5%",
    minBDT: 0,
    maxBDT: 999,
    minUSDT: 0,
    maxUSDT: Number((999 / DEFAULT_USDT_RATE).toFixed(2)),
  },
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

/* Tier accent palette — each VIP level gets its own color family */
const TIER_ACCENTS = [
  { from: "#64748b", to: "#475569", glow: "rgba(100,116,139,0.35)", label: "STARTER" },
  { from: "#38bdf8", to: "#0284c7", glow: "rgba(56,189,248,0.35)", label: "BRONZE" },
  { from: "#a78bfa", to: "#7c3aed", glow: "rgba(167,139,250,0.35)", label: "SILVER" },
  { from: "#f59e0b", to: "#d97706", glow: "rgba(245,158,11,0.35)", label: "GOLD" },
  { from: "#f43f5e", to: "#be123c", glow: "rgba(244,63,94,0.35)", label: "DIAMOND" },
];

export default function VipPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { toast } = useToast();
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
          setVipPlans(tiersData.tiers.sort((a: VipTier, b: VipTier) => a.level - b.level));
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

      const successMsg = data.message || `${selectedPlan.name} activated successfully!`;
      setPurchaseSuccess(successMsg);
      toast.success(successMsg);
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
  const userLevel = user ? (user.vipLevel ?? 0) : 0;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-300 ${
        isLight
          ? "bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        {/* ─── Top Header ─── */}
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

          {/* Centered Title */}
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-4 bg-[#f5ba31]/70" />
            <h1
              style={{ color: "#f5ba31", WebkitTextFillColor: "#f5ba31" }}
              className="text-base sm:text-lg font-black tracking-tight !text-[#f5ba31] text-[#f5ba31] drop-shadow-[0_0_10px_rgba(245,186,49,0.35)]"
            >
              {t("vip_title")}
            </h1>
            <span className="h-[1px] w-4 bg-[#f5ba31]/70" />
          </div>

          <div className="w-9 flex items-center justify-end">
            <ThemeToggle compact />
          </div>
        </div>

        {/* ─── Premium Balance Card ─── */}
        <div className="px-3 mt-3">
          <div
            className={`vip-balance-card relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
              isLight
                ? "bg-white border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                : "bg-gradient-to-br from-[#0a1d4a] via-[#071640] to-[#040e28] border border-[#f5ba31]/30 shadow-[0_4px_30px_rgba(245,186,49,0.12)]"
            }`}
          >
            {/* Subtle decorative radial behind the card */}
            {!isLight && (
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#f5ba31]/[0.06] blur-3xl pointer-events-none" />
            )}

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isLight
                      ? "bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_4px_14px_rgba(14,165,233,0.3)]"
                      : "bg-gradient-to-br from-[#00b4d8] to-[#0077b6] shadow-[0_4px_14px_rgba(0,180,216,0.35)]"
                  }`}
                >
                  <Wallet size={20} className="text-white" />
                </div>
                <div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      isLight ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {t("vip_my_wallet_balance")}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span
                      className={`text-lg font-black tabular-nums tracking-tight ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {user ? Number(user.balance).toFixed(2) : "0.00"}
                    </span>
                    <span className={`text-[10px] font-extrabold ${isLight ? "text-sky-600" : "text-[#f5ba31]"}`}>
                      USDT
                    </span>
                    <span className={`text-[10px] font-semibold ml-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                      ≈ {user ? (Number(user.balance) * usdtRate).toFixed(0) : "0"} Tk
                    </span>
                  </div>
                </div>
              </div>

              {/* Current VIP badge */}
              <div
                className={`vip-badge-pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs tracking-wide ${
                  isLight
                    ? "bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-400 text-amber-800 shadow-[0_2px_10px_rgba(245,158,11,0.15)]"
                    : "bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-[#f5ba31] text-[#f5ba31] shadow-[0_0_12px_rgba(245,186,49,0.25)]"
                }`}
              >
                <Crown size={14} />
                <span>
                  {user ? (user.vipLevel === 0 ? "VIP-0" : `VIP-${user.vipLevel}`) : "VIP-0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── VIP Packages List ─── */}
        <div className="px-3 py-3 space-y-3 max-w-[440px] mx-auto">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin mx-auto text-[#f5ba31] mb-3" />
              <p className={`text-xs font-bold ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                Loading VIP Plans...
              </p>
            </div>
          ) : (
            vipPlans.map((item, idx) => {
              const isActive = userLevel === item.level;
              const isCompleted = userLevel > item.level;
              const accent = TIER_ACCENTS[idx] || TIER_ACCENTS[0];

              return (
                <div
                  key={item.id || `tier-${item.level}`}
                  className={`vip-tier-card group relative overflow-hidden rounded-[20px] transition-all duration-300 ${
                    isLight
                      ? `bg-white border-2 shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${
                          isActive
                            ? "border-emerald-400 ring-2 ring-emerald-200"
                            : "border-slate-200 hover:border-slate-300"
                        }`
                      : `bg-gradient-to-br from-[#0a1d4a]/90 via-[#071640]/90 to-[#040e28]/90 backdrop-blur-sm border ${
                          isActive
                            ? "border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/30"
                            : "border-slate-700/50 hover:border-slate-600/70"
                        }`
                  }`}
                >
                  {/* ─ Decorative accent top bar ─ */}
                  <div
                    className="h-1 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                    }}
                  />

                  {/* Active Level badge */}
                  {isActive && (
                    <div className="absolute top-1 right-0 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-[8px] font-black uppercase px-3 py-[3px] rounded-bl-xl shadow-[0_0_10px_rgba(16,185,129,0.4)] flex items-center gap-1 tracking-widest">
                      <Sparkles size={9} /> ACTIVE
                    </div>
                  )}

                  <div className="p-3.5 sm:p-4">
                    {/* VIP Title row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* Tier icon badge */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                            boxShadow: `0 4px 14px ${accent.glow}`,
                          }}
                        >
                          <Crown size={18} />
                        </div>
                        <div>
                          <h3
                            className={`text-base sm:text-lg font-black tracking-tight ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {item.name}
                          </h3>
                          <span
                            className="text-[9px] font-extrabold uppercase tracking-[0.15em] opacity-70"
                            style={{ color: accent.from }}
                          >
                            {accent.label}
                          </span>
                        </div>
                      </div>

                      {/* Status / Purchase Button */}
                      <div>
                        {isActive ? (
                          <button
                            disabled
                            className={`px-4 py-1.5 rounded-full font-black text-[11px] flex items-center gap-1 cursor-default transition-all ${
                              isLight
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : "bg-gradient-to-b from-[#00b040] to-[#008a30] text-white shadow-[0_0_10px_rgba(0,176,64,0.35)]"
                            }`}
                          >
                            <Check size={13} className="stroke-[3]" />
                            <span>{t("vip_active_now")}</span>
                          </button>
                        ) : isCompleted ? (
                          <button
                            disabled
                            className={`px-3.5 py-1.5 rounded-full font-bold text-[11px] shadow-sm cursor-default ${
                              isLight
                                ? "bg-slate-100 text-slate-400 border border-slate-200"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {t("success")}
                          </button>
                        ) : vipAutoActiveEnabled ? (
                          <Link
                            href="/recharge"
                            className="px-3.5 py-1.5 rounded-full bg-gradient-to-b from-[#e52d27] to-[#b31217] text-white font-black text-[11px] shadow-[0_0_10px_rgba(229,45,39,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                          >
                            <span>{t("recharge_to_unlock")}</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openBuyModal(item)}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-b from-[#e52d27] to-[#b31217] text-white font-black text-[11px] shadow-[0_0_10px_rgba(229,45,39,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>{t("join_now")}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3 Metrics — premium card-style with icons */}
                    <div
                      className={`grid grid-cols-3 gap-2 mb-3 ${
                        isLight ? "" : ""
                      }`}
                    >
                      {/* Daily Return */}
                      <div
                        className={`relative rounded-xl px-2 py-2.5 text-center overflow-hidden ${
                          isLight
                            ? "bg-rose-50 border border-rose-200/80"
                            : "bg-white/[0.04] border border-white/[0.08]"
                        }`}
                      >
                        <TrendingUp
                          size={13}
                          className={`mx-auto mb-1 ${
                            isLight ? "text-rose-400" : "text-rose-400/60"
                          }`}
                        />
                        <div
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isLight ? "text-rose-600" : "text-[#ff6b6b]"
                          }`}
                        >
                          {item.dailyReturn}
                        </div>
                        <div
                          className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${
                            isLight ? "text-rose-400" : "text-slate-400"
                          }`}
                        >
                          {t("daily_return_rate")}
                        </div>
                      </div>

                      {/* Orders Per Day */}
                      <div
                        className={`relative rounded-xl px-2 py-2.5 text-center overflow-hidden ${
                          isLight
                            ? "bg-emerald-50 border border-emerald-200/80"
                            : "bg-white/[0.04] border border-white/[0.08]"
                        }`}
                      >
                        <ShoppingBag
                          size={13}
                          className={`mx-auto mb-1 ${
                            isLight ? "text-emerald-400" : "text-emerald-400/60"
                          }`}
                        />
                        <div
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isLight ? "text-emerald-600" : "text-[#00e676]"
                          }`}
                        >
                          {item.numberOfOrders}
                        </div>
                        <div
                          className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${
                            isLight ? "text-emerald-400" : "text-slate-400"
                          }`}
                        >
                          {t("vip_orders_per_day")}
                        </div>
                      </div>

                      {/* Commission Per Order */}
                      <div
                        className={`relative rounded-xl px-2 py-2.5 text-center overflow-hidden ${
                          isLight
                            ? "bg-sky-50 border border-sky-200/80"
                            : "bg-white/[0.04] border border-white/[0.08]"
                        }`}
                      >
                        <Percent
                          size={13}
                          className={`mx-auto mb-1 ${
                            isLight ? "text-sky-400" : "text-sky-400/60"
                          }`}
                        />
                        <div
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isLight ? "text-sky-600" : "text-[#38bdf8]"
                          }`}
                        >
                          {item.commissionPerOrder}
                        </div>
                        <div
                          className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${
                            isLight ? "text-sky-400" : "text-slate-400"
                          }`}
                        >
                          {t("vip_per_order")}
                        </div>
                      </div>
                    </div>

                    {/* Investment amount footer row */}
                    <div
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                        isLight
                          ? "bg-slate-50 border border-slate-200/80"
                          : "bg-white/[0.03] border border-white/[0.06]"
                      }`}
                    >
                      <div>
                        <div
                          className={`text-[10px] font-semibold leading-tight ${
                            isLight ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {t("amount")}
                        </div>
                        <div
                          className={`text-sm sm:text-base font-black tabular-nums tracking-tight mt-0.5 ${
                            isLight ? "text-slate-800" : "text-white"
                          }`}
                        >
                          {item.minBDT.toLocaleString()}–{item.maxBDT.toLocaleString()} Tk
                        </div>
                      </div>
                      <div
                        className={`text-[11px] font-extrabold tabular-nums flex items-center gap-1 ${
                          isLight ? "text-sky-600" : "text-[#f5ba31]"
                        }`}
                      >
                        <span>≈ {item.minUSDT} - {item.maxUSDT} USDT</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Manual Buy / Upgrade Modal ─── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl border-2 p-5 space-y-4 overflow-hidden ${
              isLight
                ? "bg-white border-amber-300 shadow-[0_8px_40px_rgba(245,186,49,0.18)]"
                : "bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] border-[#f5ba31] shadow-[0_0_35px_rgba(245,186,49,0.35)]"
            }`}
          >
            {/* Decorative glow */}
            {!isLight && (
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#f5ba31]/[0.06] blur-3xl pointer-events-none" />
            )}

            {/* Modal Header */}
            <div
              className={`relative z-10 flex items-center justify-between pb-3 border-b ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    isLight
                      ? "bg-amber-100 border border-amber-300 text-amber-700"
                      : "bg-[#f5ba31]/20 border border-[#f5ba31] text-[#f5ba31]"
                  }`}
                >
                  VIP
                </div>
                <div>
                  <h4
                    className={`text-base font-black ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Activate {selectedPlan.name}
                  </h4>
                  <div
                    className={`text-[10px] font-semibold ${
                      isLight ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    Rate: 1 USDT = {usdtRate} BDT
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-500"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Plan Highlights */}
            <div
              className={`relative z-10 p-3 rounded-2xl text-xs ${
                isLight
                  ? "bg-slate-50 border border-slate-200"
                  : "bg-white/5 border border-white/10 text-white"
              }`}
            >
              <div className="grid grid-cols-3 text-center divide-x divide-slate-200 dark:divide-white/10">
                <div>
                  <div className={`font-extrabold ${isLight ? "text-rose-600" : "text-[#ff4d4f]"}`}>
                    {selectedPlan.dailyReturn}
                  </div>
                  <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                    Daily Return
                  </div>
                </div>
                <div>
                  <div className={`font-extrabold ${isLight ? "text-emerald-600" : "text-[#00e676]"}`}>
                    {selectedPlan.numberOfOrders}
                  </div>
                  <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                    Orders/Day
                  </div>
                </div>
                <div>
                  <div className={`font-extrabold ${isLight ? "text-sky-600" : "text-[#38bdf8]"}`}>
                    {selectedPlan.commissionPerOrder}
                  </div>
                  <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                    Commission
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Amount Input (in BDT) */}
            <div className="relative z-10 space-y-1.5">
              <label
                className={`text-xs font-bold flex items-center justify-between ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                <span>Investment Amount (BDT)</span>
                <span className={`text-[11px] ${isLight ? "text-amber-600" : "text-[#f5ba31]"}`}>
                  Range: {selectedPlan.minBDT.toLocaleString()} - {selectedPlan.maxBDT.toLocaleString()} Tk
                </span>
              </label>

              <div
                className={`flex items-center rounded-2xl border-2 px-3.5 py-2.5 transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-300 focus-within:border-amber-400"
                    : "bg-[#020a1f] border-slate-700 focus-within:border-[#f5ba31]"
                }`}
              >
                <span
                  className={`text-sm font-black mr-2 ${
                    isLight ? "text-amber-600" : "text-[#f5ba31]"
                  }`}
                >
                  Tk
                </span>
                <input
                  type="number"
                  min={selectedPlan.minBDT}
                  max={selectedPlan.maxBDT}
                  value={investBDT}
                  onChange={(e) => setInvestBDT(Number(e.target.value))}
                  className={`w-full bg-transparent text-base font-black outline-none tabular-nums ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                />
              </div>

              {/* USDT Equivalent calculation */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className={`font-medium ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                  Cost in USDT:
                </span>
                <span
                  className={`font-black tabular-nums text-sm ${
                    isLight ? "text-amber-600" : "text-[#f5ba31]"
                  }`}
                >
                  {currentInvestUSDT} USDT
                </span>
              </div>
            </div>

            {/* User Wallet Balance Verification */}
            <div
              className={`relative z-10 p-3 rounded-2xl text-xs space-y-1 ${
                isLight
                  ? "bg-slate-50 border border-slate-200"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Your Available Balance:
                </span>
                <span className={`font-black ${isLight ? "text-slate-800" : "text-white"}`}>
                  {user ? Number(user.balance).toFixed(2) : "0.00"} USDT
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  After Purchase Balance:
                </span>
                <span
                  className={`font-black ${
                    hasEnoughBalance
                      ? isLight ? "text-emerald-600" : "text-emerald-400"
                      : isLight ? "text-rose-600" : "text-rose-400"
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
              <div
                className={`relative z-10 p-3 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-2 ${
                  isLight
                    ? "bg-rose-50 border-rose-300 text-rose-800"
                    : "bg-red-950/70 border-red-500/60 text-red-100"
                }`}
              >
                <AlertCircle
                  size={17}
                  className={`shrink-0 ${isLight ? "text-rose-600" : "text-rose-400"}`}
                />
                <span>{purchaseError}</span>
              </div>
            )}

            {/* Success Message */}
            {purchaseSuccess && (
              <div
                className={`relative z-10 p-3 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-2 ${
                  isLight
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-emerald-950/70 border-emerald-500/60 text-emerald-100"
                }`}
              >
                <Check
                  size={17}
                  className={`shrink-0 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
                />
                <span>{purchaseSuccess}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="relative z-10">
              {!hasEnoughBalance ? (
                <div className="space-y-2">
                  <Link
                    href="/recharge"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Recharge Account First</span>
                    <ArrowRight size={16} />
                  </Link>
                  <p
                    className={`text-[10px] text-center ${
                      isLight ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
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
