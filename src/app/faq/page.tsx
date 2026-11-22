import React from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { HelpCircle } from "lucide-react";

export default function FaqPage() {
  const faqs = [
    {
      q: "1. How do I register for a Zexo Capital account?",
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
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="FAQ" showBack={true} />

        <div className="p-4 space-y-3 max-w-[420px] mx-auto">
          {/* Header Icon */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="w-16 h-16 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-blue-950 mt-2 tracking-tight">
              FAQ
            </h2>
          </div>

          {/* FAQ Cards */}
          <div className="space-y-2.5">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white shadow-sm border border-blue-100 space-y-1.5"
              >
                <h3 className="text-xs font-bold text-blue-950">{item.q}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-blue-700">Ans:</span> {item.a}
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

