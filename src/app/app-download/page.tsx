import React from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import Logo from "@/components/common/Logo";
import { Download, Apple, Play } from "lucide-react";

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Download App" showBack={true} />

        <div className="p-4 space-y-6 max-w-[380px] mx-auto text-center mt-6">
          {/* Card with App Logo */}
          <div className="p-6 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-xl flex flex-col items-center">
            <div className="mb-4">
              <Logo size={90} showText={true} />
            </div>

            <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-base shadow-[0_0_20px_rgba(245,186,49,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2">
              <Download size={20} />
              <span>Download Now</span>
            </button>
          </div>

          {/* App Store & Google Play badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#020a1f] border border-slate-700 text-white text-xs font-semibold shadow-md flex-1 justify-center opacity-85">
                <Apple size={22} />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase text-gray-400">
                    Download on the
                  </div>
                  <div className="font-bold text-xs">App Store</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#020a1f] border border-slate-700 text-white text-xs font-semibold shadow-md flex-1 justify-center opacity-85">
                <Play size={20} className="fill-current text-emerald-400" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase text-gray-400">
                    GET IT ON
                  </div>
                  <div className="font-bold text-xs">Google Play</div>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-[#f5ba31] tracking-wider">
              — Coming Soon —
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

