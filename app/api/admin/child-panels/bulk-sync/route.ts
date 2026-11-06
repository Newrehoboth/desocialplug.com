import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ChildPanel from "@/models/ChildPanel";

export async function POST(req: Request) {
  const secretKey = req.headers.get("x-super-admin-key");
  const masterSecret = process.env.SUPER_ADMIN_SECRET_KEY || "dsp_master_secret_2025_security_bypass";

  if (secretKey !== masterSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { discounts } = await req.json();
    await connectDB();

    // Update ALL child panels with the provided discounts
    // This merges the global discounts into their existing discounts map
    const panels = await ChildPanel.find({});
    
    const updates = panels.map(panel => {
      const existingDiscounts = panel.discounts instanceof Map 
        ? Object.fromEntries(panel.discounts) 
        : (panel.discounts || {});
        
      const updatedDiscounts = { ...existingDiscounts, ...discounts };
      
      return ChildPanel.findByIdAndUpdate(panel._id, { 
        discounts: updatedDiscounts 
      });
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: `Updated ${panels.length} panels` });
  } catch (error: any) {
    console.error("Bulk sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
