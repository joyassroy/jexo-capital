"use client";

import React, { useEffect, useState } from "react";
import {
  Crown,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Percent,
  Layers,
  ShoppingBag,
  DollarSign,
  X,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";

interface AdminVipTier {
  _id: string;
  level: number;
  name: string;
  dailyReturn: string;
  dailyReturnPercent: number;
  numberOfOrders: number;
  commissionPerOrder: string;
  commissionPerOrderPercent: number;
  minBDT: number;
  maxBDT: number;
  minUSDT?: number;
  maxUSDT?: number;
  status: "active" | "inactive";
  order?: number;
}

export default function AdminVipManagementPage() {
  const [tiers, setTiers] = useState<AdminVipTier[]>([]);
  const [vipAutoActiveEnabled, setVipAutoActiveEnabled] = useState<boolean>(true);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [loading, setLoading] = useState(true);
  const [updatingAuto, setUpdatingAuto] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [savingTier, setSavingTier] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    level: 1,
    name: "Vip-1",
    dailyReturnPercent: 5.0,
    numberOfOrders: 5,
    commissionPerOrderPercent: 0.5,
    minBDT: 1000,
    maxBDT: 2999,
    status: "active" as "active" | "inactive",
  });

  const fetchTiers = async () => {
    try {
      const res = await fetch("/api/admin/vip");
      const data = await res.json();
      if (res.ok && data.tiers) {
        setTiers(data.tiers);
        setVipAutoActiveEnabled(data.vipAutoActiveEnabled !== false);
        if (data.usdtRate) setUsdtRate(data.usdtRate);
      }
    } catch (err) {
      console.error("Error fetching VIP tiers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  // Toggle global auto-active switch
  const handleToggleAutoActive = async () => {
    setUpdatingAuto(true);
    const nextVal = !vipAutoActiveEnabled;
    try {
      const res = await fetch("/api/admin/vip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vipAutoActiveEnabled: nextVal }),
      });
      const data = await res.json();
      if (res.ok) {
        setVipAutoActiveEnabled(nextVal);
        showNotification(
          "success",
          nextVal
            ? "VIP Auto-Activation ENABLED! Users automatically upgrade when their balance qualifies."
            : "VIP Auto-Activation DISABLED."
        );
      } else {
        showNotification("error", data.error || "Failed to update setting.");
      }
    } catch {
      showNotification("error", "Network error updating VIP auto-activation.");
    } finally {
      setUpdatingAuto(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    const hasZero = tiers.some((t) => t.level === 0);
    const nextLevel = !hasZero ? 0 : (tiers.length > 0 ? Math.max(...tiers.map((t) => t.level)) + 1 : 1);
    setFormData({
      level: nextLevel,
      name: `Vip-${nextLevel}`,
      dailyReturnPercent: nextLevel === 0 ? 2.5 : 5.0,
      numberOfOrders: 5,
      commissionPerOrderPercent: 0.5,
      minBDT: nextLevel === 0 ? 0 : 1000,
      maxBDT: nextLevel === 0 ? 999 : 2999,
      status: "active",
    });
    setIsEditing(false);
    setEditingTierId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (tier: AdminVipTier) => {
    setFormData({
      level: tier.level,
      name: tier.name,
      dailyReturnPercent: tier.dailyReturnPercent,
      numberOfOrders: tier.numberOfOrders,
      commissionPerOrderPercent: tier.commissionPerOrderPercent,
      minBDT: tier.minBDT,
      maxBDT: tier.maxBDT,
      status: tier.status,
    });
    setIsEditing(true);
    setEditingTierId(tier._id);
    setShowModal(true);
  };

  // Submit Add or Edit
  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTier(true);

    try {
      if (isEditing && editingTierId) {
        // Update existing tier
        const res = await fetch("/api/admin/vip", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: editingTierId,
            ...formData,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showNotification("success", data.message || "VIP tier updated successfully!");
          setShowModal(false);
          fetchTiers();
        } else {
          showNotification("error", data.error || "Failed to update VIP tier.");
        }
      } else {
        // Create new tier
        const res = await fetch("/api/admin/vip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
          showNotification("success", data.message || "VIP tier created successfully!");
          setShowModal(false);
          fetchTiers();
        } else {
          showNotification("error", data.error || "Failed to create VIP tier.");
        }
      }
    } catch {
      showNotification("error", "Network error saving VIP tier.");
    } finally {
      setSavingTier(false);
    }
  };

  // Delete tier
  const handleDeleteTier = async (tier: AdminVipTier) => {
    if (!confirm(`Are you sure you want to delete ${tier.name} (Level ${tier.level})? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/vip?id=${tier._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", data.message || "VIP tier deleted successfully.");
        fetchTiers();
      } else {
        showNotification("error", data.error || "Failed to delete VIP tier.");
      }
    } catch {
      showNotification("error", "Network error deleting VIP tier.");
    }
  };

  // Toggle single tier status
  const handleToggleTierStatus = async (tier: AdminVipTier) => {
    const newStatus = tier.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/admin/vip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: tier._id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setTiers((prev) =>
          prev.map((t) => (t._id === tier._id ? { ...t, status: newStatus } : t))
        );
        showNotification("success", `${tier.name} marked as ${newStatus}.`);
      }
    } catch {
      showNotification("error", "Failed to change tier status.");
    }
  };

  return (
    <div
      data-admin-root="true"
      className="admin-root space-y-6 text-slate-100"
      style={{ color: "#f8fafc" }}
    >
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ color: "#ffffff" }}>
              VIP Level Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1" style={{ color: "#94a3b8" }}>
            Configure VIP investment tiers, daily returns, order commissions, and balance auto-activation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTiers}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            style={{ backgroundColor: "#1E293B", color: "#cbd5e1" }}
            title="Refresh Tiers"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/25"
            style={{ color: "#ffffff" }}
          >
            <Plus size={16} />
            <span>Add VIP Level</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all animate-in fade-in ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Auto-Activation Global Setting Banner */}
      <div
        className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ backgroundColor: "#1E293B", borderColor: "#334155" }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              vipAutoActiveEnabled
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <Crown size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white" style={{ color: "#ffffff" }}>
                Automatic VIP Activation by Balance
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  vipAutoActiveEnabled
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {vipAutoActiveEnabled ? "Enabled (Active)" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed" style={{ color: "#94a3b8" }}>
              When enabled, user VIP levels are automatically evaluated and upgraded whenever their wallet balance meets the minimum requirement (Rate: 1 USDT = {usdtRate} BDT). No manual purchasing required.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAutoActive}
          disabled={updatingAuto}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            vipAutoActiveEnabled
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
          style={
            vipAutoActiveEnabled
              ? { backgroundColor: "#059669", color: "#ffffff" }
              : { backgroundColor: "#1e293b", color: "#cbd5e1" }
          }
        >
          {updatingAuto ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : vipAutoActiveEnabled ? (
            <ToggleRight size={20} className="text-white" />
          ) : (
            <ToggleLeft size={20} className="text-slate-400" />
          )}
          <span>{vipAutoActiveEnabled ? "Auto-Activation ON" : "Auto-Activation OFF"}</span>
        </button>
      </div>

      {/* VIP Tiers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 size={32} className="animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-xs font-bold">Loading VIP Tiers...</p>
          </div>
        ) : tiers.length === 0 ? (
          <div
            className="col-span-full py-12 text-center text-slate-500 bg-[#1E293B] rounded-2xl border border-slate-800"
            style={{ backgroundColor: "#1E293B", borderColor: "#334155" }}
          >
            <Crown size={36} className="mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="text-sm font-bold text-slate-300">No VIP tiers found.</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Create VIP-1 Tier
            </button>
          </div>
        ) : (
          [...tiers].sort((a, b) => a.level - b.level).map((tier) => {
            const minUSDT = (tier.minBDT / usdtRate).toFixed(2);
            const maxUSDT = (tier.maxBDT / usdtRate).toFixed(2);
            const isTierActive = tier.status === "active";

            return (
              <div
                key={tier._id}
                className={`p-5 rounded-2xl bg-[#1E293B] border transition-all relative flex flex-col justify-between ${
                  isTierActive
                    ? "border-slate-800 hover:border-amber-500/50 shadow-md"
                    : "border-slate-800/60 opacity-60 bg-slate-900/60"
                }`}
                style={{ backgroundColor: "#1E293B", borderColor: isTierActive ? "#334155" : "#1e293b" }}
              >
                <div>
                  {/* Tier Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs">
                        {tier.level}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white" style={{ color: "#ffffff" }}>
                          {tier.name}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400" style={{ color: "#94a3b8" }}>
                          Level {tier.level}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTierStatus(tier)}
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full transition-colors ${
                        isTierActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {tier.status}
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div
                    className="space-y-2.5 p-3 rounded-xl bg-[#0c1427] border border-slate-800 text-xs mb-4"
                    style={{ backgroundColor: "#0c1427", borderColor: "#1e293b" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <TrendingUp size={13} className="text-red-400" />
                        Daily Return:
                      </span>
                      <span className="font-extrabold text-red-400 font-mono">
                        {tier.dailyReturn || `${tier.dailyReturnPercent}%`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <ShoppingBag size={13} className="text-emerald-400" />
                        Daily Orders:
                      </span>
                      <span className="font-extrabold text-emerald-400 font-mono">
                        {tier.numberOfOrders} orders
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                        <Percent size={13} className="text-cyan-400" />
                        Order Commission:
                      </span>
                      <span className="font-extrabold text-cyan-400 font-mono">
                        {tier.commissionPerOrder || `${tier.commissionPerOrderPercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* Balance Requirements */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                      Qualifying Balance Range
                    </div>
                    <div className="text-sm font-black text-white font-mono" style={{ color: "#ffffff" }}>
                      {tier.minBDT.toLocaleString()} – {tier.maxBDT.toLocaleString()} Tk
                    </div>
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1 font-mono">
                      <span>≈ {minUSDT} – {maxUSDT} USDT</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800" style={{ borderColor: "#334155" }}>
                  <button
                    onClick={() => openEditModal(tier)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-cyan-300 text-xs font-bold transition-colors border border-blue-500/30"
                    style={{ color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Tier</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTier(tier)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20"
                    style={{ color: "#f87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                    title="Delete Tier"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Add / Edit Tier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="admin-modal relative w-full max-w-lg bg-[#0F172A] rounded-3xl border border-slate-700/80 p-6 space-y-5 text-white shadow-2xl"
            style={{ backgroundColor: "#0F172A", color: "#ffffff", borderColor: "#334155" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800" style={{ borderColor: "#1E293B" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md shadow-amber-500/10">
                  <Crown size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight" style={{ color: "#ffffff" }}>
                    {isEditing ? `Edit VIP Tier: ${formData.name}` : "Create New VIP Tier"}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium" style={{ color: "#cbd5e1" }}>
                    Configure tier thresholds, commission rates, and status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700/50"
                style={{ backgroundColor: "#1E293B", color: "#cbd5e1" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTier} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    VIP Level Number
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: Number(e.target.value) })
                    }
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                </div>

                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Vip-1"
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    Daily Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.dailyReturnPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyReturnPercent: Number(e.target.value),
                      })
                    }
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                </div>

                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    Orders / Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.numberOfOrders}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfOrders: Number(e.target.value),
                      })
                    }
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                </div>

                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.commissionPerOrderPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionPerOrderPercent: Number(e.target.value),
                      })
                    }
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                </div>
              </div>

              {/* Min & Max BDT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    Min Balance (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBDT}
                    onChange={(e) =>
                      setFormData({ ...formData, minBDT: Number(e.target.value) })
                    }
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 w-fit">
                    <span className="text-[11px] font-black text-amber-400 font-mono">
                      ≈ {(formData.minBDT / usdtRate).toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <div>
                  <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                    Max Balance (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBDT}
                    onChange={(e) =>
                      setFormData({ ...formData, maxBDT: Number(e.target.value) })
                    }
                    className="admin-input w-full px-3.5 py-2.5 rounded-xl bg-[#0c1427] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                    style={{ backgroundColor: "#0c1427", color: "#ffffff", borderColor: "#334155" }}
                    required
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 w-fit">
                    <span className="text-[11px] font-black text-amber-400 font-mono">
                      ≈ {(formData.maxBDT / usdtRate).toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="admin-label text-xs font-bold text-slate-200 block mb-1.5" style={{ color: "#e2e8f0" }}>
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "active" })}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${
                      formData.status === "active"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/30"
                        : "bg-[#1E293B] text-slate-400 hover:text-slate-200 border-slate-700"
                    }`}
                    style={
                      formData.status === "active"
                        ? { backgroundColor: "#059669", color: "#ffffff", borderColor: "#10b981" }
                        : { backgroundColor: "#1e293b", color: "#94a3b8", borderColor: "#334155" }
                    }
                  >
                    <CheckCircle2 size={15} />
                    <span>Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "inactive" })}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${
                      formData.status === "inactive"
                        ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/30"
                        : "bg-[#1E293B] text-slate-400 hover:text-slate-200 border-slate-700"
                    }`}
                    style={
                      formData.status === "inactive"
                        ? { backgroundColor: "#e11d48", color: "#ffffff", borderColor: "#f43f5e" }
                        : { backgroundColor: "#1e293b", color: "#94a3b8", borderColor: "#334155" }
                    }
                  >
                    <AlertCircle size={15} />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>

              {/* Info Note */}
              <div
                className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", borderColor: "rgba(59, 130, 246, 0.35)", color: "#93c5fd" }}
              >
                <Info size={16} className="shrink-0 mt-0.5 text-cyan-400" />
                <span className="leading-relaxed">
                  The USDT equivalent is automatically computed using the current system rate (<strong className="text-white font-bold">1 USDT = {usdtRate} BDT</strong>).
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800" style={{ borderColor: "#1E293B" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  style={{ backgroundColor: "#1e293b", color: "#cbd5e1", borderColor: "#334155" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTier}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                  style={{ color: "#ffffff" }}
                >
                  {savingTier && <Loader2 size={15} className="animate-spin text-white" />}
                  <span>{isEditing ? "Update VIP Tier" : "Create VIP Tier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
