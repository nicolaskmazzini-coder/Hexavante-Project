"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Eye, Plus, Shield, UserRound, VolumeX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { UserActionModals, type ModUser } from "./action-modals";

export function UserTable() {
  const [users, setUsers] = useState<ModUser[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ModUser | null>(null);
  const [modal, setModal] = useState<"addxp" | "cargo" | "mute" | "ban" | null>(null);
  const [canImpersonate, setCanImpersonate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (role !== "all") params.set("role", role);
    const res = await fetch(`/api/moderation/users?${params}`);
    const data = (await res.json()) as { users: ModUser[] };
    setUsers(data.users ?? []);
    setLoading(false);
  }, [search, status, role]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    void fetch("/api/moderation/settings")
      .then((res) => res.json())
      .then((data: { canImpersonate?: boolean }) => setCanImpersonate(Boolean(data.canImpersonate)))
      .catch(() => undefined);
  }, []);

  const impersonate = async (user: ModUser) => {
    const res = await fetch("/api/moderation/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error ?? "Erro ao impersonar.");
      return;
    }
    globalThis.location.assign("/");
  };

  const openModal = (user: ModUser, type: typeof modal) => {
    setSelected(user);
    setModal(type);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome ou @username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="banned">Banidos</SelectItem>
          <SelectItem value="muted">Silenciados</SelectItem>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectItem value="all">Todos os cargos</SelectItem>
          <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="MODERATOR">Moderador</SelectItem>
          <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
          <SelectItem value="USER">Usuário</SelectItem>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-slate-400">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Nível</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Moedas</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
                      <div>
                        <p className="font-medium text-white">@{user.username}</p>
                        <p className="text-xs text-slate-500">{user.fullName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.level}</td>
                  <td className="px-4 py-3 text-slate-300">{user.xp}</td>
                  <td className="px-4 py-3 text-slate-300">{user.coins}</td>
                  <td className="px-4 py-3 text-slate-300">{user.roles.join(", ") || "USER"}</td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="text-red-400">Banido</span>
                    ) : user.isMuted ? (
                      <span className="text-amber-400">Silenciado</span>
                    ) : (
                      <span className="text-green-400">Ativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <ActionBtn
                        icon={Eye}
                        label="Perfil"
                        onClick={() => window.open(`/perfil/${user.username}`, "_blank")}
                      />
                      {canImpersonate &&
                      !user.roles.some((r) => ["MODERATOR", "ADMIN", "SUPERADMIN"].includes(r)) ? (
                        <ActionBtn
                          icon={UserRound}
                          label="Ver como"
                          onClick={() => void impersonate(user)}
                        />
                      ) : null}
                      <ActionBtn icon={Plus} label="XP" onClick={() => openModal(user, "addxp")} />
                      <ActionBtn
                        icon={Shield}
                        label="Cargo"
                        onClick={() => openModal(user, "cargo")}
                      />
                      <ActionBtn
                        icon={VolumeX}
                        label="Mute"
                        onClick={() => openModal(user, "mute")}
                      />
                      <ActionBtn icon={Ban} label="Ban" onClick={() => openModal(user, "ban")} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserActionModals
        user={selected}
        modal={modal}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        onSuccess={() => void load()}
      />
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-sky-400/30 hover:text-white"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
