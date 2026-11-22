import React from "react";
import Image from "next/image";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Headphones, MessageCircle, Send, ExternalLink } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Support" showBack={true} />

        <div className="p-4 space-y-5 max-w-[380px] mx-auto">
          {/* Agent Avatar */}
          <div className="flex flex-col items-center text-center mt-3">
            <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] shadow-xl mb-3">
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                  alt="24/7 Support Agent"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow flex items-center gap-1 border border-blue-200">
                <Headphones size={12} /> 24/7 Support
              </div>
            </div>

            <h2 className="text-lg font-black text-blue-950 tracking-tight">
              Zexo Capital Customer Service
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              We are available 24/7 to assist you.
            </p>
          </div>

          {/* Channels List */}
          <div className="space-y-3">
            <a
              href="https://wa.me/8801728967166"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <MessageCircle size={24} />
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">
                  Customer Service (WhatsApp)
                </span>
              </div>
              <ExternalLink size={18} className="text-gray-400 group-hover:text-blue-500" />
            </a>

            <a
              href="https://t.me/zexocapital_group"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shadow-sm">
                  <Send size={22} className="translate-x-[-1px] translate-y-[1px]" />
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">
                  Zexo Capital Official Group
                </span>
              </div>
              <ExternalLink size={18} className="text-gray-400 group-hover:text-blue-500" />
            </a>

            <a
              href="https://t.me/zexocapital_channel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a2ff] text-white flex items-center justify-center shadow-sm">
                  <Send size={22} />
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">
                  Zexo Capital Official Channel
                </span>
              </div>
              <ExternalLink size={18} className="text-gray-400 group-hover:text-blue-500" />
            </a>
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

