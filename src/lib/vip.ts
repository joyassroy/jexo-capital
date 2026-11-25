import { connectDB } from "@/lib/mongodb";
import { VipTier } from "@/models/VipTier";
import { Setting } from "@/models/Setting";
import { User } from "@/models/User";
import { IVipTier } from "@/types";

export const DEFAULT_VIP_TIERS = [
  {
    level: 0,
    name: "Vip-0",
    dailyReturn: "2.50%",
    dailyReturnPercent: 2.5,
    numberOfOrders: 5,
    commissionPerOrder: "0.5%",
    commissionPerOrderPercent: 0.5,
    minBDT: 0,
    maxBDT: 999,
    minUSDT: 0,
    maxUSDT: 7.86,
    status: "active",
    order: 0,
  },
  {
    level: 1,
    name: "Vip-1",
    dailyReturn: "5.00%",
    dailyReturnPercent: 5.0,
    numberOfOrders: 5,
    commissionPerOrder: "0.5%",
    commissionPerOrderPercent: 0.5,
    minBDT: 1000,
    maxBDT: 2999,
    minUSDT: 7.87,
    maxUSDT: 23.61,
    status: "active",
    order: 1,
  },
  {
    level: 2,
    name: "Vip-2",
    dailyReturn: "6.00%",
    dailyReturnPercent: 6.0,
    numberOfOrders: 5,
    commissionPerOrder: "0.6%",
    commissionPerOrderPercent: 0.6,
    minBDT: 3000,
    maxBDT: 9999,
    minUSDT: 23.62,
    maxUSDT: 78.73,
    status: "active",
    order: 2,
  },
  {
    level: 3,
    name: "Vip-3",
    dailyReturn: "7.00%",
    dailyReturnPercent: 7.0,
    numberOfOrders: 5,
    commissionPerOrder: "0.7%",
    commissionPerOrderPercent: 0.7,
    minBDT: 10000,
    maxBDT: 49999,
    minUSDT: 78.74,
    maxUSDT: 393.69,
    status: "active",
    order: 3,
  },
  {
    level: 4,
    name: "Vip-4",
    dailyReturn: "8.00%",
    dailyReturnPercent: 8.0,
    numberOfOrders: 5,
    commissionPerOrder: "0.8%",
    commissionPerOrderPercent: 0.8,
    minBDT: 50000,
    maxBDT: 99999,
    minUSDT: 393.70,
    maxUSDT: 787.39,
    status: "active",
    order: 4,
  },
];

export async function seedVipTiersIfEmpty() {
  await connectDB();
  const count = await VipTier.countDocuments();
  if (count === 0) {
    await VipTier.insertMany(DEFAULT_VIP_TIERS);
    return;
  }

  // 1. Auto-healing: detect and fix accidental VIP 10 that was intended as VIP 0
  try {
    const accidentalTen = await VipTier.findOne({
      level: 10,
      $or: [
        { minBDT: { $lte: 999 } },
        { name: { $regex: /vip\s*0/i } },
        { name: { $regex: /vip-0/i } },
        { name: { $regex: /vip 0/i } },
        { name: "0" },
      ],
    });

    const existingZero = await VipTier.findOne({ level: 0 });

    if (accidentalTen) {
      if (!existingZero) {
        accidentalTen.level = 0;
        accidentalTen.name = "Vip-0";
        accidentalTen.minBDT = 0;
        accidentalTen.maxBDT = accidentalTen.maxBDT > 0 && accidentalTen.maxBDT <= 2000 ? accidentalTen.maxBDT : 999;
        accidentalTen.order = 0;
        await accidentalTen.save();
      } else {
        await VipTier.deleteOne({ _id: accidentalTen._id });
      }
    } else if (!existingZero) {
      await VipTier.create(DEFAULT_VIP_TIERS[0]);
    }
  } catch (healErr) {
    console.error("Error auto-healing VIP 0 tier:", healErr);
  }

  // 2. Auto-heal any user stuck with vipLevel: 10 who has low balance (< 50 USDT / ~6350 Tk)
  try {
    const settings = await Setting.findOne().lean();
    const usdtRate = settings?.usdtRateBDT || 127;
    const glitchedUsers = await User.find({ vipLevel: 10, balance: { $lt: 50 } });
    if (glitchedUsers.length > 0) {
      const allActive = await VipTier.find({ status: "active" }).lean();
      for (const u of glitchedUsers) {
        const correctVip = calculateVipLevelForBalance(u.balance || 0, usdtRate, allActive as unknown as IVipTier[]);
        u.vipLevel = correctVip;
        await u.save();
      }
    }
  } catch (userErr) {
    console.error("Error auto-fixing glitched VIP 10 users:", userErr);
  }
}

