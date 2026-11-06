import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ChildPanel from '@/models/ChildPanel';
import Transaction from '@/models/Transaction';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';
import bcrypt from 'bcryptjs';

const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

async function addDomainToVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('Vercel credentials not configured. Skipping domain provisioning.');
    return { success: true };
  }
  try {
    const res = await fetch(`https://api.vercel.com/v10/projects/prj_D4yIoSpvWjjjP8r28sOHRZoMuJNY/domains`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_exists') {
        return { success: true };
      }
      return { success: false, error: data.error?.message || 'Vercel domain provisioning failed' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// GET — fetch the current user's existing child panel
export async function GET(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.userId as any;
    const userId = user._id.toString();

    const panel = await ChildPanel.findOne({ userId }).sort({ createdAt: -1 }).lean();

    if (!panel) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    // Fetch billing history for this panel
    const SubscriptionHistory = (await import('@/models/SubscriptionHistory')).default;
    let history = await SubscriptionHistory.find({ panelId: panel._id }).sort({ createdAt: -1 }).limit(10).lean();

    // BACKFILL: If no history exists for an existing panel, create the first record based on its creation date
    if (history.length === 0 && panel.status !== 'rejected') {
      const periodStart = new Date(panel.createdAt);
      const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      await SubscriptionHistory.create({
        panelId: panel._id,
        userId: userId,
        amount: panel.subscriptionPrice || 14287,
        periodStart,
        periodEnd,
        status: 'success',
        createdAt: periodStart // Match the original purchase time
      });
      
      // Refresh the history list after creating the backfill
      history = await SubscriptionHistory.find({ panelId: panel._id }).sort({ createdAt: -1 }).limit(10).lean();
    }

    return NextResponse.json({
      exists: true,
      domain: panel.domain,
      adminName: panel.adminName,
      status: panel.status,
      panelId: (panel as any)._id.toString(),
      createdAt: (panel as any).createdAt,
      expires_at: (panel as any).expiresAt || new Date(new Date((panel as any).createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
      auto_renew: (panel as any).autoRenew,
      subscription_price: (panel as any).subscriptionPrice || 14287,
      history: history || []
    }, { status: 200 });
  } catch (error) {
    console.error('Child Panel GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — purchase a new child panel
export async function POST(req: Request) {
  try {
    const { domain, adminName, adminPassword } = await req.json();
    const token = await getTokenFromRequest(req);

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.userId as any;
    const userId = user._id.toString();

    if (!domain || !adminName || !adminPassword) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // Check if user already has a panel — allow resubmission if rejected
    const existingUserPanel = await ChildPanel.findOne({ userId });
    if (existingUserPanel) {
      if (existingUserPanel.status === 'rejected') {
        // Delete the old rejected panel so they can start fresh
        await ChildPanel.findByIdAndDelete(existingUserPanel._id);
      } else {
        return NextResponse.json({ error: 'You already have a child panel registered.' }, { status: 400 });
      }
    }

    // Normalize domain
    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase().trim();

    if (!cleanDomain.includes('.') || cleanDomain.split('.').filter(Boolean).length < 2) {
      return NextResponse.json({ error: 'Please enter a valid domain name containing a dot (e.g. domain.com)' }, { status: 400 });
    }

    // Check for unique domain
    const existingPanel = await ChildPanel.findOne({ domain: cleanDomain });
    if (existingPanel) {
      return NextResponse.json({ error: 'Domain is already registered' }, { status: 400 });
    }

    const priceInNaira = 14287;
    const priceInUsd = 10.99;

    if (user.walletBalance < priceInNaira) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ₦${priceInNaira.toLocaleString()} to purchase a child panel.` },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: -priceInNaira } },
      { new: true }
    );

    const childPanel = await ChildPanel.create({
      userId: user._id,
      domain: cleanDomain,
      adminName,
      adminPassword: adminPassword, // Store in plain text as requested for super admin visibility
      priceInUsd,
      priceInNaira,
      subscriptionPrice: priceInNaira,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: false,
      status: 'pending',
    });

    const SubscriptionHistory = (await import('@/models/SubscriptionHistory')).default;
    await SubscriptionHistory.create({
      panelId: childPanel._id,
      userId: user._id,
      amount: priceInNaira,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'success',
    });

    await Transaction.create({
      userUUID: userId,
      type: 'purchase',
      amount: priceInNaira,
      amountUSD: priceInUsd,
      status: 'successful',
      description: `Child Panel Subscription for ${cleanDomain}`,
      reference: childPanel._id.toString(),
    });

    // Automatically register the domain on Vercel
    const vercelResult = await addDomainToVercel(cleanDomain);
    if (!vercelResult.success) {
      console.warn(`Vercel domain provisioning failed for ${cleanDomain}: ${vercelResult.error}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Child panel request submitted successfully',
      domain: cleanDomain,
      adminName,
      status: 'pending',
      vercelProvisioned: vercelResult.success,
      newBalance: updatedUser?.walletBalance,
    });

  } catch (error: any) {
    console.error('Child Panel Submission Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
