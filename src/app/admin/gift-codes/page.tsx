"use client";

import React, { useEffect, useState } from "react";
import { Gift, Plus, CheckCircle2, Clock } from "lucide-react";

interface GiftCodeItem {
  _id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminGiftCodesPage() {
  const [giftCodes, setGiftCodes] = useState<GiftCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [maxUses, setMaxUses] = useState("100");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const fetchGiftCodes = () => {
    fetch("/api/admin/gift-codes")
      .then((res) => res.json())
      .then((data) => {
        if (data?.giftCodes) setGiftCodes(data.giftCodes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchGiftCodes();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !amount) return;
    setCreating(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/gift-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          amount: Number(amount),
          maxUses: Number(maxUses),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Gift code "${code.toUpperCase()}" created successfully!`);
        setCode("");
        setAmount("");
        fetchGiftCodes();
      } else {
        alert(data.error || "Failed to create gift code.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Gift Voucher Codes
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate Telegram secret promotional vouchers and monitor claims.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Creation Card */}
      <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800">
        <h2 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus size={18} />
          <span>Create New Promo Voucher</span>
        </h2>

        <form
          onSubmit={handleCreateCode}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Secret Code Name
            </label>
            <input
              type="text"
              placeholder="e.g. BONUS50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm font-mono font-bold text-white uppercase outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bonus Reward (TK)
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm font-bold text-white outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Max Redemptions
            </label>
            <input
              type="number"
              placeholder="100"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm font-bold text-white outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {creating ? "Creating..." : "Generate Code"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1E293B] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Reward Amount</th>
                <th className="p-4">Claimed / Max Uses</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading gift codes...
                  </td>
                </tr>
              ) : giftCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No active gift codes. Create one above to distribute on Telegram.
                  </td>
                </tr>
              ) : (
                giftCodes.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-lg bg-blue-950/70 text-cyan-300 font-mono font-black border border-blue-800 select-all">
                        {item.code}
                      </span>
                    </td>
                    <td className="p-4 font-black text-white text-sm">
                      {item.amount} TK
                    </td>
                    <td className="p-4 font-bold text-slate-300">
                      {item.usedCount} / {item.maxUses}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Active
                      </span>
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

