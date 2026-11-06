import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function GET(req: Request) {
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

    // Calculate start of current week (Monday 00:00:00 local time)
    const now = new Date();
    const day = now.getDay();
    const daysToSubtract = day === 0 ? 6 : day - 1;
    const startOfWeek = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
    startOfWeek.setHours(0, 0, 0, 0);

    // Aggregate weekly purchases
    const rawWeeklyPurchases = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfWeek },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$userUUID',
          purchasedAccounts: { $sum: '$quantity' }
        }
      },
      {
        $sort: { purchasedAccounts: -1 }
      },
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
                    { $eq: ['$status', 'active'] }
                  ]
                }
              }
            },
            { $project: { username: 1 } }
          ],
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          username: '$userInfo.username',
          purchasedAccounts: 1
        }
      }
    ]);

    // Build leaderboard with rank (limit to top 20)
    const leaderboard = rawWeeklyPurchases.slice(0, 20).map((u: any, i: number) => ({
      rank: i + 1,
      userId: u.userId,
      username: u.username,
      purchasedAccounts: u.purchasedAccounts,
      isCurrentUser: u.userId === currentUserId,
    }));

    // Find current user's rank from the full weekly purchases list
    const fullRankIndex = rawWeeklyPurchases.findIndex((u: any) => u.userId === currentUserId);
    const currentUserRank: number | null = fullRankIndex !== -1 ? fullRankIndex + 1 : null;

    // Calculate user's lifetime weekly leaderboard stats
    const totalWins = await Transaction.countDocuments({
      userUUID: currentUserId,
      type: 'prize',
      status: 'successful'
    });

    const pastWeeklyPurchases = await Purchase.aggregate([
      {
        $match: {
          userUUID: currentUserId,
          status: 'completed',
          purchaseDate: { $lt: startOfWeek }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            week: { $week: '$purchaseDate' }
          }
        }
      }
    ]);

    const totalWeeksParticipated = pastWeeklyPurchases.length;
    const totalLosses = Math.max(0, totalWeeksParticipated - totalWins);

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserRank,
      currentUserId,
      stats: {
        totalWins,
        totalLosses,
      }
    });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
