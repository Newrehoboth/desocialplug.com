import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

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

    const { pushToken } = await req.json();

    if (!pushToken) {
      return NextResponse.json(
        { error: 'Push token is required' },
        { status: 400 }
      );
    }

    const userId = session.userId._id.toString();

    // Update user with push token
    await User.findByIdAndUpdate(userId, {
      expoPushToken: pushToken,
    });

    return NextResponse.json({
      success: true,
      message: 'Push token registered successfully',
    });
  } catch (error: any) {
    console.error('Register push token error:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}
