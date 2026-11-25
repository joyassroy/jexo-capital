"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Headphones, X, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

function OfficialWhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
      <path d="M16.002 0C7.165 0 0 7.165 0 16.002c0 2.822.738 5.576 2.138 8.002L.135 31.865l8.03-2.106a15.938 15.938 0 0 0 7.837 2.05h.007c8.835 0 16-7.165 16-16.002C32.009 7.165 24.837 0 16.002 0zm0 29.31a13.256 13.256 0 0 1-6.757-1.846l-.485-.288-5.025 1.318 1.341-4.9-.316-.503a13.276 13.276 0 0 1-2.037-7.09c0-7.332 5.967-13.3 13.3-13.3 3.553 0 6.893 1.385 9.406 3.897a13.238 13.238 0 0 1 3.89 9.403c0 7.333-5.967 13.303-13.322 13.303zm7.293-9.957c-.4-.2-2.366-1.167-2.732-1.3-.367-.134-.634-.2-.901.2-.267.4-1.034 1.3-1.267 1.567-.234.267-.467.3-.867.1-.4-.2-1.69-.623-3.218-1.986-1.19-1.061-1.993-2.372-2.227-2.772-.234-.4-.025-.617.175-.816.18-.18.4-.467.6-.7.2-.234.267-.4.4-.667.133-.267.067-.5-.034-.7-.1-.2-.901-2.17-1.234-2.97-.324-.78-.654-.674-.9-.687-.233-.01-.5-.014-.767-.014-.267 0-.7.1-1.067.5-.367.4-1.4 1.368-1.4 3.336s1.434 3.87 1.634 4.137c.2.267 2.822 4.31 6.837 6.042.955.412 1.7.658 2.28.843.959.305 1.832.262 2.522.159.77-.115 2.366-.968 2.7-1.902.334-.934.334-1.735.234-1.902-.101-.167-.368-.267-.768-.467z"/>
    </svg>
  );
}

function OfficialTelegramIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z"/>
    </svg>
  );
}

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
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState({
    whatsapp: whatsappUrl,
    telegramGroup: telegramGroupUrl,
    telegramChannel: telegramChannelUrl,
  });
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
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

  const isLight = mounted && theme === "light";

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

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className={`relative w-full max-w-[360px] rounded-3xl p-5 shadow-2xl border transition-all ${
              isLight
                ? "bg-white border-amber-300/80 text-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.18)]"
                : "bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] border-[#f5ba31]/50 text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]"
            }`}
          >
            {/* Close Button top-right */}
            <button
              onClick={() => setIsOpen(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
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

              <h3
                className={`text-base font-bold tracking-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Zexo Capital {t("customer_service")}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? "text-slate-500" : "text-slate-300/80"
                }`}
              >
                Our support team is available 24/7 to assist you
              </p>
            </div>

            {/* Support Channels List with Real Icons */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={urls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all group ${
                  isLight
                    ? "bg-slate-50/80 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/70"
                    : "bg-white/5 border-white/10 hover:border-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(37,211,102,0.4)] shrink-0">
                    <OfficialWhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isLight
                        ? "text-slate-800 group-hover:text-emerald-700"
                        : "text-white group-hover:text-emerald-400"
                    }`}
                  >
                    WhatsApp Customer Service
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className={`transition-colors ${
                    isLight
                      ? "text-slate-400 group-hover:text-emerald-600"
                      : "text-slate-400 group-hover:text-emerald-400"
                  }`}
                />
              </a>

              {/* Telegram Official Group */}
              <a
                href={urls.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all group ${
                  isLight
                    ? "bg-slate-50/80 border-slate-200 hover:border-sky-500 hover:bg-sky-50/70"
                    : "bg-white/5 border-white/10 hover:border-sky-400 hover:bg-sky-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(34,158,217,0.4)] shrink-0">
                    <OfficialTelegramIcon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isLight
                        ? "text-slate-800 group-hover:text-sky-700"
                        : "text-white group-hover:text-sky-400"
                    }`}
                  >
                    Telegram Official Group
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className={`transition-colors ${
                    isLight
                      ? "text-slate-400 group-hover:text-sky-600"
                      : "text-slate-400 group-hover:text-sky-400"
                  }`}
                />
              </a>

              {/* Telegram Official Channel */}
              <a
                href={urls.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all group ${
                  isLight
                    ? "bg-slate-50/80 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/70"
                    : "bg-white/5 border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,136,204,0.4)] shrink-0">
                    <OfficialTelegramIcon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isLight
                        ? "text-slate-800 group-hover:text-cyan-700"
                        : "text-white group-hover:text-cyan-400"
                    }`}
                  >
                    Telegram Official Channel
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className={`transition-colors ${
                    isLight
                      ? "text-slate-400 group-hover:text-cyan-600"
                      : "text-slate-400 group-hover:text-cyan-400"
                  }`}
                />
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className={`mt-5 w-full py-2.5 rounded-full font-bold text-sm active:scale-98 transition-all ${
                isLight
                  ? "border border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100 shadow-sm"
                  : "border border-[#f5ba31] text-[#f5ba31] bg-[#f5ba31]/10 hover:bg-[#f5ba31]/20 shadow-[0_0_12px_rgba(245,186,49,0.2)]"
              }`}
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

