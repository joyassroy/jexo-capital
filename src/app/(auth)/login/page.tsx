"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/common/Logo";
import CityFooter from "@/components/common/CityFooter";
import { Eye, EyeOff, Lock, Phone, Globe } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, keepSignedIn }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#bfe4ff] via-[#eaf4fe] to-[#cce8ff]">
      {/* Wave lines decorative top */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/40 via-transparent to-transparent pointer-events-none" />

      {/* Language Selector Top Right */}
      <div className="flex justify-end p-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-xs font-semibold text-blue-900 shadow-sm">
          <Globe size={14} className="text-blue-600" />
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
          <h2 className="text-2xl font-black text-blue-950 tracking-tight">
            Welcome to Zexo Capital
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] w-6 bg-blue-300" />
            <p className="text-xs font-medium text-blue-800">
              Login to continue your investment journey
            </p>
            <span className="h-[1px] w-6 bg-blue-300" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50/90 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Mobile input with country badge */}
          <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
            <div className="flex items-center gap-1.5 px-3 py-3 bg-blue-50/70 border-r border-blue-100 text-sm font-semibold text-gray-700">
              <span className="text-lg">🇧🇩</span>
              <span className="text-xs font-bold text-gray-800">+880</span>
            </div>
            <div className="flex items-center flex-1 px-3">
              <Phone size={18} className="text-blue-500 mr-2 flex-shrink-0" />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full py-3 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 px-3 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
            <Lock size={18} className="text-blue-500 mr-2 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-3 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-blue-900">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-blue-300 focus:ring-blue-400"
              />
              <span>Keep me signed in</span>
            </label>

            <Link
              href="/support"
              className="text-blue-600 font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#0099FF] text-white font-bold text-base shadow-[0_4px_16px_rgba(0,102,255,0.4)] hover:shadow-lg active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register navigation link */}
        <div className="text-center mt-6">
          <p className="text-xs text-blue-950 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#0055FF] font-bold hover:underline"
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

