import { safeAuth } from "@/lib/safe-auth";
import { getProfileCosmetics } from "@/services/shop.service";

const DEFAULT_COSMETICS = {
  themeId: null,
  themeClassName: "theme-default",
  avatarBorderClassName: null,
  borderId: null,
  equippedTitle: null,
};

export async function getLayoutSessionAndCosmetics() {
  const session = await safeAuth();

  if (!session?.user?.id) {
    return { session: null, cosmetics: DEFAULT_COSMETICS };
  }

  try {
    const cosmetics = await getProfileCosmetics(session.user.id);
    return { session, cosmetics };
  } catch {
    return { session, cosmetics: DEFAULT_COSMETICS };
  }
}
