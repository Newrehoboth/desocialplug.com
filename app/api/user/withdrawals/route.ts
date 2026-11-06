import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WithdrawRequest from '@/models/WithdrawRequest';
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

    const userId = session.userId._id.toString();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true,
    };

    const query = { userId };

    const result = await WithdrawRequest.paginate(query, options);

    return NextResponse.json({
      success: true,
      requests: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
      },
    });
  } catch (error: any) {
    console.error('Withdrawals fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { amount, bank, accountNumber, accountName } = await req.json();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.userId._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 1000) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is ₦1,000' },
        { status: 400 },
      );
    }

    if (user.referralBalance < withdrawAmount) {
      return NextResponse.json(
        { error: 'Insufficient referral balance' },
        { status: 400 },
      );
    }

    user.referralBalance = Number(
      (user.referralBalance - withdrawAmount).toFixed(2),
    );
    await user.save();

    const request = await WithdrawRequest.create({
      userId: user._id,
      email: user.email,
      amount: withdrawAmount,
      bank,
      accountNumber,
      accountName,
      status: 'pending',
      referralBalanceAtRequest: user.referralBalance + withdrawAmount,
    });

    return NextResponse.json({
      success: true,
      request,
      newReferralBalance: user.referralBalance,
    });
  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 },
    );
  }
}
