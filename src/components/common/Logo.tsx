import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 70, showText = true }: LogoProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,102,255,0.35)]"
        >
          <defs>
            <linearGradient id="zexoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C6FF" />
              <stop offset="50%" stopColor="#0072FF" />
              <stop offset="100%" stopColor="#0047CC" />
            </linearGradient>
            <linearGradient id="swooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#80D0FF" />
            </linearGradient>
          </defs>

          {/* Stylized 'Z' with dynamic swooshes */}
          <path
            d="M25 30 H95 L40 85 H95 L90 95 H20 L75 40 H25 Z"
            fill="url(#zexoGrad)"
          />
          {/* Dynamic speed swoosh arc */}
          <path
            d="M15 75 C30 100 85 105 105 70 C80 90 35 85 15 75 Z"
            fill="url(#swooshGrad)"
            opacity="0.9"
          />
          <path
            d="M30 45 C45 25 85 20 100 45 C80 32 45 35 30 45 Z"
            fill="#FFFFFF"
            opacity="0.8"
          />
        </svg>
      </div>

      {showText && (
        <div className="mt-2 text-center">
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#0052CC] to-[#0099FF] bg-clip-text text-transparent">
            Zexo Capital
          </span>
        </div>
      )}
    </div>
  );
}

