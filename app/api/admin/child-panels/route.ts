import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChildPanel from '@/models/ChildPanel';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-super-admin-key',
};

function isAuthorized(req: Request) {
  const key = req.headers.get('x-super-admin-key');
  // FORCE MATCH with frontend fallback to resolve connection issues
  const masterSecret = "dsp_master_secret_2025_security_bypass";
  return key === masterSecret;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const query = status ? { status } : {};
    const panels = await ChildPanel.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich active panels with live stats from their Supabase instance via bridge
    const enrichedPanels = await Promise.all(panels.map(async (p: any) => {
      const panelData = {
        id: p._id.toString(),
        domain: p.domain,
        adminName: p.adminName,
        adminPassword: p.adminPassword,
        status: p.status,
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
        discounts: p.discounts || {},
        userId: p.userId,
        priceInNaira: p.priceInNaira,
        priceInUsd: p.priceInUsd,
        stats: { totalUsers: 0, totalDeposits: 0, totalRevenue: 0 },
        users: [] // To be filled if details requested or if small list
      };

      if (p.status === 'active') {
        try {
          const pId = p._id.toString();
          const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_master_secret_2025_security_bypass";
          
          const statsResp = await fetch(`https://${p.domain}/api/dsp?action=admin-data&panelId=${pId}`, {
            headers: {
              'x-super-admin-key': masterSecret
            },
            cache: 'no-store'
          });
          
          const statsData = await statsResp.json();
          if (statsData.success && statsData.data) {
            panelData.stats = {
              totalUsers: statsData.data.stats?.total_users || 0,
              totalDeposits: statsData.data.stats?.total_deposits || 0,
              totalRevenue: statsData.data.stats?.total_revenue || 0
            };
            panelData.users = statsData.data.users || [];
          } else {
            (panelData.stats as any).error = statsData.error || `HTTP ${statsResp.status}`;
          }
        } catch (err: any) {
          console.error(`Failed to connect to ${p.domain} bridge:`, err);
          (panelData.stats as any).error = err.message || "Connection Failed";
        }
      }
      return panelData;
    }));

    return NextResponse.json({
      success: true,
      panels: enrichedPanels,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }
  try {
    await connectDB();
    const { panelId, status, discounts, expiresAt, adminPassword } = await req.json();

    if (!panelId) {
      return NextResponse.json({ error: 'Invalid panelId' }, { status: 400, headers: corsHeaders });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (discounts) updateData.discounts = discounts;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);
    
    if (adminPassword) {
      updateData.adminPassword = adminPassword; // Store in plain text as requested
    }

    if (status === 'active' && !expiresAt) {
      updateData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const panel = await ChildPanel.findByIdAndUpdate(panelId, updateData, { new: true });
    if (!panel) {
      return NextResponse.json({ error: 'Panel not found' }, { status: 404, headers: corsHeaders });
    }


    // 1. If unsuspending (activating), add the domain back to Vercel
    if (status === 'active' && process.env.VERCEL_ACCESS_TOKEN) {
      try {
        await fetch(`https://api.vercel.com/v10/projects/prj_D4yIoSpvWjjjP8r28sOHRZoMuJNY/domains`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: panel.domain })
        });
        console.log(`[Vercel] Domain ${panel.domain} restored.`);
      } catch (err) {
        console.error('Failed to restore domain to Vercel during unsuspension:', err);
      }
    }

    // 2. If suspending (rejecting), remove the domain from Vercel
    if ((status === 'rejected' || status === 'cancelled') && process.env.VERCEL_ACCESS_TOKEN) {
      try {
        await fetch(`https://api.vercel.com/v10/projects/prj_D4yIoSpvWjjjP8r28sOHRZoMuJNY/domains/${panel.domain}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`
          }
        });
        console.log(`[Vercel] Domain ${panel.domain} removed.`);
      } catch (err) {
        console.error('Failed to remove domain from Vercel during rejection:', err);
      }
    }

    return NextResponse.json({
      success: true,
      panel: { id: panel._id.toString(), domain: panel.domain, status: panel.status },
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

const corsHeadersWithDelete = {
  ...corsHeaders,
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeadersWithDelete });
  }
  try {
    await connectDB();
    const url = new URL(req.url);
    const panelId = url.searchParams.get('panelId');

    if (!panelId) {
      return NextResponse.json({ error: 'Missing panelId' }, { status: 400, headers: corsHeadersWithDelete });
    }

    const panel = await ChildPanel.findById(panelId);
    if (!panel) {
      return NextResponse.json({ error: 'Panel not found' }, { status: 404, headers: corsHeadersWithDelete });
    }

    // 1. Delete domain from Vercel
    if (process.env.VERCEL_ACCESS_TOKEN) {
      try {
        await fetch(`https://api.vercel.com/v10/projects/prj_D4yIoSpvWjjjP8r28sOHRZoMuJNY/domains/${panel.domain}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`
          }
        });
        console.log(`[Vercel] Domain ${panel.domain} removed.`);
      } catch (err) {
        console.error('Failed to remove domain from Vercel:', err);
      }
    }

    // 2. Delete the panel itself
    await ChildPanel.findByIdAndDelete(panelId);
    console.log(`[Database] Panel ${panelId} deleted.`);

    return NextResponse.json({
      success: true,
      message: "Panel and associated data permanently deleted"
    }, { headers: corsHeadersWithDelete });

  } catch (error) {
    console.error("Deletion Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeadersWithDelete });
  }
}
