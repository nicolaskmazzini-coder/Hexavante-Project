import { Award, CheckCircle2, FileBadge } from "lucide-react";
import { getUserCertificatesAction } from "@/app/actions/certificate";
import { auth } from "@/auth";

export default async function CertificatesPage() {
  const session = await auth();
  const certificates = session?.user?.id ? await getUserCertificatesAction() : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
          <Award className="h-3.5 w-3.5" />
          Conquistas
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Meus certificados</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Certificados dos cursos que você completou.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <FileBadge className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 font-semibold text-slate-200">Você ainda não possui certificados.</p>
          <p className="mt-1 text-sm text-slate-500">Complete um curso para emitir o seu.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert: any) => (
            <div
              key={cert.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition hover:border-amber-400/30 hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400/10 text-amber-200">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-snug text-white">
                    {cert.course.title}
                  </h3>
                  <p className="text-sm text-slate-400">{cert.course.category.name}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between gap-4 text-slate-300">
                  <span>Emitido para</span>
                  <span className="text-right font-semibold text-white">{cert.user.fullName}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-300">
                  <span>Código</span>
                  <span className="text-right font-semibold text-sky-200">{cert.code}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-300">
                  <span>Data</span>
                  <span>{new Date(cert.issuedAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              {cert.verifiedAt && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Verificado em {new Date(cert.verifiedAt).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
