"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { ClipboardList } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface RecordItem {
  _id: string;
  type: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function RecordsPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/user/records")
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
        <Header title={t("records")} showBack={true} />

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
                  : "bg-[#05143a]/80 backdrop-blur-md border-[#f5ba31]/30 shadow-lg text-slate-200"
              }`}
            >
              <ClipboardList
                size={40}
                className={`mx-auto mb-2 ${isLight ? "text-amber-600" : "text-[#f5ba31]"}`}
              />
              <p
                className={`font-black text-sm ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                No transactions found
              </p>
              <p
                className={`text-xs mt-1 font-semibold ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Your activity history will be listed here.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-md overflow-hidden divide-y transition-all ${
                isLight
                  ? "bg-white border-slate-200 divide-slate-100 shadow-sm"
                  : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/35 divide-white/10 shadow-lg"
              }`}
            >
              {records.map((item) => (
                <div
                  key={item._id}
                  className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                    isLight ? "hover:bg-slate-50" : "hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`flex-1 font-bold ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {item.title}
                  </div>
                  <div
                    className={`text-center font-mono font-semibold text-[11px] px-2 ${
                      isLight ? "text-slate-500" : "text-slate-300"
                    }`}
                  >
                    {formatDate(item.createdAt)}
                  </div>
                  <div
                    className={`font-black text-right text-sm font-mono shrink-0 ${
                      item.amount >= 0
                        ? isLight
                          ? "text-emerald-700"
                          : "text-[#00e676]"
                        : isLight
                        ? "text-rose-700"
                        : "text-[#ff4d4f]"
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
