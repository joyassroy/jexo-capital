"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { useTheme } from "@/context/ThemeContext";
import {
  Copy,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Coins,
  QrCode,
  Check,
  ShieldAlert,
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function RechargePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  // Settings & User state
  const [balance, setBalance] = useState<number>(0);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [adminBkash, setAdminBkash] = useState<string>("01728967166");
  const [adminNagad, setAdminNagad] = useState<string>("01812345678");
  const [adminUsdtAddress, setAdminUsdtAddress] = useState<string>(
    "TKrvSHzuR9CcvRwPGiDDb7kzPvCGU3jtyi"
  );
  const [adminUsdtQrCode, setAdminUsdtQrCode] = useState<string>("");
  const [adminUsdtNetwork, setAdminUsdtNetwork] = useState<string>("BEP-20 (BNB Smart Chain)");
  const [adminUsdtInstructions, setAdminUsdtInstructions] = useState<string>("");

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

  // Payment Proof Voucher State
  const [proofImage, setProofImage] = useState<string>("");
  const [proofPreview, setProofPreview] = useState<string>("");
  const [proofFileName, setProofFileName] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);

  // Feedback states
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    setMounted(true);

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
          if (data.settings.usdtQrCodeUrl) {
            setAdminUsdtQrCode(data.settings.usdtQrCodeUrl);
          }
          if (data.settings.usdtNetworkName) {
            setAdminUsdtNetwork(data.settings.usdtNetworkName);
          }
          if (data.settings.usdtDepositInstructions) {
            setAdminUsdtInstructions(data.settings.usdtDepositInstructions);
          }
        }
      })
      .catch(() => { });
  }, []);

  const isLight = mounted && theme === "light";

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

  // Proof Image Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setError("");
    const localPreviewUrl = URL.createObjectURL(file);
    setProofPreview(localPreviewUrl);
    setProofFileName(file.name);
    setUploadingProof(true);

    try {
      // 1. Try uploading to multipart endpoint
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data?.proofUrl) {
        setProofImage(data.proofUrl);
      } else {
        // Fallback to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback to base64 on network error
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleRemoveProof = () => {
    setProofImage("");
    setProofPreview("");
    setProofFileName("");
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
          proofImage: proofImage || proofPreview || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Deposit submission failed.");
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || "Recharge request submitted successfully!");
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

    setLoading(true);

    try {
      const res = await fetch("/api/user/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          method: "USDT-BEP20",
          senderNumber: "USDT-Wallet",
          transferType: "send_money",
          proofImage: proofImage || proofPreview || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "USDT deposit submission failed.");
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || "Recharge request submitted successfully!");
      setTimeout(() => {
        router.push("/recharge-record");
      }, 1500);
    } catch {
      setError("Failed to submit deposit. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-slate-50 text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
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
          <div className="mx-4 mt-3 p-3.5 bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mt-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-100 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: Amount Selection
        ========================================================================= */}
        {step === "select_amount" && (
          <div className="p-4 space-y-4 max-w-[440px] mx-auto">
            {/* Live Balance Card */}
            <div
              className={`flex items-center justify-between px-4 py-3.5 rounded-3xl border transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <span
                className={`text-sm font-bold ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                Account Balance
              </span>
              <div className="text-right">
                <span
                  className={`text-xl font-black ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {Number(balance).toFixed(2)}{" "}
                  <span className="text-[#f5ba31]">USDT</span>
                </span>
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  ≈ {(Number(balance) * usdtRate).toFixed(2)} BDT
                </span>
              </div>
            </div>

            {/* Amount Selection Card */}
            <div
              className={`p-4 rounded-3xl border transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <h2 className="text-base font-black text-[#f5ba31] mb-3.5 text-center tracking-tight">
                Please select recharge amount (BDT)
              </h2>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {["500", "1000", "1270", "2540", "5000"].map((val) => {
                  const isSelected = amount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black shadow-[0_4px_15px_rgba(245,186,49,0.45)] scale-[1.02]"
                          : isLight
                            ? "bg-slate-50 text-slate-700 border border-slate-200 hover:border-amber-400"
                            : "bg-[#020a1f] text-slate-200 border border-slate-700/80 hover:border-[#f5ba31]/60"
                      }`}
                    >
                      <div className="text-sm font-black">{val} TK</div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isSelected
                            ? "text-[#020a1f]/80"
                            : isLight
                              ? "text-slate-500"
                              : "text-slate-400"
                        }`}
                      >
                        ≈ ${(Number(val) / usdtRate).toFixed(1)}
                      </div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                    !["500", "1000", "1270", "2540", "5000"].includes(amount)
                      ? "bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black shadow-[0_4px_15px_rgba(245,186,49,0.45)] scale-[1.02]"
                      : isLight
                        ? "bg-slate-50 text-slate-700 border border-slate-200 hover:border-amber-400"
                        : "bg-[#020a1f] text-slate-200 border border-slate-700/80 hover:border-[#f5ba31]/60"
                  }`}
                >
                  <div className="text-sm font-black">Custom</div>
                  <div
                    className={`text-[10px] font-semibold mt-0.5 ${
                      !["500", "1000", "1270", "2540", "5000"].includes(amount)
                        ? "text-[#020a1f]/80"
                        : isLight
                          ? "text-slate-500"
                          : "text-slate-400"
                    }`}
                  >
                    Enter TK
                  </div>
                </button>
              </div>

              {/* Custom Input & Recharge Button */}
              <div
                className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all ${
                  isLight
                    ? "bg-slate-50 border-slate-200 focus-within:border-amber-500 shadow-xs"
                    : "bg-[#020a1f] border-slate-700/80 focus-within:border-[#f5ba31]"
                }`}
              >
                <input
                  type="number"
                  placeholder="Enter amount in BDT (Taka)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-3 py-2 bg-transparent text-sm font-bold outline-none ${
                    isLight
                      ? "text-slate-900 placeholder-slate-400"
                      : "text-white placeholder-slate-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleInitialRechargeClick}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-sm shadow-[0_4px_15px_rgba(245,186,49,0.35)] hover:brightness-105 active:scale-95 transition-all shrink-0"
                >
                  Recharge
                </button>
              </div>

              {/* Real-time conversion badge */}
              {amount && Number(amount) > 0 && (
                <div
                  className={`mt-3 p-3 rounded-2xl border text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-inner ${
                    isLight
                      ? "bg-amber-50/70 border-amber-200 text-slate-800"
                      : "bg-[#020a1f] border-[#f5ba31]/30 text-white"
                  }`}
                >
                  <span>Recharge Amount: {amount} BDT</span>
                  <span className="text-emerald-500 font-black">
                    Account receives: ≈ {(Number(amount) / usdtRate).toFixed(2)} USDT (1$ = {usdtRate} Tk)
                  </span>
                </div>
              )}
            </div>

            {/* Instruction Box 1 */}
            <div
              className={`p-4 rounded-3xl border text-xs leading-relaxed transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md text-slate-700"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg text-slate-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#e69e05] to-[#ffd369] text-[#020a1f] flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5 shadow-xs">
                  1
                </span>
                <p>
                  Please verify payee, account, reference, and amount. Ensure you
                  enter the correct reference information to guarantee smooth
                  confirmation. The recipient account may change periodically;
                  always copy the latest account shown.
                </p>
              </div>
            </div>

            {/* Instruction Box 2: USDT note */}
            <div
              className={`p-4 rounded-3xl border text-xs leading-relaxed transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md text-slate-700"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg text-slate-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#e69e05] to-[#ffd369] text-[#020a1f] flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5 shadow-xs">
                  2
                </span>
                <p>
                  USDT top-up exchange rate: 1 USDT = {usdtRate} BDT. Deposits are
                  promptly credited within 10-30 minutes after network confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            METHOD OF PAYMENT MODAL
        ========================================================================= */}
        {showMethodModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div
              className={`w-full max-w-[390px] rounded-3xl p-5 shadow-2xl border transition-all animate-slideUp ${
                isLight
                  ? "bg-white border-amber-300/80 text-slate-900"
                  : "bg-[#04102e] border-[#f5ba31]/40 text-white"
              }`}
            >
              <h3 className="text-base font-black text-[#f5ba31] mb-4 tracking-tight">
                Select Payment Method
              </h3>

              <div className="space-y-3">
                {/* Local Bank (bKash/Nagad) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("bank")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                    selectedMethod === "bank"
                      ? "border-[#f5ba31] bg-[#f5ba31]/10 shadow-sm"
                      : isLight
                        ? "border-slate-200 hover:border-amber-300 bg-slate-50"
                        : "border-slate-700 hover:border-[#f5ba31]/50 bg-[#020a1f]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <div
                        className={`text-sm font-bold ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        bKash / Nagad
                      </div>
                      <div
                        className={`text-[11px] ${
                          isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Fast Mobile Banking Transfer
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "bank" && (
                    <CheckCircle2 size={22} className="text-[#f5ba31]" />
                  )}
                </button>

                {/* USDT BEP-20 */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("usdt")}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                    selectedMethod === "usdt"
                      ? "border-[#f5ba31] bg-[#f5ba31]/10 shadow-sm"
                      : isLight
                        ? "border-slate-200 hover:border-amber-300 bg-slate-50"
                        : "border-slate-700 hover:border-[#f5ba31]/50 bg-[#020a1f]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                      <Coins size={20} />
                    </div>
                    <div className="text-left">
                      <div
                        className={`text-sm font-bold ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        USDT ({adminUsdtNetwork.split(" ")[0]})
                      </div>
                      <div
                        className={`text-[11px] ${
                          isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Crypto Wallet (Rate: 1 USDT = {usdtRate} BDT)
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "usdt" && (
                    <CheckCircle2 size={22} className="text-[#f5ba31]" />
                  )}
                </button>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmMethod}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-sm shadow-[0_4px_20px_rgba(245,186,49,0.4)] hover:brightness-105 active:scale-98 transition-all"
                >
                  Confirm Method
                </button>
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    isLight
                      ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                      : "border-slate-700 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: Bank Channel & Sender Input
        ========================================================================= */}
        {step === "bank_step2" && (
          <div className="p-4 space-y-4 max-w-[440px] mx-auto">
            {/* Amount Badge */}
            <div
              className={`w-full py-5 rounded-3xl border text-center shadow-lg transition-all ${
                isLight
                  ? "bg-white border-amber-300 text-slate-900"
                  : "bg-gradient-to-r from-[#04102e] via-[#071948] to-[#04102e] border-[#f5ba31]/40 text-white"
              }`}
            >
              <div className="font-black text-3xl tracking-tight font-mono text-[#f5ba31]">
                {amount} BDT
              </div>
              <div
                className={`text-xs font-bold mt-1 ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                ≈ {(Number(amount) / usdtRate).toFixed(2)} USDT will be added (1$ = {usdtRate} Tk)
              </div>
            </div>

            {/* Form */}
            <div
              className={`p-5 rounded-3xl border space-y-4 transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isLight ? "text-slate-800" : "text-slate-200"
                  }`}
                >
                  Your Sender Mobile Number
                </label>
                <div
                  className={`flex items-center rounded-2xl border-2 px-3.5 py-2.5 transition-all ${
                    isLight
                      ? "bg-slate-50 border-slate-200 focus-within:border-amber-500"
                      : "bg-[#020a1f] border-slate-700 focus-within:border-[#f5ba31]"
                  }`}
                >
                  <input
                    type="tel"
                    placeholder="016xxxxxx345"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className={`w-full bg-transparent text-sm font-bold outline-none ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isLight ? "text-slate-800" : "text-slate-200"
                  }`}
                >
                  Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("bKash")}
                    className={`py-3.5 rounded-2xl font-black text-sm border-2 transition-all ${
                      paymentChannel === "bKash"
                        ? "border-[#E2136E] bg-[#E2136E]/15 text-[#E2136E] shadow-sm"
                        : isLight
                          ? "border-slate-200 text-slate-700 bg-slate-50"
                          : "border-slate-700 text-slate-300 bg-[#020a1f]"
                    }`}
                  >
                    bKash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("Nagad")}
                    className={`py-3.5 rounded-2xl font-black text-sm border-2 transition-all ${
                      paymentChannel === "Nagad"
                        ? "border-[#F7941D] bg-[#F7941D]/15 text-[#F7941D] shadow-sm"
                        : isLight
                          ? "border-slate-200 text-slate-700 bg-slate-50"
                          : "border-slate-700 text-slate-300 bg-[#020a1f]"
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
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-base shadow-[0_4px_25px_rgba(245,186,49,0.45)] hover:brightness-105 active:scale-98 transition-all"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: Admin Account & TxID Submission with Proof Upload
        ========================================================================= */}
        {step === "bank_step3" && (
          <div className="p-4 space-y-4 max-w-[440px] mx-auto">
            {/* Step 1. Account Information */}
            <div
              className={`p-5 rounded-3xl border space-y-3 transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <h3 className="text-xs font-black text-[#f5ba31] uppercase tracking-wider">
                Step 1. Official {paymentChannel} Account
              </h3>
              <div className="space-y-2.5 text-sm font-semibold">
                <div
                  className={`flex items-center justify-between py-2 border-b ${
                    isLight ? "border-slate-100" : "border-white/10"
                  }`}
                >
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                    Account Number:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-black text-base ${
                        isLight ? "text-slate-900" : "text-[#ffd369]"
                      }`}
                    >
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
                      className="p-1.5 rounded-xl bg-gradient-to-r from-[#e69e05] to-[#ffd369] text-[#020a1f] font-bold shadow-xs hover:brightness-105"
                      title="Copy number"
                    >
                      {copied === "account" ? (
                        <Check size={16} className="text-[#020a1f] stroke-[3]" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                    Amount to Send:
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#f5ba31]">
                      {amount} BDT
                    </span>
                    <span className="text-xs font-bold text-emerald-500 block">
                      ≈ {(Number(amount) / usdtRate).toFixed(2)} USDT will be credited
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2. Terms agreement */}
            <div
              className={`p-4 rounded-3xl border transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <h3 className="text-xs font-black text-[#f5ba31] uppercase tracking-wider mb-2">
                Step 2. Agree to Terms
              </h3>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 accent-[#f5ba31] rounded"
                />
                <span className={isLight ? "text-slate-700" : "text-slate-300"}>
                  I confirm that I sent the exact amount to the official account.
                </span>
              </label>
            </div>

            {/* Step 3. Payment Method Box, TxID & Proof Upload */}
            <form
              onSubmit={handleBankDepositSubmit}
              className={`p-5 rounded-3xl border space-y-4 transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <h3 className="text-xs font-black text-[#f5ba31] uppercase tracking-wider">
                Step 3. Select Type, TxID & Upload Proof
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setTransferType("send_money")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    transferType === "send_money"
                      ? "border-[#f5ba31] bg-[#f5ba31]/10"
                      : isLight
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-700 bg-[#020a1f]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-black ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Send Money
                    </span>
                    {transferType === "send_money" && (
                      <CheckCircle2 size={16} className="text-[#f5ba31]" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] leading-tight block ${
                      isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Personal bKash/Nagad
                  </span>
                </div>

                <div
                  onClick={() => setTransferType("payment")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    transferType === "payment"
                      ? "border-[#f5ba31] bg-[#f5ba31]/10"
                      : isLight
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-700 bg-[#020a1f]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-black ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Payment
                    </span>
                    {transferType === "payment" && (
                      <CheckCircle2 size={16} className="text-[#f5ba31]" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] leading-tight block ${
                      isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Merchant Payment
                  </span>
                </div>
              </div>

              {/* 10-digit TxID input */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isLight ? "text-slate-800" : "text-slate-200"
                  }`}
                >
                  10-digit Recharge Transaction ID (TxID)
                </label>
                <div
                  className={`flex items-center rounded-2xl border-2 px-3.5 py-2.5 transition-all ${
                    isLight
                      ? "bg-slate-50 border-slate-200 focus-within:border-amber-500"
                      : "bg-[#020a1f] border-slate-700 focus-within:border-[#f5ba31]"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="e.g. 9EB90C53C7"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    className={`w-full bg-transparent text-sm font-mono font-black outline-none uppercase tracking-wider ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Payment Proof Screenshot Input */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isLight ? "text-slate-800" : "text-[#f5ba31]"
                    }`}
                  >
                    <UploadCloud size={16} className="text-[#f5ba31]" />
                    <span>Payment Proof Screenshot (পেমেন্ট প্রুফ)</span>
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Recommended
                  </span>
                </div>

                {!proofPreview ? (
                  <label
                    htmlFor="bank-proof-upload"
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                      isLight
                        ? "border-amber-300 bg-amber-50/50 hover:bg-amber-50"
                        : "border-[#f5ba31]/40 bg-[#020a1f]/70 hover:bg-[#020a1f] hover:border-[#f5ba31]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f5ba31]/20 to-[#ffd369]/30 flex items-center justify-center mb-1.5 text-[#f5ba31]">
                      <ImageIcon size={20} />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isLight ? "text-slate-800" : "text-slate-200"
                      }`}
                    >
                      Click to upload screenshot / voucher
                    </span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      JPG, PNG, WEBP (Max 10MB)
                    </span>
                    <input
                      id="bank-proof-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div
                    className={`relative p-3 rounded-2xl border flex items-center gap-3 ${
                      isLight
                        ? "bg-amber-50/60 border-amber-200"
                        : "bg-[#020a1f] border-[#f5ba31]/30"
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#f5ba31]/40 bg-black/40 shrink-0">
                      <img
                        src={proofPreview}
                        alt="Proof Preview"
                        className="w-full h-full object-cover"
                      />
                      {uploadingProof && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={16} className="animate-spin text-[#f5ba31]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        <span
                          className={`text-xs font-bold truncate ${
                            isLight ? "text-slate-800" : "text-slate-100"
                          }`}
                        >
                          {proofFileName || "Payment Receipt"}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                        {uploadingProof ? "Uploading proof..." : "Proof attached for admin verification ✔"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      title="Remove screenshot"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-base shadow-[0_4px_25px_rgba(245,186,49,0.45)] hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Deposit Request"}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            USDT RECHARGE SCREEN (BEP-20)
        ========================================================================= */}
        {step === "usdt_step2" && (
          <div className="p-4 space-y-4 max-w-[440px] mx-auto">
            {/* Cautions Notice Card */}
            <div
              className={`p-4 rounded-3xl border text-xs space-y-2.5 transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md text-slate-700"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg text-slate-300"
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 border-b ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}
              >
                <h4 className="font-black text-[#f5ba31] flex items-center gap-1.5 text-xs">
                  <ShieldAlert size={16} className="text-[#f5ba31] shrink-0" />
                  <span>Deposit Instructions & Cautions</span>
                </h4>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#f5ba31]/15 text-[#f5ba31] border border-[#f5ba31]/30">
                  {adminUsdtNetwork}
                </span>
              </div>

              {adminUsdtInstructions ? (
                <div
                  className={`font-medium whitespace-pre-line leading-relaxed text-[11.5px] ${
                    isLight ? "text-slate-600" : "text-slate-300"
                  }`}
                >
                  {adminUsdtInstructions}
                </div>
              ) : (
                <div className="space-y-1">
                  <p>• Send the exact calculated USDT amount via BEP-20 network.</p>
                  <p>• Please do not deposit non-USDT assets to this address.</p>
                </div>
              )}

              <p
                className={`font-black pt-2 border-t text-[#f5ba31] ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}
              >
                • Rate: 1 USDT = {usdtRate} BDT. Current deposit: {amount} BDT (≈{" "}
                {(Number(amount) / usdtRate).toFixed(2)} USDT).
              </p>
            </div>

            {/* Address & Dynamic QR Card */}
            <div
              className={`p-5 rounded-3xl border text-center space-y-3.5 transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <div>
                <span
                  className={`text-[11px] font-black uppercase tracking-wider block mb-1.5 ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  ADDRESS FOR COIN RECHARGE ({adminUsdtNetwork})
                </span>
                <div
                  className={`p-3 rounded-2xl font-mono text-xs select-all font-bold break-all border transition-all ${
                    isLight
                      ? "bg-amber-50/70 border-amber-200 text-amber-950"
                      : "bg-[#020a1f] border-[#f5ba31]/30 text-amber-200"
                  }`}
                >
                  {adminUsdtAddress}
                </div>
              </div>

              {/* Dynamic QR image */}
              <div className="my-2 flex flex-col items-center justify-center">
                <div
                  className={`w-48 h-48 p-2.5 bg-white rounded-2xl border-2 shadow-lg flex items-center justify-center overflow-hidden transition-all ${
                    isLight
                      ? "border-amber-300 shadow-amber-500/10"
                      : "border-[#f5ba31]/40 shadow-[0_0_25px_rgba(245,186,49,0.2)]"
                  }`}
                >
                  <img
                    src={
                      adminUsdtQrCode ||
                      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        adminUsdtAddress || "USDT-BEP20"
                      )}`
                    }
                    alt="USDT BEP-20 QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Scan QR code with your crypto wallet to pay
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(adminUsdtAddress, "usdt")}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-sm shadow-[0_4px_18px_rgba(245,186,49,0.35)] hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {copied === "usdt" ? (
                  <>
                    <Check size={18} className="stroke-[3]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Copy address
                  </>
                )}
              </button>
            </div>

            {/* Order Amount, Proof Upload & Submit Card */}
            <form
              onSubmit={handleUsdtDepositSubmit}
              className={`p-5 rounded-3xl border space-y-4 transition-all ${
                isLight
                  ? "bg-white border-amber-200/90 shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className={`text-xs font-bold ${
                      isLight ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    Order Amount (USDT)
                  </label>
                  <span className="text-xs font-black text-[#f5ba31] font-mono">
                    ≈ {amount} BDT
                  </span>
                </div>
                <div
                  className={`w-full px-4 py-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isLight
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-[#020a1f] border-[#f5ba31]/30"
                  }`}
                >
                  <span
                    className={`font-black text-lg font-mono ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {(Number(amount) / usdtRate).toFixed(2)} USDT
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-[#f5ba31] text-[#020a1f] shadow-xs">
                    {adminUsdtNetwork.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Payment Proof Screenshot Input (USDT Voucher) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isLight ? "text-slate-800" : "text-[#f5ba31]"
                    }`}
                  >
                    <UploadCloud size={16} className="text-[#f5ba31]" />
                    <span>Upload Payment Proof / Screenshot (প্রুফ ছবি)</span>
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Recommended
                  </span>
                </div>

                {!proofPreview ? (
                  <label
                    htmlFor="usdt-proof-upload"
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                      isLight
                        ? "border-amber-300 bg-amber-50/50 hover:bg-amber-50"
                        : "border-[#f5ba31]/40 bg-[#020a1f]/70 hover:bg-[#020a1f] hover:border-[#f5ba31]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f5ba31]/20 to-[#ffd369]/30 flex items-center justify-center mb-1.5 text-[#f5ba31]">
                      <ImageIcon size={20} />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isLight ? "text-slate-800" : "text-slate-200"
                      }`}
                    >
                      Click to upload transfer screenshot
                    </span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      JPG, PNG, WEBP (Max 10MB)
                    </span>
                    <input
                      id="usdt-proof-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div
                    className={`relative p-3 rounded-2xl border flex items-center gap-3 ${
                      isLight
                        ? "bg-amber-50/60 border-amber-200"
                        : "bg-[#020a1f] border-[#f5ba31]/30"
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#f5ba31]/40 bg-black/40 shrink-0">
                      <img
                        src={proofPreview}
                        alt="USDT Proof Preview"
                        className="w-full h-full object-cover"
                      />
                      {uploadingProof && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={16} className="animate-spin text-[#f5ba31]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        <span
                          className={`text-xs font-bold truncate ${
                            isLight ? "text-slate-800" : "text-slate-100"
                          }`}
                        >
                          {proofFileName || "USDT Receipt"}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                        {uploadingProof ? "Uploading proof..." : "Screenshot ready for admin verification ✔"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      title="Remove screenshot"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e69e05] via-[#ffd369] to-[#e69e05] text-[#020a1f] font-black text-base shadow-[0_4px_25px_rgba(245,186,49,0.45)] hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting Deposit..." : "I Have Paid / Submit Recharge"}
              </button>
            </form>
          </div>
        )}
      </div>

      <CityFooter />
    </div>
  );
}
