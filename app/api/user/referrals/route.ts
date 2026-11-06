import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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

    const user = await User.findById(session.userId._id).select(
      'referralCode referralBalance referrals',
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralBalance: user.referralBalance,
        referrals: user.referrals || [],
      },
    });
  } catch (error: any) {
    console.error('Referrals fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 },
    );
  }
}
