"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Crown, Sparkles } from "lucide-react";

export default function VipPage() {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const plans = [
    {
      id: "vip-1",
      name: "Vip-1",
      dailyReturn: "30.00",
      cycle: "7 days",
      totalReturn: "210.00",
      investmentAmount: 1000,
      progress: 35,
    },
    {
      id: "vip-2",
      name: "Vip-2",
      dailyReturn: "99.00",
      cycle: "7 days",
      totalReturn: "690.00",
      investmentAmount: 2000,
      progress: 50,
    },
    {
      id: "vip-3",
      name: "Vip-3",
      dailyReturn: "30.00",
      cycle: "7 days",
      totalReturn: "210.00",
      investmentAmount: 3000,
      progress: 25,
    },
    {
      id: "vip-4",
      name: "Vip-4",
      dailyReturn: "99.00",
      cycle: "7 days",
      totalReturn: "690.00",
      investmentAmount: 40000,
      progress: 10,
    },
  ];

  const handleBuy = (planName: string) => {
    alert(
      `Package "${planName}" selected. Automated ROI package purchasing is scheduled in the final VIP Phase as per roadmap.`
    );
  };

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] pb-4 flex flex-col justify-between">
      <div>
        <Header title="Invest and Share the Earnings" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {plans.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-3 relative overflow-hidden"
            >
              {/* VIP Title Header */}
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1.5px] w-12 bg-blue-300" />
                <h3 className="text-base font-black text-blue-950 tracking-tight">
                  {item.name}
                </h3>
                <span className="h-[1.5px] w-12 bg-blue-300" />
              </div>

              {/* 3 Metrics: Daily return | Cycle | Total return */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 text-center py-2">
                <div>
                  <div className="text-base font-black text-red-500">
                    {item.dailyReturn}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
                    Daily return
                  </div>
                </div>

                <div>
                  <div className="text-base font-black text-emerald-600">
                    {item.cycle}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
                    Cycle
                  </div>
                </div>

                <div>
                  <div className="text-base font-black text-blue-900">
                    {item.totalReturn}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
                    Total return
                  </div>
                </div>
              </div>

              {/* Investment Amount & Buy Button Row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex-1 mr-4">
                  <div className="text-[11px] font-bold text-gray-500">
                    Investment amount
                  </div>
                  <div className="text-xl font-black text-blue-950 font-mono">
                    {item.investmentAmount}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-blue-100 mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(item.name)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm shadow-md hover:opacity-95 active:scale-95 transition-all flex-shrink-0"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

