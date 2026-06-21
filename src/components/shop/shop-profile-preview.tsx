"use client";

import { ProfileIconBadge } from "@/components/profile/profile-icon-badge";
import { ProfilePetCompanion } from "@/components/profile/profile-pet-companion";
import { Avatar } from "@/components/ui/avatar";
import type { PetAccessoryDef, PetDef } from "@/lib/pets";

type PreviewCosmetics = {
  equippedTitle: string | null;
  avatarBorderClassName: string | null;
  profileIconId: string | null;
  pet: PetDef | null;
  petAccessory: PetAccessoryDef | null;
};

type Props = {
  fullName: string;
  username: string;
  avatarUrl: string | null;
  cosmetics: PreviewCosmetics;
};

export function ShopProfilePreview({ fullName, username, avatarUrl, cosmetics }: Props) {
  return (
    <section className="rounded-xl border border-[#1e1e2e] bg-[#111120] p-4">
      <p className="text-sm font-semibold text-slate-200">Prévia do perfil</p>
      <p className="mt-1 text-xs text-slate-500">Veja como sua vitrine aparece para outros.</p>

      <div className="mt-4 flex items-start gap-3">
        <Avatar
          src={avatarUrl}
          alt={username}
          size="md"
          borderClassName={cosmetics.avatarBorderClassName}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate font-bold text-white">{fullName}</p>
            {cosmetics.profileIconId && <ProfileIconBadge iconId={cosmetics.profileIconId} />}
          </div>
          <p className="text-sm text-slate-500">@{username}</p>
          {cosmetics.equippedTitle && (
            <p className="mt-2 inline-flex rounded-full border border-teal-400/25 bg-teal-400/10 px-2.5 py-0.5 text-xs font-semibold text-teal-100">
              {cosmetics.equippedTitle}
            </p>
          )}
        </div>

        {cosmetics.pet && (
          <ProfilePetCompanion pet={cosmetics.pet} accessory={cosmetics.petAccessory} size="sm" />
        )}
      </div>
    </section>
  );
}
