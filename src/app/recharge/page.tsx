"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import {
  Copy,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Coins,
  QrCode,
  Check,
} from "lucide-react";

export default function RechargePage() {
  const router = useRouter();

  // Settings & User state
  const [balance, setBalance] = useState<number>(0);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [adminBkash, setAdminBkash] = useState<string>("01728967166");
  const [adminNagad, setAdminNagad] = useState<string>("01812345678");
  const [adminUsdtAddress, setAdminUsdtAddress] = useState<string>(
    "TKrvSHzuR9CcvRwPGiDDb7kzPvCGU3jtyi"
  );

  // Form states
  const [amount, setAmount] = useState<string>("500");
  const [step, setStep] = useState<"select_amount" | "bank_step2" | "bank_step3" | "usdt_step2">("select_amount");
  const [showMethodModal, setShowMethodModal] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "usdt">("bank");

  // Step 2 Bank form
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [paymentChannel, setPaymentChannel] = useState<"bKash" | "Nagad">("bKash");

  // Step 3 Bank form
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);
  const [transferType, setTransferType] = useState<"send_money" | "payment">("send_money");
  const [transactionId, setTransactionId] = useState<string>("");

  // USDT form
  const [usdtTxId, setUsdtTxId] = useState<string>("");

  // Feedback states
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setBalance(data.user.balance);
      })
      .catch(() => { });

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setUsdtRate(data.settings.usdtRateBDT || 127);
          setAdminBkash(data.settings.bkashNumber || "01728967166");
          setAdminNagad(data.settings.nagadNumber || "01812345678");
          setAdminUsdtAddress(
            data.settings.usdtBep20Address ||
            "TKrvSHzuR9CcvRwPGiDDb7kzPvCGU3jtyi"
          );
        }
      })
      .catch(() => { });
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleInitialRechargeClick = () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please select or enter an amount.");
      return;
    }
    setError("");
    setShowMethodModal(true);
  };

  const handleConfirmMethod = () => {
    setShowMethodModal(false);
    if (selectedMethod === "bank") {
      setStep("bank_step2");
    } else {
      setStep("usdt_step2");
    }
  };

  // Submit Bank Deposit (Step 3)
  const handleBankDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAgreed) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    if (!transactionId || transactionId.trim() === "") {
      setError("Please enter the 10-digit Transaction ID (TxID).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          method: paymentChannel,
          senderNumber,
          transferType,
          transactionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Deposit submission failed.");
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      setTimeout(() => {
        router.push("/recharge-record");
      }, 1500);
    } catch {
      setError("Failed to submit deposit. Please try again.");
      setLoading(false);
    }
  };

  // Submit USDT Deposit
  const handleUsdtDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usdtTxId || usdtTxId.trim() === "") {
      setError("Please enter the USDT TxID / Hash.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          method: "USDT-BEP20",
          senderNumber: "USDT-Sender",
          transferType: "send_money",
          transactionId: usdtTxId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "USDT deposit submission failed.");
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      setTimeout(() => {
        router.push("/recharge-record");
      }, 1500);
    } catch {
      setError("Failed to submit deposit. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header
          title={
            step === "select_amount"
              ? "Recharge"
              : step === "bank_step2"
                ? "Please Complete Your Recharge"
                : step === "bank_step3"
                  ? "Payment"
                  : "USDT"
          }
          showBack={true}
        />

        {/* Global Notifications */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: Amount Selection (Screens 9 & 10)
        ========================================================================= */}
        {step === "select_amount" && (
          <div className="p-4 space-y-4 max-w-[420px] mx-auto">
            {/* Live Balance Card */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg">
              <span className="text-sm font-bold text-slate-300">Account Balance</span>
              <div className="text-right">
                <span className="text-xl font-black text-white">
                  {Number(balance).toFixed(2)} <span className="text-[#f5ba31]">USDT</span>
                </span>
                <span className="text-xs text-slate-400 font-semibold block">
                  ≈ {(Number(balance) * usdtRate).toFixed(2)} BDT
                </span>
              </div>
            </div>

            {/* Amount Selection Card */}
            <div className="p-4 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg">
              <h2 className="text-base font-bold text-[#f5ba31] mb-3 text-center">
                Please select the recharge amount (in BDT)
              </h2>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {["500", "1000", "1270", "2540", "5000"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${amount === val
                      ? "bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black shadow-[0_0_12px_rgba(245,186,49,0.4)] scale-102"
                      : "bg-[#020a1f] text-slate-200 border border-slate-700 hover:border-[#f5ba31]/60"
                      }`}
                  >
                    <div>{val} TK</div>
                    <div className="text-[10px] opacity-80 font-normal">
                      ≈ ${(Number(val) / usdtRate).toFixed(1)}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${!["500", "1000", "1270", "2540", "5000"].includes(amount)
                    ? "bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black shadow-[0_0_12px_rgba(245,186,49,0.4)]"
                    : "bg-[#020a1f] text-slate-200 border border-slate-700 hover:border-[#f5ba31]/60"
                    }`}
                >
                  Others
                </button>
              </div>

              {/* Custom Input & Recharge Button */}
              <div className="flex items-center gap-2 bg-[#020a1f] p-1.5 rounded-2xl border border-slate-700 focus-within:border-[#f5ba31]">
                <input
                  type="number"
                  placeholder="Enter amount in BDT (Taka)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                />
                <button
                  onClick={handleInitialRechargeClick}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-sm shadow-[0_0_15px_rgba(245,186,49,0.35)] hover:opacity-95 active:scale-95 transition-all flex-shrink-0"
                >
                  Recharge
                </button>
              </div>

              {/* Real-time conversion badge */}
              {amount && Number(amount) > 0 && (
                <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-inner">
                  <span>Recharge Amount: {amount} BDT</span>
                  <span className="text-[#00e676] font-black">
                    Account receives: ≈ {(Number(amount) / usdtRate).toFixed(2)} USDT (1$ = {usdtRate} Tk)
                  </span>
                </div>
              )}
            </div>

            {/* Instruction Box 1 */}
            <div className="p-4 rounded-2xl bg-white/95 border border-blue-200 shadow-sm text-xs leading-relaxed text-gray-700 space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Please make a copy of the payee, account, reference and
                  amount. Please make sure to enter the correct reference
                  information, otherwise you will not be able to top up
                  successfully. The transfer amount must be the same as the top-up
                  amount. The recipient account may change from time to time; do
                  not save previous accounts.
                </p>
              </div>
            </div>

            {/* Instruction Box 2: USDT note */}
            <div className="p-4 rounded-2xl bg-white/95 border border-blue-200 shadow-sm text-xs leading-relaxed text-gray-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  USDT top-up 1 USDT = {usdtRate} BDT. USDT top-ups will arrive in
                  your account within 30 minutes. If it does not arrive within 30
                  minutes, please contact your Regional Manager.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            METHOD OF PAYMENT MODAL (Screen 10)
        ========================================================================= */}
        {showMethodModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl border-2 border-blue-200 animate-slideUp">
              <h3 className="text-base font-bold text-blue-950 mb-4 tracking-tight">
                Method of payment
              </h3>

              <div className="space-y-3">
                {/* Local Bank (bKash/Nagad) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("bank")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${selectedMethod === "bank"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-800">
                        Method of payment
                      </div>
                      <div className="text-[11px] text-gray-500">
                        bKash, Nagad Mobile Wallets
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "bank" && (
                    <CheckCircle2 size={20} className="text-blue-600" />
                  )}
                </button>

                {/* USDT BEP-20 */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("usdt")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${selectedMethod === "usdt"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <Coins size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-800">
                        USDT (BEP-20)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Cryptocurrency transfer (Rate: {usdtRate} BDT)
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "usdt" && (
                    <CheckCircle2 size={20} className="text-blue-600" />
                  )}
                </button>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmMethod}
                  className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className="w-full py-2.5 rounded-2xl border border-blue-200 text-blue-700 font-semibold text-xs hover:bg-blue-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: Bank Channel & Sender Input (Screen 11)
        ========================================================================= */}
        {step === "bank_step2" && (
          <div className="p-4 space-y-5">
            {/* Amount Badge */}
            <div className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center shadow-lg border-2 border-blue-400/50">
              <div className="font-black text-3xl tracking-tight font-mono">
                {amount} BDT
              </div>
              <div className="text-xs font-bold text-cyan-300 mt-1">
                ≈ {(Number(amount) / usdtRate).toFixed(2)} USDT will be added to your account (1$ = {usdtRate} Tk)
              </div>
            </div>

            {/* Form */}
            <div className="p-4 rounded-3xl bg-white shadow-md border border-blue-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1.5">
                  Your Bank Number
                </label>
                <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-2.5 focus-within:border-blue-500">
                  <input
                    type="tel"
                    placeholder="016xxxxxx345"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1.5">
                  Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("bKash")}
                    className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all ${paymentChannel === "bKash"
                      ? "border-[#E2136E] bg-pink-50 text-[#E2136E]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    bKash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("Nagad")}
                    className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all ${paymentChannel === "Nagad"
                      ? "border-[#F7941D] bg-orange-50 text-[#F7941D]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Nagad
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!senderNumber || senderNumber.length < 11) {
                    setError("Please enter your valid 11-digit mobile number.");
                    return;
                  }
                  setError("");
                  setStep("bank_step3");
                }}
                className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: Admin Account & TxID Submission (Screen 12)
        ========================================================================= */}
        {step === "bank_step3" && (
          <div className="p-4 space-y-4">
            {/* Step 1. Account Information */}
            <div className="p-4 rounded-3xl bg-white shadow-md border border-blue-200">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">
                Step 1. Account Information
              </h3>
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-blue-950 font-mono">
                      {paymentChannel === "bKash" ? adminBkash : adminNagad}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          paymentChannel === "bKash" ? adminBkash : adminNagad,
                          "account"
                        )
                      }
                      className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      {copied === "account" ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-500">Amount:</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-red-600">
                      {amount} BDT
                    </span>
                    <span className="text-xs font-bold text-emerald-600 block">
                      ≈ {(Number(amount) / usdtRate).toFixed(2)} USDT credited to account
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2. Terms agreement */}
            <div className="p-4 rounded-3xl bg-white shadow-md border border-blue-200">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">
                Step 2. Agree to Terms
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span>
                  I have read and agree to the terms and conditions (Privacy Policy)
                </span>
              </label>
            </div>

            {/* Step 3. Payment Method Box & TxID input */}
            <form
              onSubmit={handleBankDepositSubmit}
              className="p-4 rounded-3xl bg-white shadow-md border border-blue-200 space-y-4"
            >
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                Step 3. Select Payment Type & Enter TxID
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setTransferType("send_money")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${transferType === "send_money"
                    ? "border-blue-600 bg-blue-50/70"
                    : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-gray-800">
                      Send Money
                    </span>
                    {transferType === "send_money" && (
                      <CheckCircle2 size={16} className="text-blue-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 leading-tight block">
                    Personal bKash/Nagad
                  </span>
                </div>

                <div
                  onClick={() => setTransferType("payment")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${transferType === "payment"
                    ? "border-blue-600 bg-blue-50/70"
                    : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-gray-800">
                      Payment
                    </span>
                    {transferType === "payment" && (
                      <CheckCircle2 size={16} className="text-blue-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 leading-tight block">
                    Merchant Payment
                  </span>
                </div>
              </div>

              {/* 10-digit TxID input */}
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  10-digit Recharge Transaction ID (TxID)
                </label>
                <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-2.5 focus-within:border-blue-500">
                  <input
                    type="text"
                    placeholder="e.g. 9EB90C53C7"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    className="w-full bg-transparent text-sm font-mono font-bold text-gray-800 outline-none uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            USDT RECHARGE SCREEN (Screen 13)
        ========================================================================= */}
        {step === "usdt_step2" && (
          <div className="p-4 space-y-4">
            {/* Cautions Notice Card */}
            <div className="p-4 rounded-3xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 space-y-1.5 shadow-sm">
              <h4 className="font-extrabold text-blue-900">Cautions:</h4>
              <p>• This address only accepts USDT (BEP-20) top-ups.</p>
              <p>• Please do not make duplicate payments or amend amounts.</p>
              <p>
                • Rate: 1 USDT = {usdtRate} BDT. Current deposit: {amount} BDT (≈{" "}
                {(Number(amount) / usdtRate).toFixed(2)} USDT).
              </p>
            </div>

            {/* Address & QR Card */}
            <div className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 text-center">
              <span className="text-xs font-bold text-gray-600 uppercase">
                Address for coin recharge (BEP-20)
              </span>

              <div className="mt-2 p-2 bg-blue-50 rounded-xl font-mono text-xs text-blue-900 break-all select-all font-semibold">
                {adminUsdtAddress}
              </div>

              {/* Dynamic QR illustration */}
              <div className="my-4 flex items-center justify-center">
                <div className="w-40 h-40 p-2 bg-white rounded-2xl border-2 border-blue-200 shadow-inner flex items-center justify-center">
                  <QrCode size={120} className="text-blue-950" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(adminUsdtAddress, "usdt")}
                className="w-full py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                {copied === "usdt" ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy address
                  </>
                )}
              </button>
            </div>

            {/* Order Amount & Hash Form */}
            <form
              onSubmit={handleUsdtDepositSubmit}
              className="p-4 rounded-3xl bg-white shadow-md border border-blue-200 space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Order amount (USDT)
                </label>
                <input
                  type="text"
                  disabled
                  value={(Number(amount) / usdtRate).toFixed(2)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-sm text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Transaction Hash / TxID
                </label>
                <input
                  type="text"
                  placeholder="Enter BEP-20 TxID / Hash"
                  value={usdtTxId}
                  onChange={(e) => setUsdtTxId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-blue-50/50 border border-blue-200 font-semibold text-sm text-gray-800 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}
      </div>

      <CityFooter />
    </div>
  );
}

