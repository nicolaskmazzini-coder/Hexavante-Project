import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Criar conta"
      subtitle="Junte-se à plataforma Hexavante"
      submitLabel="Cadastrar"
      action={registerAction}
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
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Entrar
          </Link>
        </p>
      }
    />
  );
}
