import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createSession } from '@/lib/auth-mongo';
import { exchangeCodeForToken, getUserInfo } from '@/lib/google-auth';
import { sendWelcomeEmail } from '@/lib/email';
import crypto from 'crypto';

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing authorization code or state' },
        { status: 400 }
      );
    }

    // Verify state parameter
    const cookies = req.headers.get('cookie');
    const stateCookie = cookies
      ?.split(';')
      .find((c) => c.trim().startsWith('google_oauth_state='))
      ?.split('=')[1];

    if (!stateCookie || stateCookie !== state) {
      console.error('❌ State mismatch - possible CSRF attack');
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 403 });
    }

    console.log('✅ State verified');

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    console.log('✅ Access token obtained');

    // Get user info from Google
    const googleUser = await getUserInfo(tokens.access_token);
    if (!googleUser.id || !googleUser.email) {
      throw new Error('Invalid Google user data');
    }

    console.log('📧 Google user info:', { id: googleUser.id, email: googleUser.email });

    await connectDB();

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId: googleUser.id }, { email: googleUser.email }],
    });

    if (user) {
      // Update googleId if not already set
      if (!user.googleId) {
        user.googleId = googleUser.id;
        await user.save();
        console.log('✅ Updated existing user with googleId');
      }
    } else {
      // Create new user from Google data
      let newReferralCode = generateReferralCode();
      while (await User.findOne({ referralCode: newReferralCode })) {
        newReferralCode = generateReferralCode();
      }

      // Extract username from email (before @)
      const emailUsername = googleUser.email.split('@')[0];
      let username = emailUsername;

      // Check if username is taken, if so append random numbers
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${emailUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        googleId: googleUser.id,
        email: googleUser.email,
        username,
        status: 'active',
        walletBalance: 0,
        purchasedAccounts: 0,
        referralCode: newReferralCode,
        referralBalance: 0,
        referrals: [],
      });

      console.log('✅ New user created:', { username, email: googleUser.email });

      // Send welcome email
      sendWelcomeEmail(googleUser.email, username).catch(console.error);
    }

    // Create session
    const session = await createSession(user._id.toString());
    console.log('✅ Session created');

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(
      new URL('/dashboard', req.url).toString()
    );

    // Set session cookie
    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Clear OAuth state cookie
    response.cookies.delete('google_oauth_state');

    console.log('✅ Google OAuth callback processed successfully');
    return response;
  } catch (error: any) {
    console.error('❌ Google OAuth callback error:', error);

    const errorMessage = error.message || 'OAuth callback failed';
    const redirectUrl = new URL(
      `/login?error=${encodeURIComponent(errorMessage)}`,
      req.url
    );

    return NextResponse.redirect(redirectUrl.toString());
  }
}
