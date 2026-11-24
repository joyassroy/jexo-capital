"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 34, showText = true }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size * 0.9 }}
      >
        <svg
          viewBox="0 0 44 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,210,255,0.5)]"
        >
          <defs>
            <linearGradient id="logoZGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#80E5FF" />
              <stop offset="45%" stopColor="#00D2FF" />
              <stop offset="100%" stopColor="#0099FF" />
            </linearGradient>
            <linearGradient id="logoZSwoosh" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#80E5FF" />
            </linearGradient>
            <linearGradient id="logoZGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE58F" />
              <stop offset="50%" stopColor="#F5BA31" />
              <stop offset="100%" stopColor="#D49002" />
            </linearGradient>
          </defs>

          {/* Dynamic Stylized Speed Z Ribbon */}
          <path
            d="M6 7 C6 7, 9.5 3, 15 3 L37 3 C39.5 3, 40.5 4.5, 39 6.5 L24 22 L37 22 C39.5 22, 40.5 23.5, 39 25.5 L34 32 C32.5 34, 29.5 34, 26 34 L6 34 C3 34, 2 32.5, 3.5 30.5 L18 15 L6 15 C3.5 15, 2.5 13.5, 4 11 Z"
            fill={isLight ? "url(#logoZGrad)" : "url(#logoZGold)"}
          />
          {/* Dynamic speed swoosh arc through middle */}
          <path
            d="M2 23 C10 26, 30 25, 41 12 C30 20, 11 19, 2 23 Z"
            fill="url(#logoZSwoosh)"
            opacity="0.95"
          />
          <path
            d="M9 9 C18 5, 32 6, 38 12 C32 8, 18 7, 9 9 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </svg>
      </div>

      {showText && (
        <span
          style={{ color: "#ffffff", WebkitTextFillColor: isLight ? "#ffffff" : undefined }}
          className={`font-black text-xl tracking-wide logo-white-text !text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)] ${
            !isLight
              ? "bg-clip-text text-transparent bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#e69e05] drop-shadow-[0_2px_12px_rgba(245,186,49,0.35)]"
              : ""
          }`}
        >
          Zexo Capital
        </span>
      )}
    </div>
  );
}
