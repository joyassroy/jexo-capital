"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ArrowUpCircle, Clock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface WithdrawItem {
  _id: string;
  amount: number;
  amountUSDT?: number;
  amountBDT?: number;
  feePercentage: number;
  charge: number;
  arrivalAmount: number;
  arrivalAmountBDT?: number;
  method: string;
  targetAccount: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function WithdrawRecordPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<WithdrawItem[]>([]);
  const [usdtRate, setUsdtRate] = useState<number>(127);
  const [loading, setLoading] = useState(true);

  const isLight = mounted && theme === "light";

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/user/withdraw/records")
        .then((res) => res.json())
        .then((data) => {
          if (data?.records) setRecords(data.records);
        }),
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data?.settings?.usdtRateBDT) {
            setUsdtRate(data.settings.usdtRateBDT);
          }
        }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <Header title={t("withdrawal_records")} showBack={true} />

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
                  ? "bg-white border-slate-200 text-slate-700 shadow-sm"
                  : "bg-[#04102e]/85 border-[#f5ba31]/30 text-slate-300 shadow-lg"
              }`}
            >
              <ArrowUpCircle
                size={40}
                className={`mx-auto mb-2 ${isLight ? "text-amber-600" : "text-[#f5ba31]"}`}
              />
              <p
                className={`font-black text-sm ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                No withdrawal records
              </p>
              <p
                className={`text-xs mt-1 font-semibold ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Your submitted cash-outs will appear here.
              </p>
            </div>
          ) : (
            records.map((item) => {
              const withdrawBDT = item.amountBDT
                ? Number(item.amountBDT)
                : Math.round(Number(item.amount) * usdtRate);
              const arrivalBDT = item.arrivalAmountBDT
                ? Number(item.arrivalAmountBDT)
                : Math.round(Number(item.arrivalAmount) * usdtRate);

              return (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl border shadow-md space-y-2.5 transition-all ${
                    isLight
                      ? "bg-white border-slate-200/90 shadow-sm"
                      : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/35 shadow-lg"
                  }`}
                >
                  {/* 3 columns: Amount | Charge | Arrival */}
                  <div
                    className={`grid grid-cols-3 divide-x text-center pb-2.5 ${
                      isLight
                        ? "divide-slate-200 border-b border-slate-100"
                        : "divide-white/10 border-b border-white/10"
                    }`}
                  >
                    <div className="flex flex-col justify-center px-1">
                      <div
                        className={`text-base font-black font-mono ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {item.amount}{" "}
                        <span
                          className={`text-xs font-bold ${
                            isLight ? "text-amber-700" : "text-[#f5ba31]"
                          }`}
                        >
                          USDT
                        </span>
                      </div>
                      {item.method !== "USDT-BEP20" ? (
                        <div
                          className={`text-[11px] font-bold font-mono mt-0.5 ${
                            isLight ? "text-amber-800" : "text-amber-300"
                          }`}
                        >
                          ≈ {withdrawBDT.toLocaleString("en-US", { maximumFractionDigits: 0 })} BDT
                        </div>
                      ) : null}
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isLight ? "text-slate-500" : "text-slate-300"
                        }`}
                      >
                        Withdraw Amount
                      </div>
                    </div>

                    <div className="flex flex-col justify-center px-1">
                      <div
                        className={`text-base font-black font-mono ${
                          isLight ? "text-amber-700" : "text-amber-400"
                        }`}
                      >
                        {item.feePercentage || 10}%
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isLight ? "text-slate-500" : "text-slate-300"
                        }`}
                      >
                        {item.feePercentage || 10}% Fee
                      </div>
                    </div>

                    <div className="flex flex-col justify-center px-1">
                      <div
                        className={`text-base font-black font-mono ${
                          isLight ? "text-emerald-700" : "text-emerald-400"
                        }`}
                      >
                        {item.arrivalAmount} <span className="text-xs">USDT</span>
                      </div>
                      {item.method !== "USDT-BEP20" ? (
                        <div
                          className={`text-[11px] font-bold font-mono mt-0.5 ${
                            isLight ? "text-emerald-800" : "text-emerald-300"
                          }`}
                        >
                          ≈ {arrivalBDT.toLocaleString("en-US", { maximumFractionDigits: 0 })} BDT
                        </div>
                      ) : null}
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isLight ? "text-slate-500" : "text-slate-300"
                        }`}
                      >
                        Arrival
                      </div>
                    </div>
                  </div>

                  {/* Footer details: Method, Date, Status */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isLight ? "text-slate-800" : "text-slate-100"
                        }`}
                      >
                        Method: {item.method}
                      </div>
                      <div
                        className={`text-[11px] flex items-center gap-1 font-mono mt-0.5 ${
                          isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        <Clock size={11} />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status Badge with High Contrast */}
                    <div className="shrink-0">
                      {item.status === "pending" && (
                        <span
                          className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
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
                          className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
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
                          className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
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
                </div>
              );
            })
          )}
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
