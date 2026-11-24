"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
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
      .catch(() => {});
  };

  useEffect(() => {
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
      .catch(() => {});

    // Fetch settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.usdtRateBDT) {
          setUsdtRate(data.settings.usdtRateBDT);
        }
      })
      .catch(() => {});
  }, []);

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
    const selectedWallet = wallets.find((w) => w._id === selectedWalletId);
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
      const cryptoWallet = wallets.find((w) => w.bankType === "USDT-BEP20");
      if (cryptoWallet && cryptoWallet.usdtAddress) {
        targetAccount = cryptoWallet.usdtAddress;
        method = "USDT-BEP20";
      } else {
        setError("Please bind a USDT (BEP-20) address first in 'My Bank'.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          currency: activeTab === "Bank" ? "BDT" : "USDT",
          method,
          targetAccount,
          withdrawPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Withdrawal failed.");
        setLoading(false);
        return;
      }

      setSuccess(data.message);
      fetchUserData();
      setAmount("");
      setWithdrawPassword("");
      setTimeout(() => {
        router.push("/withdraw-record");
      }, 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const currentWallets = wallets.filter((w) =>
    activeTab === "Bank"
      ? w.bankType === "bKash" || w.bankType === "Nagad"
      : w.bankType === "USDT-BEP20"
  );

  const numAmount = Number(amount) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Withdraw" showBack={true} />

        <div className="p-4 space-y-4 max-w-[440px] mx-auto">
          {/* Withdrawal Balance Card */}
          <div className="rounded-3xl bg-[#04102e]/90 backdrop-blur-md border border-[#f5ba31]/30 p-5 shadow-lg text-center space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Withdrawable Balance
              </span>
              <div className="text-3xl font-black text-[#f5ba31] mt-0.5 flex items-baseline justify-center gap-1.5 drop-shadow-[0_0_12px_rgba(245,186,49,0.3)]">
                <span>
                  {activeTab === "Bank"
                    ? `TK ${withdrawableBDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : `${withdrawableUSDT.toFixed(2)} USDT`}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">
                {activeTab === "Bank"
                  ? `≈ ${withdrawableUSDT.toFixed(2)} USDT`
                  : `≈ TK ${withdrawableBDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </div>
            </div>

            {/* Total Balance vs Bonus pill breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Assets</div>
                <div className="font-mono font-bold text-white text-xs mt-0.5">
                  TK {totalBalanceBDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {totalBalanceUSDT.toFixed(2)} USDT
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left">
                <div className="text-[10px] text-[#ffd369] font-bold uppercase flex items-center gap-1">
                  <Gift size={11} className="text-amber-400 shrink-0" />
                  <span>Reserve Bonus</span>
                </div>
                <div className="font-mono font-bold text-amber-300 text-xs mt-0.5">
                  TK {signupBonusBDT.toFixed(2)}
                </div>
                <div className="text-[10px] text-amber-400/80 font-medium">
                  Non-Withdrawable
                </div>
              </div>
            </div>

            {/* Min Withdrawal Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
              <Info size={13} className="shrink-0 text-blue-400" />
              <span>
                Min: {activeTab === "Bank" ? "250 BDT (bKash/Nagad)" : "6 USDT ($6.00)"} (1 USDT = {usdtRate} BDT)
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold rounded-2xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-2xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form Container with Tabs */}
          <div className="rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-[#020a1f]/80 border-b border-white/10">
              <button
                type="button"
                onClick={() => handleTabChange("Bank")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === "Bank"
                    ? "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building size={16} />
                <span>bKash / Nagad</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("USDT")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === "USDT"
                    ? "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Coins size={16} />
                <span>USDT-BEP20</span>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4">
              {/* Select Bank/Wallet Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Receiving Account
                </label>
                {currentWallets.length > 0 ? (
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white outline-none focus:border-[#f5ba31]"
                  >
                    {currentWallets.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.bankType}:{" "}
                        {w.bankType === "USDT-BEP20"
                          ? w.usdtAddress?.slice(0, 16) + "..."
                          : w.accountNumber}{" "}
                        ({w.realName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/my-bank")}
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#f5ba31]/15 border border-[#f5ba31]/40 text-[#f5ba31] text-xs font-bold flex items-center justify-between hover:bg-[#f5ba31]/25 transition-colors"
                  >
                    <span>No {activeTab === "Bank" ? "bKash / Nagad" : "USDT"} wallet bound. Tap to add</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Withdrawal Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Withdrawal Amount ({activeTab === "Bank" ? "in BDT / Tk" : "in USDT"})
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Withdrawable:{" "}
                    <span className="text-[#f5ba31] font-bold">
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
                    className="w-full pl-3.5 pr-14 py-3 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-[#f5ba31]"
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
                  <div className="mt-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>10% Platform Fee:</span>
                      <span className="text-rose-400 font-bold">
                        {activeTab === "Bank"
                          ? `- ${(numAmount * 0.1).toFixed(2)} BDT`
                          : `- ${(numAmount * 0.1).toFixed(2)} USDT`}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1.5">
                      <span>Net Arrival:</span>
                      <span className="text-emerald-400 font-black text-sm">
                        {activeTab === "Bank"
                          ? `TK ${(numAmount * 0.9).toFixed(2)}`
                          : `${(numAmount * 0.9).toFixed(2)} USDT`}
                      </span>
                    </div>

                    <div className="flex justify-between font-medium text-slate-400 text-[11px]">
                      <span>Equivalent:</span>
                      <span className="text-[#ffd369] font-mono">
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Withdrawal Password
                </label>
                <div className="flex items-center px-3.5 py-1 rounded-2xl bg-[#020a1f] border border-slate-700 focus-within:border-[#f5ba31]">
                  <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="Enter Your Withdraw Password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-base shadow-[0_0_20px_rgba(245,186,49,0.35)] active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit Withdrawal"}
              </button>
            </form>
          </div>

          {/* Operating Rules List */}
          <div className="p-4 rounded-3xl bg-[#04102e]/85 border border-[#f5ba31]/30 shadow-lg text-xs leading-relaxed text-slate-200 space-y-2">
            <div className="font-bold text-[#f5ba31] flex items-center gap-1.5 text-xs uppercase tracking-wider pb-1 border-b border-white/10">
              <ShieldAlert size={14} />
              <span>Withdrawal Rules & Guidelines</span>
            </div>
            <p className="font-medium text-slate-200">
              1. Minimum withdrawal: <strong className="text-white">250 BDT</strong> (bKash / Nagad) or <strong className="text-white">6 USDT</strong> ($6.00).
            </p>
            <p className="font-medium text-slate-200">
              2. Welcome Deposit Reserve: The <strong className="text-amber-300">500 BDT sign-up bonus</strong> is a permanent non-withdrawable reserve balance. Only funds above 500 BDT (deposits + earnings) are withdrawable.
            </p>
            <p className="font-medium text-slate-200">
              3. Withdrawal processing hours: <strong className="text-white">9:00 AM to 5:00 PM</strong> (17:00).
            </p>
            <p className="font-medium text-slate-200">
              4. Platform fee: <strong className="text-white">10%</strong> fee is deducted upon arrival.
            </p>
            <p className="font-medium text-slate-200">
              5. Working days: <strong className="text-white">Sunday to Thursday</strong> (<span className="text-rose-400 font-semibold">Friday and Saturday are weekly holidays</span>).
            </p>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
