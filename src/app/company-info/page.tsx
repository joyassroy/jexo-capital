import React from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Building2, Calendar, MapPin, Target, TrendingUp } from "lucide-react";

export default function CompanyInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Company Info" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Company Building Image with Gold Frame */}
          <div className="relative h-48 w-full rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(245,186,49,0.25)] border-2 border-[#f5ba31]/60">
            <Image
              src="/profile-banner-hq.jpg"
              alt="Jexo Capital Building"
              fill
              className="object-cover opacity-85"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020a1f] via-[#020a1f]/40 to-transparent flex items-end p-4">
              <div className="text-white">
                <span className="text-xl font-black bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] bg-clip-text text-transparent">
                  Jexo Capital
                </span>
                <span className="text-xs block text-[#ffe58f] font-semibold">Invest • Grow • Prosper</span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-3 text-xs text-slate-300 leading-relaxed">
            <h2 className="text-base font-black text-white">Jexo Capital -</h2>
            <p>
              Founded in 1980, Jexo Capital is a premier United States-based
              investment management firm with over four decades of proven
              expertise in navigating global financial markets. Built on a
              foundation of disciplined research, prudent risk management, and
              long-term value creation, we partner with institutional investors,
              family offices, and high-net-worth individuals to preserve and grow
              capital across economic cycles.
            </p>
            <p>
              From our roots in traditional equities and fixed income to modern
              multi-asset strategies, private equity, and alternative
              investments, Jexo Capital combines time-tested investment principles
              with forward-looking market insights.
            </p>
          </div>

          {/* Structured Details Card */}
          <div className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-3 text-xs text-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f5ba31]/15 text-[#f5ba31] border border-[#f5ba31]/30 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <span className="font-extrabold text-[#f5ba31]">Founded:</span> 1980
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f5ba31]/15 text-[#f5ba31] border border-[#f5ba31]/30 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="font-extrabold text-[#f5ba31]">Headquarters:</span>{" "}
                United States
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f5ba31]/15 text-[#f5ba31] border border-[#f5ba31]/30 flex items-center justify-center flex-shrink-0">
                <Target size={18} />
              </div>
              <div>
                <span className="font-extrabold text-[#f5ba31]">Core Focus:</span>{" "}
                Asset Management, Private Equity, Venture Capital, Wealth
                Advisory, and Alternative Investments
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f5ba31]/15 text-[#f5ba31] border border-[#f5ba31]/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <span className="font-extrabold text-[#f5ba31]">
                  Investment Philosophy:
                </span>{" "}
                Long-term capital appreciation through rigorous fundamental
                analysis and disciplined risk control.
              </div>
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

