"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Crown, ClipboardCheck, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  // Do not show bottom nav on admin portal or auth screens
  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  const navItems = [
    { label: "Homepage", href: "/", icon: Home },
    { label: "VIP level", href: "/vip", icon: Crown },
    { label: "Order", href: "/records", icon: ClipboardCheck },
    { label: "Personal Center", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 px-3 max-w-[440px] mx-auto pointer-events-none transform-gpu">
      <nav
        aria-label="Bottom Navigation"
        className={`pointer-events-auto rounded-full py-2 px-3 transition-all duration-300 transform-gpu will-change-transform backdrop-blur-md ${
          isLight
            ? "bg-white/95 border border-amber-400/80 shadow-[0_4px_25px_rgba(0,0,0,0.1),0_0_15px_rgba(245,186,49,0.25)]"
            : "bg-[#031130]/75 border border-[#f5ba31]/75 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_14px_rgba(245,186,49,0.2)]"
        }`}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) ||
                  (item.href === "/records" && pathname === "/orders");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 group relative ${
                  isActive
                    ? isLight
                      ? "text-amber-600 scale-105"
                      : "text-[#f5ba31] scale-105"
                    : isLight
                    ? "text-slate-600 hover:text-amber-600"
                    : "text-slate-200/80 hover:text-[#f5ba31]"
                }`}
              >
                <div
                  className={`p-1 transition-all duration-200 ${
                    isActive
                      ? isLight
                        ? "filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110"
                        : "filter drop-shadow-[0_0_10px_rgba(245,186,49,0.85)] scale-110"
                      : "group-hover:scale-105"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? isLight
                          ? "text-amber-600"
                          : "text-[#f5ba31]"
                        : isLight
                        ? "text-slate-600 group-hover:text-amber-600"
                        : "text-white/85 group-hover:text-[#f5ba31]"
                    }
                  />
                </div>
                <span
                  className={`text-[10.5px] mt-0.5 tracking-tight font-semibold transition-colors ${
                    isActive
                      ? isLight
                        ? "text-amber-600 font-bold drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                        : "text-[#f5ba31] font-bold drop-shadow-[0_0_6px_rgba(245,186,49,0.5)]"
                      : isLight
                      ? "text-slate-600 group-hover:text-amber-600"
                      : "text-white/85 group-hover:text-[#f5ba31]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
