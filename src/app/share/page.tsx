"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Share2, Link as LinkIcon, Check, Shield } from "lucide-react";

export default function SharePage() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.referralCode) {
          setReferralCode(data.user.referralCode);
        }
      })
      .catch(() => {});
  }, []);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${referralCode}`
      : `https://zexocapital.com/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] pb-4 flex flex-col justify-between">
      <div>
        <Header title="Invitation rules" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Large Shield with Share Icon */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-blue-700 p-1 flex items-center justify-center shadow-xl border-2 border-white">
              <Share2 size={44} className="text-white drop-shadow" />
            </div>
            <h2 className="text-xl font-black text-blue-950 mt-3 tracking-tight">
              Invitation rules
            </h2>
          </div>

          {/* Invitation Process Flow Card */}
          <div className="p-5 rounded-3xl bg-white shadow-md border border-blue-200">
            <div className="text-center font-bold text-xs text-blue-900 uppercase tracking-wider mb-4">
              invitation process
            </div>

            <div className="grid grid-cols-3 gap-2 text-center items-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md mb-1.5">
                  <LinkIcon size={22} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 leading-tight">
                  Share the link with your friends
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md mb-1.5">
                  <Check size={22} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 leading-tight">
                  registration success
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md mb-1.5">
                  <Share2 size={22} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 leading-tight">
                  earn rewards
                </span>
              </div>
            </div>

            {/* Click to copy link button */}
            <button
              onClick={handleCopyLink}
              className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Referral link copied!</span>
                </>
              ) : (
                <span>Click to copy the link to invite friends</span>
              )}
            </button>
          </div>

          {/* Invitation Reward Details */}
          <div className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-3">
            <div className="font-extrabold text-xs text-blue-900 tracking-wide">
              Invitation Reward Details &gt;&gt;
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed font-semibold">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>Copy the invite link and share it on social media.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Share with friends and get a 10% deposit bonus—valid for the
                  first time only.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Earnings commission Level 1-10%, Level 2-5%, Level 3-3%.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  4
                </span>
                <p>Get a 300 Taka bonus for referring 10 friends.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

