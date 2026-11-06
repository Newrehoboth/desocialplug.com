import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';

/**
 * Admin endpoint to manually credit or fix user wallet balance
 */

export async function POST(req: Request) {
  try {
    const superAdminKey = req.headers.get('x-super-admin-key');
    const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_superadmin_2025_secret_key_change_this";
    if (!superAdminKey || superAdminKey !== masterSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { userId, email, username, amount, newBalance } = body;

    await connectDB();

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: String(email).toLowerCase().trim() });
    } else if (username) {
      user = await User.findOne({ username: String(username).trim() });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found. Provide valid userId, email, or username.' }, { status: 404 });
    }

    const oldBalance = user.walletBalance || 0;
    let targetAmount = 0;

    if (typeof newBalance === 'number') {
      user.walletBalance = Number(newBalance.toFixed(2));
      targetAmount = newBalance - oldBalance;
    } else if (typeof amount === 'number' && amount > 0) {
      user.walletBalance = Number((oldBalance + amount).toFixed(2));
      targetAmount = amount;
    } else {
      return NextResponse.json({ error: 'Provide a valid positive `amount` to add or `newBalance`' }, { status: 400 });
    }

    await user.save();

    // Log transaction and notification if crediting funds
    if (targetAmount > 0) {
      const ref = `ADMIN_CREDIT_${Date.now()}`;
      await Transaction.create({
        userUUID: user._id.toString(),
        type: 'deposit',
        amount: targetAmount,
        status: 'successful',
        reference: ref,
        description: `Wallet funded by Admin (Ref: ${ref})`
      });

      await Notification.create({
        userUUID: user._id.toString(),
        type: 'payment',
        title: 'Wallet Funded',
        message: `Your wallet was credited with ₦${targetAmount.toLocaleString()} by Admin`,
        read: false,
        source: 'notifications'
      });
    }

    console.log(`✅ Balance corrected for ${user.email} (${user.username}): Old ₦${oldBalance} → New ₦${user.walletBalance}`);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          oldBalance,
          newBalance: user.walletBalance,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error fixing balance:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
