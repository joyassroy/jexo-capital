"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  pendingKycCount: number;
  totalDepositAmount: number;
  totalWithdrawalAmount: number;
  totalUserBalance: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-600",
      href: "/admin/users",
    },
    {
      title: "Pending Deposits",
      value: stats?.pendingDepositsCount ?? 0,
      icon: ArrowDownCircle,
      color: "bg-amber-600",
      highlight: (stats?.pendingDepositsCount ?? 0) > 0,
      href: "/admin/deposits",
    },
    {
      title: "Pending Withdrawals",
      value: stats?.pendingWithdrawalsCount ?? 0,
      icon: ArrowUpCircle,
      color: "bg-rose-600",
      highlight: (stats?.pendingWithdrawalsCount ?? 0) > 0,
      href: "/admin/withdrawals",
    },
    {
      title: "Total Approved Deposits",
      value: `${(stats?.totalDepositAmount ?? 0).toLocaleString()} TK`,
      icon: CheckCircle2,
      color: "bg-emerald-600",
      href: "/admin/deposits",
    },
    {
      title: "Total Paid Withdrawals",
      value: `${(stats?.totalWithdrawalAmount ?? 0).toLocaleString()} TK`,
      icon: Wallet,
      color: "bg-purple-600",
      href: "/admin/withdrawals",
    },
    {
      title: "Total User Balances",
      value: `${(stats?.totalUserBalance ?? 0).toLocaleString()} TK`,
      icon: Clock,
      color: "bg-cyan-600",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            System Overview & Metrics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial flows, pending approval queues, and platform health.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/deposits"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <ArrowDownCircle size={16} />
            <span>Review Deposits ({stats?.pendingDepositsCount ?? 0})</span>
          </Link>
          <Link
            href="/admin/withdrawals"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <ArrowUpCircle size={16} />
            <span>Review Withdrawals ({stats?.pendingWithdrawalsCount ?? 0})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`p-5 rounded-2xl bg-[#1E293B] border transition-all hover:border-blue-500 hover:shadow-xl group ${
                item.highlight
                  ? "border-amber-500/50 shadow-amber-500/10 shadow-lg"
                  : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center shadow-md`}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="text-2xl font-black text-white">
                  {loading ? "..." : item.value}
                </div>
                <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