export async function getActiveVipTiers(): Promise<IVipTier[]> {
  await connectDB();
  await seedVipTiersIfEmpty();
  const tiers = await VipTier.find({ status: "active" }).sort({ level: 1 }).lean();
  return tiers as unknown as IVipTier[];
}

export async function getAllVipTiersAdmin(): Promise<IVipTier[]> {
  await connectDB();
  await seedVipTiersIfEmpty();
  const tiers = await VipTier.find().sort({ level: 1 }).lean();
  return tiers as unknown as IVipTier[];
}

/**
 * Evaluates the qualifying VIP level strictly based on user balance in USDT.
 * Bracket-based matching against all active VIP tiers in database.
 */
export function calculateVipLevelForBalance(
  balanceUSDT: number,
  usdtRate: number = 127,
  tiers: IVipTier[] = []
): number {
  const balanceBDT = Math.round(((balanceUSDT || 0) * usdtRate) * 100) / 100;

  // Filter active tiers only
  const activeTiers = tiers.filter((t) => t.status !== "inactive");
  if (activeTiers.length === 0) return 0;

  // Sort descending by minBDT (highest minimum balance requirement first: VIP-4, VIP-3, VIP-2, VIP-1, VIP-0)
  const sortedByMinDesc = [...activeTiers].sort(
    (a, b) => (b.minBDT - a.minBDT) || (b.level - a.level)
  );

  // 1. Check exact bracket match [minBDT, maxBDT]
  const exactMatch = sortedByMinDesc.find((tier) => {
    const min = tier.minBDT ?? 0;
    const max = tier.maxBDT && tier.maxBDT > 0 ? tier.maxBDT : Infinity;
    return balanceBDT >= (min - 0.5) && balanceBDT <= (max + 0.5);
  });

  if (exactMatch) {
    return exactMatch.level;
  }

  // 2. If balanceBDT exceeds all defined maxBDTs, assign the tier with highest minBDT
  for (const tier of sortedByMinDesc) {
    if (balanceBDT >= (tier.minBDT ?? 0) - 0.5) {
      return tier.level;
    }
  }

  // 3. Fallback: tier with level 0 or minBDT 0
  const zeroTier = activeTiers.find((t) => t.level === 0 || t.minBDT === 0);
  if (zeroTier) {
    return zeroTier.level;
  }

  return 0;
}

/**
 * Synchronizes user's VIP level with their current account balance.
 * If user's balance falls into a tier range, user.vipLevel is automatically updated.
 */
export async function syncUserVipWithBalance(userDoc: any): Promise<number> {
  if (!userDoc) return 0;

  try {
    await connectDB();
    await seedVipTiersIfEmpty();

    const settings = await Setting.findOne().lean();
    const autoActiveEnabled = settings?.vipAutoActiveEnabled !== false; // default true
    if (!autoActiveEnabled) {
      return userDoc.vipLevel ?? 0;
    }

    const usdtRate = settings?.usdtRateBDT || 127;
    const activeTiers = await getActiveVipTiers();
    const targetVip = calculateVipLevelForBalance(userDoc.balance || 0, usdtRate, activeTiers);

    if (userDoc.vipLevel !== targetVip) {
      userDoc.vipLevel = targetVip;
      if (typeof userDoc.save === "function") {
        await userDoc.save();
      } else if (userDoc._id) {
        await User.findByIdAndUpdate(userDoc._id, { vipLevel: targetVip });
      }
    }

    return targetVip;
  } catch (err) {
    console.error("Error syncing user VIP with balance:", err);
    return userDoc.vipLevel ?? 0;
  }
}
