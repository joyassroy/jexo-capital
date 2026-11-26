import React from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { HelpCircle } from "lucide-react";

export default function FaqPage() {
  const faqs = [
    {
      q: "1. How do I register for a Jexo Capital account?",
      a: "Register by providing your nickname, mobile phone number, and a secure password.",
    },
    {
      q: "2. How do I recharge?",
      a: "You can recharge using bKash, Nagad, or cryptocurrency (USDT BEP-20) from the Deposit screen.",
    },
    {
      q: "3. How do I purchase a package?",
      a: "Recharge your balance, navigate to the VIP Level page, and select your preferred package.",
    },
    {
      q: "4. How do I add a bank card?",
      a: "Go to 'My Bank' and add your wallet details—this could be bKash, Nagad, or a cryptocurrency USDT address.",
    },
    {
      q: "5. How do I withdraw?",
      a: "Go to 'Withdraw', select your wallet, enter the balance amount, provide your withdrawal password, and submit.",
    },
    {
      q: "6. What should I do if there is an issue with my account?",
      a: "You will find the floating 24/7 Customer Service icon on the screen; please use it to contact WhatsApp or Telegram support.",
    },
    {
      q: "7. How do I log in to another account?",
      a: "In the Personal Center, scroll to the bottom and click on 'Log Out', then log in with your other mobile credentials.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="FAQ" showBack={true} />

        <div className="p-4 space-y-3 max-w-[420px] mx-auto">
          {/* Header Icon */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ffe58f] via-[#f5ba31] to-[#d49002] text-[#020a1f] flex items-center justify-center shadow-[0_0_20px_rgba(245,186,49,0.4)] border-2 border-white/40">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-white mt-2 tracking-tight">
              FAQ
            </h2>
          </div>

          {/* FAQ Cards */}
          <div className="space-y-2.5">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-1.5"
              >
                <h3 className="text-xs font-bold text-[#f5ba31]">{item.q}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">Ans:</span> {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

