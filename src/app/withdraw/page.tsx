"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { useTheme } from "@/context/ThemeContext";
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  Building,
  Coins,
  ChevronRight,
  ShieldAlert,
  Gift,
  Info,
} from "lucide-react";

interface WalletItem {
  _id: string;
  bankType: "bKash" | "Nagad" | "USDT-BEP20";
  realName: string;
  accountNumber: string;
  usdtAddress?: string;
}

export default function WithdrawPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted && theme === "light";

  const [totalBalanceUSDT, setTotalBalanceUSDT] = useState<number>(0);
  const [totalBalanceBDT, setTotalBalanceBDT] = useState<number>(0);
  const [withdrawableUSDT, setWithdrawableUSDT] = useState<number>(0);
  const [withdrawableBDT, setWithdrawableBDT] = useState<number>(0);
  const [signupBonusBDT, setSignupBonusBDT] = useState<number>(500);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [activeTab, setActiveTab] = useState<"Bank" | "USDT">("Bank");

  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [withdrawPassword, setWithdrawPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchUserData = () => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const uRate = data.withdrawable?.usdtRate || 127;
          setUsdtRate(uRate);

          const balUSDT = data.user.balance || 0;
          const balBDT = Number((balUSDT * uRate).toFixed(2));
          setTotalBalanceUSDT(balUSDT);
          setTotalBalanceBDT(balBDT);

          const bonusBDT = data.withdrawable?.signupBonusBDT ?? 500;
          setSignupBonusBDT(bonusBDT);

          const wUSDT = data.withdrawable?.withdrawableUSDT ?? Math.max(0, balUSDT - (bonusBDT / uRate));
          const wBDT = data.withdrawable?.withdrawableBDT ?? Math.max(0, balBDT - bonusBDT);
          setWithdrawableUSDT(wUSDT);
          setWithdrawableBDT(wBDT);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    setMounted(true);
    fetchUserData();

    // Fetch bound wallets
    fetch("/api/user/wallets")
      .then((res) => res.json())
      .then((data) => {
        if (data?.wallets) {
          setWallets(data.wallets);
          if (data.wallets.length > 0) {
            setSelectedWalletId(data.wallets[0]._id);
          }
        }
      })
      .catch(() => { });

    // Fetch settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.usdtRateBDT) {
          setUsdtRate(data.settings.usdtRateBDT);
        }
      })
      .catch(() => { });
  }, []);

  const currentWallets = wallets.filter((w) =>
    activeTab === "Bank"
      ? w.bankType === "bKash" || w.bankType === "Nagad"
      : w.bankType === "USDT-BEP20"
  );

  // Sync selectedWalletId when switching tab or when wallets load
  useEffect(() => {
    if (currentWallets.length > 0) {
      if (!selectedWalletId || !currentWallets.some((w) => w._id === selectedWalletId)) {
        setSelectedWalletId(currentWallets[0]._id);
      }
    }
  }, [activeTab, currentWallets, selectedWalletId]);

  // Clear amount when switching tabs
  const handleTabChange = (tab: "Bank" | "USDT") => {
    setActiveTab(tab);
    setAmount("");
    setError("");
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    // Minimum limit check
    if (activeTab === "Bank") {
      if (numAmount < 250) {
        setError(`Minimum withdrawal amount for bKash / Nagad is 250 BDT.`);
        return;
      }
      if (numAmount > withdrawableBDT) {
        setError(
          `Cannot withdraw the 500 BDT sign-up bonus. Maximum withdrawable amount is ${withdrawableBDT.toFixed(2)} BDT.`
        );
        return;
      }
    } else {
      if (numAmount < 6) {
        setError(`Minimum withdrawal amount for USDT is 6 USDT ($6).`);
        return;
      }
      if (numAmount > withdrawableUSDT) {
        setError(
          `Cannot withdraw the 500 BDT sign-up bonus. Maximum withdrawable amount is ${withdrawableUSDT.toFixed(2)} USDT.`
        );
        return;
      }
    }

    if (!withdrawPassword) {
      setError("Please enter your withdrawal password.");
      return;
    }

    // Determine target account
    const selectedWallet =
      currentWallets.find((w) => w._id === selectedWalletId) || currentWallets[0];
    let targetAccount = "";
    let method: "bKash" | "Nagad" | "USDT-BEP20" = "bKash";

    if (activeTab === "Bank") {
      if (selectedWallet && selectedWallet.bankType !== "USDT-BEP20") {
        targetAccount = selectedWallet.accountNumber;
        method = selectedWallet.bankType;
      } else {
        setError("Please bind a bKash or Nagad wallet first in 'My Bank'.");
        return;
      }
    } else {
      const cryptoWallet =
        currentWallets.find((w) => w._id === selectedWalletId) ||
        wallets.find((w) => w.bankType === "USDT-BEP20");
      if (cryptoWallet && cryptoWallet.usdtAddress) {
        targetAccount = cryptoWallet.usdtAddress;
        method = "USDT-BEP20";
      } else {
        setError("Please bind a USDT-BEP20 wallet first in 'My Bank'.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountBDT: activeTab === "Bank" ? numAmount : undefined,
          amountUSDT: activeTab === "USDT" ? numAmount : undefined,
          method,
          targetAccount,
          realName: selectedWallet?.realName || "User",
          withdrawPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit withdrawal request.");
        setLoading(false);
        return;
      }

      setSuccess("Withdrawal request submitted successfully! Pending admin review.");
      setAmount("");
      setWithdrawPassword("");
      fetchUserData();
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const numAmount = Number(amount) || 0;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${isLight
        ? "bg-gradient-to-b from-[#f0f4fd] via-[#f7f9ff] to-[#eef3fb] text-slate-800"
        : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
        }`}
    >
      <div>
        <Header title="Withdraw" showBack={true} />

        <div className="p-4 space-y-4 max-w-[440px] mx-auto">
          {/* Withdrawal Balance Card */}
          <div
            className={`rounded-3xl backdrop-blur-md p-5 shadow-lg text-center space-y-3 border ${isLight
              ? "bg-white/95 border-amber-200/70 shadow-amber-500/5 text-slate-800"
              : "bg-[#04102e]/90 border-[#f5ba31]/30 text-white"
              }`}
          >
            <div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"
                  }`}
              >
                Withdrawable Balance
              </span>
              <div
                className={`text-3xl font-black mt-0.5 flex items-baseline justify-center gap-1.5 ${isLight
                  ? "text-amber-600 drop-shadow-xs"
                  : "text-[#f5ba31] drop-shadow-[0_0_12px_rgba(245,186,49,0.3)]"
                  }`}
              >
                <span>
                  {activeTab === "Bank"
                    ? `TK ${withdrawableBDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : `${withdrawableUSDT.toFixed(2)} USDT`}
                </span>
              </div>
              <div
                className={`text-xs font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-slate-300"
                  }`}
              >
                {activeTab === "Bank"
                  ? `≈ ${withdrawableUSDT.toFixed(2)} USDT`
                  : `≈ TK ${withdrawableBDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </div>
            </div>

            {/* Total Balance vs Bonus pill breakdown */}
            <div
              className={`grid grid-cols-2 gap-2 pt-2 border-t text-xs ${isLight ? "border-slate-100" : "border-white/10"
                }`}
            >
              <div
                className={`p-2 rounded-xl text-left border ${isLight
                  ? "bg-slate-50 border-slate-200/80"
                  : "bg-white/5 border-white/10"
                  }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase ${isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                >
                  Total Assets
                </div>
                <div
                  className={`font-mono font-bold text-xs mt-0.5 ${isLight ? "text-slate-900" : "text-white"
                    }`}
                >
                  TK {totalBalanceBDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div
                  className={`text-[10px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                >
                  {totalBalanceUSDT.toFixed(2)} USDT
                </div>
              </div>

              <div
                className={`p-2 rounded-xl text-left border ${isLight
                  ? "bg-amber-500/10 border-amber-300 text-amber-900"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isLight ? "text-amber-700" : "text-[#ffd369]"
                    }`}
                >
                  <Gift size={11} className={isLight ? "text-amber-600 shrink-0" : "text-amber-400 shrink-0"} />
                  <span>Reserve Bonus</span>
                </div>
                <div
                  className={`font-mono font-bold text-xs mt-0.5 ${isLight ? "text-amber-800" : "text-amber-300"
                    }`}
                >
                  TK {signupBonusBDT.toFixed(2)}
                </div>
                <div
                  className={`text-[10px] font-medium ${isLight ? "text-amber-600" : "text-amber-400/80"
                    }`}
                >
                  Non-Withdrawable
                </div>
              </div>
            </div>

            {/* Min Withdrawal Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border ${isLight
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                }`}
            >
              <Info size={13} className={isLight ? "shrink-0 text-blue-600" : "shrink-0 text-blue-400"} />
              <span>
                Min: {activeTab === "Bank" ? "250 BDT (bKash/Nagad)" : "6 USDT ($6.00)"} (1 USDT = {usdtRate} BDT)
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div
              className={`p-3.5 border rounded-2xl text-xs font-bold text-center shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${isLight
                ? "bg-rose-50 border-rose-300 text-rose-800 shadow-rose-100"
                : "bg-red-950/70 border-red-500/60 text-red-100 shadow-black/40"
                }`}
            >
              <div className="flex items-center gap-2 text-center">
                <AlertCircle
                  size={18}
                  className={`shrink-0 ${isLight ? "text-rose-600" : "text-rose-400"}`}
                />
                <span className="leading-snug">{error}</span>
              </div>
              {error.toLowerCase().includes("withdrawal password") && (
                <button
                  type="button"
                  onClick={() => router.push("/set-withdraw-password")}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold underline underline-offset-2 transition-all ${isLight
                    ? "text-rose-950 bg-rose-200 hover:bg-rose-300"
                    : "text-white bg-rose-800 hover:bg-rose-700"
                    }`}
                >
                  Set Password Now →
                </button>
              )}
            </div>
          )}
          {success && (
            <div
              className={`p-3.5 border rounded-2xl text-xs font-bold text-center shadow-md flex items-center justify-center gap-2 transition-all ${isLight
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100"
                : "bg-emerald-950/70 border-emerald-500/60 text-emerald-100 shadow-black/40"
                }`}
            >
              <CheckCircle2
                size={18}
                className={`shrink-0 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
              />
              <span className="leading-snug">{success}</span>
            </div>
          )}

          {/* Form Container with Tabs */}
          <div
            className={`rounded-3xl backdrop-blur-md shadow-lg overflow-hidden border ${isLight
              ? "bg-white/95 border-amber-200/80"
              : "bg-[#04102e]/85 border-[#f5ba31]/30"
              }`}
          >
            {/* Tabs */}
            <div
              className={`grid grid-cols-2 border-b ${isLight ? "bg-slate-100/80 border-slate-200" : "bg-[#020a1f]/80 border-white/10"
                }`}
            >
              <button
                type="button"
                onClick={() => handleTabChange("Bank")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "Bank"
                  ? isLight
                    ? "bg-white text-amber-600 border-b-2 border-amber-500 shadow-xs"
                    : "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                  : isLight
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Building size={16} />
                <span>bKash / Nagad</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("USDT")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "USDT"
                  ? isLight
                    ? "bg-white text-amber-600 border-b-2 border-amber-500 shadow-xs"
                    : "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                  : isLight
                    ? "text-slate-500 hover:text-slate-800"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Coins size={16} />
                <span>USDT-BEP20</span>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              {/* Select Bank/Wallet Box (NO ARROW) */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"
                    }`}
                >
                  Select Receiving Account
                </label>
                {currentWallets.length > 0 ? (
                  <div
                    className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between border ${isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800 shadow-xs"
                      : "bg-[#020a1f] border-slate-700 text-white"
                      }`}
                  >
                    <span className="truncate select-all font-mono">
                      {currentWallets[0].bankType}:{" "}
                      {currentWallets[0].bankType === "USDT-BEP20"
                        ? currentWallets[0].usdtAddress
                        : currentWallets[0].accountNumber}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/my-bank")}
                    className={`w-full px-3.5 py-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors ${isLight
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/15"
                      : "bg-[#f5ba31]/15 border-[#f5ba31]/40 text-[#f5ba31] hover:bg-[#f5ba31]/25"
                      }`}
                  >
                    <span>No {activeTab === "Bank" ? "bKash / Nagad" : "USDT"} wallet bound. Tap to add</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Withdrawal Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"
                      }`}
                  >
                    Withdrawal Amount ({activeTab === "Bank" ? "in BDT / Tk" : "in USDT"})
                  </label>
                  <span
                    className={`text-[11px] font-semibold ${isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                  >
                    Withdrawable:{" "}
                    <span className={isLight ? "text-amber-600 font-bold" : "text-[#f5ba31] font-bold"}>
                      {activeTab === "Bank"
                        ? `${withdrawableBDT.toFixed(2)} Tk`
                        : `${withdrawableUSDT.toFixed(2)} USDT`}
                    </span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder={
                      activeTab === "Bank"
                        ? "Min: 250 BDT"
                        : "Min: 6 USDT ($6.00)"
                    }
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full pl-3.5 pr-14 py-3 rounded-2xl border text-sm font-semibold outline-none focus:border-[#f5ba31] ${isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                      : "bg-[#020a1f] border-slate-700 text-white placeholder-slate-500"
                      }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(
                        activeTab === "Bank"
                          ? String(withdrawableBDT.toFixed(2))
                          : String(withdrawableUSDT.toFixed(2))
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#f5ba31] to-[#ffd369] text-[#020a1f] text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-xs"
                  >
                    All
                  </button>
                </div>

                {/* Live Breakdown Box */}
                {numAmount > 0 && (
                  <div
                    className={`mt-2.5 p-3 rounded-2xl border text-xs space-y-1.5 ${isLight
                      ? "bg-slate-50 border-slate-200"
                      : "bg-white/5 border-white/10"
                      }`}
                  >
                    <div
                      className={`flex justify-between font-semibold ${isLight ? "text-slate-600" : "text-slate-300"
                        }`}
                    >
                      <span>10% Platform Fee:</span>
                      <span className={isLight ? "text-rose-600 font-bold" : "text-rose-400 font-bold"}>
                        {activeTab === "Bank"
                          ? `- ${(numAmount * 0.1).toFixed(2)} BDT`
                          : `- ${(numAmount * 0.1).toFixed(2)} USDT`}
                      </span>
                    </div>

                    <div
                      className={`flex justify-between font-bold border-t pt-1.5 ${isLight
                        ? "border-slate-200 text-slate-900"
                        : "border-white/10 text-white"
                        }`}
                    >
                      <span>Net Arrival:</span>
                      <span className={isLight ? "text-emerald-600 font-black text-sm" : "text-emerald-400 font-black text-sm"}>
                        {activeTab === "Bank"
                          ? `TK ${(numAmount * 0.9).toFixed(2)}`
                          : `${(numAmount * 0.9).toFixed(2)} USDT`}
                      </span>
                    </div>

                    <div
                      className={`flex justify-between font-medium text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                    >
                      <span>Equivalent:</span>
                      <span className={isLight ? "text-amber-700 font-mono font-bold" : "text-[#ffd369] font-mono"}>
                        {activeTab === "Bank"
                          ? `≈ ${((numAmount * 0.9) / usdtRate).toFixed(4)} USDT`
                          : `≈ TK ${((numAmount * 0.9) * usdtRate).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Withdrawal Password Input */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"
                    }`}
                >
                  Withdrawal Password
                </label>
                <div
                  className={`flex items-center px-3.5 py-1 rounded-2xl border focus-within:border-[#f5ba31] ${isLight
                    ? "bg-slate-50 border-slate-200"
                    : "bg-[#020a1f] border-slate-700"
                    }`}
                >
                  <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="Enter Your Withdraw Password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    className={`w-full py-2.5 bg-transparent text-sm font-semibold outline-none ${isLight
                      ? "text-slate-800 placeholder-slate-400"
                      : "text-white placeholder-slate-500"
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold-premium w-full py-4 rounded-2xl text-base disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit Withdrawal"}
              </button>
            </form>
          </div>

          {/* Operating Rules List */}
          <div
            className={`p-4 rounded-3xl shadow-lg text-xs leading-relaxed space-y-2 border ${isLight
              ? "bg-white/95 border-amber-200/80 text-slate-700"
              : "bg-[#04102e]/85 border-[#f5ba31]/30 text-slate-200"
              }`}
          >
            <div
              className={`font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider pb-1 border-b ${isLight
                ? "text-amber-700 border-slate-200"
                : "text-[#f5ba31] border-white/10"
                }`}
            >
              <ShieldAlert size={14} />
              <span>Withdrawal Rules & Guidelines</span>
            </div>
            <p className="font-medium">
              1. Minimum withdrawal: <strong className={isLight ? "text-slate-900 font-bold" : "text-white"}>250 BDT</strong> (bKash / Nagad) or <strong className={isLight ? "text-slate-900 font-bold" : "text-white"}>6 USDT</strong> ($6.00).
            </p>
            <p className="font-medium">
              2. Welcome Deposit Reserve: The <strong className={isLight ? "text-amber-700 font-bold" : "text-amber-300 font-bold"}>500 BDT sign-up bonus</strong> is a permanent non-withdrawable reserve balance. Only funds above 500 BDT (deposits + earnings) are withdrawable.
            </p>
            <p className="font-medium">
              3. Withdrawal processing hours: <strong className={isLight ? "text-slate-900 font-bold" : "text-white"}>9:00 AM to 5:00 PM</strong> (17:00).
            </p>
            <p className="font-medium">
              4. Platform fee: <strong className={isLight ? "text-slate-900 font-bold" : "text-white"}>10%</strong> fee is deducted upon arrival.
            </p>
            <p className="font-medium">
              5. Working days: <strong className={isLight ? "text-slate-900 font-bold" : "text-white"}>Sunday to Thursday</strong> (<span className={isLight ? "text-rose-600 font-semibold" : "text-rose-400 font-semibold"}>Friday and Saturday are weekly holidays</span>).
            </p>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
