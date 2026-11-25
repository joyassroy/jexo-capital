"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Lock, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 4 || newPassword.length > 10) {
      setError("Password must be between 4 and 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/security/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password.");
        setLoading(false);
        return;
      }

      const successMsg = "Login password updated successfully!";
      setSuccess(successMsg);
      toast.success(successMsg);
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
        <Header title="Change Login Password" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {/* Shield Badge */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,186,49,0.4)] border-2 border-white/40">
              <Shield size={40} className="text-[#020a1f] drop-shadow" />
              <Lock size={18} className="absolute text-[#020a1f] stroke-[3]" />
            </div>
            <h2 className="text-base font-black text-white mt-3 tracking-tight">
              Change Login Password
            </h2>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold rounded-xl text-center shadow-sm flex items-center justify-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-100 text-xs font-bold rounded-xl text-center shadow-sm flex items-center justify-center gap-2">
              <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-4"
          >
            {/* Old password */}
            <div className="flex items-center bg-[#020a1f] rounded-2xl border border-slate-700 px-3.5 py-1 focus-within:border-[#f5ba31]">
              <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
              <input
                type={showOld ? "text" : "password"}
                placeholder="Enter you old login password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="p-1 text-slate-400 hover:text-[#f5ba31]"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New password */}
            <div className="flex items-center bg-[#020a1f] rounded-2xl border border-slate-700 px-3.5 py-1 focus-within:border-[#f5ba31]">
              <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Please enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="p-1 text-slate-400 hover:text-[#f5ba31]"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="flex items-center bg-[#020a1f] rounded-2xl border border-slate-700 px-3.5 py-1 focus-within:border-[#f5ba31]">
              <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-1 text-slate-400 hover:text-[#f5ba31]"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold-premium w-full py-4 rounded-2xl text-base disabled:opacity-50"
            >
              {loading ? "Updating..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

