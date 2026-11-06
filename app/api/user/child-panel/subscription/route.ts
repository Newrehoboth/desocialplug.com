import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChildPanel from "@/models/ChildPanel";
import Transaction from "@/models/Transaction";
import { getSession, getTokenFromRequest } from "@/lib/auth-mongo";

export async function PATCH(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { autoRenew } = await req.json();
    const userId = (session.userId as any)._id;

    const panel = await ChildPanel.findOneAndUpdate(
      { userId },
      { autoRenew },
      { new: true }
    );

    if (!panel) return NextResponse.json({ error: "No panel found" }, { status: 404 });

    return NextResponse.json({ success: true, autoRenew: panel.autoRenew });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.userId as any;
    const userId = user._id;

    // 1. Get the user's panel
    const panel = await ChildPanel.findOne({ userId });
    if (!panel) return NextResponse.json({ error: "No panel found" }, { status: 404 });

    const renewalPrice = panel.subscriptionPrice || 14287;

    // 2. Check balance
    if (user.walletBalance < renewalPrice) {
      return NextResponse.json({ error: "Insufficient balance for renewal" }, { status: 400 });
    }

    // 3. Deduct balance and update panel
    await User.findByIdAndUpdate(userId, { $inc: { walletBalance: -renewalPrice } });
    
    const newExpiry = new Date((panel.expiresAt || new Date()).getTime() + 30 * 24 * 60 * 60 * 1000);
    panel.expiresAt = newExpiry;
    panel.status = 'active';
    await panel.save();

    // 4. Record history
    const SubscriptionHistory = (await import('@/models/SubscriptionHistory')).default;
    await SubscriptionHistory.create({
      panelId: panel._id,
      userId: userId,
      amount: renewalPrice,
      periodStart: new Date(),
      periodEnd: newExpiry,
      status: 'success',
    });

    // 5. Record Transaction
    await Transaction.create({
      userUUID: userId.toString(),
      type: 'purchase',
      amount: renewalPrice,
      status: 'successful',
      description: `Manual Renewal for ${panel.domain}`,
      reference: panel._id.toString(),
    });

    return NextResponse.json({ success: true, expiresAt: newExpiry });
  } catch (error: any) {
    console.error("Renewal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
