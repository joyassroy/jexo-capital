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
    const nextLevel = tiers.length > 0 ? Math.max(...tiers.map((t) => t.level)) + 1 : 1;
    setFormData({
      level: nextLevel,
      name: `Vip-${nextLevel}`,
      dailyReturnPercent: 5.0,
      numberOfOrders: 5,
      commissionPerOrderPercent: 0.5,
      minBDT: 1000,
      maxBDT: 2999,
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
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              VIP Level Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure VIP investment tiers, daily returns, order commissions, and balance auto-activation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTiers}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Tiers"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/25"
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
      <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <h2 className="text-sm font-extrabold text-white">
                Automatic VIP Activation by Balance
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  vipAutoActiveEnabled
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {vipAutoActiveEnabled ? "Enabled (Active)" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
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
        >
          {updatingAuto ? (
            <Loader2 size={16} className="animate-spin" />
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
          <div className="col-span-full py-12 text-center text-slate-500 bg-[#1E293B] rounded-2xl border border-slate-800">
            <Crown size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-bold">No VIP tiers found.</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Create VIP-1 Tier
            </button>
          </div>
        ) : (
          tiers.map((tier) => {
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
              >
                <div>
                  {/* Tier Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs">
                        {tier.level}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{tier.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400">
                          Level {tier.level}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTierStatus(tier)}
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full transition-colors ${
                        isTierActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {tier.status}
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="space-y-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-red-400" />
                        Daily Return:
                      </span>
                      <span className="font-extrabold text-red-400">
                        {tier.dailyReturn || `${tier.dailyReturnPercent}%`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <ShoppingBag size={13} className="text-emerald-400" />
                        Daily Orders:
                      </span>
                      <span className="font-extrabold text-emerald-400">
                        {tier.numberOfOrders} orders
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Percent size={13} className="text-cyan-400" />
                        Order Commission:
                      </span>
                      <span className="font-extrabold text-cyan-400">
                        {tier.commissionPerOrder || `${tier.commissionPerOrderPercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* Balance Requirements */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Qualifying Balance Range
                    </div>
                    <div className="text-sm font-black text-white font-mono">
                      {tier.minBDT.toLocaleString()} – {tier.maxBDT.toLocaleString()} Tk
                    </div>
                    <div className="text-[11px] font-bold text-amber-400">
                      ≈ {minUSDT} – {maxUSDT} USDT
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => openEditModal(tier)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold transition-colors border border-blue-500/20"
                  >
                    <Edit2 size={13} />
                    <span>Edit Tier</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTier(tier)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#1E293B] rounded-3xl border border-slate-700 p-6 space-y-5 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Crown size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isEditing ? `Edit VIP Tier: ${formData.name}` : "Create New VIP Tier"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Configure tier thresholds, commission rates, and status.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTier} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    VIP Level Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Vip-1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Commission / Order (%)
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Min & Max BDT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Min Balance (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBDT}
                    onChange={(e) =>
                      setFormData({ ...formData, minBDT: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <span className="text-[10px] text-amber-400 font-bold block mt-1">
                    ≈ {(formData.minBDT / usdtRate).toFixed(2)} USDT
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Max Balance (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxBDT}
                    onChange={(e) =>
                      setFormData({ ...formData, maxBDT: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <span className="text-[10px] text-amber-400 font-bold block mt-1">
                    ≈ {(formData.maxBDT / usdtRate).toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "active" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.status === "active"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                        : "bg-slate-900 text-slate-400 border-slate-700"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "inactive" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.status === "inactive"
                        ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30"
                        : "bg-slate-900 text-slate-400 border-slate-700"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <Info size={15} className="shrink-0 mt-0.5 text-blue-400" />
                <span>
                  The USDT equivalent is automatically computed using the current system rate (1 USDT = {usdtRate} BDT).
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTier}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/25 flex items-center gap-2"
                >
                  {savingTier && <Loader2 size={14} className="animate-spin" />}
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
