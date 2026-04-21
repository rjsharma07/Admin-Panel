"use server";

import dbConnect from "@/lib/mongodb";
import UserScratchCard from "@/models/UserScratchCard";

/**
 * saveScratchCardAction
 * Called after a user reveals their scratch card reward.
 * Saves the userId, amount, and timestamp into the UserScratchCards collection.
 */
export async function saveScratchCardAction(data: {
  userId: string;
  amount: number;
}) {
  try {
    const { userId, amount } = data;

    // 1. Validate inputs
    if (!userId) return { success: false, error: "Missing User ID." };
    if (!amount || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid reward amount." };
    }

    // 2. Save to UserScratchCards collection
    await dbConnect();

    const record = await UserScratchCard.create({
      userId,
      amount,
      createdAt: new Date(),
    });

    console.log(`✅ UserScratchCard saved — ID: ${record._id} | User: ${userId} | Amount: $${amount}`);

    return {
      success: true,
      scratchCardId: record._id.toString(),
      amount,
    };
  } catch (error: any) {
    console.error("saveScratchCardAction error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
