"use client";

import React from "react";
import { Check, X, Globe } from "lucide-react";
import { useLanguage, LANGUAGE_OPTIONS, Language } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (!isOpen) return null;

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-[340px] rounded-3xl p-5 shadow-2xl border transition-all duration-300 transform-gpu ${
          isLight
            ? "bg-white border-blue-100 text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
            : "bg-gradient-to-b from-[#081944] via-[#04102e] to-[#02091c] border-[#f5ba31]/40 text-white shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isLight ? "bg-blue-50 text-blue-600" : "bg-white/10 text-[#f5ba31]"
              }`}
            >
              <Globe size={18} />
            </div>
            <h3 className="font-bold text-base tracking-tight">
              {t("select_language")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isLight
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Language Options List */}
        <div className="mt-4 space-y-2.5">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => handleSelect(opt.code)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? isLight
                      ? "bg-blue-50/90 border-blue-500 shadow-sm text-blue-900"
                      : "bg-[#0b2466]/80 border-[#f5ba31] shadow-[0_0_12px_rgba(245,186,49,0.25)] text-white"
                    : isLight
                    ? "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-800"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{opt.flag}</span>
                  <div>
                    <div className="font-bold text-sm leading-tight">
                      {opt.nativeName}
                    </div>
                    <div
                      className={`text-xs ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {opt.name}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isLight
                        ? "bg-blue-600 text-white"
                        : "bg-[#f5ba31] text-slate-950 font-black shadow-[0_0_8px_#f5ba31]"
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      isLight ? "border-slate-300" : "border-white/20"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/10 text-center">
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                : "bg-white/10 hover:bg-white/15 text-white/90"
            }`}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
