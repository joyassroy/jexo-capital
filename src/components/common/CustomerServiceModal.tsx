"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Headphones, MessageCircle, Send, X, ExternalLink } from "lucide-react";

interface CustomerServiceProps {
  whatsappUrl?: string;
  telegramGroupUrl?: string;
  telegramChannelUrl?: string;
}

export default function CustomerServiceModal({
  whatsappUrl = "https://wa.me/8801728967166",
  telegramGroupUrl = "https://t.me/zexocapital_group",
  telegramChannelUrl = "https://t.me/zexocapital_channel",
}: CustomerServiceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState({
    whatsapp: whatsappUrl,
    telegramGroup: telegramGroupUrl,
    telegramChannel: telegramChannelUrl,
  });
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setUrls({
            whatsapp: data.settings.whatsappUrl || whatsappUrl,
            telegramGroup: data.settings.telegramGroupUrl || telegramGroupUrl,
            telegramChannel: data.settings.telegramChannelUrl || telegramChannelUrl,
          });
        }
      })
      .catch(() => {});
  }, [whatsappUrl, telegramGroupUrl, telegramChannelUrl]);

  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#00A3FF] to-[#0057FF] text-white shadow-[0_4px_16px_rgba(0,102,255,0.45)] border-2 border-white animate-floating hover:scale-105 transition-transform"
        aria-label="Customer Service"
      >
        <Headphones size={22} className="stroke-[2.5]" />
        <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5 leading-none">
          Customer
        </span>
        <span className="text-[8px] font-bold tracking-tighter uppercase leading-none">
          Service
        </span>
      </button>

      {/* Modal Backdrop & Dialog (Luxury Obsidian Gold Theme) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-[360px] bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] rounded-3xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-[#f5ba31]/50 text-white">
            {/* Close Button top-right */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header with Support Avatar */}
            <div className="flex flex-col items-center text-center mt-1 mb-4">
              <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#f5ba31] via-[#ffe899] to-[#d49002] shadow-[0_0_20px_rgba(245,186,49,0.35)] mb-2">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                  <Image
                    src="/support-agent.svg"
                    alt="24/7 Support Agent"
                    fill
                    className="object-cover p-1"
                    unoptimized
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#f5ba31] text-[#020a1f] px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow flex items-center gap-1 border border-amber-300">
                  <Headphones size={10} /> 24/7 Live
                </div>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">
                Zexo Capital Customer Service
              </h3>
              <p className="text-xs text-slate-300/80 mt-0.5">
                Our support team is available 24/7 to assist you
              </p>
            </div>

            {/* Support Channels List */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={urls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                    <MessageCircle size={22} className="fill-white" />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-emerald-400">
                    WhatsApp Customer Service
                  </span>
                </div>
                <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-400" />
              </a>

              {/* Telegram Official Group */}
              <a
                href={urls.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-sky-400 hover:bg-sky-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,136,204,0.4)]">
                    <Send size={20} className="translate-x-[-1px] translate-y-[1px]" />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-sky-400">
                    Telegram Official Group
                  </span>
                </div>
                <ExternalLink size={16} className="text-slate-400 group-hover:text-sky-400" />
              </a>

              {/* Telegram Official Channel */}
              <a
                href={urls.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,162,255,0.4)]">
                    <Send size={20} />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-cyan-400">
                    Telegram Official Channel
                  </span>
                </div>
                <ExternalLink size={16} className="text-slate-400 group-hover:text-cyan-400" />
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full py-2.5 rounded-full border border-[#f5ba31] text-[#f5ba31] bg-[#f5ba31]/10 font-bold text-sm shadow-[0_0_12px_rgba(245,186,49,0.2)] hover:bg-[#f5ba31]/20 active:scale-98 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

