import { EquippedTheme } from "@/components/shop/equipped-theme";
import { ThemeStyles } from "@/components/shop/theme-styles";
import { getLayoutSessionAndCosmetics } from "@/lib/layout-cosmetics";

/** Aplica tema equipado em todas as rotas (inclui auth e manutenção quando logado). */
export async function GlobalThemeLayer() {
  const { cosmetics } = await getLayoutSessionAndCosmetics();

  return (
    <>
      <ThemeStyles themeId={cosmetics.themeId} />
      <EquippedTheme themeId={cosmetics.themeId} themeClassName={cosmetics.themeClassName} />
    </>
  );
}
