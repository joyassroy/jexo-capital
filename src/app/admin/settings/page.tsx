"use client";

import React, { useEffect, useState } from "react";
import { Save, AlertCircle, CheckCircle2, Upload, QrCode, Trash2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [usdtBep20Address, setUsdtBep20Address] = useState("");
  const [usdtRateBDT, setUsdtRateBDT] = useState(127);
  const [usdtQrCodeUrl, setUsdtQrCodeUrl] = useState("");
  const [usdtNetworkName, setUsdtNetworkName] = useState("BEP-20 (BNB Smart Chain)");
  const [usdtDepositInstructions, setUsdtDepositInstructions] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);

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
          setUsdtQrCodeUrl(s.usdtQrCodeUrl || "");
          setUsdtNetworkName(s.usdtNetworkName || "BEP-20 (BNB Smart Chain)");
          setUsdtDepositInstructions(
            s.usdtDepositInstructions ||
              "• This address only accepts USDT (BEP-20) top-ups.\n• Please do not make duplicate payments or amend amounts.\n• Send the exact calculated USDT amount."
          );
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

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUsdtQrCodeUrl(data.url);
      } else {
        alert(data.error || "Failed to upload QR Code image.");
      }
    } catch {
      alert("Network error while uploading QR code.");
    } finally {
      setUploadingQr(false);
      e.target.value = "";
    }
  };

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
          usdtQrCodeUrl,
          usdtNetworkName,
          usdtDepositInstructions,
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
        setTimeout(() => setMessage(""), 3500);
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
          Configure receiver payment numbers, BEP-20 QR codes & details, USDT rate, support channels, and withdrawal rules.
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
            Mobile Banking Deposit Gateways
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

        {/* USDT BEP-20 Crypto Gateway & QR Code Settings */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <QrCode size={18} className="text-amber-400" />
              <span>USDT (BEP-20) Deposit Gateway & QR Code Settings</span>
            </h2>
            <span className="text-[11px] font-semibold text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Live on /recharge page
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin USDT (BEP-20) Receiving Address
              </label>
              <input
                type="text"
                value={usdtBep20Address}
                onChange={(e) => setUsdtBep20Address(e.target.value)}
                placeholder="e.g. 0x... or TKrv..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Crypto Network Name
              </label>
              <input
                type="text"
                value={usdtNetworkName}
                onChange={(e) => setUsdtNetworkName(e.target.value)}
                placeholder="BEP-20 (BNB Smart Chain)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-semibold outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* QR Code Upload & Live Preview Card */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Live QR Preview */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                Active QR Code Preview
              </span>
              <div className="w-40 h-40 bg-white p-2.5 rounded-2xl border-2 border-amber-500/50 shadow-lg flex items-center justify-center overflow-hidden">
                <img
                  src={
                    usdtQrCodeUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      usdtBep20Address || "USDT-BEP20"
                    )}`
                  }
                  alt="USDT QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10.5px] font-medium text-slate-400 mt-2">
                {usdtQrCodeUrl ? "Custom Admin QR Image" : "Auto-Generated from Address"}
              </span>
            </div>

            {/* Upload or URL Controls */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Upload Custom QR Code Image (from Binance / Bybit / TrustWallet / Gallery)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-sm">
                    <Upload size={15} />
                    <span>{uploadingQr ? "Uploading..." : "Upload QR Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={uploadingQr}
                      className="hidden"
                    />
                  </label>
                  {usdtQrCodeUrl && (
                    <button
                      type="button"
                      onClick={() => setUsdtQrCodeUrl("")}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Reset to Auto QR</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or Paste Direct QR Image URL
                </label>
                <input
                  type="text"
                  value={usdtQrCodeUrl}
                  onChange={(e) => setUsdtQrCodeUrl(e.target.value)}
                  placeholder="https://.../my-bep20-qr.png (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Deposit Instructions / Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deposit Instructions & Cautions (Shown to users on /recharge)
            </label>
            <textarea
              rows={4}
              value={usdtDepositInstructions}
              onChange={(e) => setUsdtDepositInstructions(e.target.value)}
              placeholder="Enter deposit instructions, guidelines, or cautions for users..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white leading-relaxed outline-none focus:border-amber-500 resize-none font-sans"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: You can use bullet points (•) and line breaks. They will be displayed formatted on the user deposit page.
            </p>
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
                Signup Bonus Reserve (BDT - Non-Withdrawable)
              </label>
              <input
                type="number"
                value={signupBonusBDT}
                onChange={(e) => setSignupBonusBDT(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-amber-400 font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform Withdrawal Fee (%)
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
                Withdrawal Hours (Start Time)
              </label>
              <input
                type="time"
                value={withdrawStartTime}
                onChange={(e) => setWithdrawStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Withdrawal Hours (End Time)
              </label>
              <input
                type="time"
                value={withdrawEndTime}
                onChange={(e) => setWithdrawEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social & Support Links */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider">
            Social & Customer Support Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Support URL
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
                Telegram Group URL
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
                Telegram Channel URL
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
                Home Announcement Ticker
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

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white font-extrabold text-base shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? "Saving Changes..." : "Save Platform Configurations"}</span>
        </button>
      </form>
    </div>
  );
}
