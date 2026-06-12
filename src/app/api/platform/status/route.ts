import { getPlatformSettingsSnapshot } from "@/services/platform-settings.service";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await getPlatformSettingsSnapshot();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
