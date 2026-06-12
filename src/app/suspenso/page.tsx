import Link from "next/link";

type Props = {
  searchParams: Promise<{ motivo?: string }>;
};

export default async function SuspendedPage({ searchParams }: Props) {
  const params = await searchParams;
  const reason = params.motivo?.trim();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="max-w-lg rounded-xl border border-red-500/30 bg-[#111120] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-2xl">
          ⛔
        </div>
        <h1 className="text-2xl font-bold text-white">Conta suspensa</h1>
        <p className="mt-4 text-slate-300">
          Sua conta foi suspensa pela moderação e não pode acessar a plataforma.
        </p>
        {reason ? (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Motivo: {reason}
          </p>
        ) : null}
        <p className="mt-6 text-sm text-slate-500">
          Se acredita que isso é um erro, entre em contato com o suporte.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:text-white"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
