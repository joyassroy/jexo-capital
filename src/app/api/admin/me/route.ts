import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminPayload = await getCurrentAdmin();
    if (!adminPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const admin = await Admin.findById(adminPayload.adminId).select("-passwordHash");
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error: unknown) {
    console.error("Admin Me Error:", error);
    const message = error instanceof Error ? error.message : "Failed to load admin.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
