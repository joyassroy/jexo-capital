"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Gift, CheckCircle2, AlertCircle } from "lucide-react";

export default function GiftReceivePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code || code.trim() === "") {
      setError("Please enter the secret code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/gift/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to redeem code.");
        setLoading(false);
        return;
      }

      setSuccess(data.message);
      setCode("");
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Gift Receive" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {/* 3D Gift Box illustration */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] p-2 flex items-center justify-center shadow-[0_0_25px_rgba(245,186,49,0.4)] border-2 border-white/40 animate-floating">
              <Gift size={56} className="text-[#020a1f] drop-shadow" />
            </div>
            <h2 className="text-xl font-black text-white mt-3 tracking-tight">
              Gift Receive
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
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleClaim}
            className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-3"
          >
            <div className="bg-[#020a1f] rounded-2xl border-2 border-slate-700 px-4 py-1.5 focus-within:border-[#f5ba31]">
              <input
                type="text"
                placeholder="Secret code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full py-2 bg-transparent text-sm font-mono font-bold text-white placeholder-slate-500 outline-none uppercase tracking-wider"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-base shadow-[0_0_20px_rgba(245,186,49,0.35)] active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? "Claiming..." : "Receive Reward"}
            </button>
          </form>

          {/* Instructions Box */}
          <div className="p-4 rounded-3xl bg-[#04102e]/85 border border-[#f5ba31]/30 shadow-lg text-xs leading-relaxed text-slate-300 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                1
              </span>
              <p>Obtain the secret code from the Telegram group.</p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                2
              </span>
              <p>
                Enter the secret code in the designated field and click on the
                &apos;Receive Reward&apos; option.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                3
              </span>
              <p>Get a bonus and enjoy.</p>
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

