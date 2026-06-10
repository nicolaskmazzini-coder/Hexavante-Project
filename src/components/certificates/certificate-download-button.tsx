"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  certificateId: string;
  code: string;
};

export function CertificateDownloadButton({ certificateId, code }: Props) {
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="outline"
      className="mt-4 w-full gap-2"
      onClick={async () => {
        try {
          const response = await fetch(`/api/certificates/${certificateId}/pdf`);
          if (!response.ok) {
            toast("Não foi possível baixar o certificado.", "error");
            return;
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `certificado-${code}.pdf`;
          anchor.click();
          URL.revokeObjectURL(url);
          toast("Certificado baixado com sucesso.", "success");
        } catch {
          toast("Erro ao baixar o certificado.", "error");
        }
      }}
    >
      <Download className="h-4 w-4" />
      Baixar PDF
    </Button>
  );
}
