import { Award } from "lucide-react";
import { issueCertificateAction } from "@/app/actions/certificate";

type Props = {
  courseId: string;
  progress: number;
};

export async function CertificateButton({ courseId, progress }: Props) {
  if (progress < 100) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400" role="status" aria-live="polite">
        Complete o curso para emitir o certificado ({progress}%)
      </div>
    );
  }

  return (
    <form action={async () => {
      "use server";
      await issueCertificateAction(courseId);
    }}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#1d4ed8]"
        aria-label="Emitir certificado de conclusão do curso"
      >
        <Award className="h-4 w-4" />
        Emitir certificado
      </button>
    </form>
  );
}
