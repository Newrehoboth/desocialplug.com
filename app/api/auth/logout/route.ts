import { NextResponse } from 'next/server';
import { deleteSession, getTokenFromRequest } from '@/lib/auth-mongo';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const token = await getTokenFromRequest(req);

  if (token) {
    await deleteSession(token);
  }

  const cookieStore = await cookies();
  cookieStore.delete('session_token');

  return NextResponse.json({ success: true });
}
