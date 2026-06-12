import { signOutAction } from "@/app/actions/sign-out";

export function HeaderSignOut() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="hx-btn-secondary hidden min-h-9 px-3 py-1.5 text-sm sm:inline-flex">
        Sair
      </button>
    </form>
  );
}
