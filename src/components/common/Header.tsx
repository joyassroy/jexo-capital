"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  showBack = true,
  onBack,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={`relative flex items-center justify-between px-4 py-3 backdrop-blur-md border-b shadow-xs z-30 transition-colors duration-200 ${
        isLight
          ? "bg-white/95 border-amber-300/40 text-slate-800"
          : "bg-[#030e28]/95 border-[#f5ba31]/30 text-white shadow-md"
      }`}
    >
      {/* Back button */}
      <div className="w-9 h-9 flex items-center">
        {showBack && (
          <button
            onClick={handleBack}
            className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-95 transition-all shadow-xs ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
            }`}
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Centered Title in signature Vibrant Gold (Matching Daily Necessities) */}
      <div className="flex-1 flex items-center justify-center px-2">
        <h1
          style={{ color: "#f5ba31", WebkitTextFillColor: "#f5ba31" }}
          className="header-gold-title text-base sm:text-lg font-black tracking-tight !text-[#f5ba31] text-[#f5ba31] text-center drop-shadow-[0_0_10px_rgba(245,186,49,0.35)] select-none"
        >
          {title}
        </h1>
      </div>

      {/* Right action placeholder or ThemeToggle */}
      <div className="w-9 h-9 flex items-center justify-end">
        {rightAction !== undefined ? rightAction : <ThemeToggle compact />}
      </div>
    </div>
  );
}
