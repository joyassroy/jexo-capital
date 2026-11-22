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
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Set Withdrawl Password" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {/* Security Shield Icon Badge */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 flex items-center justify-center shadow-lg border-2 border-white">
              <Shield size={40} className="text-white drop-shadow" />
              <Lock size={18} className="absolute text-blue-950 stroke-[3]" />
            </div>
            <h2 className="text-base font-black text-blue-950 mt-3 tracking-tight">
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
            className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-4"
          >
            {/* Login Password input */}
            <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-1 focus-within:border-blue-500">
              <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type={showLoginPass ? "text" : "password"}
                placeholder="Enter your login password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New Withdrawal Password input */}
            <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-1 focus-within:border-blue-500">
              <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type={showWithdrawPass ? "text" : "password"}
                placeholder="Plesse enter you withdrawl new password"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowWithdrawPass(!showWithdrawPass)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                {showWithdrawPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Withdrawal Password */}
            <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-1 focus-within:border-blue-500">
              <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm your withdrawl new password"
                value={confirmWithdrawPassword}
                onChange={(e) => setConfirmWithdrawPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
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

