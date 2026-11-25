"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Globe, ChevronDown, Check, Search, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface CountryItem {
  name: string;
  nameBn: string;
  code: string;
  flag: string;
  iso: string;
}

export const COUNTRY_LIST: CountryItem[] = [
  { name: "Bangladesh", nameBn: "বাংলাদেশ", code: "+880", flag: "🇧🇩", iso: "BD" },
  { name: "India", nameBn: "ভারত", code: "+91", flag: "🇮🇳", iso: "IN" },
  { name: "Pakistan", nameBn: "পাকিস্তান", code: "+92", flag: "🇵🇰", iso: "PK" },
  { name: "China", nameBn: "চীন", code: "+86", flag: "🇨🇳", iso: "CN" },
  { name: "Myanmar", nameBn: "মায়ানমার", code: "+95", flag: "🇲🇲", iso: "MM" },
  { name: "Malaysia", nameBn: "মালয়েশিয়া", code: "+60", flag: "🇲🇾", iso: "MY" },
  { name: "Saudi Arabia", nameBn: "সৌদি আরব", code: "+966", flag: "🇸🇦", iso: "SA" },
  { name: "United States", nameBn: "যুক্তরাষ্ট্র", code: "+1", flag: "🇺🇸", iso: "US" },
  { name: "United Kingdom", nameBn: "যুক্তরাজ্য", code: "+44", flag: "🇬🇧", iso: "GB" },
  { name: "Kuwait", nameBn: "কুয়েত", code: "+965", flag: "🇰🇼", iso: "KW" },
  { name: "Qatar", nameBn: "কাতার", code: "+974", flag: "🇶🇦", iso: "QA" },
  { name: "Bahrain", nameBn: "বাহরাইন", code: "+973", flag: "🇧🇭", iso: "BH" },
  { name: "United Arab Emirates", nameBn: "সংযুক্ত আরব আমিরাত", code: "+971", flag: "🇦🇪", iso: "AE" },
  { name: "Russia", nameBn: "রাশিয়া", code: "+7", flag: "🇷🇺", iso: "RU" },
  { name: "Iran", nameBn: "ইরান", code: "+98", flag: "🇮🇷", iso: "IR" },
  { name: "Bhutan", nameBn: "ভুটান", code: "+975", flag: "🇧🇹", iso: "BT" },
  { name: "Indonesia", nameBn: "ইন্দোনেশিয়া", code: "+62", flag: "🇮🇩", iso: "ID" },
  { name: "Lebanon", nameBn: "লেবানন", code: "+961", flag: "🇱🇧", iso: "LB" },
  { name: "Ukraine", nameBn: "ইউক্রেন", code: "+380", flag: "🇺🇦", iso: "UA" },
  { name: "Australia", nameBn: "অস্ট্রেলিয়া", code: "+61", flag: "🇦🇺", iso: "AU" },
  { name: "Jordan", nameBn: "জর্ডান", code: "+962", flag: "🇯🇴", iso: "JO" },
  { name: "Israel", nameBn: "ইসরায়েল", code: "+972", flag: "🇮🇱", iso: "IL" },
  { name: "Afghanistan", nameBn: "আফগানিস্তান", code: "+93", flag: "🇦🇫", iso: "AF" },
  { name: "Argentina", nameBn: "আর্জেন্টিনা", code: "+54", flag: "🇦🇷", iso: "AR" },
  { name: "France", nameBn: "ফ্রান্স", code: "+33", flag: "🇫🇷", iso: "FR" },
  { name: "Iraq", nameBn: "ইরাক", code: "+964", flag: "🇮🇶", iso: "IQ" },
  { name: "Italy", nameBn: "ইতালি", code: "+39", flag: "🇮🇹", iso: "IT" },
  { name: "Oman", nameBn: "ওমান", code: "+968", flag: "🇴🇲", iso: "OM" },
  { name: "Singapore", nameBn: "সিঙ্গাপুর", code: "+65", flag: "🇸🇬", iso: "SG" },
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
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

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

  // Filter countries based on search term (name, bengali name, iso, dial code)
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return COUNTRY_LIST;
    const term = searchTerm.toLowerCase().trim();
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.nameBn.includes(term) ||
        c.iso.toLowerCase().includes(term) ||
        c.code.includes(term)
    );
  }, [searchTerm]);

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="auth-input-box h-[48px] min-w-[105px] px-3 bg-[#04102e] rounded-2xl border-2 border-slate-700 shadow-sm flex items-center justify-between gap-1.5 hover:border-[#f5ba31]/60 focus:border-[#f5ba31] transition-all select-none active:scale-98"
        aria-label="Select country phone code"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none select-none">
            {selected.flag || "🌐"}
          </span>
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
        <div
          className={`absolute top-full left-0 mt-2 w-64 max-w-[85vw] backdrop-blur-xl rounded-2xl border-2 shadow-2xl overflow-hidden z-50 flex flex-col ${
            isLight
              ? "bg-white/98 border-amber-300 shadow-[0_12px_36px_rgba(245,186,49,0.3)] text-slate-800"
              : "bg-[#04102e]/98 border-[#f5ba31]/60 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(245,186,49,0.25)] text-white"
          }`}
        >
          {/* Search Header */}
          <div
            className={`p-2 border-b flex items-center gap-2 ${
              isLight ? "bg-amber-50/50 border-amber-200" : "bg-white/5 border-white/10"
            }`}
          >
            <Search
              size={14}
              className={isLight ? "text-amber-600" : "text-amber-400"}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search / খুঁজুন..."
              className={`w-full bg-transparent text-xs font-bold outline-none placeholder:text-slate-400 ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                No country found
              </div>
            ) : (
              filteredCountries.map((country, idx) => {
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
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                      isSelected
                        ? isLight
                          ? "bg-amber-100 text-amber-900 font-black"
                          : "bg-[#f5ba31]/20 text-[#f5ba31] font-black"
                        : isLight
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-base select-none leading-none shrink-0">
                        {country.flag}
                      </span>
                      <div className="flex flex-col text-left truncate">
                        <span className="truncate leading-tight">
                          {country.name}
                        </span>
                        <span
                          className={`text-[10px] leading-tight font-medium ${
                            isLight ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {country.nameBn} ({country.iso})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`font-black text-xs font-mono ${
                          isSelected
                            ? isLight
                              ? "text-amber-800"
                              : "text-[#f5ba31]"
                            : isLight
                            ? "text-slate-900"
                            : "text-white"
                        }`}
                      >
                        {country.code}
                      </span>
                      {isSelected && (
                        <Check
                          size={13}
                          className={
                            isLight
                              ? "text-amber-700 stroke-[3]"
                              : "text-[#f5ba31] stroke-[3]"
                          }
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
