"use client";



import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Select, SelectItem } from "@/components/ui/select";



export function BoosterPanel() {

  const [multiplier, setMultiplier] = useState("2");

  const [duration, setDuration] = useState("24h");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState("");

  const [activeState, setActiveState] = useState<string | null>(null);



  useEffect(() => {

    void fetch("/api/moderation/settings")

      .then((res) => res.json())

      .then(

        (data: {

          globalBooster?: { active?: boolean; multiplier?: number; expiresAt?: string | null };

        }) => {

          const booster = data.globalBooster;

          if (booster?.active && booster.expiresAt) {

            setActiveState(

              `Ativo: x${booster.multiplier} até ${new Date(booster.expiresAt).toLocaleString("pt-BR")}`,

            );

          } else {

            setActiveState("Nenhum booster global ativo.");

          }

        },

      )

      .catch(() => undefined);

  }, [result]);



  const activate = async () => {

    setLoading(true);

    const res = await fetch("/api/moderation/terminal", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ command: `/booster ${multiplier} ${duration}` }),

    });

    const data = (await res.json()) as { message: string };

    setResult(data.message);

    setLoading(false);

  };



  return (

    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-6">

      <h3 className="text-lg font-bold text-white">Booster global</h3>

      <p className="mt-1 text-sm text-slate-400">Multiplicador de XP e moedas para toda a plataforma.</p>

      {activeState ? <p className="mt-2 text-sm text-emerald-400">{activeState}</p> : null}

      <div className="mt-4 flex flex-wrap gap-3">

        <Select value={multiplier} onValueChange={setMultiplier}>

          <SelectItem value="2">2x</SelectItem>

          <SelectItem value="3">3x</SelectItem>

          <SelectItem value="5">5x</SelectItem>

          <SelectItem value="10">10x</SelectItem>

        </Select>

        <Select value={duration} onValueChange={setDuration}>

          <SelectItem value="1h">1 hora</SelectItem>

          <SelectItem value="6h">6 horas</SelectItem>

          <SelectItem value="12h">12 horas</SelectItem>

          <SelectItem value="24h">24 horas</SelectItem>

          <SelectItem value="48h">48 horas</SelectItem>

          <SelectItem value="7d">1 semana</SelectItem>

        </Select>

        <Button onClick={() => void activate()} disabled={loading}>

          {loading ? "Ativando..." : "Ativar Booster Global 🚀"}

        </Button>

      </div>

      {result && <p className="mt-3 text-sm text-slate-300">{result}</p>}

    </div>

  );

}


