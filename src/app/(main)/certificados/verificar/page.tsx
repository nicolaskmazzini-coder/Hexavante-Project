import { Award, CheckCircle2 } from "lucide-react";
import { verifyCertificateByCode } from "@/app/actions/certificate";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function VerifyCertificatePage({ searchParams }: Props) {
  const { code } = await searchParams;
  const trimmedCode = code?.trim();
  const certificate = trimmedCode ? await verifyCertificateByCode(trimmedCode) : null;

  return (
    <PageShell size="md">
      <AppLink href="/certificados" muted className="mb-4 inline-flex items-center gap-1">
        ← Meus certificados
      </AppLink>

      <PageHeader
        icon={Award}
        title="Verificar certificado"
        description="Informe o código para validar a autenticidade do certificado."
      />

      <Card padding="lg" className="mt-2">
        <form method="get" className="space-y-4">
          <div>
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              name="code"
              defaultValue={trimmedCode ?? ""}
              required
              placeholder="HEXA-XXXX-XXXX"
            />
          </div>
          <Button type="submit">Verificar</Button>
        </form>
      </Card>

      {trimmedCode && !certificate && (
        <Alert variant="danger" className="mt-4">
          Nenhum certificado encontrado com este código.
        </Alert>
      )}

      {certificate && (
        <Alert variant="success" className="mt-6">
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
            <p className="pt-2">
              <AppLink href={`/certificados/verificar/${certificate.code}`}>
                Link público de verificação →
              </AppLink>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs opacity-90">
            <Award className="h-4 w-4" />
            Verificação registrada pela plataforma Hexavante
          </div>
        </Alert>
      )}
    </PageShell>
  );
}
