import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Nome muito curto").max(120, "Nome muito longo"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional().or(z.literal("")),
  phone: z
    .string()
    .max(20, "Telefone inválido")
    .regex(/^[\d\s()+-]*$/, "Use apenas números e símbolos de telefone")
    .optional()
    .or(z.literal("")),
  city: z.string().max(80, "Cidade muito longa").optional().or(z.literal("")),
  state: z
    .string()
    .max(2, "Use a sigla do estado (ex: SP)")
    .regex(/^[A-Za-z]{0,2}$/, "Sigla inválida")
    .optional()
    .or(z.literal("")),
  profileVisibility: z.enum(["private", "public"]),
});

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmPassword: z.string().min(8, "Confirme a senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
