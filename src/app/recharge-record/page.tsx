"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ArrowDownCircle, Clock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface RechargeItem {
  _id: string;
  amount: number;
  amountBDT: number;
  amountUSDT?: number;
  method: string;
  senderNumber: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function RechargeRecordPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<RechargeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/user/recharge/records")
      .then((res) => res.json())
      .then((data) => {
        if (data?.records) setRecords(data.records);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isLight = mounted && theme === "light";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${mins}`;
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-[#f1f5f9] text-[#0f172a]"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        <Header title={t("recharge_records")} showBack={true} />

        <div className="p-4 space-y-3 max-w-[440px] mx-auto">
          {loading ? (
            <div
              className={`text-center py-10 font-bold text-sm ${
                isLight ? "text-slate-600" : "text-slate-400"
              }`}
            >
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div
              className={`text-center py-12 rounded-3xl border transition-all ${
                isLight
                  ? "bg-white border-slate-200 shadow-sm text-slate-700"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30 shadow-lg text-slate-200"
              }`}
            >
              <ArrowDownCircle
                size={40}
                className={`mx-auto mb-2 ${isLight ? "text-amber-600" : "text-[#f5ba31]"}`}
              />
              <p
                className={`font-black text-sm ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                No recharge records
              </p>
              <p
                className={`text-xs mt-1 font-semibold ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Your submitted deposits will appear here.
              </p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border shadow-md flex items-center justify-between transition-all ${
                  isLight
                    ? "bg-white border-slate-200/90 shadow-sm"
                    : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/35 shadow-lg"
                }`}
              >
                <div>
                  <div
                    className={`text-lg font-black font-mono tracking-tight ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {item.amountBDT || item.amount} BDT
                  </div>
                  <div
                    className={`text-xs font-black font-mono mt-0.5 ${
                      isLight ? "text-amber-700" : "text-[#f5ba31]"
                    }`}
                  >
                    ≈ {(item.amountUSDT || ((item.amountBDT || item.amount) / 127)).toFixed(2)} USDT
                  </div>
                  <div
                    className={`text-[11px] font-semibold mt-0.5 ${
                      isLight ? "text-slate-500" : "text-slate-300"
                    }`}
                  >
                    Recharge Amount
                  </div>
                  <div
                    className={`mt-1 text-xs font-bold ${
                      isLight ? "text-slate-700" : "text-slate-200"
                    }`}
                  >
                    Method: {item.method}
                  </div>
                  <div
                    className={`text-[11px] flex items-center gap-1 font-mono font-medium mt-0.5 ${
                      isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    <Clock size={11} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Status Badges with High Contrast */}
                <div className="shrink-0">
                  {item.status === "pending" && (
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                        isLight
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-xs"
                      }`}
                    >
                      Pending
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                        isLight
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-xs"
                      }`}
                    >
                      Success
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                        isLight
                          ? "bg-rose-50 text-rose-800 border-rose-300"
                          : "bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-xs"
                      }`}
                    >
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
