export interface IUser {
  _id?: string;
  phone: string;
  nickname: string;
  passwordHash: string;
  withdrawPasswordHash?: string;
  avatarUrl?: string;
  balance: number;
  totalFund: number;
  fundIncome: number;
  yesterdayEarnings: number;
  todayEarnings: number;
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  status: "active" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  _id?: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "superadmin" | "admin" | "support";
  permissions: string[];
  createdAt: Date;
}

export interface IBankWallet {
  _id?: string;
  userId: string;
  realName: string;
  bankType: "bKash" | "Nagad" | "USDT-BEP20";
  accountNumber: string;
  usdtAddress?: string;
  createdAt: Date;
}

export interface IDeposit {
  _id?: string;
  userId: string;
  userPhone?: string;
  userNickname?: string;
  method: "bKash" | "Nagad" | "USDT-BEP20";
  amount: number;
  amountBDT: number;
  amountUSDT: number;
  senderNumber: string;
  transferType?: "send_money" | "payment";
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface IWithdrawal {
  _id?: string;
  userId: string;
  userPhone?: string;
  userNickname?: string;
  method: "bKash" | "Nagad" | "USDT-BEP20";
  amount: number;
  amountUSDT?: number;
  amountBDT?: number;
  feePercentage: number;
  charge: number;
  arrivalAmount: number;
  arrivalAmountBDT?: number;
  targetAccount: string;
  targetName?: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface ITransaction {
  _id?: string;
  userId: string;
  type:
    | "daily_return"
    | "refer_commission"
    | "team_return"
    | "invest_return"
    | "vip_purchase"
    | "gift_received"
    | "recharge"
    | "withdraw"
    | "bonus";
  title: string;
  amount: number;
  status: "success" | "pending" | "failed";
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IKyc {
  _id?: string;
  userId: string;
  realName: string;
  age: number;
  gender: string;
  nidNumber: string;
  frontPictureUrl: string;
  backPictureUrl: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface IGiftCode {
  _id?: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  usedByUsers: string[];
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ISetting {
  _id?: string;
  key: string;
  // Financial Gateways
  bkashNumber: string;
  bkashType: "personal" | "merchant";
  nagadNumber: string;
  nagadType: "personal" | "merchant";
  usdtBep20Address: string;
  usdtRateBDT: number;
  // Social Links
  whatsappNumber: string;
  whatsappUrl: string;
  telegramGroupUrl: string;
  telegramChannelUrl: string;
  // Announcment / Notice
  homeTickerText: string;
  noticeItems: string[];
  // Withdrawal Rules
  minWithdrawBDT: number;
  minWithdrawUSDT: number;
  withdrawFeePercent: number;
  withdrawStartTime: string; // e.g. "09:00"
  withdrawEndTime: string; // e.g. "17:00"
  withdrawAllowedDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu
}

