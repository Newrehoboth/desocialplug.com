import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PocketfiCheckout from '@/models/PocketfiCheckout';
import PocketfiVirtualAccount from '@/models/PocketfiVirtualAccount';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';
import crypto from 'crypto';

async function readRawBody(req: Request): Promise<string> {
  return await req.text();
}

export async function POST(req: Request) {
  try {
    const rawBody = await readRawBody(req);
    console.log('📦 PocketFi webhook raw body received:', rawBody);

    const secret = process.env.POCKETFI_WEBHOOK_SECRET;
    const signature =
      req.headers.get('x-pocketfi-signature') ||
      req.headers.get('pocketfi-signature') ||
      req.headers.get('x-signature') ||
      req.headers.get('signature');

    // 1. Verify PocketFi webhook signature if present and secret is configured
    if (signature && secret) {
      try {
        const cleanSig = signature.replace(/^sha256=/i, '').trim().toLowerCase();
        const calculated = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('hex')
          .toLowerCase();

        if (cleanSig !== calculated) {
          console.warn('⚠️ PocketFi Webhook signature mismatch:', {
            received: cleanSig,
            calculated,
          });
        }
      } catch (sigErr) {
        console.error('Signature verification error:', sigErr);
      }
    }

    let data: any = {};
    try {
      data = JSON.parse(rawBody || '{}');
    } catch (parseErr) {
      console.error('❌ PocketFi Webhook JSON parse error:', parseErr);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const payload = data.data || data;
    const order = payload.order || data.order || {};
    const transaction = payload.transaction || data.transaction || {};

    // Robust reference extraction
    const reference = String(
      transaction.reference ||
      transaction.tx_ref ||
      transaction.reference_id ||
      payload.reference ||
      payload.tx_ref ||
      payload.transaction_reference ||
      payload.payment_reference ||
      payload.id ||
      order.reference ||
      data.reference ||
      ''
    ).trim();

    await connectDB();

    // Idempotency check: if deposit with this reference was already credited, return success 200
    if (reference) {
      const existingTx = await Transaction.findOne({
        reference,
        type: 'deposit',
        status: 'successful',
      });
      if (existingTx) {
        console.log(`ℹ️ PocketFi Webhook: Deposit reference ${reference} already processed.`);
        return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
      }
    }

    let userId: string | null = null;
    let paidAmount = 0;
    let checkout: any = null;

    // A. Check Checkouts first (if reference matches pending checkout)
    if (reference) {
      checkout = await PocketfiCheckout.findOne({
        paymentId: reference,
        status: 'pending',
      });
      if (checkout) {
        userId = checkout.userId;
        paidAmount = Number(
          order.settlement_amount ||
          order.amount ||
          payload.settlement_amount ||
          payload.amount ||
          transaction.amount ||
          checkout.amount ||
          0
        );
      }
    }

    // B. Check Virtual Accounts if no checkout match
    if (!userId) {
      const accountNumber = String(
        transaction.account ||
        transaction.accountNumber ||
        transaction.account_number ||
        payload.account_number ||
        payload.accountNumber ||
        payload.account ||
        order.account ||
        data.account_number ||
        ''
      ).trim();

      if (accountNumber) {
        const va = await PocketfiVirtualAccount.findOne({
          accountNumber,
        });

        if (va) {
          userId = va.userId;
          paidAmount = Number(
            order.settlement_amount ||
            order.amount ||
            payload.settlement_amount ||
            payload.amount ||
            payload.paid_amount ||
            transaction.amount ||
            transaction.settlement_amount ||
            data.amount ||
            0
          );
        } else {
          console.warn(`⚠️ PocketFi Webhook: No VirtualAccount found for accountNumber: "${accountNumber}"`);
        }
      }
    }

    // C. Fallback: Search by customer email if sent in payload
    if (!userId) {
      const customerEmail = String(
        payload.email ||
        payload.customer?.email ||
        transaction.email ||
        order.email ||
        ''
      ).trim().toLowerCase();

      if (customerEmail) {
        const mainEmail = customerEmail.replace(/\+va\d+@/, '@');
        const user = await User.findOne({
          $or: [{ email: customerEmail }, { email: mainEmail }],
        });
        if (user) {
          userId = user._id.toString();
          paidAmount = Number(
            order.settlement_amount ||
            order.amount ||
            payload.settlement_amount ||
            payload.amount ||
            payload.paid_amount ||
            transaction.amount ||
            data.amount ||
            0
          );
        }
      }
    }

    if (!userId || !paidAmount || paidAmount <= 0) {
      console.warn('⚠️ PocketFi Webhook: Could not determine valid userId or paidAmount', {
        userId,
        paidAmount,
        reference,
        data,
      });
      return NextResponse.json(
        { message: 'No matching checkout, virtual account, or valid deposit amount' },
        { status: 200 }
      );
    }

    const finalRef = reference || `pocketfi_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Update User Balance atomically ($inc ensures safety)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: paidAmount } },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`❌ PocketFi Webhook: User ${userId} not found`);
      return NextResponse.json({ message: 'User not found' }, { status: 200 });
    }

    console.log(`✅ PocketFi Webhook: Successfully credited ₦${paidAmount} to user ${userId} (${updatedUser.username}). New balance: ₦${updatedUser.walletBalance}`);

    // Referral bonus commission (3%)
    if (updatedUser.referredBy) {
      const commission = Number((paidAmount * 0.03).toFixed(2));
      if (commission > 0) {
        const referrer = await User.findById(updatedUser.referredBy);
        if (referrer) {
          referrer.referralBalance = Number(((referrer.referralBalance || 0) + commission).toFixed(2));
          const referralEntry = referrer.referrals.find((r: any) => r.uid === userId);
          if (referralEntry) {
            referralEntry.earnings = Number(((referralEntry.earnings || 0) + commission).toFixed(2));
            referralEntry.date = new Date();
          } else {
            referrer.referrals.push({
              uid: userId,
              username: updatedUser.username,
              date: new Date(),
              earnings: commission,
            });
          }
          await referrer.save();
        }
      }
    }

    // Create Transaction Record
    await Transaction.create({
      userUUID: userId,
      type: 'deposit',
      amount: paidAmount,
      status: 'successful',
      reference: finalRef,
      description: `Funded wallet via PocketFi (Ref: ${finalRef})`,
    });

    // Create Notification
    await Notification.create({
      userUUID: userId,
      type: 'payment',
      title: 'Wallet Funded',
      message: `Successfully added ₦${paidAmount.toLocaleString()} to your account`,
      read: false,
      source: 'notifications',
    });

    // Update Checkout Status if applicable
    if (checkout) {
      checkout.status = 'completed';
      await checkout.save();
    }

    return NextResponse.json({ message: 'success', success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ PocketFi webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
