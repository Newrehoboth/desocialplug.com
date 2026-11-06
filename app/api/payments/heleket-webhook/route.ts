import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { verifyHeleketeSignature } from '@/lib/heleket';

// Fixed exchange rate: $1 = ₦1,300 (must match CurrencyContext.tsx)
const FIXED_USD_TO_NAIRA_RATE = 1300;

interface HeleketeWebhook {
  type: string;
  uuid: string;
  order_id: string;
  amount: string;           // invoice amount (USD)
  payment_amount: string;   // amount paid in payer's crypto currency (e.g. BTC)
  payment_amount_usd: string; // ✅ actual USD equivalent of what was paid
  merchant_amount: string;  // what merchant receives (USD after fees)
  commission: string;
  is_final: boolean;
  status: string;
  from?: string;
  network?: string;
  currency: string;
  payer_currency: string;
  txid?: string;
  sign: string;
  [key: string]: any;
}

/**
 * Returns the fixed exchange rate — must stay in sync with CurrencyContext.tsx
 * DO NOT fetch from a live API here or the user dashboard will show wrong amounts.
 */
function getExchangeRate(): number {
  return FIXED_USD_TO_NAIRA_RATE;
}

export async function POST(req: Request) {
  try {
    // ── Get Raw Body for Signature Verification ──────────────────────────
    // We must use the raw body because re-stringifying the JSON can change
    // formatting (spaces, numeric precision) which breaks the signature.
    const rawBody = await req.text();
    const body = JSON.parse(rawBody) as HeleketeWebhook;

    console.log('📨 Heleket webhook received (RAW):', rawBody.substring(0, 500) + '...');

    // ── Verify webhook signature ──────────────────────────────────────────
    const { sign } = body;
    
    // We need the JSON without the 'sign' field, sorted alphabetically
    const dataWithoutSign = { ...body };
    delete (dataWithoutSign as any).sign;

    const isValid = verifyHeleketeSignature(dataWithoutSign, sign);

    if (!isValid) {
      console.error('❌ Webhook signature verification FAILED');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    } else {
      console.log('✅ Signature verified OK');
    }

    await connectDB();

    const { order_id, status, payment_amount_usd, merchant_amount, amount, currency, uuid } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 });
    }

    // Extract userId from order_id (format: userId-timestamp)
    const userId = order_id.split('-')[0];
    if (!userId) {
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }

    // ── Process success and intermediate statuses ──────────────────────────
    // Heleket statuses: paid, paid_over, wrong_amount, confirm_check, fail, system_fail, cancel, refund_paid
    const successStatuses = [
      'paid', 
      'paid_over', 
      'wrong_amount', 
      'confirm_check', 
      'wrong_amount_waiting'
    ];
    const failureStatuses = ['fail', 'system_fail', 'cancel', 'refund_paid'];
    const allHandledStatuses = [...successStatuses, ...failureStatuses];

    if (!allHandledStatuses.includes(status)) {
      console.log(`ℹ️  Skipping intermediate status: "${status}"`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // ── Idempotency check ────────────────────────────────────────────────
    // Heleket may retry webhooks. Prevent double-crediting by checking uuid.
    if (uuid) {
      const existing = await Transaction.findOne({ reference: uuid });
      if (existing) {
        console.log(`⚠️  Duplicate webhook for uuid=${uuid} — already processed. Ignoring.`);
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ── Determine the USD amount ──────────────────────────────────────────
    //
    // ⚠️  ROOT CAUSE FIX:
    //     Heleket sends `payment_amount_usd` as the CRYPTO TOKEN AMOUNT for
    //     non-USD coins. Example: user pays $5 in TRON → Heleket sends
    //     payment_amount_usd = "15.817621" (TRX tokens), NOT "$5".
    //     Using that field makes the dashboard show $15 instead of $5.
    //
    // ✅  ONLY use `amount` — the original invoice USD amount the user
    //     entered in the form (e.g. $5). It is ALWAYS in USD, ALWAYS correct,
    //     and does NOT change based on which coin the user picks.
    //
    console.log('🔍 Heleket raw payment fields:', {
      amount,              // ✅ USE THIS — original invoice USD (what user entered)
      payment_amount_usd,  // ⚠️  MISLEADING — may be crypto token units (TRX/BTC)
      merchant_amount,     // ℹ️  USD after Heleket fees
      payment_amount: body.payment_amount, // ❌ Raw crypto amount — never use for USD
      currency: body.currency,
      payer_currency: body.payer_currency,
    });

    // Always use the original invoice amount — exactly what the user requested
    const depositAmountUSD = parseFloat(amount) || 0;

    if (depositAmountUSD <= 0) {
      console.error(`❌ Could not determine USD deposit amount. Raw fields:`, {
        payment_amount_usd,
        merchant_amount,
        amount,
      });
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // ── Convert USD → Naira ───────────────────────────────────────────────
    // FIXED RATE: $1 = ₦1,300. Must match CurrencyContext.tsx on the frontend.
    const exchangeRate = getExchangeRate();
    const depositAmountNaira = Math.round(depositAmountUSD * exchangeRate * 100) / 100;

    console.log(
      `💱 Converting: $${depositAmountUSD} USD (@ ₦${exchangeRate}) => ₦${depositAmountNaira.toLocaleString()}`,
    );

    // ── Process by status ────────────────────────────────────────────────
    if (successStatuses.includes(status)) {
      // Credit the user's wallet
      user.walletBalance = (user.walletBalance || 0) + depositAmountNaira;
      await user.save();

      const isOverpaid = status === 'paid_over';
      const isWrongAmount = status === 'wrong_amount';
      const suffix = isOverpaid
        ? ' (Overpaid)'
        : isWrongAmount
          ? ' (Wrong amount paid)'
          : '';

      const desc = `Crypto deposit via Heleket: $${depositAmountUSD.toFixed(2)} USD => ₦${depositAmountNaira.toLocaleString()}${suffix}`;

      await Transaction.create({
        userUUID: userId,
        type: 'deposit',
        amount: depositAmountNaira,
        amountUSD: depositAmountUSD,
        currency: 'USD',
        status: 'successful',
        description: desc,
        reference: uuid,
      });

      console.log(`✅ Credited +₦${depositAmountNaira.toLocaleString()} ($${depositAmountUSD} USD) to user ${userId} (${user.email})`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Failure statuses
    await Transaction.create({
      userUUID: userId,
      type: 'deposit',
      amount: depositAmountNaira,
      amountUSD: depositAmountUSD,
      currency: 'USD',
      status: 'failed',
      description: `Crypto deposit failed (${status}) for $${depositAmountUSD.toFixed(2)} USD`,
      reference: uuid,
    });

    console.log(`❌ Payment failed for user ${userId} — status: ${status} ($${depositAmountUSD} USD)`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
