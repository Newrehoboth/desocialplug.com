import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        financialPin: "444666",
        isMaintenanceMode: false,
        maintenanceTitle: "System Under Maintenance",
        maintenanceMessage: "De'socialPlug is currently undergoing scheduled maintenance to improve performance and security. Please check back soon.",
      });
    }

    return NextResponse.json({
      success: true,
      isMaintenanceMode: settings.isMaintenanceMode ?? false,
      globalPurchasingEnabled: settings.globalPurchasingEnabled ?? true,
      maintenanceTitle: settings.maintenanceTitle ?? "System Under Maintenance",
      maintenanceMessage: settings.maintenanceMessage ?? "De'socialPlug is currently undergoing scheduled maintenance to improve performance and security. Please check back soon.",
    });
  } catch (error: any) {
    console.error("Error fetching system settings on user side:", error);
    return NextResponse.json(
      {
        success: false,
        isMaintenanceMode: false,
        globalPurchasingEnabled: true,
        maintenanceTitle: "System Under Maintenance",
        maintenanceMessage: "De'socialPlug is currently undergoing scheduled maintenance.",
      },
      { status: 500 }
    );
  }
}
