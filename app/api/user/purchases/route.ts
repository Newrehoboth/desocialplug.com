import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Account from '@/models/Account';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

export async function GET(req: Request) {
  try {
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.userId as any;
    const userIdentifiers = Array.from(
      new Set(
        [
          user._id.toString(),
          user.firebaseId,
          user.googleId,
          user.userUUID,
          user.email,
        ].filter(Boolean),
      ),
    );

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const options = {
      page,
      limit,
      sort: { purchaseDate: -1 },
      lean: true,
    };

    const query = { userUUID: { $in: userIdentifiers } };

    const result = await Purchase.paginate(query, options);

    // Fetch tutorialVideoUrl from Account model for purchases missing tutorialVideoUrl
    const missingAccountIds = Array.from(
      new Set(
        result.docs
          .filter((p: any) => !p.tutorialVideoUrl && p.accountId)
          .map((p: any) => p.accountId)
      )
    );

    let accountMap: Record<string, string> = {};
    if (missingAccountIds.length > 0) {
      const accounts = await Account.find({ _id: { $in: missingAccountIds } }).select(
        'tutorialVideoUrl',
      );
      accounts.forEach((acc: any) => {
        if (acc.tutorialVideoUrl) {
          accountMap[acc._id.toString()] = acc.tutorialVideoUrl;
        }
      });
    }

    const formattedPurchases = result.docs.map((p: any) => ({
      id: p._id.toString(),
      platform: p.platform,
      followers: p.followers || 0,
      quantity: p.quantity,
      totalAmount: p.totalAmount,
      purchaseDate: p.purchaseDate,
      status: p.status,
      credentials: p.credentials || [],
      type: p.type || '',
      tutorialVideoUrl:
        p.tutorialVideoUrl ||
        (p.accountId ? accountMap[p.accountId.toString()] || '' : ''),
    }));

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
      },
    });
  } catch (error: any) {
    console.error('Purchases fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 },
    );
  }
}
