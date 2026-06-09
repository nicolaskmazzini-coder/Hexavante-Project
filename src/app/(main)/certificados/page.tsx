import { Award, CheckCircle2, FileBadge } from "lucide-react";
import { getUserCertificatesAction } from "@/app/actions/certificate";
import { auth } from "@/auth";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { redirect } from "next/navigation";

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/certificados");

  const certificates = await getUserCertificatesAction();

  return (
    <PageShell>
      <PageHeader
        badge="Conquistas"
        icon={Award}
        title="Meus certificados"
        description="Certificados dos cursos que você completou."
      />
      <AppLink href="/certificados/verificar" className="mb-8 inline-block">
        Verificar um certificado por código →
      </AppLink>

      {certificates.length === 0 ? (
        <EmptyState
          icon={FileBadge}
          title="Você ainda não possui certificados."
          description="Complete um curso para emitir o seu."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} padding="lg" className="transition hover:border-amber-400/30 hover:bg-white/[0.06]">
              <CardHeader>
                <span className="hx-icon-box border-amber-400/20 bg-amber-400/10 text-amber-200">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>{cert.course.title}</CardTitle>
                  <p className="text-sm text-slate-400">{cert.course.category.name}</p>
                </div>
              </CardHeader>

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
                <div className="mt-4">
                  <Badge variant="emerald" className="w-full justify-center py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Verificado em {new Date(cert.verifiedAt).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
