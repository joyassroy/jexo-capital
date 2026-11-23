"use client";

import React, { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";

interface WithdrawItem {
  _id: string;
  userId: string;
  userPhone: string;
  userNickname: string;
  method: string;
  amount: number;
  amountUSDT?: number;
  amountBDT?: number;
  feePercentage: number;
  charge: number;
  arrivalAmount: number;
  arrivalAmountBDT?: number;
  targetAccount: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawItem[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchWithdrawals = () => {
    setLoading(true);
    fetch(`/api/admin/withdrawals?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.withdrawals) setWithdrawals(data.withdrawals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const handleAction = async (withdrawalId: string, action: "approve" | "reject") => {
    const confirmText =
      action === "approve"
        ? "Confirm you have paid this withdrawal to the user's account?"
        : "Reject this withdrawal and refund the balance back to user?";

    if (!confirm(confirmText)) return;

    setActionLoading(withdrawalId);

    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action }),
      });

      if (res.ok) {
        fetchWithdrawals();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Withdrawal Requests Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user cash-outs, 10% fee deductions, and mark paid or refund.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={fetchWithdrawals}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1E293B] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Method</th>
                <th className="p-4">Recipient Account</th>
                <th className="p-4">Requested</th>
                <th className="p-4">10% Charge</th>
                <th className="p-4">Arrival Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading withdrawal records...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No withdrawals matching filter &quot;{filter}&quot;.
                  </td>
                </tr>
              ) : (
                withdrawals.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {item.userNickname || "User"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.userPhone}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-200">
                      {item.method}
                    </td>

                    <td className="p-4 font-mono font-bold text-cyan-300 select-all">
                      {item.targetAccount}
                    </td>

                    <td className="p-4 font-black text-white text-sm">
                      <div>{item.amount} USDT</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        ≈ {item.amountBDT || (item.amount * 127).toFixed(0)} BDT
                      </div>
                    </td>

                    <td className="p-4 text-amber-400 font-semibold text-xs">
                      -{item.charge} USDT (10%)
                    </td>

                    <td className="p-4 font-black text-emerald-400 text-sm">
                      <div>{item.arrivalAmount} USDT</div>
                      {item.method !== "USDT-BEP20" && (
                        <div className="text-[11px] text-[#E2136E] font-bold">
                          Send: {item.arrivalAmountBDT || (item.arrivalAmount * 127).toFixed(2)} BDT
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {item.status === "pending" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          Pending
                        </span>
                      )}
                      {item.status === "approved" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          Paid
                        </span>
                      )}
                      {item.status === "rejected" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold">
                          Refunded
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {item.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(item._id, "approve")}
                            disabled={actionLoading === item._id}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(item._id, "reject")}
                            disabled={actionLoading === item._id}
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50"
                            title="Reject & Refund"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

