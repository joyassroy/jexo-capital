"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Lock, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();

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

      setSuccess("Login password updated successfully!");
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
        <Header title="Change Login Password" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {/* Shield Badge */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 flex items-center justify-center shadow-lg border-2 border-white">
              <Shield size={40} className="text-white drop-shadow" />
              <Lock size={18} className="absolute text-blue-950 stroke-[3]" />
            </div>
            <h2 className="text-base font-black text-blue-950 mt-3 tracking-tight">
              Change Login Password
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
            {/* Old password */}
            <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-1 focus-within:border-blue-500">
              <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type={showOld ? "text" : "password"}
                placeholder="Enter you old login password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New password */}
            <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-1 focus-within:border-blue-500">
              <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Please enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="flex items-center bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-3.5 py-1 focus-within:border-blue-500">
              <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
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

