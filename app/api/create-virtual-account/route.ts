import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🔐 Hardcoded credentials (for local testing only)
    const apiSecret =
      'b6c78bbe842c103548b6e93360def7a9fee8d89b847e7579ac648206898149e699abec0fc05518faefbc86ce43269dcb90a7e9665895993cfa930fe0';
    const apiKey = '51f95b6c653949ce47d04a3455a6dd1245ca54a6';

    // ✅ Optional: ensure business ID exists
    if (!body.businessId) {
      body.businessId = '731a954915ce7768e190acd29eb08e8a853c3ab8';
    }

    // 🧠 Validate input
    if (!body.email || !body.phoneNumber || !body.name) {
      console.error('❌ Missing required fields in request body:', body);
      return NextResponse.json(
        { error: 'Missing required fields in request body', received: body },
        { status: 400 },
      );
    }

    // 📱 Convert phone number: +234 to 0
    if (body.phoneNumber && typeof body.phoneNumber === 'string') {
      console.log(`📱 Original phone number: ${body.phoneNumber}`);

      // Remove any spaces from the phone number first
      body.phoneNumber = body.phoneNumber.replace(/\s+/g, '');

      // Check if phone number starts with +234
      if (body.phoneNumber.startsWith('+234')) {
        // Replace +234 with 0
        body.phoneNumber = '0' + body.phoneNumber.substring(4);
        console.log(
          `✅ Converted +234 to 0. New phone number: ${body.phoneNumber}`,
        );
      }
      // Also check for 234 without plus (if someone sends 234 instead of +234)
      else if (
        body.phoneNumber.startsWith('234') &&
        body.phoneNumber.length > 3
      ) {
        // Check if it's exactly "234" followed by more digits (not just "234" alone)
        body.phoneNumber = '0' + body.phoneNumber.substring(3);
        console.log(
          `✅ Converted 234 to 0. New phone number: ${body.phoneNumber}`,
        );
      }
      // If phone number already starts with 0, keep it as is
      else if (!body.phoneNumber.startsWith('0')) {
        console.warn(
          `⚠️ Phone number doesn't start with 0 or +234: ${body.phoneNumber}`,
        );
        console.log(`ℹ️ Keeping phone number as is: ${body.phoneNumber}`);
      }

      // Additional validation: ensure phone number contains only digits after processing
      const digitsOnly = body.phoneNumber.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        console.error(`❌ Invalid phone number length: ${body.phoneNumber}`);
        return NextResponse.json(
          { error: 'Invalid phone number format or length' },
          { status: 400 },
        );
      }
    }

    console.log('📦 Sending request to PaymentPoint API with body:', body);

    // 📨 Send request to PaymentPoint API
    const resp = await fetch(
      'https://api.paymentpoint.co/api/v1/createVirtualAccount',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiSecret}`,
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await resp.json().catch(() => null);

    // ✅ Log response from PaymentPoint
    console.log('📩 PaymentPoint API Response:', {
      status: resp.status,
      ok: resp.ok,
      data,
    });

    if (!resp.ok) {
      console.error('❌ PaymentPoint API Error:', data);
      return NextResponse.json(
        { error: data?.message || 'PaymentPoint API error', details: data },
        { status: resp.status },
      );
    }

    console.log('✅ Virtual account successfully created:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error('🔥 Server route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}
