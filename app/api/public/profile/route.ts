import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 401 });
    }

    await connectDB();
    
    // Find user by API Key
    const user = await User.findOne({ apiKey });

    if (!user) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    // Return the minimum needed for the child panel (balance and basic info)
    return NextResponse.json({
      success: true,
      profile: {
        username: user.username,
        email: user.email,
        walletBalance: user.walletBalance,
        purchasedAccounts: user.purchasedAccounts
      }
    });

  } catch (error: any) {
    console.error('Public Profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
