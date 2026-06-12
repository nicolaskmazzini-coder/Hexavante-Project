import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { PageShell } from "@/components/ui/page-shell";
import { getUserProfile } from "@/services/student.service";
import { getProfileCosmetics } from "@/services/shop.service";

export default async function ConfiguracoesPerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/configuracoes/perfil");

  const [profile, cosmetics] = await Promise.all([
    getUserProfile(session.user.id),
    getProfileCosmetics(session.user.id),
  ]);

  if (!profile) {
    return (
      <PageShell size="md">
        <p className="text-slate-400">Perfil não encontrado.</p>
      </PageShell>
    );
  }

  return (
    <PageShell size="md">
      <Link
        href="/configuracoes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-sky-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar às configurações
      </Link>

      <h1 className="text-2xl font-black text-white">Editar perfil</h1>
      <p className="mt-2 text-sm text-slate-400">
        Atualize suas informações públicas. Username: @{profile.username}
      </p>

      <div className="mt-6 flex justify-center sm:justify-start">
        <ProfilePhotoUpload
          key={session.user.image || profile.avatarUrl || "no-avatar"}
          currentAvatar={session.user.image || profile.avatarUrl || undefined}
          borderClassName={cosmetics.avatarBorderClassName}
        />
      </div>

      <div className="mt-6">
        <ProfileEditForm profile={profile} />
      </div>
    </PageShell>
  );
}
