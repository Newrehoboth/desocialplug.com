import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';

/**
 * Test endpoint to manually process Heleket webhook
 * This allows processing webhooks without signature verification for debugging
 * 
 * Usage: POST /api/payments/heleket-webhook-test
 * Body: Full webhook payload from Heleket
 */

export async function POST(req: Request) {
  try {
    const superAdminKey = req.headers.get('x-super-admin-key');
    const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_superadmin_2025_secret_key_change_this";
    if (!superAdminKey || superAdminKey !== masterSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    console.log('🧪 TEST WEBHOOK - Processing manually:', {
      orderId: body.order_id,
      status: body.status,
      amount: body.payment_amount,
      uuid: body.uuid,
    });

    // Skip signature verification for testing
    console.log('⚠️  SKIPPING SIGNATURE VERIFICATION (TEST MODE)');

    await connectDB();

    const { order_id, status, payment_amount, currency, uuid } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 });
    }

    // Extract userId from order_id (format: userId-timestamp)
    const userId = order_id.split('-')[0];

    if (!userId) {
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`👤 User found: ${user.email}`);

    // ── Determine the USD amount ──────────────────────────────────────────
    // In Heleket:
    // payment_amount_usd = USD value of what payer paid
    // merchant_amount    = USD merchant receives
    // amount             = original invoice amount
    const depositAmountUSD =
      parseFloat(body.payment_amount_usd) ||
      parseFloat(body.merchant_amount) ||
      parseFloat(body.amount) ||
      0;

    // ── Convert USD → Naira ───────────────────────────────────────────────
    // For test mode, we'll use a fixed rate or fetch it
    const exchangeRate = 1383; 
    const depositAmountNaira = Math.round(depositAmountUSD * exchangeRate * 100) / 100;

    console.log(`Processing with: $${depositAmountUSD} USD => ₦${depositAmountNaira}`);

    // Handle success statuses
    if (['paid', 'confirm_check', 'paid_over', 'wrong_amount'].includes(status)) {
      console.log(`Processing successful payment...`);

      // Add funds to user wallet
      const previousBalance = user.walletBalance || 0;
      user.walletBalance = previousBalance + depositAmountNaira;
      await user.save();

      const desc = `[TEST] Crypto deposit via Heleket: $${depositAmountUSD.toFixed(2)} USD => ₦${depositAmountNaira.toLocaleString()}${status === 'paid_over' ? ' (Overpaid)' : ''}`;

      // Create transaction record
      const transaction = await Transaction.create({
        userUUID: userId,
        type: 'deposit',
        amount: depositAmountNaira,
        amountUSD: depositAmountUSD,
        currency: 'USD',
        status: 'successful',
        description: desc,
        reference: uuid || `test-${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Payment processed (TEST MODE)',
        user: { email: user.email, newBalance: user.walletBalance },
        transaction
      });
    }

    return NextResponse.json({ success: true, message: 'Status skipped in test' });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
