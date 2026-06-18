import { z } from "zod";

export const verifyCertificateSchema = z.object({
  code: z.string().min(6, "Informe o código do certificado").max(64, "Código inválido"),
});

export type VerifyCertificateInput = z.infer<typeof verifyCertificateSchema>;
