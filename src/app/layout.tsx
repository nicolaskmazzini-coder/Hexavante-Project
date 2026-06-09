import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hexavante",
  description: "Plataforma educacional para estudantes e instituições",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} app-shell antialiased font-sans`}>
        <ErrorBoundary>
          <ToastProvider>{children}</ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
