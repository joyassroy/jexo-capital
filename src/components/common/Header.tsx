"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  showBack = true,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-between px-4 py-3 bg-[#030e28]/95 backdrop-blur-md border-b border-[#f5ba31]/30 text-white shadow-md z-30">
      {/* Back button */}
      <div className="w-9 h-9 flex items-center">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        )}
      </div>

      {/* Pill title with Gold Border */}
      <div className="px-5 py-1 rounded-full bg-[#05143a]/90 backdrop-blur-md border border-[#f5ba31]/60 shadow-[0_0_12px_rgba(245,186,49,0.25)]">
        <h1 className="text-sm sm:text-base font-bold text-white tracking-wide text-center drop-shadow-[0_0_8px_rgba(245,186,49,0.3)]">
          {title}
        </h1>
      </div>

      {/* Right action placeholder or component */}
      <div className="w-9 h-9 flex items-center justify-end">
        {rightAction || null}
      </div>
    </div>
  );
}

