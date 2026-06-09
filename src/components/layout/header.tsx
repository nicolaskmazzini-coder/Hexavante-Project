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
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Hexavante - Página inicial">
            <span className="hx-icon-box shadow-lg shadow-sky-950/30">
              <Hexagon className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white transition-colors group-hover:text-sky-200">
              HEXAVANTE
            </span>
          </Link>

          <nav className="hidden gap-1 sm:flex" aria-label="Navegação principal">
            <Link href="/courses" className="hx-nav-link">
              Cursos
            </Link>
            <Link href="/simulados" className="hx-nav-link">
              Simulados
            </Link>
            {session && (
              <Link href="/live-rooms" className="hx-nav-link text-teal-200 hover:bg-teal-400/10 hover:text-teal-100">
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
              <Link href="/perfil" className="hx-nav-link hidden sm:inline">
                @{session.user.username}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="hx-btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hx-btn-secondary min-h-9 px-3 py-1.5 text-sm">
                Entrar
              </Link>
              <Link href="/register" className="hx-btn-primary min-h-9 px-3 py-1.5 text-sm">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
