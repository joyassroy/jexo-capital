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
    }, 250);
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
              ? "Action Failed"
              : type === "warning"
              ? "Notice"
              : "Information");

      // Default to 2.3 seconds for a responsive center HUD
      const duration =
        typeof options === "object" && typeof options.duration === "number"
          ? options.duration
          : 2300;

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

      // Clear any prior active toasts for a clean single-HUD center display
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();

      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        createdAt: Date.now(),
      };

      setToasts([newToast]);

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

      {/* Center-Stage Luxury HUD Notification Popup */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center p-4"
        >
          {/* Subtle Ambient Dimming Backdrop */}
          <div
            className={`fixed inset-0 transition-opacity duration-200 pointer-events-none ${
              toasts[0].exiting ? "opacity-0" : "opacity-100"
            } ${isLight ? "bg-slate-900/15" : "bg-black/45"}`}
            style={{
              animation: toasts[0].exiting
                ? "toastBackdropOut 0.25s ease-out forwards"
                : "toastBackdropIn 0.25s ease-out forwards",
            }}
          />

          {toasts.map((item) => {
            const isSuccess = item.type === "success";
            const isError = item.type === "error";
            const isWarning = item.type === "warning";
            const isInfo = item.type === "info";

            // 100% Solid, Non-transparent Premium Luxury Surface
            let containerClasses = "";
            if (isLight) {
              if (isSuccess) {
                containerClasses =
                  "bg-white border-2 border-[#f5ba31] shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_30px_rgba(245,186,49,0.22)] text-slate-900";
              } else if (isError) {
                containerClasses =
                  "bg-white border-2 border-rose-500 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_30px_rgba(244,63,94,0.22)] text-slate-900";
              } else if (isWarning) {
                containerClasses =
                  "bg-white border-2 border-amber-500 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_30px_rgba(245,158,11,0.22)] text-slate-900";
              } else {
                containerClasses =
                  "bg-white border-2 border-sky-500 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_30px_rgba(14,165,233,0.22)] text-slate-900";
              }
            } else {
              // Dark Mode: Deep Solid Obsidian / Midnight Navy
              if (isSuccess) {
                containerClasses =
                  "bg-[#060c1d] border-2 border-[#f5ba31] shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(245,186,49,0.32)] text-white";
              } else if (isError) {
                containerClasses =
                  "bg-[#180508] border-2 border-rose-500 shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(244,63,94,0.35)] text-white";
              } else if (isWarning) {
                containerClasses =
                  "bg-[#1a0f02] border-2 border-amber-500 shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.35)] text-white";
              } else {
                containerClasses =
                  "bg-[#040f1f] border-2 border-sky-500 shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(14,165,233,0.35)] text-white";
              }
            }

            return (
              <div
                key={item.id}
                onClick={() => removeToast(item.id)}
                role="alert"
                style={{
                  animation: item.exiting
                    ? "toastCenterOut 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                    : "toastCenterIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
                className={`pointer-events-auto relative w-[280px] sm:w-[320px] max-w-[88vw] p-5 sm:p-6 rounded-[28px] transition-all cursor-pointer select-none flex flex-col items-center text-center ${containerClasses}`}
              >
                {/* Specular Top Shimmer Highlight */}
                <div
                  className={`absolute inset-x-6 top-0 h-[2px] ${
                    isLight
                      ? "bg-gradient-to-r from-transparent via-[#f5ba31] to-transparent"
                      : "bg-gradient-to-r from-transparent via-[#ffd700] to-transparent"
                  } pointer-events-none`}
                />

                {/* Subtle Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(item.id);
                  }}
                  className={`absolute top-3.5 right-3.5 p-1 rounded-full transition-colors ${
                    isLight
                      ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                      : "text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Dismiss toast"
                >
                  <X size={15} className="stroke-[2.5]" />
                </button>

                {/* 3D Metallic Centerpiece Badge */}
                {isSuccess && (
                  <div className="relative mb-3 mt-1">
                    <div className="absolute inset-0 rounded-2xl bg-[#f5ba31] blur-md opacity-50 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#c88100] via-[#f5ba31] to-[#ffe58f] p-[2.5px] shadow-[0_6px_22px_rgba(245,186,49,0.55)] flex items-center justify-center">
                      <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#f5ba31] to-[#d97706] flex items-center justify-center">
                        <CheckCircle2
                          size={34}
                          className="text-[#040a1c] stroke-[2.8] drop-shadow-sm"
                        />
                      </div>
                    </div>
                    {/* Sparkles */}
                    <Sparkles
                      size={18}
                      className="absolute -top-2 -right-2 text-[#fff0a8] fill-[#ffd700] drop-shadow-md animate-bounce"
                    />
                    <Sparkles
                      size={13}
                      className="absolute -bottom-1 -left-1.5 text-[#ffd700] fill-[#f5ba31] drop-shadow-md animate-pulse"
                    />
                  </div>
                )}

                {isError && (
                  <div className="relative mb-3 mt-1">
                    <div className="absolute inset-0 rounded-2xl bg-rose-500 blur-md opacity-50 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-500 to-rose-300 p-[2.5px] shadow-[0_6px_22px_rgba(244,63,94,0.55)] flex items-center justify-center">
                      <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-rose-500 to-rose-700 flex items-center justify-center">
                        <AlertCircle
                          size={34}
                          className="text-white stroke-[2.8] drop-shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isWarning && (
                  <div className="relative mb-3 mt-1">
                    <div className="absolute inset-0 rounded-2xl bg-amber-500 blur-md opacity-50 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-400 to-amber-200 p-[2.5px] shadow-[0_6px_22px_rgba(245,158,11,0.55)] flex items-center justify-center">
                      <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center">
                        <AlertTriangle
                          size={34}
                          className="text-[#1a0e00] stroke-[2.8] drop-shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isInfo && (
                  <div className="relative mb-3 mt-1">
                    <div className="absolute inset-0 rounded-2xl bg-sky-500 blur-md opacity-50 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-700 via-sky-400 to-sky-200 p-[2.5px] shadow-[0_6px_22px_rgba(14,165,233,0.55)] flex items-center justify-center">
                      <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
                        <Info
                          size={34}
                          className="text-white stroke-[2.8] drop-shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Title */}
                {item.title && (
                  <div
                    className={`text-base sm:text-lg font-black tracking-wide ${
                      isLight
                        ? isSuccess
                          ? "text-[#b45309]"
                          : isError
                          ? "text-rose-600"
                          : isWarning
                          ? "text-amber-700"
                          : "text-sky-700"
                        : isSuccess
                        ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#ffd700] bg-clip-text text-transparent"
                        : isError
                        ? "text-rose-400"
                        : isWarning
                        ? "text-amber-300"
                        : "text-sky-300"
                    }`}
                  >
                    {item.title}
                  </div>
                )}

                {/* Message Body */}
                <div
                  className={`text-[13px] sm:text-[14px] font-semibold leading-snug mt-1.5 break-words max-w-[95%] ${
                    isLight ? "text-slate-700" : "text-slate-200"
                  }`}
                >
                  {item.message}
                </div>

                {/* Micro Capsule Countdown Bar */}
                <div className="w-14 h-1 rounded-full bg-slate-300/30 dark:bg-white/10 mt-3.5 overflow-hidden">
                  <div
                    style={{
                      animation: `toastCountdown ${item.duration}ms linear forwards`,
                    }}
                    className={`h-full w-full rounded-full ${
                      isSuccess
                        ? "bg-[#f5ba31]"
                        : isError
                        ? "bg-rose-500"
                        : isWarning
                        ? "bg-amber-500"
                        : "bg-sky-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
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
