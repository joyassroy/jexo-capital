"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Headphones, MessageCircle, Send, ExternalLink, HelpCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function SupportPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-slate-50 text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        <Header title="Customer Support" showBack={true} />

        <div className="p-4 space-y-4 max-w-[390px] mx-auto">
          {/* Agent Avatar */}
          <div className="flex flex-col items-center text-center mt-2">
            <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#e69e05] shadow-[0_0_25px_rgba(245,186,49,0.4)] mb-3">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                <Image
                  src="/support-agent.svg"
                  alt="24/7 Support Agent"
                  fill
                  className="object-cover p-1"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#f5ba31] text-[#020a1f] px-2.5 py-0.5 rounded-full text-[10px] font-black shadow flex items-center gap-1 border border-white">
                <Headphones size={11} /> 24/7
              </div>
            </div>

            <h2
              className={`text-lg font-black tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Zexo Capital Customer Service
            </h2>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                isLight ? "text-slate-600 font-medium" : "text-slate-300"
              }`}
            >
              Forgot your password or need assistance? Our 24/7 official support team is here to help you recover your account.
            </p>
          </div>

          {/* Quick Notice Card */}
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 border transition-all ${
              isLight
                ? "bg-amber-50/90 border-amber-300 text-amber-950 font-semibold"
                : "bg-amber-950/40 border-amber-500/40 text-amber-200"
            }`}
          >
            <HelpCircle size={18} className="text-amber-500 flex-shrink-0" />
            <span>
              Contact our official WhatsApp or Telegram channel below to reset your login password.
            </span>
          </div>

          {/* Channels List */}
          <div className="space-y-3">
            <a
              href="https://wa.me/8801728967166"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all group ${
                isLight
                  ? "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-emerald-400 hover:bg-emerald-500/10 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <span
                    className={`block text-sm font-bold group-hover:text-emerald-500 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Customer Service (WhatsApp)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Instant Password Recovery
                  </span>
                </div>
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-emerald-500" />
            </a>

            <a
              href="https://t.me/zexocapital_group"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all group ${
                isLight
                  ? "bg-white border-slate-200 hover:border-sky-500 hover:shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-sky-400 hover:bg-sky-500/10 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,136,204,0.4)]">
                  <Send size={22} className="translate-x-[-1px] translate-y-[1px]" />
                </div>
                <div>
                  <span
                    className={`block text-sm font-bold group-hover:text-sky-500 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Zexo Capital Official Group
                  </span>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                    Community & Announcements
                  </span>
                </div>
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-sky-500" />
            </a>

            <a
              href="https://t.me/zexocapital_channel"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all group ${
                isLight
                  ? "bg-white border-slate-200 hover:border-cyan-500 hover:shadow-md"
                  : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,162,255,0.4)]">
                  <Send size={22} />
                </div>
                <div>
                  <span
                    className={`block text-sm font-bold group-hover:text-cyan-500 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Zexo Capital Official Channel
                  </span>
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    VIP & News Updates
                  </span>
                </div>
              </div>
              <ExternalLink size={18} className="text-slate-400 group-hover:text-cyan-500" />
            </a>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

