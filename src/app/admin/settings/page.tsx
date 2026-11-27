"use client";

import React, { useEffect, useState } from "react";
import { Save, AlertCircle, CheckCircle2, Upload, QrCode, Trash2, Image as ImageIcon, RotateCcw, Loader2, User, Plus } from "lucide-react";

interface GatewayAccountItem {
  number: string;
  type: "personal" | "merchant";
  dailyLimitBDT: number;
  usedTodayBDT: number;
  lastResetDate?: string;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [bkashAccounts, setBkashAccounts] = useState<GatewayAccountItem[]>([]);
  const [nagadAccounts, setNagadAccounts] = useState<GatewayAccountItem[]>([]);
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
  const [homeBanner1, setHomeBanner1] = useState("/homepage-banner.jpg");
  const [homeBanner2, setHomeBanner2] = useState("/homepage-banner-2.jpg");
  const [profileBanner, setProfileBanner] = useState("/profile-banner-hq.jpg");
  const [uploadingBanner1, setUploadingBanner1] = useState(false);
  const [uploadingBanner2, setUploadingBanner2] = useState(false);
  const [uploadingProfileBanner, setUploadingProfileBanner] = useState(false);
  const [minWithdrawBDT, setMinWithdrawBDT] = useState(250);
  const [minWithdrawUSDT, setMinWithdrawUSDT] = useState(6);
  const [signupBonusBDT, setSignupBonusBDT] = useState(500);
  const [withdrawFeePercent, setWithdrawFeePercent] = useState(15);
  const [withdrawStartTime, setWithdrawStartTime] = useState("10:00");
  const [withdrawEndTime, setWithdrawEndTime] = useState("18:00");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingGateways, setSavingGateways] = useState(false);
  const [gatewaySavedMsg, setGatewaySavedMsg] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.setting) {
          const s = data.setting;
          setBkashNumber(s.bkashNumber || "");
          setNagadNumber(s.nagadNumber || "");
          setBkashAccounts(
            Array.isArray(s.bkashAccounts) && s.bkashAccounts.length > 0
              ? s.bkashAccounts
              : [
                  {
                    number: s.bkashNumber || "",
                    type: s.bkashType || "personal",
                    dailyLimitBDT: 25000,
                    usedTodayBDT: 0,
                    isActive: true,
                  },
                ]
          );
          setNagadAccounts(
            Array.isArray(s.nagadAccounts) && s.nagadAccounts.length > 0
              ? s.nagadAccounts
              : [
                  {
                    number: s.nagadNumber || "",
                    type: s.nagadType || "personal",
                    dailyLimitBDT: 25000,
                    usedTodayBDT: 0,
                    isActive: true,
                  },
                ]
          );
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
          setHomeBanner1(s.homeBanner1 || "/homepage-banner.jpg");
          setHomeBanner2(s.homeBanner2 || "/homepage-banner-2.jpg");
          setProfileBanner(s.profileBanner || "/profile-banner-hq.jpg");
          setMinWithdrawBDT(s.minWithdrawBDT || 250);
          setMinWithdrawUSDT(s.minWithdrawUSDT || 6);
          setSignupBonusBDT(s.signupBonusBDT ?? 500);
          setWithdrawFeePercent(s.withdrawFeePercent || 15);
          setWithdrawStartTime(s.withdrawStartTime || "10:00");
          setWithdrawEndTime(s.withdrawEndTime || "18:00");
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
      formData.append("prefix", "qr");

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

  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bannerIndex: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (bannerIndex === 1) setUploadingBanner1(true);
    else setUploadingBanner2(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", `home_banner_${bannerIndex}`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (bannerIndex === 1) {
          setHomeBanner1(data.url);
        } else {
          setHomeBanner2(data.url);
        }
      } else {
        alert(data.error || `Failed to upload Banner ${bannerIndex}`);
      }
    } catch {
      alert(`Network error while uploading Banner ${bannerIndex}`);
    } finally {
      if (bannerIndex === 1) setUploadingBanner1(false);
      else setUploadingBanner2(false);
      e.target.value = "";
    }
  };

  const handleProfileBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setUploadingProfileBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", "profile_banner");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfileBanner(data.url);
      } else {
        alert(data.error || "Failed to upload Profile Banner.");
      }
    } catch {
      alert("Network error while uploading Profile Banner.");
    } finally {
      setUploadingProfileBanner(false);
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
          bkashNumber: bkashAccounts.find((a) => a.isActive)?.number || bkashNumber,
          nagadNumber: nagadAccounts.find((a) => a.isActive)?.number || nagadNumber,
          bkashAccounts,
          nagadAccounts,
          usdtBep20Address,
          usdtRateBDT,
          usdtQrCodeUrl,
          usdtNetworkName,
          usdtDepositInstructions,
          whatsappUrl,
          telegramGroupUrl,
          telegramChannelUrl,
          homeTickerText,
          homeBanner1,
          homeBanner2,
          profileBanner,
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

  const handleSaveGateways = async () => {
    setSavingGateways(true);
    setGatewaySavedMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bkashNumber: bkashAccounts.find((a) => a.isActive)?.number || bkashNumber,
          nagadNumber: nagadAccounts.find((a) => a.isActive)?.number || nagadNumber,
          bkashAccounts,
          nagadAccounts,
          usdtRateBDT,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data?.setting?.bkashAccounts) setBkashAccounts(data.setting.bkashAccounts);
        if (data?.setting?.nagadAccounts) setNagadAccounts(data.setting.nagadAccounts);
        setGatewaySavedMsg("Gateways saved to database!");
        setTimeout(() => setGatewaySavedMsg(""), 3500);
      } else {
        alert(data.error || "Failed to save gateways.");
      }
    } catch {
      alert("Network error while saving gateways.");
    } finally {
      setSavingGateways(false);
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
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider">
                Mobile Banking Deposit Gateways (Auto-Rotation & Daily Limit)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add 4–5+ bKash & Nagad numbers with daily limits. When a number reaches its limit, users automatically get the next available number.
              </p>
            </div>
          </div>

          {/* bKash Accounts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-pink-400 uppercase tracking-wider">
                bKash Accounts ({bkashAccounts.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setBkashAccounts([
                    ...bkashAccounts,
                    {
                      number: "",
                      type: "personal",
                      dailyLimitBDT: 25000,
                      usedTodayBDT: 0,
                      isActive: true,
                    },
                  ])
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all"
              >
                <Plus size={14} /> Add bKash Number
              </button>
            </div>

            <div className="space-y-2.5">
              {bkashAccounts.map((acc, idx) => (
                <div
                  key={`bkash-${idx}`}
                  className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      bKash #{idx + 1} Number
                    </label>
                    <input
                      type="text"
                      placeholder="017xxxxxxxx"
                      value={acc.number}
                      onChange={(e) => {
                        const updated = [...bkashAccounts];
                        updated[idx] = { ...updated[idx], number: e.target.value };
                        setBkashAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Type
                    </label>
                    <select
                      value={acc.type}
                      onChange={(e) => {
                        const updated = [...bkashAccounts];
                        updated[idx] = {
                          ...updated[idx],
                          type: e.target.value as "personal" | "merchant",
                        };
                        setBkashAccounts(updated);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-semibold outline-none"
                    >
                      <option value="personal">Personal</option>
                      <option value="merchant">Merchant</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Daily Limit (TK, 0=No Limit)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={acc.dailyLimitBDT}
                      onChange={(e) => {
                        const updated = [...bkashAccounts];
                        updated[idx] = {
                          ...updated[idx],
                          dailyLimitBDT: Number(e.target.value),
                        };
                        setBkashAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                    <div className="text-[10px] font-mono text-slate-300">
                      Used:{" "}
                      <span
                        className={
                          acc.dailyLimitBDT > 0 && acc.usedTodayBDT >= acc.dailyLimitBDT
                            ? "text-rose-400 font-bold"
                            : "text-emerald-400 font-bold"
                        }
                      >
                        {acc.usedTodayBDT}
                      </span>
                      {acc.usedTodayBDT > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...bkashAccounts];
                            updated[idx] = { ...updated[idx], usedTodayBDT: 0 };
                            setBkashAccounts(updated);
                          }}
                          className="ml-1.5 text-[9px] text-amber-400 underline"
                          title="Reset today's usage"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...bkashAccounts];
                        updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                        setBkashAccounts(updated);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        acc.isActive
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {acc.isActive ? "ON" : "OFF"}
                    </button>

                    {bkashAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setBkashAccounts(bkashAccounts.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nagad Accounts List */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                Nagad Accounts ({nagadAccounts.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setNagadAccounts([
                    ...nagadAccounts,
                    {
                      number: "",
                      type: "personal",
                      dailyLimitBDT: 25000,
                      usedTodayBDT: 0,
                      isActive: true,
                    },
                  ])
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold transition-all"
              >
                <Plus size={14} /> Add Nagad Number
              </button>
            </div>

            <div className="space-y-2.5">
              {nagadAccounts.map((acc, idx) => (
                <div
                  key={`nagad-${idx}`}
                  className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Nagad #{idx + 1} Number
                    </label>
                    <input
                      type="text"
                      placeholder="018xxxxxxxx"
                      value={acc.number}
                      onChange={(e) => {
                        const updated = [...nagadAccounts];
                        updated[idx] = { ...updated[idx], number: e.target.value };
                        setNagadAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Type
                    </label>
                    <select
                      value={acc.type}
                      onChange={(e) => {
                        const updated = [...nagadAccounts];
                        updated[idx] = {
                          ...updated[idx],
                          type: e.target.value as "personal" | "merchant",
                        };
                        setNagadAccounts(updated);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-semibold outline-none"
                    >
                      <option value="personal">Personal</option>
                      <option value="merchant">Merchant</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Daily Limit (TK, 0=No Limit)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={acc.dailyLimitBDT}
                      onChange={(e) => {
                        const updated = [...nagadAccounts];
                        updated[idx] = {
                          ...updated[idx],
                          dailyLimitBDT: Number(e.target.value),
                        };
                        setNagadAccounts(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                    <div className="text-[10px] font-mono text-slate-300">
                      Used:{" "}
                      <span
                        className={
                          acc.dailyLimitBDT > 0 && acc.usedTodayBDT >= acc.dailyLimitBDT
                            ? "text-rose-400 font-bold"
                            : "text-emerald-400 font-bold"
                        }
                      >
                        {acc.usedTodayBDT}
                      </span>
                      {acc.usedTodayBDT > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...nagadAccounts];
                            updated[idx] = { ...updated[idx], usedTodayBDT: 0 };
                            setNagadAccounts(updated);
                          }}
                          className="ml-1.5 text-[9px] text-amber-400 underline"
                          title="Reset today's usage"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...nagadAccounts];
                        updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                        setNagadAccounts(updated);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        acc.isActive
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {acc.isActive ? "ON" : "OFF"}
                    </button>

                    {nagadAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setNagadAccounts(nagadAccounts.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="w-full sm:w-64">
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

            <div className="flex items-center gap-3">
              {gatewaySavedMsg && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={15} />
                  {gatewaySavedMsg}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveGateways}
                disabled={savingGateways}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {savingGateways ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                <span>{savingGateways ? "Saving..." : "Save Gateways"}</span>
              </button>
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

        {/* Homepage & Profile Banners */}
        <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={18} className="text-amber-400" />
                <span>Platform Banners (Homepage & Profile)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload custom banners displayed on the home page carousel slider and profile page header.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner 1 */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Carousel Slide 1 Banner
                </span>
                {homeBanner1 !== "/homepage-banner.jpg" && (
                  <button
                    type="button"
                    onClick={() => setHomeBanner1("/homepage-banner.jpg")}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset Default
                  </button>
                )}
              </div>

              {/* Preview Box */}
              <div className="relative aspect-[825/365] w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-inner group">
                <img
                  src={homeBanner1 || "/homepage-banner.jpg"}
                  alt="Homepage Banner 1 Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white font-medium bg-black/70 px-2.5 py-1 rounded-md">
                    Slide 1 Live Preview
                  </span>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-98">
                  {uploadingBanner1 ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Uploading Banner 1...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Upload Banner 1 Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e, 1)}
                    disabled={uploadingBanner1}
                    className="hidden"
                  />
                </label>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Or Enter Image URL:
                  </label>
                  <input
                    type="text"
                    value={homeBanner1}
                    onChange={(e) => setHomeBanner1(e.target.value)}
                    placeholder="/homepage-banner.jpg or https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Banner 2 */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Carousel Slide 2 Banner
                </span>
                {homeBanner2 !== "/homepage-banner-2.jpg" && (
                  <button
                    type="button"
                    onClick={() => setHomeBanner2("/homepage-banner-2.jpg")}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset Default
                  </button>
                )}
              </div>

              {/* Preview Box */}
              <div className="relative aspect-[825/365] w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-inner group">
                <img
                  src={homeBanner2 || "/homepage-banner-2.jpg"}
                  alt="Homepage Banner 2 Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white font-medium bg-black/70 px-2.5 py-1 rounded-md">
                    Slide 2 Live Preview
                  </span>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-98">
                  {uploadingBanner2 ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Uploading Banner 2...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Upload Banner 2 Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e, 2)}
                    disabled={uploadingBanner2}
                    className="hidden"
                  />
                </label>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Or Enter Image URL:
                  </label>
                  <input
                    type="text"
                    value={homeBanner2}
                    onChange={(e) => setHomeBanner2(e.target.value)}
                    placeholder="/homepage-banner-2.jpg or https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Profile Page Header Banner */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-700/70 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} />
                    Personal Center / Profile Page Header Banner
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Displayed at the top of the user&apos;s Profile Page (/profile) behind their avatar.
                  </p>
                </div>
                {profileBanner !== "/profile-banner-hq.jpg" && (
                  <button
                    type="button"
                    onClick={() => setProfileBanner("/profile-banner-hq.jpg")}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset Default
                  </button>
                )}
              </div>

              {/* Preview Box */}
              <div className="relative h-32 sm:h-36 w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-inner group">
                <img
                  src={profileBanner || "/profile-banner-hq.jpg"}
                  alt="Profile Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-3 pointer-events-none">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-slate-800 flex items-center justify-center text-white text-xs font-black shadow-md">
                      ZC
                    </div>
                    <div>
                      <div className="text-xs text-white font-bold">
                        User Profile Live Header
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Shows behind user avatar on /profile
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-98">
                  {uploadingProfileBanner ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Uploading Profile Banner...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Upload Profile Banner Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileBannerUpload}
                    disabled={uploadingProfileBanner}
                    className="hidden"
                  />
                </label>

                <div>
                  <input
                    type="text"
                    value={profileBanner}
                    onChange={(e) => setProfileBanner(e.target.value)}
                    placeholder="/profile-banner-hq.jpg or https://..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1E293B] border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>
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
