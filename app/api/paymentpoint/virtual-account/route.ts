import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PaymentpointVirtualAccount from '@/models/PaymentpointVirtualAccount';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const PAYMENTPOINT_API_BASE = 'https://api.paymentpoint.co/api/v1';

interface CreateVaRequestBody {
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await connectDB();

    const existing = await PaymentpointVirtualAccount.findOne({ userId }).sort({ createdAt: -1 });

    if (!existing) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ 
      exists: true, 
      id: existing._id.toString(),
      ...existing.toObject() 
    }, { status: 200 });
  } catch (error) {
    console.error('PaymentPoint VA GET error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateVaRequestBody;
    const userId = (body.userId || '').toString().trim();
    const bodyFirstName = (body.firstName || '').toString().trim();
    const bodyLastName = (body.lastName || '').toString().trim();
    const bodyPhone = (body.phone || '').toString().trim();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await connectDB();

    const apiKey = process.env.PAYMENTPOINT_API_KEY || '51f95b6c653949ce47d04a3455a6dd1245ca54a6';
    const apiSecret = process.env.PAYMENTPOINT_API_SECRET || 'b6c78bbe842c103548b6e93360def7a9fee8d89b847e7579ac648206898149e699abec0fc05518faefbc86ce43269dcb90a7e9665895993cfa930fe0';
    const businessId = process.env.PAYMENTPOINT_BUSINESS_ID || '731a954915ce7768e190acd29eb08e8a853c3ab8';
    
    // Palmpay bank code for PaymentPoint
    const bankCode = ['20946'];

    if (!apiKey || !apiSecret || !businessId) {
      return NextResponse.json(
        { error: 'PaymentPoint is not configured' },
        { status: 500 }
      );
    }

    // If a VA already exists, just return it
    const existing = await PaymentpointVirtualAccount.findOne({ userId }).sort({ createdAt: -1 });
    if (existing) {
      return NextResponse.json(
        { created: false, id: existing._id.toString(), ...existing.toObject() },
        { status: 200 }
      );
    }

    // Read user profile
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found for virtual account creation' },
        { status: 400 }
      );
    }

    const email = (user.email || '').toString().trim();
    if (!email) {
      return NextResponse.json(
        { error: 'User email is required to create a virtual account' },
        { status: 400 }
      );
    }

    const fullName = (user.username || '').toString().trim();
    const profilePhone = (user.phone || '').toString().trim();

    const nameParts = fullName.split(' ').filter(Boolean);
    const defaultFirstName = nameParts[0] || 'Customer';
    const defaultLastName = nameParts.slice(1).join(' ') || 'User';

    const firstName = bodyFirstName || defaultFirstName;
    const lastName = bodyLastName || defaultLastName;
    const phone = bodyPhone || profilePhone || '09000000000';

    const payload = {
      email,
      name: `${firstName} ${lastName}`.trim(),
      phoneNumber: phone,
      bankCode,
      businessId,
    };
    
    console.debug('PaymentPoint create virtual account payload', payload);

    const res = await fetch(`${PAYMENTPOINT_API_BASE}/createVirtualAccount`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiSecret}`,
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    const isSuccess = data?.status === 'success' || data?.status === true;
    const bankAccounts = data?.data?.bankAccounts || data?.bankAccounts;

    if (
      !res.ok ||
      !data ||
      !isSuccess ||
      !Array.isArray(bankAccounts) ||
      !bankAccounts[0]
    ) {
      console.error('PaymentPoint create virtual account error', data);
      
      const providerError = Array.isArray(data?.errors) && data.errors.length > 0 
        ? data.errors.join(', ') 
        : (data?.message?.includes('Customer account created successfully') 
            ? 'Failed to generate bank details. Please contact support.' 
            : data?.message || 'Invalid response structure');

      return NextResponse.json(
        {
          error: 'Unable to create PaymentPoint virtual account',
          details: { message: providerError },
        },
        { status: 502 }
      );
    }

    const bankInfo = bankAccounts[0];
    const bankName = String(bankInfo.bankName || '');
    const accountNumber = String(bankInfo.accountNumber || '');
    const accountName = String(bankInfo.accountName || '');

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        {
          error: 'Invalid response from PaymentPoint when creating virtual account',
          details: data || null,
        },
        { status: 502 }
      );
    }

    const newVa = await PaymentpointVirtualAccount.create({
      userId,
      businessId: String(businessId),
      bank: bankInfo.bankCode || bankCode[0],
      bankName,
      accountNumber,
      accountName,
      provider: 'paymentpoint',
      status: 'active',
    });

    return NextResponse.json(
      { 
        created: true, 
        id: newVa._id.toString(), 
        ...newVa.toObject() 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PaymentPoint VA POST error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
