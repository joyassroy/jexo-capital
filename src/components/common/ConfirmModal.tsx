"use client";

import React from "react";
import { LogOut, AlertTriangle, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning";
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  icon,
}: ConfirmModalProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-[320px] rounded-[24px] p-5 shadow-2xl transition-all border ${
          isLight
            ? "bg-white border-slate-200 text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            : "bg-[#071126] border-[#f5ba31]/40 text-white shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-3.5 right-3.5 p-1 rounded-full transition-colors ${
            isLight
              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Center Icon */}
        <div className="flex flex-col items-center text-center mt-1">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
              type === "danger"
                ? "bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-900/30"
                : "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-900/30"
            }`}
          >
            {icon || (type === "danger" ? <LogOut size={24} /> : <AlertTriangle size={24} />)}
          </div>

          {title && (
            <h3
              className={`text-base font-extrabold tracking-tight mb-1 ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {title}
            </h3>
          )}

          <p
            className={`text-xs font-semibold leading-relaxed mb-5 ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                : "bg-white/10 hover:bg-white/15 text-slate-200"
            }`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-95 ${
              type === "danger"
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-rose-900/40"
                : "bg-gradient-to-r from-amber-500 to-[#f5ba31] hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-900/40"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
