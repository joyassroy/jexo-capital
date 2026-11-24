"use client";

import React, { useEffect, useState } from "react";
import { Search, ShieldAlert, CheckCircle2, UserCheck } from "lucide-react";

interface UserItem {
  _id: string;
  phone: string;
  nickname: string;
  balance: number;
  referralCode: string;
  referralCount: number;
  vipLevel: number;
  status: "active" | "blocked";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Balance adjustment modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjusting, setAdjusting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUserStatus = async (user: UserItem) => {
    const newStatus = user.status === "active" ? "blocked" : "active";
    if (!confirm(`Change user ${user.nickname} status to ${newStatus}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, status: newStatus }),
      });

      if (res.ok) fetchUsers();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;

    const delta =
      adjustType === "credit" ? Number(adjustAmount) : -Number(adjustAmount);

    setAdjusting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          balanceAdjustment: delta,
        }),
      });

      if (res.ok) {
        setSelectedUser(null);
        setAdjustAmount("");
        fetchUsers();
      } else {
        alert("Failed to adjust balance.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            User Management Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search users, adjust balances manually, and manage account statuses.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex items-center bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-blue-500">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search phone or nickname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-white outline-none w-44"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1E293B] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Referral Code</th>
                <th className="p-4">Team Count</th>
                <th className="p-4">VIP Tier</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-white">{u.nickname}</td>
                    <td className="p-4 font-mono text-slate-300">{u.phone}</td>
                    <td className="p-4 font-mono text-cyan-400">{u.referralCode}</td>
                    <td className="p-4 font-bold text-blue-400">{u.referralCount}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        Vip {u.vipLevel}
                      </span>
                    </td>
                    <td className="p-4 font-black text-white text-sm">
                      {Number(u.balance).toFixed(2)} TK
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[11px] transition-colors"
                      >
                        Adjust Balance
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          u.status === "active"
                            ? "bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white"
                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        {u.status === "active" ? "Block" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="admin-modal w-full max-w-sm rounded-3xl bg-[#1E293B] border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">
              Adjust Balance for {selectedUser.nickname}
            </h3>
            <p className="text-xs text-slate-400">
              Current Balance:{" "}
              <span className="font-bold text-white">
                {selectedUser.balance} TK
              </span>
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("credit")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    adjustType === "credit"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  + Add Funds
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("debit")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    adjustType === "debit"
                      ? "bg-red-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  - Deduct Funds
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount in TK
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm font-bold text-white outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {adjusting ? "Processing..." : "Confirm Adjustment"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

