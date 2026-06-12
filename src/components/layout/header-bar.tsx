import Link from "next/link";
import { Hexagon } from "lucide-react";
import { HeaderWalletBadge } from "@/components/gamification/header-wallet-badge";
import { HeaderXpBadge } from "@/components/gamification/header-xp-badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Avatar } from "@/components/ui/avatar";
import type { NavSession } from "@/lib/nav-session";
import { HeaderAuthActions } from "./header-auth-actions";
import { HeaderSignOut } from "./header-sign-out";
import { SearchBar } from "./search-bar";

type Props = {
  session: NavSession;
  menuToggle: React.ReactNode;
};

export function HeaderBar({ session, menuToggle }: Props) {
  return (
    <header className="hx-header-bar sticky top-0 border-b border-white/10 bg-[#06080f]/82 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        {menuToggle}

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 sm:gap-2.5"
          aria-label="Hexavante - Página inicial"
        >
          <span className="hx-icon-box shadow-lg shadow-sky-950/30">
            <Hexagon className="h-5 w-5" />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-white transition-colors group-hover:text-sky-200 sm:inline">
            HEXAVANTE
          </span>
        </Link>

        <div className="min-w-0 flex-1 px-1 sm:px-2">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-1.5 text-sm sm:gap-2">
          {session?.user ? (
            <>
              <HeaderWalletBadge userId={session.user.id} />
              <HeaderXpBadge userId={session.user.id} />
              <NotificationBell />
              <Link
                href={`/perfil/${session.user.username}`}
                className="hidden rounded-full transition hover:ring-2 hover:ring-sky-400/40 sm:inline-flex"
                aria-label={`Perfil de @${session.user.username}`}
              >
                <Avatar src={session.user.image} alt={session.user.username} size="sm" />
              </Link>
              <HeaderSignOut />
            </>
          ) : (
            <HeaderAuthActions />
          )}
        </nav>
      </div>
    </header>
  );
}
