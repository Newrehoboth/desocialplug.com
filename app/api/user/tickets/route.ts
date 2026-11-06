import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

// GET /api/user/tickets — list all tickets for the logged-in user
export async function GET(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.userId as any)._id;
    const tickets = await Ticket.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = tickets.map((t: any) => ({
      id: t._id.toString(),
      subject: t.subject,
      status: t.status,
      messageCount: t.messages?.length || 0,
      lastMessage: t.messages?.length
        ? t.messages[t.messages.length - 1]
        : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({ success: true, tickets: formatted });
  } catch (error: any) {
    console.error('Tickets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST /api/user/tickets — create a new ticket
export async function POST(req: Request) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.userId as any)._id;
    const { subject, text, fileUrl } = await req.json();
    if (!subject?.trim() || (!text?.trim() && !fileUrl)) {
      return NextResponse.json({ error: 'Subject and message text/attachment are required' }, { status: 400 });
    }

    const ticket = await Ticket.create({
      userId,
      subject: subject.trim(),
      status: 'open',
      messages: [
        {
          sender: 'user',
          text: text?.trim() || '',
          fileUrl: fileUrl || undefined,
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ success: true, ticket: { id: ticket._id.toString(), subject: ticket.subject, status: ticket.status } }, { status: 201 });
  } catch (error: any) {
    console.error('Tickets POST error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
