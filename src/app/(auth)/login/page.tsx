import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <AuthForm
      title="ENTRAR"
      subtitle="Acesse sua conta Hexavante"
      submitLabel="Entrar"
      action={loginAction}
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
