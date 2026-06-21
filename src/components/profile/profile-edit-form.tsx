"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, type ProfileActionResult } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

type ProfileData = {
  fullName: string;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  profileVisibility: string;
};

type Props = {
  profile: ProfileData;
};

const initialState: ProfileActionResult = { success: false };

export function ProfileEditForm({ profile }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast("Perfil atualizado! Seu nome foi atualizado em todo o app.", "success");
      router.refresh();
    } else if (state.error && !state.fieldErrors) {
      toast(state.error, "error");
    }
  }, [state, toast, router]);

  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-white">Dados pessoais</h2>
      <p className="mt-1 text-sm text-slate-400">
        Atualize suas informações públicas e de contato.
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={profile.fullName}
            required
            className={cn(state.fieldErrors?.fullName && "border-red-400/50")}
          />
          {state.fieldErrors?.fullName && (
            <p className="mt-1 text-xs text-red-300">{state.fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio ?? ""}
            placeholder="Conte um pouco sobre você e seus objetivos de estudo..."
            className={cn(state.fieldErrors?.bio && "border-red-400/50")}
          />
          {state.fieldErrors?.bio && (
            <p className="mt-1 text-xs text-red-300">{state.fieldErrors.bio}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={profile.phone ?? ""}
              placeholder="(11) 99999-9999"
              className={cn(state.fieldErrors?.phone && "border-red-400/50")}
            />
            {state.fieldErrors?.phone && (
              <p className="mt-1 text-xs text-red-300">{state.fieldErrors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile.city ?? ""}
              className={cn(state.fieldErrors?.city && "border-red-400/50")}
            />
          </div>
          <div>
            <Label htmlFor="state">Estado (UF)</Label>
            <Input
              id="state"
              name="state"
              maxLength={2}
              defaultValue={profile.state ?? ""}
              placeholder="SP"
              className={cn(state.fieldErrors?.state && "border-red-400/50")}
            />
            {state.fieldErrors?.state && (
              <p className="mt-1 text-xs text-red-300">{state.fieldErrors.state}</p>
            )}
          </div>
          <div>
            <Label htmlFor="profileVisibility">Visibilidade do perfil</Label>
            <NativeSelect
              id="profileVisibility"
              name="profileVisibility"
              defaultValue={profile.profileVisibility}
            >
              <option value="private">Privado</option>
              <option value="public">Público</option>
            </NativeSelect>
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
