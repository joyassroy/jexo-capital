"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Crown, Share2, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Homepage", href: "/", icon: Home },
    { label: "VIP level", href: "/vip", icon: Crown },
    { label: "Share", href: "/share", icon: Share2 },
    { label: "Personal Center", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto bg-white/95 backdrop-blur-md border-t border-blue-100 shadow-[0_-4px_20px_rgba(0,102,255,0.08)]">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                isActive
                  ? "text-[#0066FF] font-semibold scale-105"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? "bg-blue-50 text-[#0066FF]" : ""
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

