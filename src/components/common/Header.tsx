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
    <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0072FF] to-[#00C6FF] text-white shadow-md">
      {/* Back button */}
      <div className="w-9 h-9 flex items-center">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
        )}
      </div>

      {/* Pill title */}
      <div className="px-5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
        <h1 className="text-base font-bold text-white tracking-wide text-center">
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

