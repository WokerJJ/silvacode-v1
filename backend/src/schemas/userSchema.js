import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string()
        .min(3, "El username debe tener mínimo 3 caracteres")
        .max(50, "El username no puede exceder 50 caracteres"),
    email: z.string().email("Debe ser un correo válido"),
    full_name: z.string().max(150).optional(),
});

export const updateUserSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    full_name: z.string().max(150).optional(),
});
