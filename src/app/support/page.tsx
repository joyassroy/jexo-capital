"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Headphones, ExternalLink, HelpCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

function OfficialWhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
      <path d="M16.002 0C7.165 0 0 7.165 0 16.002c0 2.822.738 5.576 2.138 8.002L.135 31.865l8.03-2.106a15.938 15.938 0 0 0 7.837 2.05h.007c8.835 0 16-7.165 16-16.002C32.009 7.165 24.837 0 16.002 0zm0 29.31a13.256 13.256 0 0 1-6.757-1.846l-.485-.288-5.025 1.318 1.341-4.9-.316-.503a13.276 13.276 0 0 1-2.037-7.09c0-7.332 5.967-13.3 13.3-13.3 3.553 0 6.893 1.385 9.406 3.897a13.238 13.238 0 0 1 3.89 9.403c0 7.333-5.967 13.303-13.322 13.303zm7.293-9.957c-.4-.2-2.366-1.167-2.732-1.3-.367-.134-.634-.2-.901.2-.267.4-1.034 1.3-1.267 1.567-.234.267-.467.3-.867.1-.4-.2-1.69-.623-3.218-1.986-1.19-1.061-1.993-2.372-2.227-2.772-.234-.4-.025-.617.175-.816.18-.18.4-.467.6-.7.2-.234.267-.4.4-.667.133-.267.067-.5-.034-.7-.1-.2-.901-2.17-1.234-2.97-.324-.78-.654-.674-.9-.687-.233-.01-.5-.014-.767-.014-.267 0-.7.1-1.067.5-.367.4-1.4 1.368-1.4 3.336s1.434 3.87 1.634 4.136c.2.267 2.82 4.306 6.83 6.037.954.412 1.7.658 2.28.843.958.305 1.83.262 2.52.16.768-.115 2.366-.967 2.7-1.9.333-.934.333-1.734.233-1.9-.1-.167-.367-.267-.767-.467z" />
    </svg>
  );
}

function OfficialTelegramIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.926z" />
    </svg>
  );
}

export default function SupportPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [urls, setUrls] = useState({
    whatsapp: "https://wa.me/8801728967166",
    telegramGroup: "https://t.me/zexocapital_group",
    telegramChannel: "https://t.me/zexocapital_channel",
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setUrls({
            whatsapp: data.settings.adminWhatsapp
              ? `https://wa.me/${data.settings.adminWhatsapp.replace(/[^0-9]/g, "")}`
              : "https://wa.me/8801728967166",
            telegramGroup:
              data.settings.telegramGroup || "https://t.me/zexocapital_group",
            telegramChannel:
              data.settings.telegramChannel || "https://t.me/zexocapital_channel",
          });
        }
      })
      .catch(() => {});
  }, []);

  const isLight = mounted && theme === "light";

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-[#f1f5f9] text-[#0f172a]"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        <Header title={t("support")} showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
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
              className={`text-xs mt-1.5 leading-relaxed font-semibold ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              Need assistance or account recovery? Our 24/7 official support team is here to help you.
            </p>
          </div>

          {/* Quick Notice Card */}
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border shadow-sm transition-all ${
              isLight
                ? "bg-amber-50/95 border-amber-300 text-amber-950 font-bold"
                : "bg-amber-950/40 border-amber-500/40 text-amber-200 font-semibold"
            }`}
          >
            <HelpCircle size={18} className="text-amber-500 flex-shrink-0" />
            <span>
              Contact our official WhatsApp or Telegram channel below for fast 24/7 assistance.
            </span>
          </div>

          {/* Channels List with Official Vectors */}
          <div className="space-y-3">
            {/* WhatsApp */}
            <a
              href={urls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                isLight
                  ? "bg-white border-slate-200/90 hover:border-emerald-500 shadow-sm hover:bg-emerald-50/50"
                  : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-emerald-400 hover:bg-emerald-500/10 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-[0_2px_12px_rgba(37,211,102,0.4)] shrink-0">
                  <OfficialWhatsAppIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span
                    className={`block text-sm font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Customer Service (WhatsApp)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    24/7 Instant Support &amp; Recovery
                  </span>
                </div>
              </div>
              <ExternalLink
                size={18}
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
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                isLight
                  ? "bg-white border-slate-200/90 hover:border-sky-500 shadow-sm hover:bg-sky-50/50"
                  : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-sky-400 hover:bg-sky-500/10 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center shadow-[0_2px_12px_rgba(34,158,217,0.4)] shrink-0">
                  <OfficialTelegramIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span
                    className={`block text-sm font-black group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Telegram Official Group
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                    Community, Chat &amp; Discussions
                  </span>
                </div>
              </div>
              <ExternalLink
                size={18}
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
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                isLight
                  ? "bg-white border-slate-200/90 hover:border-cyan-500 shadow-sm hover:bg-cyan-50/50"
                  : "bg-[#04102e]/85 backdrop-blur-md border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white flex items-center justify-center shadow-[0_2px_12px_rgba(0,136,204,0.4)] shrink-0">
                  <OfficialTelegramIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span
                    className={`block text-sm font-black group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    Telegram Official Channel
                  </span>
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                    Official VIP News &amp; Announcements
                  </span>
                </div>
              </div>
              <ExternalLink
                size={18}
                className={`transition-colors ${
                  isLight
                    ? "text-slate-400 group-hover:text-cyan-600"
                    : "text-slate-400 group-hover:text-cyan-400"
                }`}
              />
            </a>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
