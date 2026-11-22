import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const USER_JWT_SECRET =
  process.env.USER_JWT_SECRET || "zexo_user_super_secret_jwt_key_2026_xyz";
const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || "zexo_admin_super_secret_jwt_key_2026_abc";

export const USER_COOKIE_NAME = "zexo_user_session";
export const ADMIN_COOKIE_NAME = "zexo_admin_session";

export interface UserTokenPayload {
  userId: string;
  phone: string;
  nickname: string;
  role: "user";
}

export interface AdminTokenPayload {
  adminId: string;
  username: string;
  role: "superadmin" | "admin" | "support";
  permissions: string[];
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// Generate unique referral code (e.g., 6 digits like 125675 or uppercase chars)
export function generateReferralCode(): string {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// User JWT functions
export function signUserToken(payload: UserTokenPayload, rememberMe = true): string {
  return jwt.sign(payload, USER_JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : "1d",
  });
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, USER_JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

// Admin JWT functions
export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

// Server Component / API helper to get current user from cookies
export async function getCurrentUser(): Promise<UserTokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

// Server Component / API helper to get current admin from cookies
export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// Request header token extractor (for Edge middleware / API routes)
export function getUserTokenFromRequest(req: NextRequest): UserTokenPayload | null {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export function getAdminTokenFromRequest(req: NextRequest): AdminTokenPayload | null {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

