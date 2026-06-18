"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_COOKIE = "hx_cookie_consent";
const CONSENT_DURATION_DAYS = 365;

function readConsentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)hx_cookie_consent=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function writeConsentCookie(value: "accepted" | "declined") {
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_DURATION_DAYS);
  document.cookie = [
    `${CONSENT_COOKIE}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsentCookie()) {
      // document.cookie is not available on the server — this SSR-safe check is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAccept() {
    writeConsentCookie("accepted");
    setVisible(false);
  }

  function handleDecline() {
    writeConsentCookie("declined");
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-zinc-900/95 backdrop-blur-sm shadow-2xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Usamos cookies essenciais para manter sua sessão e cookies analíticos para melhorar a
          plataforma.{" "}
          <Link
            href="/privacidade"
            className="underline underline-offset-2 hover:text-white transition-colors"
          >
            Política de Privacidade
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
          >
            Recusar não-essenciais
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
