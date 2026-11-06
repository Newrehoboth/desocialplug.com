import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({ message: "Webhook path is active and ready." });
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Webhook Error: Missing Supabase Keys');
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 200 }); // Return 200 so PocketFi stops retrying
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(req.url);
    const panelId = searchParams.get('panelId');

    if (!panelId) {
      return NextResponse.json({ error: "Missing Panel ID" }, { status: 200 });
    }

    const data = await req.json();
    
    // PocketFi Structure
    const transaction = data.transaction || {};
    const order = data.order || {};
    const reference = transaction.reference || order.reference || `manual_${Date.now()}`;
    const amount = Number(order.settlement_amount || order.amount || 0);
    
    const accountNumber = (
      transaction.account || 
      transaction.accountNumber || 
      order.account || 
      data.account_number || 
      ''
    ).toString().trim();

    if (!accountNumber || amount <= 0) {
      return NextResponse.json({ message: "Invalid data received", success: false }, { status: 200 });
    }

    // Call the Smart Function we created in the SQL editor
    const { data: result, error: rpcError } = await supabase.rpc('handle_child_panel_payment', {
      p_panel_id: panelId,
      p_account_number: accountNumber,
      p_amount: amount,
      p_reference: reference
    });

    if (rpcError) {
      console.error('Database RPC Error:', rpcError);
      return NextResponse.json({ error: rpcError.message, success: false }, { status: 200 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment processed successfully",
      result
    }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Crash:', error.message);
    return NextResponse.json({ error: "Internal processing error", success: false }, { status: 200 });
  }
}
