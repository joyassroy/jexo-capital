"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export default function ThemeToggle({
  compact = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 focus:outline-none ${
          isDark
            ? "bg-[#05143a]/80 text-[#ffe58f] border border-[#f5ba31]/60 shadow-[0_0_10px_rgba(245,186,49,0.3)] hover:border-[#f5ba31]"
            : "bg-amber-50 text-amber-600 border border-amber-300 shadow-sm hover:bg-amber-100"
        } ${className}`}
        aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
        title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      >
        {isDark ? (
          <Moon size={15} className="text-[#ffe58f]" />
        ) : (
          <Sun size={15} className="text-amber-500" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer ${
        isDark
          ? "bg-[#05143a]/80 backdrop-blur-md border border-[#f5ba31]/70 shadow-[0_0_12px_rgba(245,186,49,0.25)] text-xs font-semibold text-white hover:border-[#f5ba31]"
          : "bg-white/95 backdrop-blur-md border border-amber-400 shadow-[0_2px_8px_rgba(245,158,11,0.2)] text-xs font-semibold text-slate-800 hover:bg-amber-50"
      } ${className}`}
      aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
    >
      {isDark ? (
        <>
          <Moon size={13} className="text-[#ffe58f]" />
          <span className="text-[11px] font-bold text-[#ffe58f]">Night</span>
        </>
      ) : (
        <>
          <Sun size={13} className="text-amber-500 fill-amber-400" />
          <span className="text-[11px] font-bold text-amber-700">Day</span>
        </>
      )}
    </button>
  );
}
