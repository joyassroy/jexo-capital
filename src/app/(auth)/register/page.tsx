"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/common/Logo";
import CityFooter from "@/components/common/CityFooter";
import { Eye, EyeOff, Lock, Phone, User, UserPlus, Globe } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

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

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          phone,
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

      router.push("/profile");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3.5">
      {/* Error notification */}
      {error && (
        <div className="mb-4 p-3 bg-red-50/90 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center shadow-sm">
          {error}
        </div>
      )}

      {/* Nickname */}
      <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 px-3.5 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
        <User size={18} className="text-blue-500 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="w-full py-2.5 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
        />
      </div>

      {/* Mobile Number with country selector */}
      <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50/70 border-r border-blue-100 text-sm font-semibold text-gray-700">
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
            className="w-full py-2.5 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
          />
        </div>
      </div>

      {/* Password (4-10 digits) */}
      <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 px-3.5 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
        <Lock size={18} className="text-blue-500 mr-2.5 flex-shrink-0" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter a password of 4-10 digits."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          maxLength={10}
          className="w-full py-2.5 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 px-3.5 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
        <Lock size={18} className="text-blue-500 mr-2.5 flex-shrink-0" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          maxLength={10}
          className="w-full py-2.5 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Referral Code (Optional) */}
      <div className="flex items-center bg-white rounded-2xl border-2 border-blue-200 px-3.5 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
        <UserPlus size={18} className="text-blue-500 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full py-2.5 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium"
        />
      </div>

      {/* Register Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-[#0066FF] to-[#0099FF] text-white font-bold text-base shadow-[0_4px_16px_rgba(0,102,255,0.4)] hover:shadow-lg active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <UserPlus size={18} />
        <span>{loading ? "Creating Account..." : "Register"}</span>
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#bfe4ff] via-[#eaf4fe] to-[#cce8ff]">
      {/* Language Selector Top Right */}
      <div className="flex justify-end p-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-blue-200 text-xs font-semibold text-blue-900 shadow-sm">
          <Globe size={14} className="text-blue-600" />
          <span>English</span>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="px-6 z-10 flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full py-4">
        {/* Logo */}
        <div className="mb-2">
          <Logo size={70} showText={false} />
        </div>

        {/* Titles */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-blue-950 tracking-tight">
            Welcome to Zexo Capital
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] w-6 bg-blue-300" />
            <p className="text-xs font-medium text-blue-800">
              Complete your registration
            </p>
            <span className="h-[1px] w-6 bg-blue-300" />
          </div>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-sm text-gray-500">Loading form...</div>}>
          <RegisterForm />
        </Suspense>

        {/* Already have an account */}
        <div className="text-center mt-5">
          <p className="text-xs text-blue-950 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#0055FF] font-bold hover:underline"
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
