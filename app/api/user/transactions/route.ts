import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
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

    const userId = session.userId._id.toString();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true,
    };

    const query = { userUUID: userId };

    const result = await Transaction.paginate(query, options);

    const formattedTransactions = result.docs.map((tx: any) => ({
      id: tx._id.toString(),
      type: tx.type,
      amount: tx.amount,
      amountUSD: tx.amountUSD,
      currency: tx.currency,
      status: tx.status,
      reference: tx.reference,
      description: tx.description,
      date: tx.createdAt,
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
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
    console.error('Transactions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    );
  }
}
