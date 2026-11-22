import React from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Building2, Calendar, MapPin, Target, TrendingUp } from "lucide-react";

export default function CompanyInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Company Info" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Company Building Image */}
          <div className="relative h-48 w-full rounded-3xl overflow-hidden shadow-lg border-2 border-white">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
              alt="Zexo Capital Building"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-white">
                <span className="text-xl font-black">Zexo Capital</span>
                <span className="text-xs block text-cyan-200">Invest • Grow • Prosper</span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-3 text-xs text-gray-700 leading-relaxed">
            <h2 className="text-base font-black text-blue-950">Zexo Capital -</h2>
            <p>
              Founded in 1980, Zexo Capital is a premier United States-based
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
              investments, Zexo Capital combines time-tested investment principles
              with forward-looking market insights.
            </p>
          </div>

          {/* Structured Details Card */}
          <div className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-3 text-xs text-gray-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <span className="font-extrabold text-blue-950">Founded:</span> 1980
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="font-extrabold text-blue-950">Headquarters:</span>{" "}
                United States
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Target size={18} />
              </div>
              <div>
                <span className="font-extrabold text-blue-950">Core Focus:</span>{" "}
                Asset Management, Private Equity, Venture Capital, Wealth
                Advisory, and Alternative Investments
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <span className="font-extrabold text-blue-950">
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

