"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ClipboardList } from "lucide-react";

interface RecordItem {
  _id: string;
  type: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/records")
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
    <div className="w-full min-h-full bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between pb-4">
      <div>
        <Header title="Record" showBack={true} />

        <div className="p-4 space-y-2">
          {loading ? (
            <div className="text-center py-10 text-gray-500 font-semibold text-sm">
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white shadow-sm border border-blue-100 text-gray-500">
              <ClipboardList size={40} className="mx-auto text-blue-300 mb-2" />
              <p className="font-bold text-sm text-gray-700">No transactions found</p>
              <p className="text-xs text-gray-400 mt-1">
                Your activity history will be listed here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow-md border border-blue-100 overflow-hidden divide-y divide-blue-50">
              {records.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 font-semibold text-gray-800">
                    {item.title}
                  </div>
                  <div className="text-center font-mono text-blue-600 font-medium px-2">
                    {formatDate(item.createdAt)}
                  </div>
                  <div
                    className={`font-black text-right text-sm ${
                      item.amount >= 0 ? "text-blue-900" : "text-red-600"
                    }`}
                  >
                    {item.amount >= 0
                      ? `+${Number(item.amount).toFixed(2)} USDT`
                      : `${Number(item.amount).toFixed(2)} USDT`}
                  </div>
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

