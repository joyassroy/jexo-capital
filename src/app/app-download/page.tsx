"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import Logo from "@/components/common/Logo";
import { Download, Apple, Play, CheckCircle2, Smartphone, MoreVertical, Share } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __jexoInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function AppDownloadPage() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  const isLight = mounted && theme === "light";

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      // Detect standalone / already installed
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((window.navigator as { standalone?: boolean }).standalone);
      setIsInstalled(standalone);

      // Detect iOS Safari
      const ua = window.navigator.userAgent;
      setIsIOS(/iPad|iPhone|iPod/.test(ua));

      // Grab prompt if already captured in layout
      if (window.__jexoInstallPrompt) {
        setDeferredPrompt(window.__jexoInstallPrompt);
      }

      const handleReady = () => {
        if (window.__jexoInstallPrompt) {
          setDeferredPrompt(window.__jexoInstallPrompt);
        }
      };

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        window.__jexoInstallPrompt = e as BeforeInstallPromptEvent;
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
        window.__jexoInstallPrompt = null;
        toast.success("Jexo Capital app installed on your home screen!");
      };

      window.addEventListener("jexo-install-ready", handleReady);
      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      window.addEventListener("appinstalled", handleInstalled);

      return () => {
        window.removeEventListener("jexo-install-ready", handleReady);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleInstalled);
      };
    }
  }, [toast]);

  const handleInstallClick = async () => {
    if (isInstalled) {
      toast.info("Jexo Capital is already installed on your device.");
      return;
    }

    const promptEvent = deferredPrompt || window.__jexoInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          toast.success("Installing Jexo Capital shortcut...");
        }
        window.__jexoInstallPrompt = null;
        setDeferredPrompt(null);
      } catch {
        setShowManualGuide(true);
      }
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-[#f1f5f9] text-[#0f172a]"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        <Header title="Download App" showBack={true} />

        <div className="p-4 space-y-5 max-w-[390px] mx-auto text-center mt-4">
          {/* Card with App Logo */}
          <div
            className={`p-6 rounded-3xl border shadow-xl flex flex-col items-center transition-all ${
              isLight
                ? "bg-white border-slate-200 shadow-sm"
                : "bg-[#04102e]/85 backdrop-blur-md border-[#f5ba31]/30"
            }`}
          >
            <div className="mb-3 p-4 rounded-3xl bg-gradient-to-br from-[#0a1f52] to-[#020a1f] border border-[#f5ba31]/40 shadow-[0_8px_24px_rgba(2,10,31,0.3)]">
              <Logo size={68} showText={false} />
            </div>

            <h2
              className={`text-lg font-black tracking-tight mb-1 ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Jexo Capital App
            </h2>
            <p
              className={`text-xs mb-5 font-medium ${
                isLight ? "text-slate-500" : "text-slate-300"
              }`}
            >
              Install on your phone home screen for fast, full-screen access.
            </p>

            {isInstalled ? (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                <span>App Installed on Device</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="btn-gold-premium w-full py-4 rounded-2xl text-base"
              >
                <Download size={20} />
                <span>{deferredPrompt ? "Install App Now" : "Download Now"}</span>
              </button>
            )}

            {/* Manual Install Guide (shown when browser doesn't expose prompt or on iOS) */}
            {(showManualGuide || (!deferredPrompt && !isInstalled)) && (
              <div
                className={`mt-4 w-full text-left p-3.5 rounded-2xl border text-xs space-y-2 ${
                  isLight
                    ? "bg-amber-50 border-amber-200 text-slate-700"
                    : "bg-white/5 border-[#f5ba31]/25 text-slate-300"
                }`}
              >
                <div
                  className={`font-black flex items-center gap-1.5 ${
                    isLight ? "text-amber-800" : "text-[#f5ba31]"
                  }`}
                >
                  <Smartphone size={14} />
                  <span>
                    {isIOS
                      ? "How to Install on iPhone:"
                      : "How to Add Shortcut on Android:"}
                  </span>
                </div>
                {isIOS ? (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium">
                    <li>
                      Tap the <Share size={12} className="inline mx-0.5" />{" "}
                      <strong>Share</strong> button at the bottom of Safari.
                    </li>
                    <li>
                      Scroll down and tap{" "}
                      <strong>&quot;Add to Home Screen&quot;</strong>.
                    </li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium">
                    <li>
                      Tap the <MoreVertical size={12} className="inline mx-0.5" />{" "}
                      <strong>3-dot menu</strong> at top-right of Chrome.
                    </li>
                    <li>
                      Tap <strong>&quot;Install app&quot;</strong> or{" "}
                      <strong>&quot;Add to Home screen&quot;</strong>.
                    </li>
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* App Store & Google Play badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-md flex-1 justify-center opacity-85 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-[#020a1f] border-slate-700 text-white"
                }`}
              >
                <Apple size={22} />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase text-gray-400">
                    Download on the
                  </div>
                  <div className="font-bold text-xs">App Store</div>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-md flex-1 justify-center opacity-85 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-[#020a1f] border-slate-700 text-white"
                }`}
              >
                <Play size={20} className="fill-current text-emerald-500" />
                <div className="text-left leading-tight">
                  <div className="text-[9px] uppercase text-gray-400">
                    GET IT ON
                  </div>
                  <div className="font-bold text-xs">Google Play</div>
                </div>
              </div>
            </div>

            <div
              className={`text-xs font-bold tracking-wider ${
                isLight ? "text-amber-600" : "text-[#f5ba31]"
              }`}
            >
              — Store Apps Coming Soon —
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
