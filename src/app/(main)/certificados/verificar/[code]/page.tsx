import { redirect } from "next/navigation";
import { verifyCertificateCode } from "@/lib/certificate";
import { getCertificatePublicPath } from "@/lib/certificate-share";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function LegacyVerifyRedirectPage({ params }: Props) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).trim();

  if (!verifyCertificateCode(code)) {
    redirect("/certificados/verificar");
  }

  redirect(getCertificatePublicPath(code));
}
