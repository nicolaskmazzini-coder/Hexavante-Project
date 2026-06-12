"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ModUser = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  coins: number;
  roles: string[];
  isBanned: boolean;
  isMuted: boolean;
  warnings: number;
};

type Props = {
  user: ModUser | null;
  modal: "addxp" | "cargo" | "mute" | "ban" | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function UserActionModals({ user, modal, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24h");
  const [role, setRole] = useState("MODERATOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || !modal) return null;

  const runCommand = async (command: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/moderation/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = (await res.json()) as { status: string; message: string };
      if (data.status === "error") {
        setError(data.message);
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Falha ao executar ação.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    addxp: "Adicionar XP",
    cargo: "Alterar cargo",
    mute: "Silenciar usuário",
    ban: "Banir usuário",
  };

  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{titles[modal]}</h3>
        <p className="mt-1 text-sm text-slate-400">
          @{user.username} · {user.fullName}
        </p>

        <div className="mt-4 space-y-3">
          {modal === "addxp" && (
            <div>
              <label className="mb-1 block text-sm text-slate-400">Quantidade de XP</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
              />
            </div>
          )}
          {modal === "cargo" && (
            <Select value={role} onValueChange={setRole}>
              <SelectItem value="USER">Usuário</SelectItem>
              <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
              <SelectItem value="MODERATOR">Moderador</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </Select>
          )}
          {modal === "mute" && (
            <Select value={duration} onValueChange={setDuration}>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </Select>
          )}
          {(modal === "ban" || modal === "mute") && (
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                {modal === "ban" ? "Motivo (obrigatório)" : "Motivo"}
              </label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={modal === "ban" ? "danger" : "default"}
            disabled={loading || ((modal === "ban" || modal === "mute") && !reason.trim())}
            onClick={() => {
              if (modal === "addxp") {
                void runCommand(`/addxp @${user.username} ${amount}`);
              } else if (modal === "cargo") {
                void runCommand(`/addcargo @${user.username} ${role}`);
              } else if (modal === "mute") {
                void runCommand(`/mute @${user.username} ${duration} "${reason}"`);
              } else if (modal === "ban") {
                void runCommand(`/ban @${user.username} "${reason}"`);
              }
            }}
          >
            {loading ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
