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

  const [balance, setBalance] = useState<number>(0);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [activeTab, setActiveTab] = useState<"Bank" | "USDT">("Bank");

  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [withdrawPassword, setWithdrawPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    // Fetch live user balance
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setBalance(data.user.balance);
      })
      .catch(() => { });

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

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
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
        setError(
          "Please bind a bKash or Nagad wallet first in 'My Bank'."
        );
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
          amount: Number(amount),
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
      setBalance(data.newBalance);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Withdraw" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Withdrawal Amount Header & Rate Pill */}
          <div className="text-center py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="text-3xl font-black text-white mt-1 flex items-baseline justify-center gap-1">
              <span>{Number(balance).toFixed(2)}</span>
              <span className="text-sm font-bold text-[#f5ba31]">USDT</span>
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">
              ≈ {(Number(balance) * usdtRate).toFixed(2)} BDT
            </div>
            <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#f5ba31]/20 border border-[#f5ba31]/60 text-[#f5ba31] text-xs font-bold shadow-[0_0_10px_rgba(245,186,49,0.2)]">
              1 USDT = {usdtRate} BDT (Min: 5 USDT)
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Form Container with Tabs */}
          <div className="rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-[#020a1f]/80 border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("Bank")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "Bank"
                  ? "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <Building size={16} />
                <span>Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("USDT")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "USDT"
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
                          ? w.usdtAddress?.slice(0, 15) + "..."
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
                    <span>No {activeTab} wallet bound. Tap to add wallet</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Withdrawal Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Withdrawal Amount (in USDT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter amount in USDT (Min: 5)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-[#f5ba31]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(String(balance))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#f5ba31] text-[#020a1f] text-[10px] font-black"
                  >
                    All
                  </button>
                </div>
                {amount && Number(amount) > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-slate-400">
                      <span>10% Platform Fee:</span>
                      <span className="text-rose-400 font-bold">
                        -{(Number(amount) * 0.1).toFixed(2)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1">
                      <span>Arrival Amount:</span>
                      <span className="text-[#00e676] font-black">
                        {(Number(amount) * 0.9).toFixed(2)} USDT
                      </span>
                    </div>
                    {activeTab === "Bank" && (
                      <div className="flex justify-between font-black text-white text-[11px] bg-white/5 p-1.5 rounded-lg border border-white/10">
                        <span>bKash / Nagad Arrival:</span>
                        <span className="text-[#f5ba31]">
                          {((Number(amount) * 0.9) * usdtRate).toFixed(2)} BDT
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Withdrawal Password Input */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-base shadow-[0_0_20px_rgba(245,186,49,0.35)] active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Operating Rules List */}
          <div className="p-4 rounded-3xl bg-[#04102e]/85 border border-[#f5ba31]/30 shadow-lg text-xs leading-relaxed text-slate-300 space-y-2">
            <p className="font-semibold text-white">
              1. Minimum withdrawal Amount 250 BDT / 5 USDT
            </p>
            <p className="font-semibold text-blue-950">
              2. Withdraw time 9:00 am to 17:00 pm
            </p>
            <p className="font-semibold text-blue-950">
              3. Withdrawal fee 10%
            </p>
            <p className="font-semibold text-blue-950">
              4. Withdrawal time Sunday to Thursday (
              <span className="text-red-600">
                Friday and Saturday are weekly holidays
              </span>
              ).
            </p>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

