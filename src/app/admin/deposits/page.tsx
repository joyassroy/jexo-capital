"use client";

import React, { useEffect, useState } from "react";
import { Check, X, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface DepositItem {
  _id: string;
  userId: string;
  userPhone: string;
  userNickname: string;
  method: string;
  amount: number;
  amountBDT: number;
  amountUSDT?: number;
  senderNumber: string;
  transferType: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDeposits = () => {
    setLoading(true);
    fetch(`/api/admin/deposits?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.deposits) setDeposits(data.deposits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeposits();
  }, [filter]);

  const handleAction = async (depositId: string, action: "approve" | "reject") => {
    const confirmText =
      action === "approve"
        ? "Approve this deposit and credit user balance?"
        : "Reject this deposit request?";

    if (!confirm(confirmText)) return;

    setActionLoading(depositId);

    try {
      const res = await fetch("/api/admin/deposits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId, action }),
      });

      if (res.ok) {
        fetchDeposits();
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
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Deposit Requests Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify submitted 10-digit TxIDs and credit user accounts in 1-click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={fetchDeposits}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="rounded-2xl bg-[#1E293B] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Method / Channel</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Sender Account</th>
                <th className="p-4">Transaction ID (TxID)</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading deposit records...
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No deposits matching filter &quot;{filter}&quot;.
                  </td>
                </tr>
              ) : (
                deposits.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {item.userNickname || "User"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.userPhone}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-200">
                        {item.method}
                      </span>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {item.transferType?.replace("_", " ") || "send money"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-black text-white text-sm">
                        {item.amountBDT || item.amount} BDT
                      </div>
                      <div className="text-[11px] font-bold text-emerald-400">
                        ≈ {(item.amountUSDT || (item.amountBDT / 127)).toFixed(2)} USDT
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      {item.senderNumber}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-950/70 text-cyan-400 font-mono font-bold border border-blue-800 select-all">
                        {item.transactionId}
                      </span>
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
                          Approved
                        </span>
                      )}
                      {item.status === "rejected" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold">
                          Rejected
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
                            title="Approve & Credit Balance"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(item._id, "reject")}
                            disabled={actionLoading === item._id}
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50"
                            title="Reject"
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

