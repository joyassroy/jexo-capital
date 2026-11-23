"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import {
  Building2,
  Coins,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

interface Wallet {
  _id?: string;
  bankType: "bKash" | "Nagad" | "USDT-BEP20";
  realName: string;
  accountNumber: string;
  usdtAddress?: string;
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
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

      // Client-side BEP-20 validation
      if (activeTab === "USDT") {
        const trimmed = usdtAddress.trim();
        const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
        if (!bep20Regex.test(trimmed)) {
          setError(
            "Invalid USDT (BEP-20) address. It must start with 0x and have 42 characters (e.g. 0x8f83d56dac8403238181a32f4e766d68529d9cad)."
          );
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName,
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

      setSuccess(
        data.message ||
          "Wallet bound successfully and submitted for admin verification!"
      );
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
    alert("Copied to clipboard!");
  };

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
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold rounded-2xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-2xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle size={16} className="shrink-0" />
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
                <span>Bank</span>
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
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#07173e]/90 to-[#030e28]/95 border border-[#f5ba31]/40 text-left space-y-2 mb-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          {activeTab === "USDT" ? <Coins size={14} /> : <Building2 size={14} />}
                          <span>{currentWallet.bankType}</span>
                        </span>

                        {/* Verification Status Badge */}
                        {currentWallet.status === "approved" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <CheckCircle size={10} /> Verified
                          </span>
                        ) : currentWallet.status === "rejected" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <XCircle size={10} /> Rejected
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <Clock size={10} /> Pending Verification
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-white">
                        {currentWallet.realName}
                      </div>

                      <div className="p-2 rounded-xl bg-[#020a1f] border border-white/10 flex items-center justify-between gap-2">
                        <div className="text-xs font-mono text-slate-200 break-all select-all">
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
                          className="p-1 rounded text-slate-400 hover:text-white shrink-0"
                          title="Copy"
                        >
                          <Copy size={13} />
                        </button>
                      </div>

                      {/* Rejection Alert Box */}
                      {currentWallet.status === "rejected" && (
                        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1 text-rose-400">
                            <AlertCircle size={14} />
                            <span>Verification Notice:</span>
                          </div>
                          <p className="leading-relaxed">
                            {currentWallet.rejectionReason ||
                              "Your account details could not be verified by admin."}
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Please click <strong>Update</strong> below to correct your address and re-submit.
                          </p>
                        </div>
                      )}

                      {/* Pending notice */}
                      {currentWallet.status === "pending" && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
                          <Clock size={13} className="shrink-0" />
                          <span>Admin verification in progress. You can still re-edit if needed.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 3D Bank / Crypto Illustration Placeholder */
                    <div className="my-4 flex flex-col items-center justify-center">
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
                      setError("");
                    }}
                    className={`w-full py-3 rounded-full font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 ${
                      currentWallet?.status === "rejected"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                        : "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f] shadow-[0_0_15px_rgba(245,186,49,0.35)]"
                    }`}
                  >
                    <PlusCircle size={18} />
                    <span>
                      {currentWallet
                        ? currentWallet.status === "rejected"
                          ? `Re-apply ${activeTab === "Bank" ? "Bank Card" : "USDT Address"}`
                          : `Update ${activeTab === "Bank" ? "Bank Card" : "USDT Address"}`
                        : `Add ${activeTab === "Bank" ? "Bank Card" : "USDT Address"}`}
                    </span>
                  </button>
                </>
              ) : (
                /* Add Wallet Form */
                <form onSubmit={handleSaveWallet} className="space-y-4 text-left">
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
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Please select your bank / MFS
                        </label>
                        <select
                          value={bankType}
                          onChange={(e) =>
                            setBankType(e.target.value as "bKash" | "Nagad")
                          }
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white outline-none focus:border-[#f5ba31]"
                        >
                          <option value="bKash">bKash</option>
                          <option value="Nagad">Nagad</option>
                        </select>
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
                      className="w-full py-3 rounded-full bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f] font-black text-sm shadow-[0_0_15px_rgba(245,186,49,0.35)] active:scale-98 transition-all disabled:opacity-50"
                    >
                      {loading ? "Submitting for Verification..." : "Confirm & Submit"}
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
              2. For international USDT withdrawals, you must provide a valid <strong>USDT (BEP-20)</strong> address starting with <code>0x</code>.
            </p>
            <p>
              3. Once submitted, your wallet will be reviewed by admin. If rejected, an alert with the reason will be sent to your <strong>Notice</strong> page.
            </p>
            <p>4. Please double-check your address before confirming.</p>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
