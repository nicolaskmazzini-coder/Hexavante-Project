"use client";

import { useEffect } from "react";

type Props = {
  themeId: string | null;
  themeClassName: string;
};

export function EquippedTheme({ themeId, themeClassName }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    const classes = ["theme-default", "theme-cyberpunk", "theme-hacker", "theme-obsidian"];

    classes.forEach((cls) => root.classList.remove(cls));

    if (themeId && themeClassName) {
      root.classList.add(themeClassName);
      root.dataset.shopTheme = themeId;
    } else {
      root.classList.add("theme-default");
      delete root.dataset.shopTheme;
    }

    return () => {
      classes.forEach((cls) => root.classList.remove(cls));
      delete root.dataset.shopTheme;
    };
  }, [themeId, themeClassName]);

  return null;
}
