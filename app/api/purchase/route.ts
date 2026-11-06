import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import Purchase from '@/models/Purchase';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import SystemSettings from '@/models/SystemSettings';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function POST(req: Request) {
  try {
    const { accountId, quantity } = await req.json();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check Global Log Purchasing Key Switch
    const systemSettings = await SystemSettings.findOne();
    if (systemSettings && systemSettings.globalPurchasingEnabled === false) {
      return NextResponse.json(
        { error: 'Transaction failed. Please try again in a few minutes or contact the administrator.' },
        { status: 400 }
      );
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.userId as any;

    // Check Per-User Log Purchasing Key Switch
    if (user.canBuyLogs === false) {
      return NextResponse.json(
        { error: 'Transaction failed. Please try again in a few minutes or contact the administrator.' },
        { status: 400 }
      );
    }

    const userId = user._id.toString();

    const account = await Account.findById(accountId).select(
      '+bulkLogs +vpnType +description +subcategory +type +tutorialVideoUrl',
    );

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.status !== 'Available' && account.status !== 'Sold Out') {
      return NextResponse.json(
        { error: 'Account is not available' },
        { status: 400 },
      );
    }

    if (!account.bulkLogs || account.bulkLogs.length < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 },
      );
    }

    const totalCost = account.price * quantity;
    if (user.walletBalance < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 },
      );
    }

    const purchasedCredentials = account.bulkLogs.slice(0, quantity);
    const remainingBulkLogs = account.bulkLogs.slice(quantity);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { walletBalance: -totalCost, purchasedAccounts: quantity },
      },
      { new: true },
    );

    await Account.findByIdAndUpdate(accountId, {
      logs: remainingBulkLogs.length,
      bulkLogs: remainingBulkLogs,
      ...(remainingBulkLogs.length === 0 && { status: 'Sold Out' }),
    });

    const accountObj = account.toObject() as any;
    const typeValue = accountObj.vpnType || accountObj.description || accountObj.type || '';

    const purchase = await Purchase.create({
      userUUID: userId,
      quantity,
      platform: account.platform,
      totalAmount: totalCost,
      status: 'completed',
      credentials: purchasedCredentials,
      accountId: accountId,
      subcategory: account.subcategory || '',
      type: typeValue,
      followers: account.followers || 0,
      tutorialVideoUrl: account.tutorialVideoUrl || '',
    });

    await Transaction.create({
      userUUID: userId,
      type: 'purchase',
      amount: totalCost,
      status: 'successful',
      description: `Purchased ${quantity} ${account.platform} account(s)`,
      reference: purchase._id.toString(),
    });

    return NextResponse.json({
      success: true,
      purchase: {
        ...purchase.toObject(),
        credentials: purchasedCredentials,
      },
      newBalance: updatedUser?.walletBalance,
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
