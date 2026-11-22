import React from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Volume2 } from "lucide-react";

export default function NoticePage() {
  const rules = [
    "1. Our manager will never send you any messages. If someone sends you a message, please block them.",
    "2. Do not share your personal information with anyone.",
    "3. Do not send money to anyone outside of the website.",
    "4. Keep your account number and password secure.",
    "5. For any assistance, please contact Customer Service.",
    "6. Withdrawal hours are Sunday to Thursday, from 9:00 AM to 5:00 PM (17:00).",
    "7. Deposits can be made at any time.",
    "8. The Telegram group is open from 9:00 AM to 10:00 PM.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Notice" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Volume2 size={32} />
            </div>
            <h2 className="text-xl font-black text-blue-950 mt-2 tracking-tight">
              Notice
            </h2>
          </div>

          {/* Rules Card */}
          <div className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 divide-y divide-blue-50 text-xs text-gray-800 font-semibold leading-relaxed space-y-3">
            {rules.map((rule, idx) => (
              <div key={idx} className="pt-3 first:pt-0">
                {rule}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

