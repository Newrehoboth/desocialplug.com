import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const platform = url.searchParams.get('platform') || 'all';

    // ✅ Show all active accounts (Available and Sold Out) to users
    let query: any = {
      $or: [{ visibleToUsers: true }, { visibleToUsers: { $exists: false } }],
    };

    if (platform !== 'all') {
      query.platform = { $regex: platform, $options: 'i' };
    }

    const accounts = await Account.find(query).lean();

    const toSortablePosition = (pos: unknown) => {
      const n = typeof pos === 'number' ? pos : Number.NaN;
      return Number.isFinite(n) && n > 0 ? n : Number.MAX_SAFE_INTEGER;
    };

    accounts.sort((a: any, b: any) => {
      const platformA = (a.platform || '').toString().toLowerCase();
      const platformB = (b.platform || '').toString().toLowerCase();
      if (platformA !== platformB) return platformA.localeCompare(platformB);

      const subA = (a.subcategory || '').toString().toLowerCase();
      const subB = (b.subcategory || '').toString().toLowerCase();
      if (subA !== subB) return subA.localeCompare(subB);

      const positionA = toSortablePosition(a.position);
      const positionB = toSortablePosition(b.position);
      if (positionA !== positionB) return positionA - positionB;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const formattedAccounts = accounts.map((acc: any) => {
      const bulkCount = Array.isArray(acc.bulkLogs) ? acc.bulkLogs.length : 0;
      const logCount = acc.logs !== undefined && acc.logs !== null ? acc.logs : bulkCount;
      return {
        id: acc._id,
        platform: acc.platform,
        account: acc.account || acc.olaz,
        followers: acc.followers || 0,
        logs: logCount,
        bulkLogs: acc.bulkLogs || [],
        price: acc.price || 0,
        mailIncluded: acc.mailIncluded || false,
        status: acc.status || (logCount > 0 ? 'Available' : 'Sold Out'),
        subcategory: acc.subcategory || '',
        description: acc.description || '',
        descriptionHeader: acc.descriptionHeader || '',
        tutorialVideoUrl: acc.tutorialVideoUrl || '',
        vpnType: acc.vpnType || '',
        position: acc.position,
        createdAt: acc.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      accounts: formattedAccounts,
    });
  } catch (error) {
    console.error('User accounts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 },
    );
  }
}
