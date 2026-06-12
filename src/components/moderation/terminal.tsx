"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_TERMINAL_COMMANDS } from "@/lib/moderation/commands";
import { TerminalLine, type TerminalEntry } from "./terminal-line";

export function ModerationTerminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: "welcome",
      status: "info",
      message: "Terminal Hexavante — digite /help para ver os comandos.",
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const pushEntry = useCallback((entry: Omit<TerminalEntry, "id">) => {
    setHistory((prev) => [...prev, { ...entry, id: `${Date.now()}-${prev.length}` }]);
  }, []);

  const executeCommand = useCallback(async () => {
    const cmd = input.trim();
    if (!cmd || loading) return;

    if (cmd.toLowerCase() === "/clear") {
      setHistory([]);
      setInput("");
      setHistoryIndex(-1);
      return;
    }

    pushEntry({ command: cmd, status: "input", message: "" });
    setCommandHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)].slice(0, 50));
    setHistoryIndex(-1);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/moderation/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = (await res.json()) as {
        status?: string;
        message?: string;
        error?: string;
        data?: { redirect?: string };
      };
      pushEntry({
        status: (data.status as TerminalEntry["status"]) ?? (res.ok ? "success" : "error"),
        message: data.message ?? data.error ?? "Erro desconhecido.",
      });
      if (data.data?.redirect) {
        window.location.href = data.data.redirect;
      }
    } catch {
      pushEntry({ status: "error", message: "❌ Falha de rede ao executar comando." });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, pushEntry]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(idx);
      setInput(commandHistory[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIndex - 1, -1);
      setHistoryIndex(idx);
      setInput(idx === -1 ? "" : commandHistory[idx]);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      void executeCommand();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = input.trim().toLowerCase();
      const match = ALL_TERMINAL_COMMANDS.find((c) => c.startsWith(trimmed));
      if (match) setInput(`${match} `);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] font-mono">
      <div className="flex items-center justify-between border-b border-[#1e1e2e] bg-[#111120] px-4 py-2">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="text-sm text-gray-400">Terminal Hexavante — Moderação</span>
        <button
          type="button"
          onClick={() => setHistory([])}
          className="text-xs text-gray-500 transition hover:text-white"
        >
          Limpar
        </button>
      </div>

      <div className="h-96 space-y-2 overflow-y-auto p-4">
        {history.map((entry) => (
          <TerminalLine key={entry.id} entry={entry} />
        ))}
        {loading && <p className="text-sm text-slate-500">Executando...</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-[#1e1e2e] px-4 py-3">
        <span className="text-green-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando... (ex: /help)"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          autoFocus
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => void executeCommand()}
          disabled={loading || !input.trim()}
          className="rounded bg-green-600 px-3 py-1 text-xs text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          Executar
        </button>
      </div>
    </div>
  );
}
