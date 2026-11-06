import { NextResponse } from 'next/server';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

/**
 * Verify Nigerian bank account using Paystack API
 * POST /api/verify-bank-account
 * Body: { accountNumber: string, bankCode: string }
 */
export async function POST(req: Request) {
  try {
    const token = await getTokenFromRequest(req);

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      console.log('❌ Invalid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountNumber, bankCode } = await req.json();

    console.log('🔍 Verifying account:', { accountNumber, bankCode });

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: 'Account number and bank code are required' },
        { status: 400 }
      );
    }

    // Validate account number format (10 digits for Nigerian banks)
    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: 'Invalid account number format. Must be 10 digits.' },
        { status: 400 }
      );
    }

    // Call Paystack account verification API
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_live_63e86b3ca2570289120218429194d10937bad6db';

    if (!paystackSecretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Bank verification service not configured' },
        { status: 500 }
      );
    }

    console.log('✅ Paystack key found, calling API...');

    const paystackUrl = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;
    console.log('🌐 Paystack URL:', paystackUrl);

    const response = await fetch(paystackUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('📥 Paystack response:', JSON.stringify(data, null, 2));

    if (!response.ok || !data.status) {
      console.log('❌ Paystack returned error:', data.message);
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'Could not verify account. Please check the details.',
        },
        { status: 400 }
      );
    }

    console.log('✅ Account verified:', data.data.account_name);

    // Return account name
    return NextResponse.json({
      success: true,
      accountName: data.data.account_name,
      accountNumber: data.data.account_number,
    });
  } catch (error: any) {
    console.error('❌ Bank verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify bank account: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
