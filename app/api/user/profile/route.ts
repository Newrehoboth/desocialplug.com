import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { username, profileImage } = body;
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build update object – only include fields that were sent
    const updateFields: Record<string, any> = {};
    if (username !== undefined) {
      // Check username uniqueness
      const existing = await User.findOne({
        username,
        _id: { $ne: session.userId._id },
      });
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
      updateFields.username = username;
    }
    if (profileImage !== undefined) {
      updateFields.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId._id,
      updateFields,
      { new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 },
    );
  }
}
