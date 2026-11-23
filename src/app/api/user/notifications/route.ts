import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const notifications = await Notification.find({
      userId: userPayload.userId,
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      userId: userPayload.userId,
      status: "unread",
    });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error: unknown) {
    console.error("Get Notifications Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch notifications.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany(
        { userId: userPayload.userId, status: "unread" },
        { status: "read" }
      );
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: userPayload.userId },
        { status: "read" }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Update Notification Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update notification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
