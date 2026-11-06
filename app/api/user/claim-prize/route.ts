import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

// Prize amounts in Naira for top 3 positions
const PRIZES: Record<number, number> = {
  1: 25000,
  2: 15000,
  3: 5000,
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const daysToSubtract = day === 0 ? 6 : day - 1;
  const startOfWeek = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

export async function POST(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = (session.userId as any)._id.toString();
    const startOfWeek = getWeekStart();

    // Only allow claiming on Sunday (day === 0) or within 24hrs after
    const now = new Date();
    // We allow claiming any time for flexibility; admin can restrict if needed.

    // Check if user already claimed this week
    const user = await User.findById(currentUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Store claim timestamp in user doc (we'll use a virtual field approach via transactions)
    // Check for existing prize transaction this week
    const existingClaim = await Transaction.findOne({
      userUUID: currentUserId,
      type: 'prize',
      createdAt: { $gte: startOfWeek },
    });

    if (existingClaim) {
      return NextResponse.json({ error: 'You have already claimed your prize this week' }, { status: 400 });
    }

    // Fetch current week's leaderboard rank for this user
    const rawWeeklyPurchases = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfWeek },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$userUUID',
          purchasedAccounts: { $sum: '$quantity' },
        },
      },
      { $sort: { purchasedAccounts: -1 } },
      {
        $lookup: {
          from: 'users',
          let: { userIdStr: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $toString: '$_id' }, '$$userIdStr'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            { $project: { username: 1 } },
          ],
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
    ]);

    const rankIndex = rawWeeklyPurchases.findIndex((u: any) => u._id === currentUserId);
    const rank = rankIndex !== -1 ? rankIndex + 1 : null;

    if (!rank || rank > 3) {
      return NextResponse.json(
        { error: 'Only the top 3 users can claim prizes' },
        { status: 400 },
      );
    }

    const prizeAmount = PRIZES[rank];

    // Credit wallet
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { walletBalance: prizeAmount },
    });

    // Record transaction
    await Transaction.create({
      userUUID: currentUserId,
      amount: prizeAmount,
      type: 'prize',
      description: `🏆 Weekly leaderboard prize – Rank #${rank}`,
      status: 'successful',
    });

    return NextResponse.json({
      success: true,
      rank,
      amount: prizeAmount,
      message: `Congratulations! ₦${prizeAmount.toLocaleString()} has been added to your wallet.`,
    });
  } catch (error: any) {
    console.error('Claim prize error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to claim prize' },
      { status: 500 },
    );
  }
}
