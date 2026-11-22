"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Headphones, MessageCircle, Send, X, ExternalLink } from "lucide-react";

interface CustomerServiceProps {
  whatsappUrl?: string;
  telegramGroupUrl?: string;
  telegramChannelUrl?: string;
}

export default function CustomerServiceModal({
  whatsappUrl = "https://wa.me/8801728967166",
  telegramGroupUrl = "https://t.me/zexocapital_group",
  telegramChannelUrl = "https://t.me/zexocapital_channel",
}: CustomerServiceProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#00A3FF] to-[#0057FF] text-white shadow-[0_4px_16px_rgba(0,102,255,0.45)] border-2 border-white animate-floating hover:scale-105 transition-transform"
        aria-label="Customer Service"
      >
        <Headphones size={22} className="stroke-[2.5]" />
        <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5 leading-none">
          Customer
        </span>
        <span className="text-[8px] font-bold tracking-tighter uppercase leading-none">
          Service
        </span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-[360px] bg-gradient-to-b from-[#EDF6FF] via-[#F8FBFF] to-[#E3F2FE] rounded-3xl p-5 shadow-2xl border-2 border-blue-200">
            {/* Close Button top-right */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-blue-100/80 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header with Support Avatar */}
            <div className="flex flex-col items-center text-center mt-1 mb-4">
              <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] shadow-md mb-2">
                <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                    alt="24/7 Support Agent"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow flex items-center gap-1 border border-blue-200">
                  <Headphones size={10} /> 24/7 Support
                </div>
              </div>

              <h3 className="text-base font-bold text-gray-800 tracking-tight">
                Zexo Capital Customer Service
              </h3>
            </div>

            {/* Support Channels List */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <MessageCircle size={22} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                    Customer Service (WhatsApp)
                  </span>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
              </a>

              {/* Telegram Official Group */}
              <a
                href={telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-sm">
                    <Send size={20} className="translate-x-[-1px] translate-y-[1px]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                    Zexo Capital Official Group
                  </span>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
              </a>

              {/* Telegram Official Channel */}
              <a
                href={telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white flex items-center justify-center shadow-sm">
                    <Send size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                    Zexo Capital Official Channel
                  </span>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full py-2.5 rounded-full border border-blue-300 text-blue-700 bg-white font-semibold text-sm shadow-sm hover:bg-blue-50 active:scale-98 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

