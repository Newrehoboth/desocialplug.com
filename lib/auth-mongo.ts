import connectDB from './mongodb';
import User, { IUser } from '@/models/User';
import Session from '@/models/Session';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from './email';
import crypto from 'crypto';

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  phone?: string,
  referralCode?: string,
) {
  await connectDB();

  // Normalize email to lowercase for case-insensitive comparison
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
  if (existingUser) {
    if (existingUser.email === normalizedEmail) throw new Error('Email already in use');
    if (existingUser.username === username)
      throw new Error('Username already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate unique referral code for new user
  let newReferralCode = generateReferralCode();
  while (await User.findOne({ referralCode: newReferralCode })) {
    newReferralCode = generateReferralCode();
  }

  // Check if referred by someone
  let referredByUserId: string | undefined;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referredByUserId = referrer._id.toString();
    }
  }

  const user = await User.create({
    email: normalizedEmail,
    username,
    password: hashedPassword,
    phone,
    status: 'active',
    walletBalance: 0,
    purchasedAccounts: 0,
    referralCode: newReferralCode,
    referredBy: referredByUserId,
    referralBalance: 0,
    referrals: [],
  });

  // If referred, add to referrer's referrals list
  if (referredByUserId) {
    await User.findByIdAndUpdate(referredByUserId, {
      $push: {
        referrals: {
          uid: user._id.toString(),
          username: user.username,
          date: new Date(),
          earnings: 0,
        },
      },
    });
  }

  // Send welcome email (don't await to not block signup)
  sendWelcomeEmail(email, username).catch(console.error);

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

export async function signIn(email: string, password: string) {
  await connectDB();

  // Normalize email to lowercase for case-insensitive lookup
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (user.status === 'suspended') {
    throw new Error('Your account has been suspended. Please contact support.');
  }

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

export async function createSession(userId: string) {
  await connectDB();

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await Session.create({
    userId,
    token,
    expiresAt,
  });

  return session;
}

export async function getSession(token: string | null) {
  if (!token) return null;
  await connectDB();

  const session = await Session.findOne({
    token,
    expiresAt: { $gt: new Date() },
  }).populate('userId');

  if (!session) return null;

  return session;
}

export async function deleteSession(token: string | null) {
  if (!token) return;
  await connectDB();
  await Session.deleteOne({ token });
}

export async function getUserById(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return null;
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

export async function getTokenFromRequest(req: Request): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (token) return token;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
