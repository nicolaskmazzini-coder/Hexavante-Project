import { Award, CheckCircle2 } from "lucide-react";
import { verifyCertificateByCode } from "@/app/actions/certificate";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function VerifyCertificatePage({ searchParams }: Props) {
  const { code } = await searchParams;
  const trimmedCode = code?.trim();
  const certificate = trimmedCode ? await verifyCertificateByCode(trimmedCode) : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/certificados" className="text-sm text-indigo-400 hover:underline">
        ← Meus certificados
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white">Verificar certificado</h1>
      <p className="mt-1 text-sm text-slate-400">
        Informe o código para validar a autenticidade do certificado.
      </p>

      <form method="get" className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6">
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-200">
            Código
          </label>
          <input
            id="code"
            name="code"
            defaultValue={trimmedCode ?? ""}
            required
            placeholder="HEXA-XXXX-XXXX"
            className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Verificar
        </button>
      </form>

      {trimmedCode && !certificate && (
        <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          Nenhum certificado encontrado com este código.
        </p>
      )}

      {certificate && (
        <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Certificado válido</span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-200">
            <p>
              <span className="text-slate-400">Aluno:</span> {certificate.user.fullName}
            </p>
            <p>
              <span className="text-slate-400">Curso:</span> {certificate.course.title}
            </p>
            <p>
              <span className="text-slate-400">Categoria:</span>{" "}
              {certificate.course.category.name}
            </p>
            <p>
              <span className="text-slate-400">Emitido em:</span>{" "}
              {new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}
            </p>
            <p>
              <span className="text-slate-400">Código:</span> {certificate.code}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-200">
            <Award className="h-4 w-4" />
            Verificação registrada pela plataforma Hexavante
          </div>
        </div>
      )}
    </div>
  );
}
