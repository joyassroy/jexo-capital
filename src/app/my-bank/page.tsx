"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import {
  Building2,
  Coins,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Lock,
  Copy,
  Headphones,
  ShieldCheck,
  Info,
  ChevronDown,
  Check,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface Wallet {
  _id?: string;
  bankType: "bKash" | "Nagad" | "USDT-BEP20";
  realName: string;
  accountNumber: string;
  usdtAddress?: string;
  status?: "pending" | "approved" | "rejected";
  isLocked?: boolean;
}

export default function MyBankPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"Bank" | "USDT">("Bank");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [realName, setRealName] = useState("");
  const [bankType, setBankType] = useState<"bKash" | "Nagad">("bKash");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBankDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      // Client-side BEP-20 validation
      if (activeTab === "USDT") {
        const trimmed = usdtAddress.trim();
        const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
        if (!bep20Regex.test(trimmed)) {
          setError(
            "Invalid USDT (BEP-20) address. It must start with 0x and have 42 characters."
          );
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName: realName.trim(),
          bankType: type,
          accountNumber: activeTab === "Bank" ? accountNumber.trim() : "",
          usdtAddress: activeTab === "USDT" ? usdtAddress.trim() : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save wallet.");
        setLoading(false);
        return;
      }

      const successMsg = data.message || `${type} account bound successfully and locked!`;
      setSuccess(successMsg);
      toast.success(successMsg);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Wallet details copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header
          title={
            showAddForm
              ? activeTab === "Bank"
                ? "Bind Bank Card"
                : "Bind USDT Address"
              : "My Bank"
          }
          showBack={true}
        />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-100 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2">
              <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
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
                  setError("");
                }}
                className={`py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === "Bank"
                    ? "bg-[#04102e] text-[#f5ba31] border-b-2 border-[#f5ba31] shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 size={16} />
                <span>bKash / Nagad</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("USDT");
                  setShowAddForm(false);
                  setError("");
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
                    <div className="space-y-4">
                      {/* Active Bound Wallet Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#07173e]/90 to-[#030e28]/95 border border-[#f5ba31]/40 text-left space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                            {activeTab === "USDT" ? (
                              <Coins size={15} />
                            ) : (
                              <Building2 size={15} />
                            )}
                            <span>{currentWallet.bankType}</span>
                          </span>

                          {/* Instant Bound & Locked Badge */}
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <ShieldCheck size={11} /> Bound & Locked
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Account Holder
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {currentWallet.realName}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {currentWallet.bankType === "USDT-BEP20"
                              ? "USDT Address (BEP-20)"
                              : "Account Number"}
                          </div>
                          <div className="mt-1 p-2.5 rounded-xl bg-[#020a1f] border border-white/10 flex items-center justify-between gap-2">
                            <div className="text-xs font-mono font-semibold text-slate-100 break-all select-all">
                              {currentWallet.bankType === "USDT-BEP20"
                                ? currentWallet.usdtAddress
                                : currentWallet.accountNumber}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  (currentWallet.bankType === "USDT-BEP20"
                                    ? currentWallet.usdtAddress
                                    : currentWallet.accountNumber) || ""
                                )
                              }
                              className="p-1 rounded text-slate-400 hover:text-white shrink-0 active:scale-90 transition-all"
                              title="Copy"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Locked Notice & Support Button (Replaces Edit button) */}
                      <div className="p-4 rounded-2xl bg-[#020a1f]/90 border border-slate-700/80 text-center space-y-2.5">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                          <Lock size={14} className="shrink-0" />
                          <span>Account Locked for Security</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Bank details can only be bound once. If you need to update or change your account number, please contact Customer Service for admin permission.
                        </p>
                        <Link
                          href="/service"
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold active:scale-95 transition-all shadow-sm"
                        >
                          <Headphones size={14} />
                          <span>Contact Support to Modify</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* 3D Bank / Crypto Placeholder for Unbound state */
                    <>
                      <div className="my-5 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f] flex items-center justify-center shadow-[0_0_25px_rgba(245,186,49,0.35)] border-2 border-white/40">
                          {activeTab === "Bank" ? (
                            <Building2 size={40} />
                          ) : (
                            <Coins size={40} />
                          )}
                        </div>
                        <span className="text-sm font-extrabold text-white mt-3 tracking-wide">
                          {activeTab === "Bank" ? "BANK CARD" : "USDT (BEP-20)"}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {activeTab === "Bank"
                            ? "Bind bKash or Nagad"
                            : "Bind Binance Smart Chain address"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(true);
                          setError("");
                        }}
                        className="w-full py-3 rounded-full font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f] shadow-[0_0_15px_rgba(245,186,49,0.35)] hover:brightness-105"
                      >
                        <PlusCircle size={18} />
                        <span>
                          {activeTab === "Bank"
                            ? "Bind Bank Card"
                            : "Bind USDT Address"}
                        </span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* Add Wallet Form (Can be submitted only once) */
                <form onSubmit={handleSaveWallet} className="space-y-4 text-left">
                  {/* Warning Notice */}
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <Info size={15} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>One-Time Setup:</strong> You can only bind your account once. Please double-check your information carefully before submitting.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Please enter your real name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter real name matching your account"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white outline-none focus:border-[#f5ba31]"
                      required
                    />
                  </div>

                  {activeTab === "Bank" ? (
                    <>
                      <div className="relative" ref={bankDropdownRef}>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Please select your MFS Provider
                        </label>

                        {/* Custom Dropdown Trigger */}
                        <button
                          type="button"
                          onClick={() => setIsBankDropdownOpen((prev) => !prev)}
                          className="w-full h-[48px] px-3.5 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white outline-none flex items-center justify-between hover:border-[#f5ba31]/60 focus:border-[#f5ba31] transition-all select-none active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-2.5">
                            {bankType === "bKash" ? (
                              <span className="px-2.5 py-1 rounded-lg bg-[#e2136e] text-white text-[11px] font-black tracking-wide shadow-xs">
                                bKash
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#f7941d] text-white text-[11px] font-black tracking-wide shadow-xs">
                                Nagad
                              </span>
                            )}
                            <span className="font-extrabold text-white text-sm">
                              {bankType === "bKash" ? "bKash (বিকাশ)" : "Nagad (নগদ)"}
                            </span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${
                              isBankDropdownOpen ? "rotate-180 text-[#f5ba31]" : ""
                            }`}
                          />
                        </button>

                        {/* Custom Animated Dropdown Menu Panel */}
                        {isBankDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[#030e26]/98 backdrop-blur-xl border-2 border-[#f5ba31]/60 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(245,186,49,0.3)] overflow-hidden p-1.5 space-y-1">
                            {/* bKash Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setBankType("bKash");
                                setIsBankDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                bankType === "bKash"
                                  ? "bg-[#f5ba31]/20 border border-[#f5ba31]/50 text-white font-black"
                                  : "text-slate-200 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#e2136e] flex items-center justify-center text-white text-xs font-black shadow-sm">
                                  bK
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-extrabold text-white leading-tight">
                                    bKash
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">
                                    বিকাশ ওয়ালেট (Personal)
                                  </div>
                                </div>
                              </div>
                              {bankType === "bKash" && (
                                <Check size={18} className="text-[#f5ba31] stroke-[3]" />
                              )}
                            </button>

                            {/* Nagad Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setBankType("Nagad");
                                setIsBankDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                bankType === "Nagad"
                                  ? "bg-[#f5ba31]/20 border border-[#f5ba31]/50 text-white font-black"
                                  : "text-slate-200 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#f7941d] flex items-center justify-center text-white text-xs font-black shadow-sm">
                                  Na
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-extrabold text-white leading-tight">
                                    Nagad
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">
                                    নগদ ওয়ালেট (Personal)
                                  </div>
                                </div>
                              </div>
                              {bankType === "Nagad" && (
                                <Check size={18} className="text-[#f5ba31] stroke-[3]" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Please enter the Account Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Account Number (e.g. 017xxxxxxxx)"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white outline-none focus:border-[#f5ba31]"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Network / Cryptocurrency
                        </label>
                        <div className="w-full px-3.5 py-2.5 rounded-2xl bg-[#020a1f]/80 border border-cyan-500/40 text-xs font-bold text-cyan-400 flex items-center justify-between">
                          <span>USDT (BEP-20)</span>
                          <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">
                            BNB Smart Chain
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                          <span>USDT (BEP-20) Address</span>
                          <span className="text-[10px] text-slate-400">Starts with 0x</span>
                        </label>
                        <input
                          type="text"
                          placeholder="0x8f83d56dac8403238181a32f4e766d68529d9cad"
                          value={usdtAddress}
                          onChange={(e) => setUsdtAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#020a1f] border border-slate-700 text-xs font-mono font-semibold text-white outline-none focus:border-[#f5ba31] placeholder:text-slate-600"
                          required
                        />
                        <div className="text-[10px] text-slate-400 mt-1">
                          Supported format: 42-character Binance Smart Chain BEP-20 address.
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-gold-premium w-full py-3.5 rounded-2xl font-black text-sm active:scale-98 transition-all disabled:opacity-50"
                    >
                      {loading ? "Binding Account..." : "Confirm & Lock Account"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="w-full py-2.5 rounded-full border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-white/5"
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
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>Important Guidelines</span>
            </p>
            <p>1. For local currency withdrawals, bKash and Nagad are accepted.</p>
            <p>
              2. For crypto withdrawals, provide a valid <strong>USDT (BEP-20)</strong> address on Binance Smart Chain.
            </p>
            <p>
              3. <strong>One-Time Setup:</strong> For your security, account details can only be bound once. To modify an existing account, admin permission is required.
            </p>
            <p>4. Please double-check your account number or address before confirming.</p>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
