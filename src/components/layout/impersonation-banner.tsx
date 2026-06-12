"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  username: string;
  impersonatorUsername?: string;
};

export function ImpersonationBanner({ username, impersonatorUsername }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const stop = async () => {
    setLoading(true);
    try {
      await fetch("/api/moderation/impersonate", { method: "DELETE" });
      router.refresh();
      router.push("/moderacao/usuarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[10003] bg-yellow-500 py-2 text-center text-sm font-medium text-black">
      Você está vendo como @{username}
      {impersonatorUsername ? (
        <span className="ml-2 text-black/70">(conta real: @{impersonatorUsername})</span>
      ) : null}
      <button
        type="button"
        onClick={() => void stop()}
        disabled={loading}
        className="ml-4 underline hover:no-underline disabled:opacity-60"
      >
        {loading ? "Saindo..." : "Sair"}
      </button>
    </div>
  );
}
