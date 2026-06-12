import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PerfilRedirectPage() {
  const session = await auth();
  if (!session?.user?.username) {
    redirect("/login?callbackUrl=/perfil");
  }
  redirect(`/perfil/${session.user.username}`);
}
