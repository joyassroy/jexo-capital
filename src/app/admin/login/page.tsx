"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg mb-3">
            <Shield size={36} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Zexo Capital Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure Management & Financial Operations Portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or Admin Email
            </label>
            <div className="flex items-center bg-[#0F172A] border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors">
              <User size={18} className="text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="admin or admin@zexocapital.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="flex items-center bg-[#0F172A] border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors">
              <Lock size={18} className="text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Portal"}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-slate-500">
          Default: <span className="text-slate-300 font-mono">admin</span> /{" "}
          <span className="text-slate-300 font-mono">Admin@123456</span>
        </div>
      </div>
    </div>
  );
}

