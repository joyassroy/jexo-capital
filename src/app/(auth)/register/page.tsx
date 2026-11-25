"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/common/Logo";
import CityFooter from "@/components/common/CityFooter";
import ThemeToggle from "@/components/common/ThemeToggle";
import CountryCodeDropdown, {
  COUNTRY_LIST,
  CountryItem,
} from "@/components/common/CountryCodeDropdown";
import { Eye, EyeOff, Lock, Phone, User, UserPlus, Globe, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [country, setCountry] = useState<CountryItem>(COUNTRY_LIST[0]);
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isAutoReferred, setIsAutoReferred] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Check Next.js searchParams first
    const fromParams =
      searchParams.get("ref") ||
      searchParams.get("code") ||
      searchParams.get("invite") ||
      searchParams.get("referral") ||
      searchParams.get("invitation") ||
      searchParams.get("referralCode");

    let code = fromParams ? fromParams.trim() : "";

    // 2. Direct browser URL query string fallback (works synchronously on load)
    if (!code && typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const qCode =
          urlParams.get("ref") ||
          urlParams.get("code") ||
          urlParams.get("invite") ||
          urlParams.get("referral") ||
          urlParams.get("invitation") ||
          urlParams.get("referralCode");
        if (qCode && qCode.trim()) {
          code = qCode.trim();
        }
      } catch {}
    }

    // 3. Fallback to localStorage / sessionStorage / cookie (in case user browsed other pages before registering)
    if (!code && typeof window !== "undefined") {
      try {
        const stored =
          localStorage.getItem("jexo_referral_code") ||
          sessionStorage.getItem("jexo_referral_code");
        if (stored && stored.trim()) {
          code = stored.trim();
        } else {
          const match = document.cookie.match(/(^| )jexo_ref=([^;]+)/);
          if (match && match[2]) {
            code = decodeURIComponent(match[2]).trim();
          }
        }
      } catch {}
    }

    if (code) {
      setReferralCode(code);
      setIsAutoReferred(true);
      // Persist across browser session
      try {
        localStorage.setItem("jexo_referral_code", code);
        sessionStorage.setItem("jexo_referral_code", code);
        document.cookie = `jexo_ref=${encodeURIComponent(code)}; path=/; max-age=2592000; SameSite=Lax`;
      } catch {}
    }
  }, [searchParams]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    // If user accidentally typed country code digits, strip them
    const codeDigits = country.code.replace(/[^0-9]/g, "");
    if (val.startsWith(codeDigits)) {
      val = val.slice(codeDigits.length);
    }
    setPhone(val);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4 || password.length > 10) {
      setError("Password must be between 4 and 10 digits.");
      return;
    }

    const cleanDigits = phone.trim().replace(/[^0-9]/g, "");
    if (!cleanDigits || cleanDigits.length < 5 || cleanDigits.length > 15) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          countryCode: country.code,
          phone: cleanDigits,
          password,
          confirmPassword,
          referralCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      try {
        localStorage.removeItem("jexo_referral_code");
        sessionStorage.removeItem("jexo_referral_code");
        document.cookie = "jexo_ref=; path=/; max-age=0";
      } catch {}

      toast.success("Account created successfully! Welcome to Jexo Capital.");
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 850);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3.5">
      {/* Error notification */}
      {error && (
        <div className="mb-4 p-3.5 bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold rounded-xl text-center shadow-sm">
          {error}
        </div>
      )}

      {/* Nickname */}
      <div className="auth-input-box flex items-center rounded-2xl border-2 px-3.5 h-[48px] shadow-sm transition-all">
        <User size={18} className="auth-input-icon mr-2.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="auth-input-field w-full bg-transparent text-sm outline-none font-medium"
        />
      </div>

      {/* Country Code + Mobile Number in one row */}
      <div className="flex items-center gap-2">
        <CountryCodeDropdown selected={country} onSelect={setCountry} />

        <div className="auth-input-box flex-1 flex items-center rounded-2xl border-2 px-3.5 h-[48px] shadow-sm transition-all">
          <Phone size={18} className="auth-input-icon mr-2.5 flex-shrink-0" />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={handlePhoneChange}
            required
            className="auth-input-field w-full bg-transparent text-sm outline-none font-semibold"
          />
        </div>
      </div>

      {/* Password (4-10 digits) */}
      <div className="auth-input-box flex items-center rounded-2xl border-2 px-3.5 h-[48px] shadow-sm transition-all">
        <Lock size={18} className="auth-input-icon mr-2.5 flex-shrink-0" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password of 4–10 digits."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          maxLength={10}
          className="auth-input-field w-full bg-transparent text-sm outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="auth-input-box flex items-center rounded-2xl border-2 px-3.5 h-[48px] shadow-sm transition-all">
        <Lock size={18} className="auth-input-icon mr-2.5 flex-shrink-0" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          maxLength={10}
          className="auth-input-field w-full bg-transparent text-sm outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Invite Code (Optional / Auto-Applied via Share Link or QR Code) */}
      <div
        className={`auth-input-box flex items-center rounded-2xl border-2 px-3.5 h-[48px] shadow-sm transition-all ${
          isAutoReferred ? "border-amber-400/80 bg-amber-500/5 dark:bg-amber-400/5" : ""
        }`}
      >
        <UserPlus size={18} className="auth-input-icon mr-2.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Invite Code (Optional)"
          value={referralCode}
          onChange={(e) => {
            setReferralCode(e.target.value);
            if (e.target.value.trim() === "") setIsAutoReferred(false);
          }}
          className="auth-input-field w-full bg-transparent text-sm outline-none font-semibold"
        />
        {referralCode && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0 select-none">
            <Check size={12} className="stroke-[3]" />
            <span>Applied</span>
          </span>
        )}
      </div>

      {/* Register Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="auth-submit-btn w-full py-3.5 mt-2 rounded-2xl font-black text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
      >
        <UserPlus size={18} className="stroke-[2.5]" />
        <span>{loading ? "Creating Account..." : "Register"}</span>
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white">
      {/* Top Bar: Theme Toggle & Language Selector */}
      <div className="flex justify-end items-center p-4 z-10">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#05143a]/90 backdrop-blur-md border border-[#f5ba31]/50 text-xs font-semibold text-white shadow-sm">
            <Globe size={14} className="text-[#f5ba31]" />
            <span>English</span>
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="px-6 z-10 flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full py-4">
        {/* Centered Logo Emblem */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#071333] via-[#091d52] to-[#040f2e] p-3 border border-[#f5ba31]/40 shadow-[0_8px_30px_rgba(245,186,49,0.25)] flex items-center justify-center group transition-transform hover:scale-105">
            <Logo size={52} showText={false} />
          </div>
        </div>

        {/* Titles */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight auth-heading">
            Welcome to Zexo Capital
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] w-6 bg-amber-400/50" />
            <p className="text-xs font-semibold auth-subheading">
              Complete your registration
            </p>
            <span className="h-[1px] w-6 bg-amber-400/50" />
          </div>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-sm text-slate-400">Loading form...</div>}>
          <RegisterForm />
        </Suspense>

        {/* Already have an account */}
        <div className="text-center mt-5">
          <p className="text-xs font-semibold auth-footer-text">
            Already have an account?{" "}
            <Link
              href="/login"
              className="auth-link font-black hover:underline ml-1"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
