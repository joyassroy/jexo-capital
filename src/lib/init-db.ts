import { connectDB } from "./mongodb";
import { Setting } from "@/models/Setting";
import { Admin } from "@/models/Admin";
import { hashPassword } from "./auth";

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  try {
    await connectDB();

    // 1. Ensure default settings exist
    const existingSettings = await Setting.findOne({ key: "default_settings" });
    if (!existingSettings) {
      await Setting.create({
        key: "default_settings",
        bkashNumber: "01728967166",
        bkashType: "personal",
        nagadNumber: "01812345678",
        nagadType: "personal",
        usdtBep20Address: "TKrvSHzuR9CcvRwPGiDDb7kzPvCGU3jtyi",
        usdtRateBDT: 127,
        whatsappNumber: "+8801728967166",
        whatsappUrl: "https://wa.me/8801728967166",
        telegramGroupUrl: "https://t.me/jexocapital_group",
        telegramChannelUrl: "https://t.me/jexocapital_channel",
        homeTickerText: "Jexo Capital is a USA-based International Investment Platform.",
        noticeItems: [
          "1. Our manager will never send you any messages. If someone sends you a message, please block them.",
          "2. Do not share your personal information with anyone.",
          "3. Do not send money to anyone outside of the website.",
          "4. Keep your account number and password secure.",
          "5. For any assistance, please contact Customer Service.",
          "6. Withdrawal hours are Sunday to Thursday, from 9:00 AM to 5:00 PM (17:00).",
          "7. Deposits can be made at any time.",
          "8. The Telegram group is open from 9:00 AM to 10:00 PM.",
        ],
        minWithdrawBDT: 250,
        minWithdrawUSDT: 5,
        withdrawFeePercent: 15,
        withdrawStartTime: "10:00",
        withdrawEndTime: "18:00",
        withdrawAllowedDays: [0, 1, 2, 3, 4], // Sun, Mon, Tue, Wed, Thu
      });
      console.log("Default Jexo settings seeded.");
    }

    // 2. Ensure initial Admin account exists
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME || "admin";
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@jexocapital.com";
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "Admin@123456";

    const existingAdmin = await Admin.findOne({
      $or: [{ username: adminUsername }, { email: adminEmail }],
    });

    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPassword);
      await Admin.create({
        username: adminUsername,
        email: adminEmail,
        passwordHash,
        role: "superadmin",
        permissions: ["all", "deposits", "withdrawals", "users", "settings", "kyc"],
      });
      console.log(`Initial Admin seeded: ${adminUsername} / ${adminPassword}`);
    }

    isInitialized = true;
  } catch (error) {
    console.error("Error initializing DB:", error);
  }
}

