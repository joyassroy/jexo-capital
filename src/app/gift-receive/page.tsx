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
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Gift Receive" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {/* 3D Gift Box illustration */}
          <div className="flex flex-col items-center justify-center my-3">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-2 flex items-center justify-center shadow-xl border-2 border-white animate-floating">
              <Gift size={56} className="text-white drop-shadow" />
            </div>
            <h2 className="text-xl font-black text-blue-950 mt-3 tracking-tight">
              Gift Receive
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
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleClaim}
            className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-3"
          >
            <div className="bg-blue-50/50 rounded-2xl border-2 border-blue-200 px-4 py-1.5 focus-within:border-blue-500">
              <input
                type="text"
                placeholder="Secret code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full py-2 bg-transparent text-sm font-mono font-bold text-gray-800 placeholder-gray-400 outline-none uppercase tracking-wider"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? "Claiming..." : "Receive Reward"}
            </button>
          </form>

          {/* Instructions Box */}
          <div className="p-4 rounded-3xl bg-white/95 border border-blue-200 shadow-sm text-xs leading-relaxed text-gray-700 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                1
              </span>
              <p>Obtain the secret code from the Telegram group.</p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                2
              </span>
              <p>
                Enter the secret code in the designated field and click on the
                &apos;Receive Reward&apos; option.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
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

