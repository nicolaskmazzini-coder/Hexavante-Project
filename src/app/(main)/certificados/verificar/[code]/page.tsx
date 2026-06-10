import { Award, CheckCircle2 } from "lucide-react";
import { verifyCertificateByCode } from "@/app/actions/certificate";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { verifyCertificateCode } from "@/lib/certificate";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function VerifyCertificateByCodePage({ params }: Props) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).trim();

  if (!verifyCertificateCode(code)) {
    notFound();
  }

  const certificate = await verifyCertificateByCode(code);

  return (
    <PageShell size="md">
      <AppLink href="/certificados/verificar" muted className="mb-4 inline-flex items-center gap-1">
        ← Verificar outro código
      </AppLink>

      <PageHeader
        icon={Award}
        title="Verificação pública"
        description="Resultado da validação do certificado informado."
      />

      {!certificate ? (
        <Alert variant="danger" className="mt-4">
          Nenhum certificado encontrado com o código <strong>{code}</strong>.
        </Alert>
      ) : (
        <Alert variant="success" className="mt-4">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            Certificado válido
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="opacity-70">Aluno:</span> {certificate.user.fullName}
            </p>
            <p>
              <span className="opacity-70">Curso:</span> {certificate.course.title}
            </p>
            <p>
              <span className="opacity-70">Categoria:</span> {certificate.course.category.name}
            </p>
            <p>
              <span className="opacity-70">Emitido em:</span>{" "}
              {new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}
            </p>
            <p>
              <span className="opacity-70">Código:</span> {certificate.code}
            </p>
          </div>
        </Alert>
      )}
    </PageShell>
  );
}
