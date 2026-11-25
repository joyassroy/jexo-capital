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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

              return (
                <div
                  key={item.id}
                  onClick={() => removeToast(item.id)}
                  role="alert"
                  style={{
                    willChange: "transform, opacity",
                    animation: item.exiting
                      ? "toastHudOut 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                      : "toastHudIn 0.20s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }}
                  className="pointer-events-auto cursor-pointer relative min-w-[124px] max-w-[200px] min-h-[124px] px-5 py-4 rounded-[18px] bg-[#3a3d42]/95 backdrop-blur-md text-white shadow-[0_14px_36px_rgba(0,0,0,0.38)] flex flex-col items-center justify-center text-center transition-transform active:scale-95"
                >
                  {/* Minimal Centered Icon */}
                  <div className="mb-2 flex items-center justify-center">
                    {isSuccess && (
                      <Check
                        size={38}
                        className="text-white stroke-[3.4] drop-shadow-sm"
                      />
                    )}
                    {isError && (
                      <X
                        size={38}
                        className="text-white stroke-[3.4] drop-shadow-sm"
                      />
                    )}
                    {isWarning && (
                      <AlertTriangle
                        size={36}
                        className="text-amber-400 stroke-[3] drop-shadow-sm"
                      />
                    )}
                    {!isSuccess && !isError && !isWarning && (
                      <Info
                        size={36}
                        className="text-sky-400 stroke-[3] drop-shadow-sm"
                      />
                    )}
                  </div>

                  {/* Clean Text Label */}
                  <div className="text-[13px] sm:text-[13.5px] font-medium text-white text-center leading-snug whitespace-pre-line break-words max-w-[170px]">
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
