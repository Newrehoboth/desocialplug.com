import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getSession, getTokenFromRequest } from '@/lib/auth-mongo';

// GET /api/user/tickets/[id] — get full ticket with all messages
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.userId as any)._id;
    const ticket = await Ticket.findOne({ _id: id, userId }).lean() as any;

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id.toString(),
        subject: ticket.subject,
        status: ticket.status,
        messages: ticket.messages,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Ticket GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// POST /api/user/tickets/[id] — user replies to an existing ticket
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const session = await getSession(token);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.userId as any)._id;
    const ticket = await Ticket.findOne({ _id: id, userId });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.status === 'resolved') {
      return NextResponse.json({ error: 'Cannot reply to a resolved ticket' }, { status: 400 });
    }

    const { text, fileUrl } = await req.json();
    if (!text?.trim() && !fileUrl) {
      return NextResponse.json({ error: 'Message text or attachment is required' }, { status: 400 });
    }

    ticket.messages.push({
      sender: 'user',
      text: text?.trim() || '',
      fileUrl: fileUrl || undefined,
      createdAt: new Date(),
    });
    await ticket.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ticket POST reply error:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
