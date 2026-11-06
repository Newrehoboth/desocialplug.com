import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PocketfiVirtualAccount from '@/models/PocketfiVirtualAccount';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const POCKETFI_API_BASE = 'https://api.pocketfi.ng/api/v1';

interface CreateVaRequestBody {
  userId?: string;
  bank?: string;
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

    const existing = await PocketfiVirtualAccount.findOne({ userId }).sort({ createdAt: -1 });

    if (!existing) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ 
      exists: true, 
      id: existing._id.toString(),
      ...existing.toObject() 
    }, { status: 200 });
  } catch (error) {
    console.error('PocketFi VA GET error', error);
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

    const apiToken = process.env.POCKETFI_API_TOKEN;
    const businessId = process.env.POCKETFI_BUSINESS_ID;
    const defaultBank = process.env.POCKETFI_VA_BANK || 'palmpay';

    if (!apiToken || !businessId) {
      return NextResponse.json(
        { error: 'PocketFi is not configured' },
        { status: 500 }
      );
    }

    // If a VA already exists for this user, just return it (regardless of bank)
    const existing = await PocketfiVirtualAccount.findOne({ userId }).sort({ createdAt: -1 });
    if (existing) {
      return NextResponse.json(
        { created: false, id: existing._id.toString(), ...existing.toObject() },
        { status: 200 }
      );
    }

    // Read user profile for KYC-like details
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

    let firstName = (bodyFirstName || defaultFirstName).replace(/[^a-zA-Z]/g, '');
    let lastName = (bodyLastName || defaultLastName).replace(/[^a-zA-Z]/g, '');
    
    if (!firstName) firstName = 'Customer';
    if (!lastName) lastName = 'User';

    let phone = bodyPhone || profilePhone || '08000000000';
    if (phone.length < 10) phone = '08000000000';

    const bank = (body.bank || defaultBank).toString().trim() || defaultBank;

    // Use email plus-aliasing (+va...) so PocketFi sees it as unique,
    // but the user STILL receives deposit receipts (standard email feature)
    const [localPart, domainPart] = email.split('@');
    const uniqueEmail = `${localPart}+va${Date.now().toString().slice(-6)}@${domainPart || 'desocialplug.com'}`;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: uniqueEmail,
      businessId: String(businessId),
      bank,
    };
    console.debug('PocketFi create virtual account payload', payload);

    let res = await fetch(`${POCKETFI_API_BASE}/virtual-accounts/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = await res.json().catch(() => null);

    // Fallback to palmpay if the requested bank fails (e.g. paga strict KYC or downtime)
    if (
      (!res.ok || !data || !data.status || !Array.isArray(data.banks) || !data.banks[0]) &&
      bank !== 'palmpay'
    ) {
      console.warn(`PocketFi failed for bank ${bank}, falling back to palmpay`, data);
      payload.bank = 'palmpay';
      
      res = await fetch(`${POCKETFI_API_BASE}/virtual-accounts/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      data = await res.json().catch(() => null);
    }

    if (
      !res.ok ||
      !data ||
      !data.status ||
      !Array.isArray(data.banks) ||
      !data.banks[0]
    ) {
      console.error('PocketFi create virtual account error', data);
      return NextResponse.json(
        {
          error: 'Unable to create PocketFi virtual account',
          details: data || null,
        },
        { status: 502 }
      );
    }

    const bankInfo = data.banks[0];
    const bankName = String(bankInfo.bankName || '');
    const accountNumber = String(bankInfo.accountNumber || '');
    const accountName = String(bankInfo.accountName || '');

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        {
          error: 'Invalid response from PocketFi when creating virtual account',
          details: data || null,
        },
        { status: 502 }
      );
    }

    const newVa = await PocketfiVirtualAccount.create({
      userId,
      businessId: String(businessId),
      bank,
      bankName,
      accountNumber,
      accountName,
      provider: 'pocketfi',
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
    console.error('PocketFi VA POST error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
