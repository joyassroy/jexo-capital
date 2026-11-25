"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Sparkles } from "lucide-react";
import { playSuccessChime } from "@/lib/soundEffects";

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
          : 3200;

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
      {/* Toast Render Container */}
      <div
        aria-live="polite"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-[420px] pointer-events-none flex flex-col items-center space-y-2.5"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            onClick={() => removeToast(item.id)}
            role="alert"
            style={{
              animation: item.exiting
                ? "toastSlideOut 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                : "toastSlideIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
            className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl backdrop-blur-xl transition-all cursor-pointer select-none group shadow-2xl ${
              item.type === "success"
                ? "bg-gradient-to-r from-[#030d26]/95 via-[#081a44]/95 to-[#030d26]/95 border border-[#f5ba31]/70 shadow-[0_14px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(245,186,49,0.32)] dark:bg-gradient-to-r dark:from-[#030d26]/95 dark:via-[#081a44]/95 dark:to-[#030d26]/95 light:bg-gradient-to-r light:from-white/98 light:via-amber-50/98 light:to-white/98 light:border-amber-300 light:shadow-[0_12px_36px_rgba(245,186,49,0.28)]"
                : item.type === "error"
                ? "bg-gradient-to-r from-[#21050a]/95 via-[#380913]/95 to-[#21050a]/95 border border-rose-500/70 shadow-[0_14px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(244,63,94,0.3)]"
                : item.type === "warning"
                ? "bg-gradient-to-r from-[#211503]/95 via-[#382405]/95 to-[#211503]/95 border border-amber-500/70 shadow-[0_14px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(245,158,11,0.3)]"
                : "bg-gradient-to-r from-[#031726]/95 via-[#06243d]/95 to-[#031726]/95 border border-cyan-500/70 shadow-[0_14px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(6,182,212,0.3)]"
            }`}
          >
            {/* Specular Top Shimmer Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <div className="p-3.5 sm:p-4 flex items-start gap-3">
              {/* Premium 3D Metallic Badge Icon */}
              {item.type === "success" && (
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d48b06] p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(245,186,49,0.55)] border border-white/60">
                    <CheckCircle2
                      size={22}
                      className="text-[#020a1f] stroke-[2.7] drop-shadow-sm"
                    />
                  </div>
                  {/* Subtle Sparkle Accent */}
                  <Sparkles
                    size={12}
                    className="absolute -top-1 -right-1 text-amber-200 fill-amber-300 drop-shadow animate-pulse"
                  />
                </div>
              )}

              {item.type === "error" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-rose-500 to-rose-700 p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(244,63,94,0.5)] border border-rose-200/60 shrink-0">
                  <AlertCircle
                    size={22}
                    className="text-white stroke-[2.7] drop-shadow-sm"
                  />
                </div>
              )}

              {item.type === "warning" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-600 p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.5)] border border-amber-100/60 shrink-0">
                  <AlertTriangle
                    size={22}
                    className="text-[#1f1300] stroke-[2.7] drop-shadow-sm"
                  />
                </div>
              )}

              {item.type === "info" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-sky-700 p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.5)] border border-cyan-100/60 shrink-0">
                  <Info
                    size={22}
                    className="text-white stroke-[2.7] drop-shadow-sm"
                  />
                </div>
              )}

              {/* Text Information */}
              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <div
                    className={`text-[11.5px] font-black uppercase tracking-wider mb-0.5 ${
                      item.type === "success"
                        ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#ffd700] bg-clip-text text-transparent"
                        : item.type === "error"
                        ? "text-rose-300"
                        : item.type === "warning"
                        ? "text-amber-300"
                        : "text-cyan-300"
                    }`}
                  >
                    {item.title}
                  </div>
                )}
                <div className="text-xs sm:text-[12.5px] font-semibold text-white/95 leading-snug break-words">
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
                className="shrink-0 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss toast"
              >
                <X size={15} />
              </button>
            </div>

            {/* Shimmering Metallic Countdown Progress Bar */}
            <div className="relative w-full h-[3px] bg-black/40 overflow-hidden">
              <div
                style={{
                  animation: `toastCountdown ${item.duration}ms linear forwards`,
                }}
                className={`h-full ${
                  item.type === "success"
                    ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#d48b06] shadow-[0_0_8px_rgba(245,186,49,0.8)]"
                    : item.type === "error"
                    ? "bg-gradient-to-r from-rose-300 via-rose-500 to-rose-700 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                    : item.type === "warning"
                    ? "bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700"
                    : "bg-gradient-to-r from-cyan-300 via-cyan-500 to-sky-700"
                }`}
              />
            </div>
          </div>
        ))}
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
