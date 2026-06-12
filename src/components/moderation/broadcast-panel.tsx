"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function BroadcastPanel() {
  const [title, setTitle] = useState("Aviso da plataforma");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult("");
    const res = await fetch("/api/moderation/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `/broadcast "${message}"` }),
    });
    const data = (await res.json()) as { message: string };
    setResult(data.message);
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-6">
      <h3 className="text-lg font-bold text-white">Broadcast de notificação</h3>
      <p className="mt-1 text-sm text-slate-400">Envia aviso para todos os usuários da plataforma.</p>
      <div className="mt-4 space-y-3">
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Mensagem da notificação"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <Button onClick={() => void send()} disabled={loading || !message.trim()}>
          {loading ? "Enviando..." : "Enviar para todos"}
        </Button>
        {result && <p className="text-sm text-slate-300">{result}</p>}
      </div>
    </div>
  );
}
