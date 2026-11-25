"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import {
  Share2,
  Link as LinkIcon,
  Check,
  Copy,
  Users,
  QrCode,
  Gift,
  Award,
} from "lucide-react";

export default function SharePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted && theme === "light";

  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/user/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          if (data.user.referralCode) setReferralCode(data.user.referralCode);
          if (data.user.referralCount !== undefined) setReferralCount(data.user.referralCount);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://zexocapital.com";

  const referralLink = referralCode
    ? `${origin}/register?ref=${referralCode}`
    : `${origin}/register`;

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success(`Referral code ${referralCode} copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className={`min-h-screen pb-28 flex flex-col justify-between transition-colors duration-200 ${
        isLight
          ? "bg-gradient-to-b from-[#f0f4fd] via-[#f7f9ff] to-[#eef3fb] text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        <Header title={t("invite_friends")} showBack={true} />

        <div className="p-4 space-y-4 max-w-[440px] mx-auto">
          {/* Top Banner Shield Icon */}
          <div className="flex flex-col items-center justify-center my-1 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] p-1 flex items-center justify-center shadow-[0_0_25px_rgba(245,186,49,0.45)] border-2 border-white/50">
              <Share2 size={38} className="text-[#020a1f] drop-shadow" />
            </div>
            <h2
              className={`text-lg font-black mt-2 tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Invite Friends & Earn Rewards
            </h2>
            <p
              className={`text-xs font-semibold ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Build your team and earn 3-level perpetual commissions
            </p>
          </div>

          {/* Referral Statistics Card */}
          <div
            className={`p-4 rounded-3xl backdrop-blur-md shadow-md border grid grid-cols-2 gap-3 text-center ${
              isLight
                ? "bg-white/95 border-amber-200/80 shadow-amber-500/5 text-slate-800"
                : "bg-[#04102e]/85 border-[#f5ba31]/30 text-white"
            }`}
          >
            <div
              className={`p-3 rounded-2xl border ${
                isLight
                  ? "bg-amber-50/60 border-amber-200/60"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                <Users size={14} />
                <span>Invited Friends</span>
              </div>
              <div
                className={`text-2xl font-black font-mono ${
                  isLight ? "text-slate-900" : "text-[#f5ba31]"
                }`}
              >
                {loading ? "..." : referralCount}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Direct Members
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                isLight
                  ? "bg-blue-50/60 border-blue-200/60"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">
                <Gift size={14} />
                <span>Commission Tier</span>
              </div>
              <div className="text-2xl font-black font-mono text-blue-500">
                10% / 5% / 3%
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Level 1, 2 & 3
              </span>
            </div>
          </div>

          {/* QR Code & Invite Box Card */}
          <div
            className={`p-5 rounded-3xl backdrop-blur-md shadow-lg border space-y-4 text-center ${
              isLight
                ? "bg-white/95 border-amber-200/80"
                : "bg-[#04102e]/85 border-[#f5ba31]/30"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500">
              <QrCode size={16} />
              <span>Scan QR Code to Register</span>
            </div>

            {/* Dynamic QR Code */}
            <div className="flex justify-center my-2">
              <div className="w-44 h-44 p-2.5 bg-white rounded-2xl border-2 border-amber-500/50 shadow-md flex items-center justify-center overflow-hidden">
                {referralCode ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      referralLink
                    )}`}
                    alt="Referral QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-400 font-semibold">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>

            <p
              className={`text-[11px] font-medium ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Friends can scan this QR code with mobile camera to register directly
            </p>

            {/* My Referral Code Box */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-white/10">
              <label
                className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-left ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                My Invitation Code
              </label>
              <div
                className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-800"
                    : "bg-[#020a1f] border-slate-700 text-white"
                }`}
              >
                <span className="font-mono font-black text-base text-amber-500 tracking-wider pl-2 select-all">
                  {loading ? "Loading..." : referralCode || "No Code"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            {/* My Referral Link Box */}
            <div>
              <label
                className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-left ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                My Invitation Link
              </label>
              <div
                className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-800"
                    : "bg-[#020a1f] border-slate-700 text-white"
                }`}
              >
                <span className="font-mono text-xs font-semibold truncate pr-2 pl-2 select-all text-slate-400">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs shrink-0"
                >
                  {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Big Share Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-gold-premium w-full mt-2 py-4 rounded-2xl text-sm"
            >
              {copiedLink ? (
                <>
                  <Check size={18} />
                  <span>Referral Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span>Share Invite Link with Friends</span>
                </>
              )}
            </button>
          </div>

          {/* Invitation Process Flow Card */}
          <div
            className={`p-5 rounded-3xl backdrop-blur-md shadow-md border ${
              isLight
                ? "bg-white/95 border-amber-200/80"
                : "bg-[#04102e]/85 border-[#f5ba31]/30"
            }`}
          >
            <div className="text-center font-extrabold text-xs text-[#f5ba31] uppercase tracking-wider mb-4">
              How Invitation Works
            </div>

            <div className="grid grid-cols-3 gap-2 text-center items-start">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs mb-2">
                  <LinkIcon size={20} />
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  1. Share Link
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Send to friends
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-xs mb-2">
                  <Check size={20} className="stroke-[3]" />
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  2. Register
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Friend joins
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-xs mb-2">
                  <Award size={20} />
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  3. Earn Daily
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Automatic bonus
                </span>
              </div>
            </div>
          </div>

          {/* Invitation Reward Details */}
          <div
            className={`p-5 rounded-3xl backdrop-blur-md shadow-md border space-y-3.5 ${
              isLight
                ? "bg-white/95 border-amber-200/80 text-slate-700"
                : "bg-[#04102e]/85 border-[#f5ba31]/30 text-slate-300"
            }`}
          >
            <div className="font-extrabold text-xs text-[#f5ba31] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200/60 dark:border-white/10">
              <Gift size={15} />
              <span>Commission Rewards & Guidelines</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed font-medium">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Share your unique invite link or QR code on Facebook, Telegram, WhatsApp, or WhatsApp groups.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Every new registered friend immediately gets a <strong className={isLight ? "text-amber-700 font-bold" : "text-amber-300 font-bold"}>500 BDT free welcome deposit</strong> to start earning.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>3-Level Perpetual Commission:</strong> When your referrals recharge, you earn{" "}
                  <strong className={isLight ? "text-emerald-700 font-bold" : "text-emerald-400 font-bold"}>10% for Level 1</strong> (direct friends),{" "}
                  <strong className={isLight ? "text-blue-700 font-bold" : "text-blue-400 font-bold"}>5% for Level 2</strong>, and{" "}
                  <strong className={isLight ? "text-purple-700 font-bold" : "text-purple-400 font-bold"}>3% for Level 3</strong> credited directly to your balance.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f5ba31] text-[#020a1f] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  Milestone bonus: Invite 10 active friends to receive an additional special milestone bonus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
