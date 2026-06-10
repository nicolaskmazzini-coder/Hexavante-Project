import { AppLink } from "@/components/ui/app-link";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { loginAction } from "@/app/actions/auth";
import { oauthErrorMessages, oauthProviders } from "@/lib/oauth";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  const oauthError = error ? oauthErrorMessages[error] ?? "Não foi possível entrar com a conta social." : null;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <OAuthButtons callbackUrl={safeCallback} providers={oauthProviders} />

      {oauthError && (
        <p className="w-full rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {oauthError}
        </p>
      )}

      <AuthForm
        title="ENTRAR"
        subtitle="Acesse sua conta Hexavante"
        submitLabel="Entrar"
        action={loginAction}
        callbackUrl={safeCallback}
        formKind="login"
        fields={[
          { name: "email", label: "E-mail", type: "email" },
          { name: "password", label: "Senha", type: "password" },
        ]}
        footer={
          <div className="space-y-2">
            <p>
              <AppLink href="/recuperar-senha">Esqueci minha senha</AppLink>
            </p>
            <p>
              Não tem conta?{" "}
              <AppLink
                href={
                  safeCallback === "/"
                    ? "/register"
                    : `/register?callbackUrl=${encodeURIComponent(safeCallback)}`
                }
              >
                Cadastre-se
              </AppLink>
            </p>
          </div>
        }
      />
    </div>
  );
}
