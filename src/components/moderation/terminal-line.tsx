export type TerminalEntry = {
  id: string;
  command?: string;
  status: "success" | "error" | "info" | "input";
  message: string;
};

const statusColors: Record<TerminalEntry["status"], string> = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-slate-300",
  input: "text-sky-300",
};

export function TerminalLine({ entry }: { entry: TerminalEntry }) {
  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {entry.command && (
        <p className="text-sky-300">
          <span className="text-green-400">$</span> {entry.command}
        </p>
      )}
      <p className={statusColors[entry.status]}>{entry.message}</p>
    </div>
  );
}
