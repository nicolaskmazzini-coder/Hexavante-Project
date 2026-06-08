// Importações necessárias para a navegação de escola
import Link from "next/link"; // Componente de link do Next.js
import {
  canManageAcademics,
  canManageSchool,
  INSTITUTION_ROLE_LABELS,
} from "@/lib/school-permissions"; // Funções de permissão e labels
import type { InstitutionRole } from "@prisma/client"; // Tipo de papel na instituição

// Chaves de navegação
type NavKey = "dashboard" | "members" | "courses";

// Props do componente SchoolNav
type Props = {
  schoolId: string; // ID da escola
  role: InstitutionRole; // Papel do usuário na escola
  active: NavKey; // Navegação ativa
};

// Componente de navegação para páginas de escola
// Exibe links baseados em permissões, aplica tema azul e preto
export function SchoolNav({ schoolId, role, active }: Props) {
  // Lista de links baseada em permissões
  const links: { key: NavKey; href: string; label: string }[] = [
    { key: "dashboard", href: `/schools/${schoolId}`, label: "Painel" },
  ];

  // Adiciona link de membros se pode gerenciar escola
  if (canManageSchool(role)) {
    links.push({
      key: "members",
      href: `/schools/${schoolId}/members`,
      label: "Membros",
    });
  }

  // Adiciona link de cursos se pode gerenciar acadêmicos
  if (canManageAcademics(role)) {
    links.push({
      key: "courses",
      href: `/schools/${schoolId}/courses`,
      label: "Cursos",
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#0f172a] pb-4">
      <nav className="flex flex-wrap gap-2" aria-label="Navegação da escola">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              active === link.key
                ? "bg-[#2563eb] text-white"
                : "text-slate-300 hover:bg-white/10"
            }`}
            aria-label={`Ir para ${link.label}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400">
        {INSTITUTION_ROLE_LABELS[role]}
      </span>
    </div>
  );
}
