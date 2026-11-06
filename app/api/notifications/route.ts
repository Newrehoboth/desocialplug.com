import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import Account from '@/models/Account';
import Purchase from '@/models/Purchase';
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

    const user = await User.findById(userId).select('createdAt').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userCreatedAt = new Date(user.createdAt);

    const LIMIT = 20;

    const notificationsPromise = Notification.find({
      $or: [
        { userUUID: userId },
        {
          userUUID: null,
          createdAt: { $gte: userCreatedAt },
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .lean();

    const uploadsPromise = Account.find({
      createdAt: { $gte: userCreatedAt },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const purchasesPromise = Purchase.find({ userUUID: userId })
      .sort({ purchaseDate: -1 })
      .limit(10)
      .lean();

    const [notifs, uploads, purchases] = await Promise.all([
      notificationsPromise,
      uploadsPromise,
      purchasesPromise,
    ]);

    const formattedNotifs = notifs.map((n: any) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt,
      read: n.read || false,
      source: 'notifications',
    }));

    const formattedUploads = uploads.map((u: any) => ({
      id: u._id.toString(),
      type: 'new_account',
      title: 'New Account Available',
      message: `${u.platform} account with ${u.followers?.toLocaleString() || '—'}+ followers is now available`,
      timestamp: u.createdAt,
      read: true,
      source: 'uploads',
    }));

    const formattedPurchases = purchases.map((p: any) => ({
      id: p._id.toString(),
      type: 'purchase',
      title: 'Purchase Successful',
      message: `You purchased ${p.quantity} ${p.platform} account(s) for ₦${(p.totalAmount || 0).toLocaleString()}`,
      timestamp: p.purchaseDate,
      read: true,
      source: 'purchases',
    }));

    const allNotifications = [
      ...formattedNotifs,
      ...formattedUploads,
      ...formattedPurchases,
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return NextResponse.json({
      success: true,
      notifications: allNotifications.slice(0, LIMIT),
    });
  } catch (error: any) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
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

    const result = await Notification.updateMany(
      { userUUID: userId, read: false },
      { $set: { read: true } },
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount ?? 0,
    });
  } catch (error: any) {
    console.error('Notifications mark-all-read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 },
    );
  }
}
