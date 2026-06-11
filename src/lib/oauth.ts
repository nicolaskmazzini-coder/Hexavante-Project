export const oauthProviders = {
  google:
    Boolean(process.env.AUTH_GOOGLE_ID) && Boolean(process.env.AUTH_GOOGLE_SECRET),
  github:
    Boolean(process.env.AUTH_GITHUB_ID) && Boolean(process.env.AUTH_GITHUB_SECRET),
} as const;

export function hasOAuthProviders() {
  return oauthProviders.google || oauthProviders.github;
}

export const oauthErrorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "Este e-mail já possui conta com senha. Entre com e-mail e senha para continuar.",
  OAuthSignin: "Não foi possível iniciar o login social. Tente novamente.",
  OAuthCallback: "Falha ao concluir o login social. Verifique as credenciais OAuth.",
  AccessDenied: "Não foi possível concluir o login social. Tente novamente ou use e-mail e senha.",
  Configuration: "Login social não configurado corretamente no servidor.",
};
