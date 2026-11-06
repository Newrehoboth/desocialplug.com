import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChildPanel from '@/models/ChildPanel';

export const dynamic = 'force-dynamic';

// CORS headers for child panel domains
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain')?.trim().toLowerCase();

    if (!domain) {
      return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400, headers: corsHeaders });
    }

    await connectDB();

    const panel = await ChildPanel.findOne({ domain });

    if (!panel) {
      return NextResponse.json({ exists: false, active: false }, { status: 200, headers: corsHeaders });
    }

    // On-the-fly expiry check
    const now = new Date();
    const expiresAt = panel.expiresAt || new Date(new Date((panel as any).createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (now > expiresAt && panel.status === 'active') {
      if (panel.autoRenew) {
        // Attempt Auto-Renewal
        const User = (await import('@/models/User')).default;
        const owner = await User.findById(panel.userId);
        const price = panel.subscriptionPrice || 14287;

        if (owner && owner.walletBalance >= price) {
          // Process payment
          owner.walletBalance -= price;
          await owner.save();

          // Extend panel
          panel.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          await panel.save();

          // Record History
          const SubscriptionHistory = (await import('@/models/SubscriptionHistory')).default;
          await SubscriptionHistory.create({
            panelId: panel._id,
            userId: panel.userId,
            amount: price,
            periodStart: now,
            periodEnd: panel.expiresAt,
            status: 'success',
          });
        } else {
          panel.status = 'expired';
          await panel.save();
        }
      } else {
        panel.status = 'expired';
        await panel.save();
      }
    }

    return NextResponse.json({
      exists: true,
      active: panel.status === 'active',
      status: panel.status,
      domain: panel.domain,
      panelId: (panel as any)._id.toString(),
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Child Panel Config GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
