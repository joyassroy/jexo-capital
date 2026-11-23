import React from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Headphones, MessageCircle, Send, ExternalLink } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Support" showBack={true} />

        <div className="p-4 space-y-5 max-w-[380px] mx-auto">
          {/* Agent Avatar */}
          <div className="flex flex-col items-center text-center mt-3">
            <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#e69e05] shadow-[0_0_25px_rgba(245,186,49,0.4)] mb-3">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                <Image
                  src="/support-agent.svg"
                  alt="24/7 Support Agent"
                  fill
                  className="object-cover p-1"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#f5ba31] text-[#020a1f] px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow flex items-center gap-1 border border-[#f5ba31]">
                <Headphones size={12} /> 24/7 Support
              </div>
            </div>

            <h2 className="text-lg font-black text-white tracking-tight">
              Zexo Capital Customer Service
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              We are available 24/7 to assist you.
            </p>
          </div>

          {/* Channels List */}
          <div className="space-y-3">
            <a
              href="https://wa.me/8801728967166"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#04102e]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg hover:border-emerald-400 hover:bg-emerald-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <MessageCircle size={24} />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400">
                  Customer Service (WhatsApp)
                </span>
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-emerald-400" />
            </a>

            <a
              href="https://t.me/zexocapital_group"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#04102e]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg hover:border-sky-400 hover:bg-sky-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,136,204,0.4)]">
                  <Send size={22} className="translate-x-[-1px] translate-y-[1px]" />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-sky-400">
                  Zexo Capital Official Group
                </span>
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-sky-400" />
            </a>

            <a
              href="https://t.me/zexocapital_channel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#04102e]/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,162,255,0.4)]">
                  <Send size={22} />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-cyan-400">
                  Zexo Capital Official Channel
                </span>
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-cyan-400" />
            </a>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

