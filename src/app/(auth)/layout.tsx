import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5" aria-label="Hexavante - Página inicial">
        <span className="hx-icon-box shadow-lg shadow-sky-950/30">
          <Hexagon className="h-5 w-5" />
        </span>
        <span className="text-lg font-extrabold tracking-tight text-white">HEXAVANTE</span>
      </Link>
      {children}
    </div>
  );
}
