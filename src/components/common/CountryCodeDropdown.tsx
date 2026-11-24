"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

export interface CountryItem {
  name: string;
  code: string;
  flag: string;
  iso: string;
}

export const COUNTRY_LIST: CountryItem[] = [
  { name: "Bangladesh", code: "+880", flag: "🇧🇩", iso: "BD" },
  { name: "United States", code: "+1", flag: "🇺🇸", iso: "US" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧", iso: "GB" },
  { name: "Canada", code: "+1", flag: "🇨🇦", iso: "CA" },
  { name: "India", code: "+91", flag: "🇮🇳", iso: "IN" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰", iso: "PK" },
  { name: "Australia", code: "+61", flag: "🇦🇺", iso: "AU" },
  { name: "Germany", code: "+49", flag: "🇩🇪", iso: "DE" },
  { name: "France", code: "+33", flag: "🇫🇷", iso: "FR" },
  { name: "Japan", code: "+81", flag: "🇯🇵", iso: "JP" },
  { name: "China", code: "+86", flag: "🇨🇳", iso: "CN" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪", iso: "AE" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦", iso: "SA" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾", iso: "MY" },
  { name: "Singapore", code: "+65", flag: "🇸🇬", iso: "SG" },
  { name: "Italy", code: "+39", flag: "🇮🇹", iso: "IT" },
];

interface CountryCodeDropdownProps {
  selected: CountryItem;
  onSelect: (country: CountryItem) => void;
}

export default function CountryCodeDropdown({
  selected,
  onSelect,
}: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="auth-input-box h-[48px] min-w-[105px] px-3 bg-[#04102e] rounded-2xl border-2 border-slate-700 shadow-sm flex items-center justify-between gap-1.5 hover:border-[#f5ba31]/60 focus:border-[#f5ba31] transition-all select-none active:scale-98"
      >
        <div className="flex items-center gap-1.5">
          <Globe size={18} className="auth-input-icon text-[#f5ba31] flex-shrink-0" />
          <span className="auth-input-text text-sm font-black text-white tracking-tight">
            {selected.code}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-slate-300 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#f5ba31]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#04102e]/98 backdrop-blur-md rounded-2xl border-2 border-[#f5ba31]/50 shadow-[0_0_20px_rgba(245,186,49,0.3)] overflow-hidden z-50 py-1.5 max-h-64 overflow-y-auto">
          {COUNTRY_LIST.map((country, idx) => {
            const isSelected =
              selected.code === country.code && selected.iso === country.iso;
            return (
              <button
                key={`${country.iso}-${idx}`}
                type="button"
                onClick={() => {
                  onSelect(country);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors hover:bg-white/10 ${
                  isSelected
                    ? "bg-[#f5ba31]/20 text-[#f5ba31]"
                    : "text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none leading-none">
                    {country.flag}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {country.iso}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-xs">
                    {country.code}
                  </span>
                  {isSelected && (
                    <Check size={13} className="text-[#f5ba31] stroke-[3]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
