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
      .catch(() => {});

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
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Withdraw" showBack={true} />

        <div className="p-4 space-y-4">
          {/* Withdrawal Amount Header & Rate Pill */}
          <div className="text-center py-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Withdrawal Ammount
            </span>
            <div className="text-3xl font-black text-blue-950 mt-1">
              {Number(balance).toFixed(2)}
            </div>
            <div className="mt-2 inline-block px-4 py-1 rounded-full bg-blue-100/90 text-blue-800 text-xs font-bold shadow-inner">
              1 USDT (BEP-20) = {usdtRate} BDT
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Form Container with Tabs */}
          <div className="rounded-3xl bg-white shadow-md border border-blue-200 overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-blue-50/70 border-b border-blue-100">
              <button
                type="button"
                onClick={() => setActiveTab("Bank")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === "Bank"
                    ? "bg-white text-blue-700 border-b-2 border-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <Building size={16} />
                <span>Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("USDT")}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === "USDT"
                    ? "bg-white text-blue-700 border-b-2 border-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-blue-600"
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
                    className="w-full px-3.5 py-3 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
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
                    className="w-full px-3.5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between hover:bg-amber-100 transition-colors"
                  >
                    <span>No {activeTab} wallet bound. Tap to add wallet</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Withdrawal Amount Input */}
              <div>
                <input
                  type="number"
                  placeholder="Withdrawal amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500"
                  required
                />
                {amount && Number(amount) > 0 && (
                  <div className="mt-1.5 px-2 text-[11px] font-semibold text-gray-500 flex justify-between">
                    <span>10% fee: {(Number(amount) * 0.1).toFixed(2)} TK</span>
                    <span className="text-emerald-600 font-bold">
                      Arrival: {(Number(amount) * 0.9).toFixed(2)} TK
                    </span>
                  </div>
                )}
              </div>

              {/* Withdrawal Password Input */}
              <div className="flex items-center px-3.5 py-1 rounded-2xl bg-blue-50/50 border border-blue-200 focus-within:border-blue-500">
                <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  placeholder="Enter Your Withdraw Password"
                  value={withdrawPassword}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                  className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Operating Rules List */}
          <div className="p-4 rounded-3xl bg-white/95 border border-blue-200 shadow-sm text-xs leading-relaxed text-gray-700 space-y-2">
            <p className="font-semibold text-blue-950">
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

