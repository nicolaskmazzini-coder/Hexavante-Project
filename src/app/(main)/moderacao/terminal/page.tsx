import { ModerationTerminal } from "@/components/moderation/terminal";

export default function ModerationTerminalPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Execute comandos com <code className="text-sky-300">/help</code> para listar todos. Use{" "}
        <kbd className="rounded border border-white/10 px-1">Tab</kbd> para autocompletar e{" "}
        <kbd className="rounded border border-white/10 px-1">↑</kbd>
        <kbd className="rounded border border-white/10 px-1">↓</kbd> para histórico.
      </p>
      <ModerationTerminal />
    </div>
  );
}
