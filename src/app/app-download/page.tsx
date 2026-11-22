import React from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import Logo from "@/components/common/Logo";
import { Download, Apple, Play } from "lucide-react";

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Download App" showBack={true} />

        <div className="p-4 space-y-6 max-w-[380px] mx-auto text-center mt-6">
          {/* Card with App Logo */}
          <div className="p-6 rounded-3xl bg-white shadow-xl border-2 border-blue-200 flex flex-col items-center">
            <div className="mb-4">
              <Logo size={90} showText={true} />
            </div>

            <button className="w-full py-3.5 rounded-2xl bg-blue-700 text-white font-bold text-base shadow-md hover:bg-blue-800 active:scale-98 transition-all flex items-center justify-center gap-2">
              <Download size={20} />
              <span>Download Now</span>
            </button>
          </div>

          {/* App Store & Google Play badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black text-white text-xs font-semibold shadow-md flex-1 justify-center opacity-80">
                <Apple size={22} />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase text-gray-400">
                    Download on the
                  </div>
                  <div className="font-bold text-xs">App Store</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black text-white text-xs font-semibold shadow-md flex-1 justify-center opacity-80">
                <Play size={20} className="fill-current text-emerald-400" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase text-gray-400">
                    GET IT ON
                  </div>
                  <div className="font-bold text-xs">Google Play</div>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-blue-900 tracking-wider">
              — Coming Soon —
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

