// Importações necessárias para validação
import { z } from "zod"; // Biblioteca de validação de schemas

// Schema de validação para registro de usuário
// Define regras para cada campo do formulário de registro
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e _"),
  fullName: z.string().min(2, "Nome muito curto"),
  email: z
    .email("E-mail inválido")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  birthDate: z.coerce.date({
    error: "Data de nascimento inválida",
  }),
});

// Schema de validação para login
// Define regras para email e senha
export const loginSchema = z.object({
  email: z
    .email("E-mail inválido")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Informe a senha"),
});

// Tipos inferidos dos schemas para uso no código
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
