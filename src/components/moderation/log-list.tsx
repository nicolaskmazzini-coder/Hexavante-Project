"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";

type Log = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  moderator: string;
  targetUser: string | null;
};

const logColors: Record<string, string> = {
  BAN: "text-red-400",
  UNBAN: "text-green-400",
  MUTE: "text-amber-400",
  WARN: "text-yellow-400",
  XP_ADD: "text-sky-400",
  COIN_ADD: "text-amber-300",
  ROLE_ADD: "text-violet-400",
  BROADCAST: "text-teal-400",
};

export function LogList() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (search) params.set("search", search);
    const res = await fetch(`/api/moderation/logs?${params}`);
    const data = (await res.json()) as { logs: Log[] };
    setLogs(data.logs ?? []);
    setLoading(false);
  }, [type, search]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={type} onValueChange={setType}>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="BAN">Ban</SelectItem>
          <SelectItem value="UNBAN">Unban</SelectItem>
          <SelectItem value="MUTE">Mute</SelectItem>
          <SelectItem value="WARN">Advertência</SelectItem>
          <SelectItem value="XP_ADD">XP</SelectItem>
          <SelectItem value="COIN_ADD">Moedas</SelectItem>
          <SelectItem value="ROLE_ADD">Cargo</SelectItem>
          <SelectItem value="BROADCAST">Broadcast</SelectItem>
        </Select>
        <Input
          placeholder="Filtrar por usuário ou ação"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
        />
      </div>

      <ul className="space-y-2">
        {loading ? (
          <li className="py-8 text-center text-slate-500">Carregando logs...</li>
        ) : logs.length === 0 ? (
          <li className="py-8 text-center text-slate-500">Nenhum log encontrado.</li>
        ) : (
          logs.map((log) => (
            <li
              key={log.id}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                <span className={logColors[log.action] ?? "text-slate-400"}>{log.action}</span>
                <span>por @{log.moderator}</span>
                {log.targetUser && <span>→ @{log.targetUser}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-200">{log.description}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
