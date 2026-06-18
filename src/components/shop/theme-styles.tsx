import { buildThemeStyleBlock, resolveAppTheme } from "@/lib/cosmetics";

type Props = {
  themeId: string | null;
};

export function ThemeStyles({ themeId }: Props) {
  const theme = resolveAppTheme(themeId);
  const css = buildThemeStyleBlock(theme.id === "default" ? null : theme.id);

  if (!css) return null;

  return <style id="hexavante-equipped-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
