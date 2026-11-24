"use client";

import React, { useEffect, useState } from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [usdtBep20Address, setUsdtBep20Address] = useState("");
  const [usdtRateBDT, setUsdtRateBDT] = useState(127);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [telegramGroupUrl, setTelegramGroupUrl] = useState("");
  const [telegramChannelUrl, setTelegramChannelUrl] = useState("");
  const [homeTickerText, setHomeTickerText] = useState("");
  const [minWithdrawBDT, setMinWithdrawBDT] = useState(250);
  const [minWithdrawUSDT, setMinWithdrawUSDT] = useState(6);
  const [signupBonusBDT, setSignupBonusBDT] = useState(500);
  const [withdrawFeePercent, setWithdrawFeePercent] = useState(10);
  const [withdrawStartTime, setWithdrawStartTime] = useState("09:00");
  const [withdrawEndTime, setWithdrawEndTime] = useState("17:00");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.setting) {
          const s = data.setting;
          setBkashNumber(s.bkashNumber || "");
          setNagadNumber(s.nagadNumber || "");
          setUsdtBep20Address(s.usdtBep20Address || "");
          setUsdtRateBDT(s.usdtRateBDT || 127);
          setWhatsappUrl(s.whatsappUrl || "");
          setTelegramGroupUrl(s.telegramGroupUrl || "");
          setTelegramChannelUrl(s.telegramChannelUrl || "");
          setHomeTickerText(s.homeTickerText || "");
          setMinWithdrawBDT(s.minWithdrawBDT || 250);
          setMinWithdrawUSDT(s.minWithdrawUSDT || 6);
          setSignupBonusBDT(s.signupBonusBDT ?? 500);
          setWithdrawFeePercent(s.withdrawFeePercent || 10);
          setWithdrawStartTime(s.withdrawStartTime || "09:00");
          setWithdrawEndTime(s.withdrawEndTime || "17:00");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bkashNumber,
          nagadNumber,
          usdtBep20Address,
          usdtRateBDT,
          whatsappUrl,
          telegramGroupUrl,
          telegramChannelUrl,
          homeTickerText,
          minWithdrawBDT,
          minWithdrawUSDT,
          signupBonusBDT,
          withdrawFeePercent,
          withdrawStartTime,
          withdrawEndTime,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Settings updated successfully!");
      } else {
        alert(data.error || "Failed to update settings.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Platform Configuration & Gateways
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure receiver payment numbers, USDT rate, support channels, and withdrawal rules.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Gateways Card */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider">
            Deposit Payment Gateways
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin bKash Number
              </label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Nagad Number
              </label>
              <input
                type="text"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin USDT (BEP-20) Address
              </label>
              <input
                type="text"
                value={usdtBep20Address}
                onChange={(e) => setUsdtBep20Address(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                1 USDT Rate in BDT
              </label>
              <input
                type="number"
                value={usdtRateBDT}
                onChange={(e) => setUsdtRateBDT(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-bold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Withdrawal Rules Card */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider">
            Withdrawal Operating Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Minimum Withdrawal for bKash/Nagad (BDT)
              </label>
              <input
                type="number"
                value={minWithdrawBDT}
                onChange={(e) => setMinWithdrawBDT(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Minimum Withdrawal for USDT ($ / Crypto)
              </label>
              <input
                type="number"
                value={minWithdrawUSDT}
                onChange={(e) => setMinWithdrawUSDT(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Free Sign-up Bonus Reserve (BDT)
              </label>
              <input
                type="number"
                value={signupBonusBDT}
                onChange={(e) => setSignupBonusBDT(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-bold outline-none"
              />
              <span className="text-[10px] text-amber-400 mt-1 block">
                Automatic free welcome deposit upon registration (Non-withdrawable).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Withdrawal Fee (%)
              </label>
              <input
                type="number"
                value={withdrawFeePercent}
                onChange={(e) => setWithdrawFeePercent(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Opening Hour (e.g. 09:00)
              </label>
              <input
                type="text"
                value={withdrawStartTime}
                onChange={(e) => setWithdrawStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Closing Hour (e.g. 17:00)
              </label>
              <input
                type="text"
                value={withdrawEndTime}
                onChange={(e) => setWithdrawEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links & Ticker */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider">
            Social Channels & Notice Ticker
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Direct Link
              </label>
              <input
                type="text"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telegram Official Group URL
              </label>
              <input
                type="text"
                value={telegramGroupUrl}
                onChange={(e) => setTelegramGroupUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telegram Official Channel URL
              </label>
              <input
                type="text"
                value={telegramChannelUrl}
                onChange={(e) => setTelegramChannelUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Homepage Scrolling Marquee Notice
              </label>
              <input
                type="text"
                value={homeTickerText}
                onChange={(e) => setHomeTickerText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center gap-2"
        >
          <Save size={18} />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </form>
    </div>
  );
}

