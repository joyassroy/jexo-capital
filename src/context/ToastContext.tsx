"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { Check, X, AlertTriangle, Info } from "lucide-react";
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

  // Bulletproof detection for Day Mode (Light Theme)
  const isLight =
    mounted &&
    (theme === "light" ||
      (typeof document !== "undefined" &&
        (document.documentElement.classList.contains("light") ||
          document.body?.classList.contains("light"))));

  const removeToast = useCallback((id: string) => {
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
    }, 180);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      options?: ToastOptions | string
    ) => {
      if (!message) return;

      // Snappy 1.8s duration matching native mobile HUDs
      const duration =
        typeof options === "object" && typeof options.duration === "number"
          ? options.duration
          : 1800;

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

      // Clear any prior active toasts so only 1 clean HUD shows
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();

      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
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

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  // Portal Toast directly to document.body with max z-index: 2147483647
  // Guaranteed first priority on top of everything
  const toastPortal =
    mounted && toasts.length > 0 && typeof document !== "undefined"
      ? createPortal(
          <div
            aria-live="assertive"
            style={{ zIndex: 2147483647 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 select-none"
          >
            {toasts.map((item) => {
              const isSuccess = item.type === "success";
              const isError = item.type === "error";
              const isWarning = item.type === "warning";

              // Explicit Color Schemes for Day Mode & Night Mode
              // Day Mode (White/Light Screen):
              // Solid pure white box with crisp gold border, vibrant emerald checkmark, dark high-contrast text
              // Night Mode (Dark Screen):
              // Solid midnight obsidian box with crisp gold border, vibrant gold checkmark, white text
              const cardBg = isLight ? "#ffffff" : "#081026";
              const cardBorder = isLight ? "2px solid #f5ba31" : "2px solid #f5ba31";
              const cardShadow = isLight
                ? "0 18px 45px rgba(0, 0, 0, 0.22), 0 0 20px rgba(245, 186, 49, 0.25)"
                : "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 186, 49, 0.35)";
              const textColor = isLight ? "#0f172a" : "#ffffff";

              const iconColor = isSuccess
                ? isLight
                  ? "#059669"
                  : "#f5ba31"
                : isError
                ? isLight
                  ? "#e11d48"
                  : "#fb7185"
                : isWarning
                ? isLight
                  ? "#d97706"
                  : "#fbbf24"
                : isLight
                ? "#0284c7"
                : "#38bdf8";

              return (
                <div
                  key={item.id}
                  onClick={() => removeToast(item.id)}
                  role="alert"
                  style={{
                    backgroundColor: cardBg,
                    border: cardBorder,
                    boxShadow: cardShadow,
                    color: textColor,
                    willChange: "transform, opacity",
                    animation: item.exiting
                      ? "toastHudOut 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                      : "toastHudIn 0.20s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }}
                  className="toast-hud-card pointer-events-auto cursor-pointer relative min-w-[126px] max-w-[210px] min-h-[126px] px-5 py-4 rounded-[20px] flex flex-col items-center justify-center text-center transition-transform active:scale-95"
                >
                  {/* Minimal Centered Icon */}
                  <div className="mb-2 flex items-center justify-center">
                    {isSuccess && (
                      <Check
                        size={38}
                        strokeWidth={3.5}
                        style={{ stroke: iconColor, color: iconColor }}
                        className="drop-shadow-sm"
                      />
                    )}
                    {isError && (
                      <X
                        size={38}
                        strokeWidth={3.5}
                        style={{ stroke: iconColor, color: iconColor }}
                        className="drop-shadow-sm"
                      />
                    )}
                    {isWarning && (
                      <AlertTriangle
                        size={36}
                        strokeWidth={3}
                        style={{ stroke: iconColor, color: iconColor }}
                        className="drop-shadow-sm"
                      />
                    )}
                    {!isSuccess && !isError && !isWarning && (
                      <Info
                        size={36}
                        strokeWidth={3}
                        style={{ stroke: iconColor, color: iconColor }}
                        className="drop-shadow-sm"
                      />
                    )}
                  </div>

                  {/* High Contrast Clean Text Label */}
                  <div
                    style={{ color: textColor }}
                    className="text-[13px] sm:text-[13.5px] font-bold text-center leading-snug whitespace-pre-line break-words max-w-[170px]"
                  >
                    {item.message}
                  </div>
                </div>
              );
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {toastPortal}
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
