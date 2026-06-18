"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  date: string;
  usuarios: number;
  simulados: number;
  xpGanho: number;
};

export function ActivityChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-4 text-sm font-semibold text-white">Atividade — últimos 7 dias</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#111120", border: "1px solid #1e1e2e", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="usuarios"
            name="Usuários"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="simulados"
            name="Simulados"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="xpGanho"
            name="XP ganho"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
