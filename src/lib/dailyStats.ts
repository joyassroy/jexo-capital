/**
 * Daily Stats & Orders Management for Midnight (12:00 AM Asia/Dhaka) Reset
 */

export function getTodayDateStringDhaka(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function getYesterdayDateStringDhaka(): string {
  try {
    // 24 hours prior to current time
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(yesterday);
  } catch {
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }
}

/**
 * Checks if user's daily order counts and earnings need to be reset
 * based on Bangladesh (Asia/Dhaka) midnight rollover (12:00 AM).
 * 
 * If a new day has arrived:
 * - todayOrdersCount is reset to 0
 * - todayCommission is reset to 0
 * - todayEarnings is transferred to yesterdayEarnings (if consecutive)
 * - todayEarnings is reset to 0
 * - lastOrderDate is updated to today's date
 * - User document is immediately persisted in MongoDB
 */
export async function syncDailyOrdersAndEarnings(user: any): Promise<boolean> {
  if (!user) return false;

  const todayStr = getTodayDateStringDhaka();
  const yesterdayStr = getYesterdayDateStringDhaka();

  let modified = false;

  // Initialize fields if undefined or null
  if (typeof user.todayOrdersCount !== "number" || isNaN(user.todayOrdersCount)) {
    user.todayOrdersCount = 0;
    modified = true;
  }
  if (typeof user.todayCommission !== "number" || isNaN(user.todayCommission)) {
    user.todayCommission = 0;
    modified = true;
  }
  if (typeof user.todayEarnings !== "number" || isNaN(user.todayEarnings)) {
    user.todayEarnings = 0;
    modified = true;
  }
  if (typeof user.yesterdayEarnings !== "number" || isNaN(user.yesterdayEarnings)) {
    user.yesterdayEarnings = 0;
    modified = true;
  }

  // Check if date changed (midnight reset)
  if (user.lastOrderDate !== todayStr) {
    if (user.lastOrderDate === yesterdayStr) {
      user.yesterdayEarnings = user.todayEarnings || 0;
    } else if (user.lastOrderDate) {
      user.yesterdayEarnings = 0;
    }

    user.todayEarnings = 0;
    user.todayCommission = 0;
    user.todayOrdersCount = 0;
    user.lastOrderDate = todayStr;
    modified = true;
  }

  if (modified) {
    await user.save();
    return true;
  }

  return false;
}
