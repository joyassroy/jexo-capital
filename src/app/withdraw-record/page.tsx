"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ArrowUpCircle, Clock, AlertCircle } from "lucide-react";

interface WithdrawItem {
  _id: string;
  amount: number;
  feePercentage: number;
  charge: number;
  arrivalAmount: number;
  method: string;
  targetAccount: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function WithdrawRecordPage() {
  const [records, setRecords] = useState<WithdrawItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/withdraw/records")
      .then((res) => res.json())
      .then((data) => {
        if (data?.records) setRecords(data.records);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Withdraw Record" showBack={true} />

        <div className="p-4 space-y-3 max-w-[420px] mx-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400 font-semibold text-sm">
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg text-slate-300">
              <ArrowUpCircle size={40} className="mx-auto text-[#f5ba31] mb-2" />
              <p className="font-bold text-sm text-white">No withdrawal records</p>
              <p className="text-xs text-slate-400 mt-1">
                Your submitted cash-outs will appear here.
              </p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-2.5"
              >
                {/* 3 columns: Amount | Charge | Arrival */}
                <div className="grid grid-cols-3 divide-x divide-white/10 text-center pb-2 border-b border-white/10">
                  <div>
                    <div className="text-base font-black text-white">
                      {item.amount} <span className="text-[#f5ba31] text-xs">USDT</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Withdraw Amount
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-amber-600">
                      {item.feePercentage || 10}%
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">
                      10% Charge
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-emerald-600">
                      {item.arrivalAmount} USDT
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {item.method !== "USDT-BEP20"
                        ? `≈ ${(item.arrivalAmount * 127).toFixed(0)} BDT`
                        : "Arrival"}
                    </div>
                  </div>
                </div>

                {/* Footer details: Method, Date, Status */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-gray-600 font-semibold">
                    <span>Method: {item.method}</span>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-normal">
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
            ))
          )}
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

