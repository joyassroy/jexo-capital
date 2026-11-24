"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  Copy,
  ExternalLink,
  Coins,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface WalletItem {
  _id: string;
  userId: string;
  userPhone?: string;
  userNickname?: string;
  realName: string;
  bankType: "bKash" | "Nagad" | "USDT-BEP20";
  accountNumber: string;
  usdtAddress?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectModalWallet, setRejectModalWallet] = useState<WalletItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchWallets = () => {
    setLoading(true);
    fetch(`/api/admin/wallets?status=${statusFilter}&type=${typeFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.wallets) setWallets(data.wallets);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWallets();
  }, [statusFilter, typeFilter]);

  const handleApprove = async (walletId: string) => {
    if (!confirm("Approve and verify this wallet address?")) return;
    setActionLoading(walletId);

    try {
      const res = await fetch("/api/admin/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, action: "approve" }),
      });

      if (res.ok) {
        fetchWallets();
      } else {
        const data = await res.json();
        alert(data.error || "Approval failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlock = async (walletId: string, bankType: string) => {
    if (
      !confirm(
        `Unlock and reset this ${bankType} account? The user will be permitted to bind a new account.`
      )
    )
      return;
    setActionLoading(walletId);

    try {
      const res = await fetch("/api/admin/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, action: "unlock" }),
      });

      if (res.ok) {
        fetchWallets();
      } else {
        const data = await res.json();
        alert(data.error || "Unlock failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalWallet) return;

    setActionLoading(rejectModalWallet._id);
    try {
      const res = await fetch("/api/admin/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: rejectModalWallet._id,
          action: "reject",
          rejectionReason,
        }),
      });

      if (res.ok) {
        setRejectModalWallet(null);
        setRejectionReason("");
        fetchWallets();
      } else {
        const data = await res.json();
        alert(data.error || "Rejection failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const pendingCount = wallets.filter((w) => w.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Bank & Wallets Verification Queue</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user bound bKash, Nagad, and USDT (BEP-20) addresses. Rejecting will automatically notify the user.
          </p>
        </div>

        <button
          onClick={fetchWallets}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {["all", "USDT-BEP20", "bKash", "Nagad"].map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === tp
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-extrabold border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Account / Address</th>
                <th className="p-4">Real Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="animate-spin inline mr-2" size={18} />
                    Loading wallets...
                  </td>
                </tr>
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No wallet bindings found for this filter.
                  </td>
                </tr>
              ) : (
                wallets.map((w) => {
                  const isBep20 = w.bankType === "USDT-BEP20";
                  const address = isBep20 ? w.usdtAddress : w.accountNumber;

                  return (
                    <tr key={w._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* User Column */}
                      <td className="p-4">
                        <div className="font-bold text-white">
                          {w.userPhone || "User"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {w.userNickname || w.userId.slice(-6)}
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="p-4">
                        {isBep20 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-black">
                            <Coins size={12} />
                            <span>USDT (BEP-20)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30 text-xs font-bold">
                            <Building2 size={12} />
                            <span>{w.bankType}</span>
                          </span>
                        )}
                      </td>

                      {/* Address Column */}
                      <td className="p-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-200 break-all select-all">
                            {address}
                          </span>
                          {address && (
                            <button
                              onClick={() => copyToClipboard(address)}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                              title="Copy"
                            >
                              <Copy size={13} />
                            </button>
                          )}
                          {isBep20 && address && (
                            <a
                              href={`https://bscscan.com/address/${address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:bg-slate-700 text-cyan-400 hover:text-cyan-300"
                              title="View on BscScan"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                        {w.rejectionReason && (
                          <div className="mt-1 text-[11px] text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                            <strong>Reason:</strong> {w.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Real Name */}
                      <td className="p-4 font-semibold text-white">
                        {w.realName}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {w.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : w.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                            <AlertCircle size={12} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold animate-pulse">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(w.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(w._id)}
                              disabled={actionLoading === w._id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                              title="Approve & Verify"
                            >
                              <Check size={13} />
                              <span>Verify</span>
                            </button>
                          )}

                          {w.status !== "rejected" && (
                            <button
                              onClick={() => {
                                setRejectModalWallet(w);
                                setRejectionReason(
                                  w.bankType === "USDT-BEP20"
                                    ? "Invalid BEP-20 address format. Please re-check your Binance Smart Chain wallet address."
                                    : "Account number could not be verified."
                                );
                              }}
                              disabled={actionLoading === w._id}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                              title="Reject with Notice"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleUnlock(w._id, w.bankType)}
                            disabled={actionLoading === w._id}
                            className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                            title="Unlock and permit user to re-bind"
                          >
                            <span>Unlock</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectModalWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="admin-modal bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="font-black text-base text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={18} />
                <span>Reject {rejectModalWallet.bankType} Wallet</span>
              </h3>
              <button
                onClick={() => setRejectModalWallet(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div className="text-xs text-slate-300">
                User: <strong>{rejectModalWallet.userPhone}</strong> ({rejectModalWallet.realName})
              </div>
              <div className="text-xs text-slate-400 font-mono break-all bg-slate-900/60 p-2 rounded border border-slate-800">
                {rejectModalWallet.bankType === "USDT-BEP20"
                  ? rejectModalWallet.usdtAddress
                  : rejectModalWallet.accountNumber}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Rejection Reason (will be shown in user Notices/Notifications)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-rose-500"
                  placeholder="Explain why this wallet/address was rejected..."
                  required
                />
              </div>

              <div className="text-[11px] text-amber-400/90 leading-tight">
                ⚠️ When rejected, a notification will automatically appear on the user's <strong>Notice</strong> page with instructions to re-apply.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalWallet(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === rejectModalWallet._id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white shadow-md disabled:opacity-50"
                >
                  Confirm Rejection & Send Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
