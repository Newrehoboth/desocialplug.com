import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Account from "@/models/Account";
import ChildPanel from "@/models/ChildPanel";
import GlobalSettings from "@/models/GlobalSettings";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-dsp-domain',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = req.headers.get("x-api-key");
  
  const platform = searchParams.get("platform"); 
  const subcategory = searchParams.get("subcategory"); 

  if (!apiKey) {
    return NextResponse.json({ error: "API Key is required" }, { status: 401, headers: corsHeaders });
  }

  try {
    await connectDB();
    const user = await User.findOne({ apiKey }).lean();
    if (!user) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401, headers: corsHeaders });
    }

    let query: any = {
      status: { $in: ['Available', 'Sold Out'] },
      $or: [{ visibleToUsers: true }, { visibleToUsers: { $exists: false } }],
    };

    if (platform && platform !== 'all') {
      query.platform = { $regex: platform, $options: 'i' };
    }
    
    if (subcategory) {
      query.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // Fetch accounts, child panel, and global settings in parallel
    // Fallback search by domain name if API key owner doesn't match
    const rawDomain = req.headers.get("x-dsp-domain") || "";
    const cleanDomain = rawDomain.replace(/^www\./i, '');

    const [accounts, childPanel, globalSettings] = await Promise.all([
      Account.find(query).select('+bulkLogs').lean(),
      ChildPanel.findOne({ 
        $or: [
          { userId: user._id }, 
          { userId: user._id.toString() },
          { domain: { $regex: cleanDomain, $options: 'i' } }
        ] 
      }),
      GlobalSettings.findOne()
    ]);

    // Pre-process discounts for reliable lookup
    let panelDiscounts: Record<string, number> = {};
    if (childPanel?.discounts) {
      if (childPanel.discounts instanceof Map) {
        panelDiscounts = Object.fromEntries(childPanel.discounts);
      } else {
        panelDiscounts = childPanel.discounts;
      }
    }
      
    let globalDiscounts: Record<string, number> = {};
    if (globalSettings?.globalDiscounts) {
      if (globalSettings.globalDiscounts instanceof Map) {
        globalDiscounts = Object.fromEntries(globalSettings.globalDiscounts);
      } else {
        globalDiscounts = globalSettings.globalDiscounts;
      }
    }

    // Group the data: { [platform]: { [subcategory]: [ items... ] } }
    const groupedData: Record<string, Record<string, any[]>> = {};

    accounts.forEach((acc: any) => {
      const plat = (acc.platform || 'uncategorized').toLowerCase().trim();
      const sub = acc.subcategory?.trim() || 'General';

      if (!groupedData[plat]) {
        groupedData[plat] = {};
      }
      if (!groupedData[plat][sub]) {
        groupedData[plat][sub] = [];
      }

      // Apply Discounts
      let finalPrice = acc.price || 0;
      const itemIdStr = acc._id.toString();
      
      let appliedDiscount = panelDiscounts[itemIdStr] || 0;

      // Fallback to global discount if panel-specific is missing
      if (!appliedDiscount || appliedDiscount === 0) {
        appliedDiscount = globalDiscounts[itemIdStr] || 0;
      }

      appliedDiscount = Number(appliedDiscount) || 0;

      if (appliedDiscount > 0) {
        finalPrice = (acc.price || 0) * (1 - appliedDiscount / 100);
      }

      groupedData[plat][sub].push({
        itemId: acc._id,
        type: acc.type || '',
        name: acc.account || acc.olaz || '',
        price: finalPrice,
        followers: acc.followers || 0,
        logsCount: acc.logs || 0,
        availableLogsCount: acc.bulkLogs ? acc.bulkLogs.length : 0,
        description: acc.description || '',
        vpnType: acc.vpnType || '',
        mailIncluded: acc.mailIncluded || false,
        logs: acc.bulkLogs || []
      });
    });

    // We return ONLY the platforms to keep child panel parsing simple
    return NextResponse.json(groupedData, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching public logs API:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
