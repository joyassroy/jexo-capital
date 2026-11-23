import mongoose, { Schema, Model, models } from "mongoose";
import { ITransaction } from "@/types";

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "daily_return",
        "refer_commission",
        "team_return",
        "invest_return",
        "vip_purchase",
        "gift_received",
        "recharge",
        "withdraw",
        "bonus",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction: Model<ITransaction> =
  models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

