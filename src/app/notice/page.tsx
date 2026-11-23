"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCheck,
} from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "wallet_rejected" | "wallet_approved" | "withdrawal_rejected" | "deposit_rejected" | "system";
  actionUrl?: string;
  actionText?: string;
  status: "unread" | "read";
  createdAt: string;
}

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<"notifications" | "rules">("notifications");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const rules = [
    "1. Our manager will never send you any messages. If someone sends you a message, please block them.",
    "2. Do not share your personal information with anyone.",
    "3. Do not send money to anyone outside of the website.",
    "4. Keep your account number and password secure.",
    "5. For any assistance, please contact Customer Service.",
    "6. Withdrawal hours are Sunday to Thursday, from 9:00 AM to 5:00 PM (17:00).",
    "7. Deposits can be made at any time.",
    "8. The Telegram group is open from 9:00 AM to 10:00 PM.",
  ];

  const fetchNotifications = () => {
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data?.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Notices & Alerts" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col items-center justify-center my-2 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] text-[#020a1f] flex items-center justify-center shadow-[0_0_25px_rgba(245,186,49,0.4)] border-2 border-white/40">
              <Bell size={30} />
            </div>
            <h2 className="text-xl font-black text-white mt-2 tracking-tight">
              Notice Center
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Account alerts, verification updates & official platform rules
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#030e28]/90 border border-white/10 text-xs font-bold shadow-md">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "notifications"
                  ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f] shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bell size={14} />
              <span>Personal Alerts</span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ml-1">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "rules"
                  ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f] shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Volume2 size={14} />
              <span>Platform Rules</span>
            </button>
          </div>

          {/* Tab 1: Personal Notifications / Rejection Alerts */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              {unreadCount > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#f5ba31] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all as read</span>
                  </button>
                </div>
              )}

              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading notices...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#04102e]/85 border border-white/10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                    <Bell size={22} />
                  </div>
                  <div className="text-sm font-bold text-white">No New Notifications</div>
                  <div className="text-xs text-slate-400 max-w-xs mx-auto">
                    You have no active alerts. Important updates regarding wallet bindings, deposits, or withdrawals will appear here.
                  </div>
                </div>
              ) : (
                notifications.map((item) => {
                  const isRejected =
                    item.type === "wallet_rejected" || item.type === "withdrawal_rejected";
                  const isApproved =
                    item.type === "wallet_approved";

                  return (
                    <div
                      key={item._id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 relative overflow-hidden shadow-lg ${
                        isRejected
                          ? "bg-gradient-to-b from-rose-950/40 via-[#04102e] to-[#02091c] border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                          : isApproved
                          ? "bg-gradient-to-b from-emerald-950/40 via-[#04102e] to-[#02091c] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "bg-[#04102e]/90 border-white/10"
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isRejected
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : isApproved
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            }`}
                          >
                            {isRejected ? (
                              <AlertCircle size={15} />
                            ) : isApproved ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <Sparkles size={15} />
                            )}
                          </div>
                          <div>
                            <h4
                              className={`text-xs sm:text-sm font-black tracking-tight ${
                                isRejected
                                  ? "text-rose-400"
                                  : isApproved
                                  ? "text-emerald-400"
                                  : "text-white"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              <span>
                                {new Date(item.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {item.status === "unread" && (
                          <span className="w-2 h-2 rounded-full bg-[#f5ba31] shrink-0 mt-1 shadow-[0_0_6px_#f5ba31]" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-line pl-9">
                        {item.message}
                      </div>

                      {/* Action Button if available */}
                      {item.actionUrl && (
                        <div className="pt-1 pl-9">
                          <Link
                            href={item.actionUrl}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 ${
                              isRejected
                                ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]"
                                : "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] text-[#020a1f]"
                            }`}
                          >
                            <span>{item.actionText || "View Details"}</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Official Rules Card */}
          {activeTab === "rules" && (
            <div className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg divide-y divide-white/10 text-xs text-slate-300 font-semibold leading-relaxed space-y-3">
              {rules.map((rule, idx) => (
                <div key={idx} className="pt-3 first:pt-0">
                  {rule}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
