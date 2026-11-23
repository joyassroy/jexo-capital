import mongoose, { Schema, Model, models } from "mongoose";
import { INotification } from "@/types";

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "wallet_rejected",
        "wallet_approved",
        "withdrawal_rejected",
        "deposit_rejected",
        "system",
      ],
      default: "system",
    },
    actionUrl: {
      type: String,
    },
    actionText: {
      type: String,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> =
  models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
