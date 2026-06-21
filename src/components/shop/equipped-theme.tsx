"use client";

import { useEffect } from "react";

type Props = {
  themeId: string | null;
  themeClassName: string;
};

export function EquippedTheme({ themeId, themeClassName }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const classes = ["theme-default", "theme-cyberpunk", "theme-hacker", "theme-obsidian"];

    classes.forEach((cls) => {
      root.classList.remove(cls);
      body.classList.remove(cls);
    });

    const active = themeId && themeClassName ? themeClassName : "theme-default";
    root.classList.add(active);
    body.classList.add(active);

    if (themeId && themeClassName) {
      root.dataset.shopTheme = themeId;
    } else {
      delete root.dataset.shopTheme;
    }

    return () => {
      classes.forEach((cls) => {
        root.classList.remove(cls);
        body.classList.remove(cls);
      });
      delete root.dataset.shopTheme;
    };
  }, [themeId, themeClassName]);

  return null;
}
