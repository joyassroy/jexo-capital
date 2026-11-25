"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ArrowUpCircle, Clock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
    <div className={`min-h-screen ${isLight ? "bg-[#f4f7fb] text-slate-800" : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"} flex flex-col justify-between pb-28`}>
      <div>
        <Header title="Withdraw Record" showBack={true} />

        <div className="p-4 space-y-3 max-w-[420px] mx-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400 font-semibold text-sm">
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className={`text-center py-12 rounded-3xl ${isLight ? "bg-white border-slate-200 text-slate-600 shadow-sm" : "bg-[#04102e]/85 border-[#f5ba31]/30 text-slate-300 shadow-lg"} backdrop-blur-md border`}>
              <ArrowUpCircle size={40} className="mx-auto text-[#f5ba31] mb-2" />
              <p className={`font-bold text-sm ${isLight ? "text-slate-800" : "text-white"}`}>No withdrawal records</p>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"} mt-1`}>
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
                  className={`p-4 rounded-2xl ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#04102e]/85 border-[#f5ba31]/30 shadow-lg"} backdrop-blur-md border space-y-2.5`}
                >
                  {/* 3 columns: Amount | Charge | Arrival */}
                  <div className={`grid grid-cols-3 divide-x ${isLight ? "divide-slate-200 border-b border-slate-100" : "divide-white/10 border-b border-white/10"} text-center pb-2.5`}>
                    <div className="flex flex-col justify-center px-1">
                      <div className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                        {item.amount} <span className="text-[#f5ba31] text-xs">USDT</span>
                      </div>
                      {item.method !== "USDT-BEP20" ? (
                        <div className="text-[11px] text-amber-500 font-bold">
                          ≈ {withdrawBDT.toLocaleString("en-US", { maximumFractionDigits: 0 })} BDT
                        </div>
                      ) : null}
                      <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"} font-semibold`}>
                        Withdraw Amount
                      </div>
                    </div>

                    <div className="flex flex-col justify-center px-1">
                      <div className="text-base font-black text-amber-600">
                        {item.feePercentage || 10}%
                      </div>
                      <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-400"} font-semibold`}>
                        {item.feePercentage || 10}% Charge
                      </div>
                    </div>

                    <div className="flex flex-col justify-center px-1">
                      <div className="text-base font-black text-emerald-600">
                        {item.arrivalAmount} <span className="text-xs">USDT</span>
                      </div>
                      {item.method !== "USDT-BEP20" ? (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ≈ {arrivalBDT.toLocaleString("en-US", { maximumFractionDigits: 0 })} BDT
                        </div>
                      ) : null}
                      <div className={`text-[10px] ${isLight ? "text-emerald-700/80" : "text-emerald-400/80"} font-semibold`}>
                        Arrival
                      </div>
                    </div>
                  </div>

                  {/* Footer details: Method, Date, Status */}
                  <div className="flex items-center justify-between pt-1">
                    <div className={`text-xs ${isLight ? "text-slate-700" : "text-gray-300"} font-semibold`}>
                      <span>Method: {item.method}</span>
                      <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-400"} flex items-center gap-1 mt-0.5 font-normal`}>
                        <Clock size={11} />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {item.status === "pending" && (
                        <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                          Pending
                        </span>
                      )}
                      {item.status === "approved" && (
                        <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                          Success
                        </span>
                      )}
                      {item.status === "rejected" && (
                        <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
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
