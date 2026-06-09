import { signInWithGithub, signInWithGoogle } from "@/app/actions/oauth";
import { Button } from "@/components/ui/button";

type Props = {
  callbackUrl: string;
  providers: { google: boolean; github: boolean };
};

export function OAuthButtons({ callbackUrl, providers }: Props) {
  if (!providers.google && !providers.github) return null;

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {providers.google && (
          <form action={signInWithGoogle.bind(null, callbackUrl)}>
            <Button type="submit" variant="outline" className="w-full">
              <GoogleIcon />
              Google
            </Button>
          </form>
        )}
        {providers.github && (
          <form action={signInWithGithub.bind(null, callbackUrl)}>
            <Button type="submit" variant="outline" className="w-full">
              <GitHubIcon />
              GitHub
            </Button>
          </form>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-slate-500">ou com e-mail</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.5-5.4 3.5-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.4 3.2 15 2.2 12 2.2 6.8 2.2 2.5 6.5 2.5 11.7S6.8 21.2 12 21.2c6.1 0 7.6-4.3 7.6-6.5 0-.4 0-.7-.1-1H12z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
