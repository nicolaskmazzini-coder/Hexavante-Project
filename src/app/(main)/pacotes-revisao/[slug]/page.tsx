import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { getReviewPackContent } from "@/services/review-pack.service";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ReviewPackPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;
  const pack = await getReviewPackContent(session.user.id, slug);

  if (!pack) {
    return (
      <PageShell>
        <PageHeader
          badge="Revisão"
          icon={BookOpen}
          title="Pacote indisponível"
          description="Este pacote não existe ou você não tem acesso ativo. Compre ou renove na loja."
        />
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Ir para a loja
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        badge="Pacote de revisão"
        icon={BookOpen}
        title={pack.storeItem.name}
        description={pack.storeItem.description}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-violet-100">
          Tema: {pack.topic}
        </span>
        <span>{pack.questions.length} questões selecionadas</span>
        {pack.inventory?.expiresAt && (
          <span>
            Válido até{" "}
            {new Date(pack.inventory.expiresAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {pack.questions.map((question, index) => (
          <article
            key={question.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Questão {index + 1} · {question.examTitle}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-200">{question.statement}</p>
            <ul className="mt-4 space-y-2">
              {question.alternatives.map((alt) => (
                <li
                  key={alt.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    alt.isCorrect
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                      : "border-white/10 bg-white/[0.02] text-slate-300"
                  }`}
                >
                  {alt.text}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
