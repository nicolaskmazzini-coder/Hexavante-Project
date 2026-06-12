import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/moderation/permissions";
import { canModerate } from "@/lib/permissions";
import { getRealRolesFromToken, getRequestToken } from "@/services/impersonation.service";
import { getPlatformSettingsSnapshot } from "@/services/platform-settings.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canModerate(session.user.roles)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const token = await getRequestToken(request);
  const realRoles = getRealRolesFromToken(token);
  const settings = await getPlatformSettingsSnapshot();

  return NextResponse.json({
    ...settings,
    canManageMaintenance: isSuperAdmin(realRoles),
    canImpersonate: isSuperAdmin(realRoles),
  });
}
