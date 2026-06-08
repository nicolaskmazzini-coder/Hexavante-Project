import Link from "next/link";
import { auth, signOut } from "@/auth";
import { HeaderXpBadge } from "@/components/gamification/header-xp-badge";
import { HeaderDropdown } from "./header-dropdown";
import { Hexagon, Radio } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080f]/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="group relative flex items-center gap-2.5 text-xl font-bold transition-all"
            aria-label="Hexavante - Página inicial"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300 shadow-lg shadow-sky-950/30">
              <Hexagon className="h-5 w-5" />
            </span>
            <span className="relative z-10 text-lg font-extrabold tracking-tight text-white transition-colors group-hover:text-sky-200">
              HEXAVANTE
            </span>
          </Link>

          <nav className="hidden gap-1 text-sm text-slate-300 sm:flex" aria-label="Navegação principal">
            <Link
              href="/courses"
              className="relative rounded-lg px-3 py-2 transition-all hover:bg-white/[0.06] hover:text-white"
              aria-label="Ver cursos disponíveis"
            >
              Cursos
            </Link>
            <Link
              href="/simulados"
              className="relative rounded-lg px-3 py-2 transition-all hover:bg-white/[0.06] hover:text-white"
              aria-label="Ver simulados disponíveis"
            >
              Simulados
            </Link>
            {session && (
              <Link
                href="/live-rooms"
                className="relative rounded-lg px-3 py-2 text-teal-200 transition-all hover:bg-teal-400/10 hover:text-teal-100"
                aria-label="Ver salas ao vivo"
              >
                <span className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  <span className="text-xs font-semibold">Ao vivo</span>
                </span>
              </Link>
            )}
            {session && <HeaderDropdown session={session} />}
          </nav>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          {session?.user ? (
            <>
              <HeaderXpBadge userId={session.user.id} />
              <Link
                href="/perfil"
                className="hidden rounded-lg px-3 py-2 text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white sm:inline"
                aria-label={`Ver perfil de ${session.user.username}`}
              >
                @{session.user.username}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-slate-200 transition-all hover:border-sky-400/40 hover:bg-sky-400/10"
                  aria-label="Sair da conta"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-slate-200 transition-all hover:border-sky-400/40 hover:bg-sky-400/10"
                aria-label="Fazer login na plataforma"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#2563eb] px-3 py-1.5 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:bg-[#1d4ed8]"
                aria-label="Criar nova conta"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
