import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RedefinirSenhaPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token?.trim() ?? ""} />;
}
