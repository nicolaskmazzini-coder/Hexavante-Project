import { getOAuthCredentials } from "@/lib/auth-env";

const credentials = getOAuthCredentials();

export const oauthProviders = {
  google: Boolean(credentials.googleId) && Boolean(credentials.googleSecret),
  github: Boolean(credentials.githubId) && Boolean(credentials.githubSecret),
} as const;

export function hasOAuthProviders() {
  return oauthProviders.google || oauthProviders.github;
}

export const oauthErrorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "Este e-mail já possui conta com senha. Entre com e-mail e senha para continuar.",
  OAuthSignin: "Não foi possível iniciar o login social. Tente novamente.",
  OAuthCallback: "Falha ao concluir o login social. Verifique as credenciais OAuth.",
  AccessDenied:
    "Não foi possível concluir o login social. Verifique se o provedor retornou seu e-mail ou use e-mail e senha.",
  Configuration: "Login social não configurado corretamente no servidor.",
};
