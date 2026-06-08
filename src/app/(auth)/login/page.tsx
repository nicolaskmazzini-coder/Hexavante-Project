import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/app/actions/auth";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  return (
    <AuthForm
      title="ENTRAR"
      subtitle="Acesse sua conta Hexavante"
      submitLabel="Entrar"
      action={loginAction}
      callbackUrl={safeCallback}
      fields={[
        { name: "email", label: "E-mail", type: "email" },
        { name: "password", label: "Senha", type: "password" },
      ]}
      footer={
        <p>
          Não tem conta?{" "}
          <Link href="/register" className="font-semibold text-sky-300 hover:text-sky-200">
            Cadastre-se
          </Link>
        </p>
      }
    />
  );
}
