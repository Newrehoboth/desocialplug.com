import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createHeleketePaymentLink } from '@/lib/heleket';

interface CreatePaymentBody {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency?: string;
  callbackUrl: string;
  returnUrl: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreatePaymentBody;
    const {
      userId,
      userName,
      userEmail,
      amount,
      currency = 'USD',
      callbackUrl,
      returnUrl,
    } = body;

    if (!userId || !amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid userId or amount' },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Heleket payment link
    const result = await createHeleketePaymentLink(
      {
        userId,
        email: userEmail,
        name: userName,
      },
      {
        amount,
        currency,
        description: `DeSocial Plug - Add Funds (${amount} ${currency})`,
      },
      {
        callbackUrl,
        returnUrl,
      },
    );

    if (!result.success || !result.payment_url) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        payment_url: result.payment_url,
        transaction_id: result.transaction_id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment',
      },
      { status: 500 },
    );
  }
}
