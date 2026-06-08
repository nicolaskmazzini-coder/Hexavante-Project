// Importações necessárias para a página de nova escola
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { createSchoolAction } from "@/app/actions/school"; // Action para criar escola
import { SchoolForm } from "@/components/schools/school-form"; // Componente de formulário de escola
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página para criar nova instituição escolar
// Exibe formulário para criar escola, aplica tema azul e preto
export default async function NewSchoolPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/schools/new"); // Redireciona se não estiver logado

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/schools" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para HexaSchools">
        ← HexaSchools
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Nova instituição</h1>
      <p className="mt-1 text-sm text-slate-300">
        Você será o diretor e poderá convidar administradores, professores e alunos.
      </p>

      <div className="mt-8">
        <SchoolForm action={createSchoolAction} submitLabel="Criar instituição">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Nome da instituição</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="Ex.: Faculdade Demo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">E-mail institucional</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="contato@escola.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Telefone (opcional)</label>
            <input
              name="phone"
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="(11) 99999-0000"
            />
          </div>
        </SchoolForm>
      </div>
    </div>
  );
}
