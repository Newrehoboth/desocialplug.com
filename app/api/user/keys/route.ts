import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getSession, getTokenFromRequest } from "@/lib/auth-mongo";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    await connectDB();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.userId as any;
    return NextResponse.json({ apiKey: user?.apiKey || null });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const token = await getTokenFromRequest(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSession(token);

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newApiKey = "dsp_" + crypto.randomBytes(24).toString("hex");
    const userId = (session.userId as any)._id;
    await User.findByIdAndUpdate(userId, { apiKey: newApiKey });

    return NextResponse.json({ apiKey: newApiKey });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
