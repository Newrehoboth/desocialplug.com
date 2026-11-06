import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PocketfiCheckout from '@/models/PocketfiCheckout';

const POCKETFI_API_BASE = 'https://api.pocketfi.ng/api/v1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, email, firstName, lastName, phone, userId } = body || {};

    if (!userId || !email || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 500) {
      return NextResponse.json(
        { error: 'Minimum amount is ₦500' },
        { status: 400 }
      );
    }

    const apiToken = process.env.POCKETFI_API_TOKEN;
    const businessId = process.env.POCKETFI_BUSINESS_ID;

    if (!apiToken || !businessId) {
      return NextResponse.json(
        { error: 'PocketFi is not configured' },
        { status: 500 }
      );
    }

    const rawLastName = (lastName || '').toString().trim();
    const rawPhone = (phone || '').toString().trim();

    if (!rawLastName || !rawPhone) {
      return NextResponse.json(
        { error: 'Please provide your last name and phone number.' },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const redirectLink = `${url.origin}/add-funds`;

    const payload = {
      first_name: firstName || 'User',
      last_name: rawLastName,
      phone: rawPhone,
      business_id: String(businessId),
      email,
      amount: String(Math.round(numericAmount)),
      redirect_link: redirectLink,
    };

    console.debug({payload})

    const res = await fetch(`${POCKETFI_API_BASE}/checkout/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch((e) => e);

    if (!res.ok || !data || !data.payment_id || !data.payment_link) {
      return NextResponse.json(
        { error: 'PocketFi checkout request failed', details: data || null },
        { status: 502 }
      );
    }

    const paymentId = String(data.payment_id);
    const paymentLink = String(data.payment_link);

    await connectDB();

    await PocketfiCheckout.create({
      paymentId,
      userId,
      amount: numericAmount,
      status: 'pending',
    });

    return NextResponse.json({ paymentId, paymentLink });
  } catch (error) {
    console.error('PocketFi checkout error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
