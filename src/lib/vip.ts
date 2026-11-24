import { connectDB } from "@/lib/mongodb";
import { VipTier } from "@/models/VipTier";
import { Setting } from "@/models/Setting";
import { IVipTier } from "@/types";

export const DEFAULT_VIP_TIERS = [
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
 * Evaluates the qualifying VIP level based on user balance in USDT
 * Converted using current USDT rate (e.g. 1 USDT = 127 BDT)
 */
export function calculateVipLevelForBalance(
  balanceUSDT: number,
  usdtRate: number = 127,
  tiers: IVipTier[] = []
): number {
  if (balanceUSDT <= 0) return 0;
  const balanceBDT = balanceUSDT * usdtRate;

  // Sort descending by level (highest tier first: VIP-4, VIP-3, VIP-2, VIP-1)
  const sorted = [...tiers].sort((a, b) => b.level - a.level);

  for (const tier of sorted) {
    if (balanceBDT >= tier.minBDT) {
      return tier.level;
    }
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
      await userDoc.save();
    }

    return targetVip;
  } catch (err) {
    console.error("Error syncing user VIP with balance:", err);
    return userDoc.vipLevel ?? 0;
  }
}
