import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import PaymentpointVirtualAccount from "@/models/PaymentpointVirtualAccount";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";

/**
 * 🚀 PaymentPoint Webhook Handler (TypeScript for Next.js)
 * Converts their Express example into a Next.js API route.
 */

export async function POST(request: Request) {
  try {
    // 🔹 1. Read the raw body text (PaymentPoint sends JSON)
    const rawBody = await request.text();

    console.log("📦 Raw webhook body received:", rawBody);

    // 🔹 2. Try parsing JSON safely
    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch (err: any) {
      console.error("❌ Invalid JSON received from PaymentPoint:", err.message);
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid JSON format. Ensure 'Content-Type: application/json' is set.",
          rawBody,
        },
        { status: 400 }
      );
    }

    // 🔹 3. Get signature from headers
    const signature = request.headers.get("paymentpoint-signature");
    if (!signature) {
      console.warn("⚠️ Missing PaymentPoint-Signature header");
      return NextResponse.json(
        { status: "error", message: "Missing signature" },
        { status: 400 }
      );
    }

    // 🔹 4. Your secret key from PaymentPoint dashboard
    const securityKey =
      process.env.PAYMENTPOINT_WEBHOOK_SECRET ||
      "b6c78bbe842c103548b6e93360def7a9fee8d89b847e7579ac648206898149e699abec0fc05518faefbc86ce43269dcb90a7e9665895993cfa930fe0"; // ⚠️ Replace with your real secret

    // 🔹 5. Recreate hash using raw body + secret key
    const calculatedSignature = crypto
      .createHmac("sha256", securityKey)
      .update(rawBody)
      .digest("hex");

    // 🔹 6. Validate signature
    if (calculatedSignature !== signature) {
      console.error("❌ Invalid PaymentPoint signature");
      console.log("Expected:", calculatedSignature);
      console.log("Received:", signature);
      return NextResponse.json(
        { status: "error", message: "Invalid signature" },
        { status: 403 }
      );
    }

    // ✅ 7. Signature valid — process the webhook data
    const {
      transaction_id,
      amount_paid,
      settlement_amount,
      transaction_status,
      settlement_fee,
      notification_status,
      sender,
      receiver,
      customer,
      description,
      timestamp,
    } = data;

    console.log("✅ PaymentPoint Webhook Verified Successfully!");
    console.log("Transaction ID:", transaction_id);
    console.log("Amount Paid:", amount_paid);
    console.log("Settlement Amount:", settlement_amount);
    console.log("Status:", transaction_status);
    console.log("Receiver Account:", receiver?.account_number);
    console.log("Timestamp:", timestamp);
    console.log("Customer:", customer?.email);
    console.log("Description:", description);

    if (transaction_status !== "success" && transaction_status !== "successful" && transaction_status !== "Completed") {
      console.log(`Transaction is not successful: ${transaction_status}. Skipping credit.`);
      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    const accountNumber = receiver?.account_number || data.account_number;
    if (!accountNumber) {
      console.error("No account number found in webhook data");
      return NextResponse.json({ status: "error", message: "No account number" }, { status: 400 });
    }

    await connectDB();

    const va = await PaymentpointVirtualAccount.findOne({
      accountNumber,
      status: "active"
    });

    if (!va) {
      console.log(`No active virtual account found for account number: ${accountNumber}`);
      return NextResponse.json({ status: "success", message: "VA not found" }, { status: 200 });
    }

    const paidAmount = Number(settlement_amount) || Number(amount_paid) || 0;
    if (paidAmount <= 0) {
      return NextResponse.json({ status: "success", message: "Invalid amount" }, { status: 200 });
    }

    const user = await User.findByIdAndUpdate(
      va.userId,
      { $inc: { walletBalance: paidAmount } },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ status: "success", message: "User not found" }, { status: 200 });
    }

    // Process Referral Commission
    const commission = user.referredBy ? Number((paidAmount * 0.03).toFixed(2)) : 0;

    if (user.referredBy && commission > 0) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        referrer.referralBalance = Number((referrer.referralBalance + commission).toFixed(2));
        const referralEntry = referrer.referrals.find((r: any) => r.uid === va.userId);
        if (referralEntry) {
          referralEntry.earnings = Number((referralEntry.earnings + commission).toFixed(2));
          referralEntry.date = new Date();
        } else {
          referrer.referrals.push({
            uid: va.userId,
            username: user.username,
            date: new Date(),
            earnings: commission
          });
        }
        await referrer.save();
      }
    }

    await Transaction.create({
      userUUID: va.userId,
      type: "deposit",
      amount: paidAmount,
      status: "successful",
      reference: transaction_id,
      description: `Funded wallet via PaymentPoint (Ref: ${transaction_id})`
    });

    await Notification.create({
      userUUID: va.userId,
      type: "payment",
      title: "Wallet Funded",
      message: `Successfully added ₦${paidAmount.toLocaleString()} to your account`,
      read: false,
      source: "notifications"
    });

    // ✅ 8. Respond to PaymentPoint that webhook was processed
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("🔥 Webhook error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

// Optional GET route to verify webhook is reachable
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "PaymentPoint webhook active 🚀",
  });
}
