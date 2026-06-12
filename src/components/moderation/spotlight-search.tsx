"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

type UserHit = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  isBanned: boolean;
  isMuted: boolean;
};

export function SpotlightSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserHit[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/moderation/users?search=${encodeURIComponent(q)}&limit=8`);
    const data = (await res.json()) as { users: UserHit[] };
    setResults(data.users ?? []);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10004] flex items-start justify-center bg-black/60 p-4 pt-[15vh]">
      <div className="w-full max-w-lg rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#1e1e2e] px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <Input
            autoFocus
            placeholder="Buscar usuário, @username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent shadow-none focus:ring-0"
          />
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500">
            Esc
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.map((user) => (
            <li key={user.id}>
              <Link
                href={`/perfil/${user.username}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.06]"
              >
                <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{user.fullName}</p>
                  <p className="text-sm text-slate-400">
                    @{user.username} · Nível {user.level}
                  </p>
                </div>
                {user.isBanned && <span className="text-xs text-red-400">Banido</span>}
                {user.isMuted && !user.isBanned && (
                  <span className="text-xs text-amber-400">Mute</span>
                )}
              </Link>
            </li>
          ))}
          {query.length >= 2 && results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">Nenhum resultado.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
