import { GatewayAccount } from "@/types";

/**
 * Returns today's date string (YYYY-MM-DD) in Asia/Dhaka timezone (UTC+6).
 */
export function getTodayBDDate(): string {
  const now = new Date();
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return bdTime.toISOString().slice(0, 10);
}

/**
 * Ensures gateway accounts array is initialized from legacy single number if empty,
 * and automatically resets `usedTodayBDT` to 0 when a new day starts in Bangladesh.
 */
export function normalizeGatewayAccounts(
  accounts: GatewayAccount[] | undefined,
  fallbackNumber: string,
  fallbackType: "personal" | "merchant" = "personal"
): { accounts: GatewayAccount[]; changed: boolean } {
  const today = getTodayBDDate();
  let changed = false;

  if (!accounts || accounts.length === 0) {
    const num = (fallbackNumber || "").trim();
    if (!num) {
      return { accounts: [], changed: false };
    }
    return {
      accounts: [
        {
          number: num,
          type: fallbackType,
          dailyLimitBDT: 25000,
          usedTodayBDT: 0,
          lastResetDate: today,
          isActive: true,
        },
      ],
      changed: true,
    };
  }

  const normalized = accounts.map((acc) => {
    const plain: GatewayAccount = {
      number: (acc.number || "").trim(),
      type: acc.type === "merchant" ? "merchant" : "personal",
      dailyLimitBDT: Number(acc.dailyLimitBDT ?? 25000),
      usedTodayBDT: Number(acc.usedTodayBDT ?? 0),
      lastResetDate: acc.lastResetDate || today,
      isActive: acc.isActive !== false,
    };

    if (plain.lastResetDate !== today) {
      plain.usedTodayBDT = 0;
      plain.lastResetDate = today;
      changed = true;
    }

    return plain;
  });

  return { accounts: normalized, changed };
}

/**
 * Picks the next available gateway account using round-robin rotation,
 * automatically skipping inactive accounts or accounts that reached their daily limit.
 */
export function selectNextGatewayAccount(
  accounts: GatewayAccount[],
  rotationIndex: number = 0
): {
  selected: GatewayAccount | null;
  availableAccounts: GatewayAccount[];
  nextRotationIndex: number;
} {
  const active = accounts.filter((a) => a.isActive && a.number.trim() !== "");
  if (active.length === 0) {
    return { selected: null, availableAccounts: [], nextRotationIndex: 0 };
  }

  // Prefer accounts that have not yet hit their daily limit
  const underLimit = active.filter(
    (a) => a.dailyLimitBDT <= 0 || a.usedTodayBDT < a.dailyLimitBDT
  );

  const pool =
    underLimit.length > 0
      ? underLimit
      : [...active].sort((a, b) => a.usedTodayBDT - b.usedTodayBDT);

  const safeIdx = Math.abs(rotationIndex) % pool.length;
  const selected = pool[safeIdx];
  const nextRotationIndex = (safeIdx + 1) % pool.length;

  return {
    selected,
    availableAccounts: pool,
    nextRotationIndex,
  };
}
