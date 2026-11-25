"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import { playSuccessChime } from "@/lib/soundEffects";
import { useTheme } from "@/context/ThemeContext";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title?: string;
  duration?: number;
  sound?: boolean;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  createdAt: number;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    options?: ToastOptions | string
  ) => void;
  toast: {
    success: (message: string, options?: ToastOptions | string) => void;
    error: (message: string, options?: ToastOptions | string) => void;
    info: (message: string, options?: ToastOptions | string) => void;
    warning: (message: string, options?: ToastOptions | string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  const removeToast = useCallback((id: string) => {
    // Mark as exiting first for smooth exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const existingTimeout = timeoutsRef.current.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        timeoutsRef.current.delete(id);
      }
    }, 280);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      options?: ToastOptions | string
    ) => {
      if (!message) return;

      const title =
        typeof options === "string"
          ? options
          : options?.title ??
            (type === "success"
              ? "Success"
              : type === "error"
              ? "Action Required"
              : type === "warning"
              ? "Warning"
              : "Notification");

      const duration =
        typeof options === "object" && typeof options.duration === "number"
          ? options.duration
          : 3600;

      const playSound =
        typeof options === "object" && typeof options.sound === "boolean"
          ? options.sound
          : type === "success";

      if (playSound) {
        try {
          playSuccessChime();
        } catch {
          // ignore audio context restrictions
        }
      }

      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // Keep at most 3 visible

      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);

      timeoutsRef.current.set(id, timeout);
    },
    [removeToast]
  );

  const toast = {
    success: useCallback(
      (msg: string, opt?: ToastOptions | string) => showToast(msg, "success", opt),
      [showToast]
    ),
    error: useCallback(
      (msg: string, opt?: ToastOptions | string) => showToast(msg, "error", opt),
      [showToast]
    ),
    info: useCallback(
      (msg: string, opt?: ToastOptions | string) => showToast(msg, "info", opt),
      [showToast]
    ),
    warning: useCallback(
      (msg: string, opt?: ToastOptions | string) => showToast(msg, "warning", opt),
      [showToast]
    ),
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Floating Viewport Container */}
      <div
        aria-live="polite"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] w-[94%] max-w-[420px] pointer-events-none flex flex-col items-center space-y-3 pt-[env(safe-area-inset-top,0px)]"
      >
        {toasts.map((item) => {
          // Theme-based class computation
          const isSuccess = item.type === "success";
          const isError = item.type === "error";
          const isWarning = item.type === "warning";
          const isInfo = item.type === "info";

          // Card Background & Border & Shadow
          let containerClasses = "";
          if (isLight) {
            if (isSuccess) {
              containerClasses =
                "bg-white border-2 border-[#f5ba31] shadow-[0_16px_45px_rgba(245,186,49,0.45),0_6px_20px_rgba(0,0,0,0.12)] text-slate-900";
            } else if (isError) {
              containerClasses =
                "bg-white border-2 border-rose-500 shadow-[0_16px_45px_rgba(244,63,94,0.38),0_6px_20px_rgba(0,0,0,0.12)] text-slate-900";
            } else if (isWarning) {
              containerClasses =
                "bg-white border-2 border-amber-500 shadow-[0_16px_45px_rgba(245,158,11,0.38),0_6px_20px_rgba(0,0,0,0.12)] text-slate-900";
            } else {
              containerClasses =
                "bg-white border-2 border-sky-500 shadow-[0_16px_45px_rgba(14,165,233,0.38),0_6px_20px_rgba(0,0,0,0.12)] text-slate-900";
            }
          } else {
            // Dark Mode
            if (isSuccess) {
              containerClasses =
                "bg-[#030e26] border-2 border-[#f5ba31] shadow-[0_18px_50px_rgba(0,0,0,0.95),0_0_32px_rgba(245,186,49,0.5)] text-white";
            } else if (isError) {
              containerClasses =
                "bg-[#1c050a] border-2 border-rose-500 shadow-[0_18px_50px_rgba(0,0,0,0.95),0_0_32px_rgba(244,63,94,0.45)] text-white";
            } else if (isWarning) {
              containerClasses =
                "bg-[#1c1204] border-2 border-amber-500 shadow-[0_18px_50px_rgba(0,0,0,0.95),0_0_32px_rgba(245,158,11,0.45)] text-white";
            } else {
              containerClasses =
                "bg-[#031526] border-2 border-sky-500 shadow-[0_18px_50px_rgba(0,0,0,0.95),0_0_32px_rgba(14,165,233,0.45)] text-white";
            }
          }

          return (
            <div
              key={item.id}
              onClick={() => removeToast(item.id)}
              role="alert"
              style={{
                animation: item.exiting
                  ? "toastSlideOut 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                  : "toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
              className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl backdrop-blur-2xl transition-all cursor-pointer select-none group ${containerClasses}`}
            >
              {/* Specular Top Shimmer Highlight */}
              <div
                className={`absolute inset-x-0 top-0 h-[2px] ${
                  isLight
                    ? "bg-gradient-to-r from-transparent via-[#f5ba31] to-transparent"
                    : "bg-gradient-to-r from-transparent via-white/40 to-transparent"
                } pointer-events-none`}
              />

              <div className="p-3.5 sm:p-4 flex items-center gap-3.5">
                {/* 3D Metallic Badge Icon */}
                {isSuccess && (
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d48b06] p-0.5 flex items-center justify-center shadow-[0_2px_14px_rgba(245,186,49,0.65)] border-2 border-white/70">
                      <CheckCircle2
                        size={24}
                        className="text-[#020a1f] stroke-[2.8] drop-shadow-sm"
                      />
                    </div>
                    {/* Pulsing Sparkle */}
                    <Sparkles
                      size={13}
                      className="absolute -top-1 -right-1 text-amber-200 fill-amber-300 drop-shadow animate-pulse"
                    />
                  </div>
                )}

                {isError && (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-400 via-rose-500 to-rose-700 p-0.5 flex items-center justify-center shadow-[0_2px_14px_rgba(244,63,94,0.6)] border-2 border-white/70 shrink-0">
                    <AlertCircle
                      size={24}
                      className="text-white stroke-[2.8] drop-shadow-sm"
                    />
                  </div>
                )}

                {isWarning && (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-600 p-0.5 flex items-center justify-center shadow-[0_2px_14px_rgba(245,158,11,0.6)] border-2 border-white/70 shrink-0">
                    <AlertTriangle
                      size={24}
                      className="text-[#1f1300] stroke-[2.8] drop-shadow-sm"
                    />
                  </div>
                )}

                {isInfo && (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-sky-700 p-0.5 flex items-center justify-center shadow-[0_2px_14px_rgba(14,165,233,0.6)] border-2 border-white/70 shrink-0">
                    <Info
                      size={24}
                      className="text-white stroke-[2.8] drop-shadow-sm"
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="flex-1 min-w-0 pr-1">
                  {item.title && (
                    <div
                      className={`text-[11px] sm:text-xs font-black uppercase tracking-wider mb-0.5 ${
                        isLight
                          ? isSuccess
                            ? "text-amber-800"
                            : isError
                            ? "text-rose-700"
                            : isWarning
                            ? "text-amber-800"
                            : "text-sky-800"
                          : isSuccess
                          ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#ffd700] bg-clip-text text-transparent"
                          : isError
                          ? "text-rose-300"
                          : isWarning
                          ? "text-amber-300"
                          : "text-sky-300"
                      }`}
                    >
                      {item.title}
                    </div>
                  )}
                  <div
                    className={`text-[13px] sm:text-[13.5px] font-bold leading-snug break-words ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {item.message}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(item.id);
                  }}
                  className={`shrink-0 p-1.5 rounded-xl transition-colors ${
                    isLight
                      ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Dismiss toast"
                >
                  <X size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* High-definition Countdown Line */}
              <div
                className={`relative w-full h-[3px] overflow-hidden ${
                  isLight ? "bg-slate-200" : "bg-black/60"
                }`}
              >
                <div
                  style={{
                    animation: `toastCountdown ${item.duration}ms linear forwards`,
                  }}
                  className={`h-full ${
                    isSuccess
                      ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#d48b06] shadow-[0_0_8px_rgba(245,186,49,0.9)]"
                      : isError
                      ? "bg-gradient-to-r from-rose-300 via-rose-500 to-rose-700 shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                      : isWarning
                      ? "bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700"
                      : "bg-gradient-to-r from-sky-300 via-sky-500 to-sky-700"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
