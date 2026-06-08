"use client";

import { useState } from "react";
import Link from "next/link";
import { canModerate, isInstructor } from "@/lib/permissions";
import { ChevronDown } from "lucide-react";

type Props = {
  session: any;
};

export function HeaderDropdown({ session }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-1 rounded-lg px-3 py-2 transition-all hover:bg-white/[0.06] hover:text-white"
        aria-label="Mais opções"
      >
        Mais
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="py-1">
            <Link
              href="/ranking"
              className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-sky-400/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Ranking
            </Link>
            <Link
              href="/certificados"
              className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-sky-400/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Certificados
            </Link>
            <Link
              href="/instructor/courses"
              className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-sky-400/10 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {isInstructor(session.user?.roles) ? "Meus cursos" : "Instrutor"}
            </Link>
            {canModerate(session.user?.roles) && (
              <Link
                href="/moderacao"
                className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-sky-400/10 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Moderação
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
