"use client";



import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";



export function MaintenancePanel() {

  const [enabled, setEnabled] = useState(false);

  const [message, setMessage] = useState("Estamos em manutenção. Voltamos em breve!");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState("");

  const [canManage, setCanManage] = useState(false);



  useEffect(() => {

    void fetch("/api/moderation/settings")

      .then((res) => res.json())

      .then((data: { maintenance?: { enabled?: boolean; message?: string }; canManageMaintenance?: boolean }) => {

        setEnabled(Boolean(data.maintenance?.enabled));

        if (data.maintenance?.message) setMessage(data.maintenance.message);

        setCanManage(Boolean(data.canManageMaintenance));

      })

      .catch(() => undefined);

  }, []);



  const save = async () => {

    setLoading(true);

    const cmd = `/manutencao ${enabled ? "on" : "off"} "${message}"`;

    const res = await fetch("/api/moderation/terminal", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ command: cmd }),

    });

    const data = (await res.json()) as { message: string };

    setResult(data.message);

    setLoading(false);

  };



  if (!canManage) {

    return (

      <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-6">

        <h3 className="text-lg font-bold text-white">Modo manutenção</h3>

        <p className="mt-2 text-sm text-slate-400">

          Apenas superadmin pode ativar ou desativar o modo manutenção.

        </p>

      </div>

    );

  }



  return (

    <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-6">

      <h3 className="text-lg font-bold text-white">Modo manutenção</h3>

      <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">

        <input

          type="checkbox"

          checked={enabled}

          onChange={(e) => setEnabled(e.target.checked)}

          className="h-4 w-4 rounded border-white/20"

        />

        Ativar modo manutenção

      </label>

      <Textarea

        className="mt-3"

        value={message}

        onChange={(e) => setMessage(e.target.value)}

        rows={3}

        placeholder="Mensagem exibida aos usuários"

      />

      <Button className="mt-3" onClick={() => void save()} disabled={loading}>

        {loading ? "Salvando..." : "Salvar"}

      </Button>

      {result && <p className="mt-3 text-sm text-slate-300">{result}</p>}

    </div>

  );

}


