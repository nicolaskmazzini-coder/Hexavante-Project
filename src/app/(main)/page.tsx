import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, Award, BookOpen, Building2, Radio, Target } from "lucide-react";

const highlights = [
  { label: "Cursos", value: "Aprendizado guiado", icon: BookOpen, tone: "text-sky-300 bg-sky-400/10" },
  { label: "Simulados", value: "Prática com desempenho", icon: Target, tone: "text-teal-300 bg-teal-400/10" },
  { label: "Certificados", value: "Evolução registrada", icon: Award, tone: "text-amber-300 bg-amber-400/10" },
];

const shortcuts = [
  { href: "/courses", label: "Catálogo de cursos", icon: BookOpen },
  { href: "/simulados", label: "Simulados", icon: Target },
  { href: "/live-rooms", label: "Aulas ao vivo", icon: Radio },
  { href: "/schools", label: "HexaSchools", icon: Building2 },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
            Plataforma educacional Hexavante
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Aprenda, pratique e acompanhe seu progresso em um só lugar.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Cursos, simulados, aulas ao vivo e gamificação para estudantes do ensino técnico,
            universitários de TI e candidatos ao ENEM.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#1d4ed8] hover:-translate-y-0.5"
              aria-label="Explorar cursos disponíveis na plataforma"
            >
              Explorar cursos
              <ArrowRight className="h-4 w-4" />
            </Link>
            {session?.user ? (
              <Link
                href="/perfil"
                className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10"
                aria-label="Abrir perfil"
              >
                Meu progresso
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10"
                aria-label="Criar nova conta na plataforma"
              >
                Criar conta
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-semibold text-white">Painel do estudante</p>
              <p className="mt-1 text-xs text-slate-400">Visão rápida da jornada</p>
            </div>
            <span className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
              Ativo
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.04]/70 p-4">
                  <span className={`grid h-10 w-10 place-items-center rounded-lg ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-sky-400/35 hover:bg-sky-400/10"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                <Icon className="h-4 w-4 text-sky-300" />
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-sky-200" />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
