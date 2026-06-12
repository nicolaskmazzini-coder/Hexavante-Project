import Link from "next/link";

export function HeaderAuthActions() {
  return (
    <>
      <Link href="/login" className="hx-btn-secondary hidden min-h-9 px-3 py-1.5 text-sm sm:inline-flex">
        Entrar
      </Link>
      <Link href="/register" className="hx-btn-primary min-h-9 px-3 py-1.5 text-sm">
        Cadastrar
      </Link>
    </>
  );
}
