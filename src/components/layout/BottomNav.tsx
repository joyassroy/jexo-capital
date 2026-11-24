"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Crown, ClipboardCheck, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { t } = useLanguage();
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
    { label: t("nav_home"), href: "/", icon: Home },
    { label: t("nav_vip"), href: "/vip", icon: Crown },
    { label: t("nav_order"), href: "/orders", icon: ClipboardCheck },
    { label: t("nav_profile"), href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-[440px] mx-auto pointer-events-none transform-gpu">
      <nav
        aria-label="Bottom Navigation"
        className={`pointer-events-auto transition-all duration-300 transform-gpu will-change-transform ${
          isLight
            ? "rounded-full py-1.5 px-3 mx-2 mb-2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            : "rounded-full py-2 px-3 mx-2 mb-2 backdrop-blur-md bg-[#031130]/80 border border-[#f5ba31]/75 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_14px_rgba(245,186,49,0.2)]"
        }`}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            if (isLight) {
              return (
                <React.Fragment key={item.href}>
                  {index > 0 && (
                    <div className="w-[1px] h-5 bg-slate-200/80 my-auto flex-shrink-0" />
                  )}
                  <Link
                    href={item.href}
                    className="flex flex-col items-center justify-center flex-1 py-0.5 transition-all duration-200 group relative"
                  >
                    {isActive ? (
                      <div className="flex flex-col items-center">
                        {/* Circular soft lavender badge */}
                        <div className="w-8 h-8 rounded-full bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shadow-xs">
                          <Icon size={18} strokeWidth={2.5} className="text-[#7c3aed]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#7c3aed] mt-0.5 tracking-tight">
                          {item.label}
                        </span>
                        {/* Purple horizontal indicator bar */}
                        <div className="w-6 h-1 rounded-full bg-[#7c3aed] mt-0.5 shadow-xs" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-600 group-hover:text-slate-900">
                        <div className="p-1 transition-transform group-hover:scale-105">
                          <Icon size={19} strokeWidth={1.8} className="text-slate-600 group-hover:text-slate-900" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 group-hover:text-slate-900 mt-0.5 tracking-tight">
                          {item.label}
                        </span>
                      </div>
                    )}
                  </Link>
                </React.Fragment>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 group relative ${
                  isActive
                    ? "text-[#f5ba31] scale-105"
                    : "text-slate-200/80 hover:text-[#f5ba31]"
                }`}
              >
                <div
                  className={`p-1 transition-all duration-200 ${
                    isActive
                      ? "filter drop-shadow-[0_0_10px_rgba(245,186,49,0.85)] scale-110"
                      : "group-hover:scale-105"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? "text-[#f5ba31]"
                        : "text-white/85 group-hover:text-[#f5ba31]"
                    }
                  />
                </div>
                <span
                  className={`text-[10.5px] mt-0.5 tracking-tight font-semibold transition-colors ${
                    isActive
                      ? "text-[#f5ba31] font-bold drop-shadow-[0_0_6px_rgba(245,186,49,0.5)]"
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
