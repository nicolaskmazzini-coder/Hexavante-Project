import { AppLink } from "@/components/ui/app-link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { registerAction } from "@/app/actions/auth";
import { getSafeCallbackUrl } from "@/lib/auth-routes";
import { oauthProviders } from "@/lib/oauth";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  const safeCallback = getSafeCallbackUrl(callbackUrl);

  return (
    <AuthPageShell>
      <OAuthButtons callbackUrl={safeCallback} providers={oauthProviders} />

      <div className="mt-6">
        <AuthForm
          embedded
          title="Criar conta"
          subtitle="Junte-se à plataforma Hexavante"
          submitLabel="Cadastrar"
          action={registerAction}
          callbackUrl={safeCallback}
          formKind="register"
          fields={[
            { name: "username", label: "Nome de usuário" },
            { name: "fullName", label: "Nome completo" },
            { name: "email", label: "E-mail", type: "email" },
            { name: "password", label: "Senha", type: "password" },
            { name: "birthDate", label: "Data de nascimento", type: "date" },
          ]}
          footer={
            <p>
              Já tem conta?{" "}
              <AppLink
                href={
                  safeCallback === "/"
                    ? "/login"
                    : `/login?callbackUrl=${encodeURIComponent(safeCallback)}`
                }
              >
                Entrar
              </AppLink>
            </p>
          }
        />
      </div>
    </AuthPageShell>
  );
}
