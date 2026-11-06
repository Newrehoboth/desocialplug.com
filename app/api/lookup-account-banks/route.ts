import { NextResponse } from 'next/server';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';
import { NIGERIAN_BANKS } from '@/lib/nigerian-banks';

/**
 * Lookup which banks an account number might belong to
 * This attempts to verify the account across multiple banks
 * POST /api/lookup-account-banks
 * Body: { accountNumber: string }
 */
export async function POST(req: Request) {
  try {
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountNumber } = await req.json();

    if (!accountNumber) {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 }
      );
    }

    // Validate account number format
    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: 'Invalid account number format. Must be 10 digits.' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_live_63e86b3ca2570289120218429194d10937bad6db';

    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Bank lookup service not configured' },
        { status: 500 }
      );
    }

    // Top digital and commercial banks in Nigeria
    const priorityCodes = [
      '999992', // Opay
      '999991', // PalmPay
      '50515',  // Moniepoint MFB
      '50211',  // Kuda Bank
      '058',    // GTBank
      '044',    // Access
      '033',    // UBA
      '057',    // Zenith
      '011',    // First Bank
      '214',    // FCMB
      '070',    // Fidelity
      '035',    // Wema
      '232',    // Sterling
      '221',    // Stanbic IBTC
      '032',    // Union Bank
    ];

    const priorityBanks = priorityCodes
      .map(code => NIGERIAN_BANKS.find(b => b.code === code))
      .filter((b): b is typeof NIGERIAN_BANKS[0] => Boolean(b));

    // Resolve priority banks in parallel for fast response
    const priorityPromises = priorityBanks.map(async (bank) => {
      try {
        const response = await fetch(
          `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bank.code}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        if (response.ok && data.status && data.data?.account_name) {
          return {
            bank,
            accountName: data.data.account_name,
          };
        }
      } catch (err) {
        console.log(`Failed to check ${bank.name}:`, err);
      }
      return null;
    });

    let matchingBanks = (await Promise.all(priorityPromises)).filter(
      (item): item is { bank: typeof NIGERIAN_BANKS[0]; accountName: string } => item !== null
    );

    // If no match found in priority banks, check remaining banks
    if (matchingBanks.length === 0) {
      const remainingBanks = NIGERIAN_BANKS.filter(
        b => !priorityCodes.includes(b.code)
      );

      const remainingPromises = remainingBanks.map(async (bank) => {
        try {
          const response = await fetch(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bank.code}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();
          if (response.ok && data.status && data.data?.account_name) {
            return {
              bank,
              accountName: data.data.account_name,
            };
          }
        } catch (err) {
          // ignore
        }
        return null;
      });

      matchingBanks = (await Promise.all(remainingPromises)).filter(
        (item): item is { bank: typeof NIGERIAN_BANKS[0]; accountName: string } => item !== null
      );
    }

    if (matchingBanks.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not find any banks with this account number',
        banks: [],
      });
    }

    return NextResponse.json({
      success: true,
      banks: matchingBanks.map(m => ({
        name: m.bank.name,
        code: m.bank.code,
        accountName: m.accountName,
      })),
    });
  } catch (error: any) {
    console.error('Account lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup account banks' },
      { status: 500 }
    );
  }
}
