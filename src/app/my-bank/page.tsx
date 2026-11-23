"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Building2, Coins, PlusCircle, CheckCircle, AlertCircle } from "lucide-react";

interface Wallet {
  _id?: string;
  bankType: "bKash" | "Nagad" | "USDT-BEP20";
  realName: string;
  accountNumber: string;
  usdtAddress?: string;
}

export default function MyBankPage() {
  const [activeTab, setActiveTab] = useState<"Bank" | "USDT">("Bank");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [realName, setRealName] = useState("");
  const [bankType, setBankType] = useState<"bKash" | "Nagad">("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchWallets = () => {
    fetch("/api/user/wallets")
      .then((res) => res.json())
      .then((data) => {
        if (data?.wallets) setWallets(data.wallets);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const type = activeTab === "Bank" ? bankType : "USDT-BEP20";
      const res = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName,
          bankType: type,
          accountNumber: activeTab === "Bank" ? accountNumber : "",
          usdtAddress: activeTab === "USDT" ? usdtAddress : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save wallet.");
        setLoading(false);
        return;
      }

      setSuccess("Wallet saved successfully!");
      setShowAddForm(false);
      fetchWallets();
      setLoading(false);
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const currentWallet = wallets.find((w) =>
    activeTab === "Bank"
      ? w.bankType === "bKash" || w.bankType === "Nagad"
      : w.bankType === "USDT-BEP20"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header
          title={
            showAddForm
              ? activeTab === "Bank"
                ? "Bank Card Information"
                : "USDT Card Information"
              : "My Bank"
          }
          showBack={true}
        />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Outer Card with Tabs */}
          <div className="rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-[#020a1f]/80 border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Bank");
                  setShowAddForm(false);
                }}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === "Bank"
                    ? "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 size={16} />
                <span>Bank</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("USDT");
                  setShowAddForm(false);
                }}
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

            {/* Display / Add Form Area */}
            <div className="p-5 text-center">
              {!showAddForm ? (
                <>
                  {currentWallet ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-left space-y-1 mb-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 uppercase">
                          {currentWallet.bankType} Wallet
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                          Bound
                        </span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">
                        {currentWallet.realName}
                      </div>
                      <div className="text-xs font-mono text-gray-600 break-all">
                        {currentWallet.bankType === "USDT-BEP20"
                          ? currentWallet.usdtAddress
                          : currentWallet.accountNumber}
                      </div>
                    </div>
                  ) : (
                    /* 3D Bank / Crypto Illustration Placeholder */
                    <div className="my-4 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-400 to-cyan-300 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        {activeTab === "Bank" ? (
                          <Building2 size={48} />
                        ) : (
                          <Coins size={48} />
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-blue-950 mt-3">
                        {activeTab === "Bank" ? "BANK" : "USDT"}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (currentWallet) {
                        setRealName(currentWallet.realName);
                        if (currentWallet.bankType !== "USDT-BEP20") {
                          setBankType(currentWallet.bankType as "bKash" | "Nagad");
                          setAccountNumber(currentWallet.accountNumber);
                        } else {
                          setUsdtAddress(currentWallet.usdtAddress || "");
                        }
                      }
                      setShowAddForm(true);
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={18} />
                    <span>
                      {currentWallet
                        ? `Update ${activeTab === "Bank" ? "bank" : "USDT"}`
                        : `Add ${activeTab === "Bank" ? "bank" : "USDT"}`}
                    </span>
                  </button>
                </>
              ) : (
                /* Add Wallet Form (Screens 14 & 15) */
                <form onSubmit={handleSaveWallet} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-1">
                      Please enter your real name
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter your real name"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none"
                      required
                    />
                  </div>

                  {activeTab === "Bank" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 mb-1">
                          Please enter your bank card
                        </label>
                        <select
                          value={bankType}
                          onChange={(e) =>
                            setBankType(e.target.value as "bKash" | "Nagad")
                          }
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none"
                        >
                          <option value="bKash">bKash</option>
                          <option value="Nagad">Nagad</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-blue-900 mb-1">
                          Please select the account Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Account Number (e.g. 017xxxxxxxx)"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-blue-900 mb-1">
                          Please select your cryptocurrency account.
                        </label>
                        <input
                          type="text"
                          disabled
                          value="USDT (BEP-20)"
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-blue-900 mb-1">
                          Please enter your USDT (BEP-20) address
                        </label>
                        <input
                          type="text"
                          placeholder="USDT (BEP-20) address"
                          value={usdtAddress}
                          onChange={(e) => setUsdtAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs font-mono font-semibold text-gray-800 outline-none"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm shadow-md active:scale-98 transition-all disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="w-full py-2 rounded-full border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Info Box Guidelines */}
          <div className="p-4 rounded-3xl bg-[#04102e]/85 border border-[#f5ba31]/30 shadow-lg text-xs leading-relaxed text-slate-300 space-y-2">
            <p>1. For withdrawals to a bank card, only bKash and Nagad are applicable.</p>
            <p>2. If you wish to receive payments via cryptocurrency, please add a cryptocurrency.</p>
            <p>3. To receive funds, you must select a USDT (BEP-20) address.</p>
            <p>4. You can use one wallet per account.</p>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

