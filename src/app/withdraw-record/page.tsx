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
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Withdraw Record" showBack={true} />

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500 font-semibold text-sm">
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white shadow-sm border border-blue-100 text-gray-500">
              <ArrowUpCircle size={40} className="mx-auto text-blue-300 mb-2" />
              <p className="font-bold text-sm text-gray-700">No withdrawal records</p>
              <p className="text-xs text-gray-400 mt-1">
                Your submitted cash-outs will appear here.
              </p>
            </div>
          ) : (
            records.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-2.5"
              >
                {/* 3 columns: Amount | Charge | Arrival */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 text-center pb-2 border-b border-gray-100">
                  <div>
                    <div className="text-base font-black text-blue-950">
                      {item.amount}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">
                      Withdraw&apos;l Amount
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-amber-600">
                      {item.feePercentage || 10}%
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">
                      Charge
                    </div>
                  </div>

                  <div>
                    <div className="text-base font-black text-emerald-600">
                      {item.arrivalAmount}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">
                      Arrival Amount
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

