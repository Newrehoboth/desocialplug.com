import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChildPanel from '@/models/ChildPanel';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { domain, username, password } = await req.json();

    if (!domain || !username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400, headers: corsHeaders });
    }

    await connectDB();

    const panel = await ChildPanel.findOne({
      domain: domain.toLowerCase().trim(),
      status: 'active',
    });

    if (!panel) {
      return NextResponse.json(
        { error: 'Domain not found or panel is not yet active.' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (panel.adminName !== username) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
    }

    const isPlainTextMatch = password === panel.adminPassword;
    const isHashedMatch = !isPlainTextMatch && await bcrypt.compare(password, panel.adminPassword || '');
    
    if (!isPlainTextMatch && !isHashedMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
    }

    return NextResponse.json({
      success: true,
      panelId: panel._id.toString(),
      domain: panel.domain,
      adminName: panel.adminName,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Child Panel Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
