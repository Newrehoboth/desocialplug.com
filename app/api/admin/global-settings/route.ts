import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GlobalSettings from '@/models/GlobalSettings';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-super-admin-key',
};

function isAuthorized(req: Request) {
  const superAdminKey = req.headers.get('x-super-admin-key');
  const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_master_secret_2025_security_bypass";
  return superAdminKey === masterSecret;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  
  try {
    await connectDB();
    let settings = await GlobalSettings.findOne().lean();
    if (!settings) {
      settings = await GlobalSettings.create({ globalDiscounts: {} });
    }
    return NextResponse.json({ success: true, settings }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  
  try {
    await connectDB();
    const { globalDiscounts } = await req.json();
    
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings({ globalDiscounts });
    } else {
      settings.globalDiscounts = globalDiscounts;
    }
    
    await settings.save();
    return NextResponse.json({ success: true, settings }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
