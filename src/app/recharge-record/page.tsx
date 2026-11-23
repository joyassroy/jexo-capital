"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ArrowDownCircle, Clock } from "lucide-react";

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
  const [records, setRecords] = useState<RechargeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/recharge/records")
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
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Recharge Record" showBack={true} />

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500 font-semibold text-sm">
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white shadow-sm border border-blue-100 text-gray-500">
              <ArrowDownCircle size={40} className="mx-auto text-blue-300 mb-2" />
              <p className="font-bold text-sm text-gray-700">No recharge records</p>
              <p className="text-xs text-gray-400 mt-1">
                Your submitted deposits will appear here.
              </p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-lg font-black text-blue-950">
                    {item.amountBDT || item.amount} BDT
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold">
                    ≈ {(item.amountUSDT || ((item.amountBDT || item.amount) / 127)).toFixed(2)} USDT
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Recharge Amount
                  </div>
                  <div className="mt-1 text-xs text-gray-700 font-medium">
                    Method: {item.method}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div>
                  {item.status === "pending" && (
                    <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                      Pending
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Success
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
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

