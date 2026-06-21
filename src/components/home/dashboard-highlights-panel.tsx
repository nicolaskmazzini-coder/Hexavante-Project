import Link from "next/link";
import { Award, Calendar, Radio, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCertificatePublicPath } from "@/lib/certificate-share";
import type { DashboardHighlights } from "@/services/dashboard-goals.service";

type Props = {
  highlights: DashboardHighlights;
};

function formatEventDate(date: Date): string {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardHighlightsPanel({ highlights }: Props) {
  const { lastCertificate, nextGoal, nextLiveEvent } = highlights;
  const hasContent = lastCertificate || nextGoal || nextLiveEvent;

  if (!hasContent) return null;

  return (
    <section className="mt-8 grid gap-3 md:grid-cols-3">
      {nextGoal && (
        <Card padding="md" className="border-sky-400/20 bg-sky-400/5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-sky-400/25 bg-sky-400/10 text-sky-300">
              <Target className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-300">Próxima meta</p>
              <p className="mt-1 truncate font-semibold text-white">{nextGoal.courseTitle}</p>
              <p className="mt-1 text-sm text-slate-400">{nextGoal.label}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${nextGoal.progress}%` }}
                />
              </div>
              <Link
                href={`/courses/${nextGoal.courseSlug}/learn`}
                className="mt-3 inline-block text-sm font-semibold text-sky-300 hover:text-sky-200"
              >
                Continuar curso →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {lastCertificate && (
        <Card padding="md" className="border-amber-400/20 bg-amber-400/5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <Award className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
                Último certificado
              </p>
              <p className="mt-1 truncate font-semibold text-white">{lastCertificate.courseTitle}</p>
              <p className="mt-1 text-sm text-slate-400">
                {new Date(lastCertificate.issuedAt).toLocaleDateString("pt-BR")}
              </p>
              <Link
                href={getCertificatePublicPath(lastCertificate.code)}
                className="mt-3 inline-block text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Compartilhar certificado →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {nextLiveEvent && (
        <Card
          padding="md"
          className={
            nextLiveEvent.status === "LIVE"
              ? "border-red-400/25 bg-red-400/5"
              : "border-violet-400/20 bg-violet-400/5"
          }
        >
          <div className="flex items-start gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${
                nextLiveEvent.status === "LIVE"
                  ? "border-red-400/30 bg-red-400/10 text-red-300"
                  : "border-violet-400/25 bg-violet-400/10 text-violet-300"
              }`}
            >
              <Radio className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-violet-300">
                  Próximo evento
                </p>
                {nextLiveEvent.status === "LIVE" && <Badge variant="red">Ao vivo</Badge>}
              </div>
              <p className="mt-1 truncate font-semibold text-white">{nextLiveEvent.title}</p>
              <p className="mt-1 text-sm text-slate-400">
                {nextLiveEvent.instructorName}
                {nextLiveEvent.courseTitle ? ` · ${nextLiveEvent.courseTitle}` : ""}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                {formatEventDate(nextLiveEvent.scheduledAt)}
              </p>
              <Link
                href={nextLiveEvent.href}
                className="mt-3 inline-block text-sm font-semibold text-violet-300 hover:text-violet-200"
              >
                {nextLiveEvent.status === "LIVE" ? "Entrar agora →" : "Ver sala →"}
              </Link>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}
