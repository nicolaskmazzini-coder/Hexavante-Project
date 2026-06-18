import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { getNavAvatarUrl } from "@/lib/nav-avatar";
import { toNavSession } from "@/lib/nav-session";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hexavante",
  description: "Plataforma educacional para estudantes e instituições",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const avatarUrl = session?.user?.id ? await getNavAvatarUrl(session.user.id) : null;
  const navSession = toNavSession(session, avatarUrl);

  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} app-shell antialiased font-sans`}>
        <ErrorBoundary>
          <ToastProvider>
            <AppShell session={navSession}>{children}</AppShell>
          </ToastProvider>
          <CookieBanner />
        </ErrorBoundary>
      </body>
    </html>
  );
}
