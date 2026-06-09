import { Award } from "lucide-react";
import { issueCertificateAction } from "@/app/actions/certificate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  courseId: string;
  progress: number;
};

export function CertificateButton({ courseId, progress }: Props) {
  if (progress < 100) {
    return (
      <Card padding="sm" className="text-sm text-slate-400" role="status" aria-live="polite">
        Complete o curso para emitir o certificado ({progress}%)
      </Card>
    );
  }

  return (
    <form action={issueCertificateAction.bind(null, courseId)}>
      <Button type="submit" aria-label="Emitir certificado de conclusão do curso">
        <Award className="h-4 w-4" />
        Emitir certificado
      </Button>
    </form>
  );
}
