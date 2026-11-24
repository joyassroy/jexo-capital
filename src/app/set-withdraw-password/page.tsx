"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Lock, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function SetWithdrawPasswordPage() {
  const router = useRouter();

  const [loginPassword, setLoginPassword] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [confirmWithdrawPassword, setConfirmWithdrawPassword] = useState("");

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showWithdrawPass, setShowWithdrawPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (withdrawPassword !== confirmWithdrawPassword) {
      setError("Withdrawal passwords do not match.");
      return;
    }

    if (withdrawPassword.length < 4) {
      setError("Withdrawal password must be at least 4 digits.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/security/withdraw-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginPassword,
          withdrawPassword,
          confirmWithdrawPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to set withdrawal password.");
        setLoading(false);
        return;
      }

      setSuccess("Withdrawal password set successfully!");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Set Withdrawl Password" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {/* Security Shield Icon Badge */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,186,49,0.4)] border-2 border-white/40">
              <Shield size={40} className="text-[#020a1f] drop-shadow" />
              <Lock size={18} className="absolute text-[#020a1f] stroke-[3]" />
            </div>
            <h2 className="text-base font-black text-white mt-3 tracking-tight">
              Set Withdrawl Password
            </h2>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-4"
          >
            {/* Login Password input */}
            <div className="flex items-center bg-[#020a1f] rounded-2xl border border-slate-700 px-3.5 py-1 focus-within:border-[#f5ba31]">
              <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
              <input
                type={showLoginPass ? "text" : "password"}
                placeholder="Enter your login password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="p-1 text-slate-400 hover:text-[#f5ba31]"
              >
                {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New Withdrawal Password input */}
            <div className="flex items-center bg-[#020a1f] rounded-2xl border border-slate-700 px-3.5 py-1 focus-within:border-[#f5ba31]">
              <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
              <input
                type={showWithdrawPass ? "text" : "password"}
                placeholder="Plesse enter you withdrawl new password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowWithdrawPass(!showWithdrawPass)}
                className="p-1 text-slate-400 hover:text-[#f5ba31]"
              >
                {showWithdrawPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Withdrawal Password */}
            <div className="flex items-center bg-[#020a1f] rounded-2xl border border-slate-700 px-3.5 py-1 focus-within:border-[#f5ba31]">
              <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm your withdrawl new password"
                value={confirmWithdrawPassword}
                onChange={(e) => setConfirmWithdrawPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="p-1 text-slate-400 hover:text-[#f5ba31]"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold-premium w-full py-4 rounded-2xl text-base disabled:opacity-50"
            >
              {loading ? "Setting Password..." : "Set withdraw password"}
            </button>
          </form>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

