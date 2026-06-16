export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 shadow-lg shadow-black/30 backdrop-blur">
      {children}
    </div>
  );
}
