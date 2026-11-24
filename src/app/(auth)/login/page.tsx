"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/common/Logo";
import CityFooter from "@/components/common/CityFooter";
import CountryCodeDropdown, {
  COUNTRY_LIST,
  CountryItem,
} from "@/components/common/CountryCodeDropdown";
import { Eye, EyeOff, Lock, Phone, Globe } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [country, setCountry] = useState<CountryItem>(COUNTRY_LIST[0]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    const codeDigits = country.code.replace(/[^0-9]/g, "");
    if (val.startsWith(codeDigits)) {
      val = val.slice(codeDigits.length);
    }
    setPhone(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanDigits = phone.trim().replace(/[^0-9]/g, "");
    if (!cleanDigits) {
      setError("Please enter your mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: country.code,
          phone: cleanDigits,
          password,
          keepSignedIn,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      const redirectUrl = searchParams.get("redirect") || "/profile";
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white">
      {/* Wave lines decorative top */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />

      {/* Language Selector Top Right */}
      <div className="flex justify-end p-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#05143a]/90 backdrop-blur-md border border-[#f5ba31]/50 text-xs font-semibold text-white shadow-sm">
          <Globe size={14} className="text-[#f5ba31]" />
          <span>English</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="px-6 z-10 flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
        {/* Logo */}
        <div className="mb-2">
          <Logo size={75} showText={false} />
        </div>

        {/* Titles */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome to Zexo Capital
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] w-6 bg-[#f5ba31]/60" />
            <p className="text-xs font-medium text-slate-300">
              Login to continue your investment journey
            </p>
            <span className="h-[1px] w-6 bg-[#f5ba31]/60" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold rounded-xl text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Country Code + Mobile Number in one row */}
          <div className="flex items-center gap-2">
            <CountryCodeDropdown selected={country} onSelect={setCountry} />

            <div className="flex-1 flex items-center bg-[#04102e] rounded-2xl border-2 border-slate-700 px-3.5 h-[48px] shadow-sm focus-within:border-[#f5ba31] transition-all">
              <Phone size={18} className="text-[#f5ba31] mr-2.5 flex-shrink-0" />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex items-center bg-[#04102e] rounded-2xl border-2 border-slate-700 px-3 py-1 shadow-sm focus-within:border-[#f5ba31] transition-all">
            <Lock size={18} className="text-[#f5ba31] mr-2 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 text-sm font-semibold text-white placeholder:text-slate-500 bg-transparent outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-[#f5ba31] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 rounded text-[#f5ba31] border-slate-600 focus:ring-[#f5ba31]"
              />
              <span>Keep me signed in</span>
            </label>

            <Link
              href="/support"
              className="text-[#f5ba31] font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f5ba31] via-[#ffd369] to-[#d49002] text-[#020a1f] font-black text-base shadow-[0_0_20px_rgba(245,186,49,0.35)] hover:shadow-lg active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register navigation link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-300 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#f5ba31] font-bold hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* City footer decoration */}
      <CityFooter />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020a1f] text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
