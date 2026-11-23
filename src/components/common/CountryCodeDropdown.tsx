"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown, Check } from "lucide-react";

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
        className="h-[48px] min-w-[105px] px-3 bg-white rounded-2xl border-2 border-blue-200 shadow-sm flex items-center justify-between gap-1.5 hover:border-blue-400 focus:border-blue-500 transition-all select-none active:scale-98"
      >
        <div className="flex items-center gap-1.5">
          <User size={18} className="text-blue-600 flex-shrink-0" />
          <span className="text-sm font-black text-blue-950 tracking-tight">
            {selected.code}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-blue-900 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-40 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden z-50 py-1.5 max-h-64 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors hover:bg-blue-50/80 ${
                  isSelected
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none leading-none">
                    {country.flag}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {country.iso}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-blue-950 text-xs">
                    {country.code}
                  </span>
                  {isSelected && (
                    <Check size={13} className="text-blue-600 stroke-[3]" />
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
