import { NextResponse } from 'next/server';
import { getGoogleAuthURL } from '@/lib/google-auth';

export async function GET(req: Request) {
  try {
    const { url, state } = getGoogleAuthURL();

    const response = NextResponse.redirect(url);
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
