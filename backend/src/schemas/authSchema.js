import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string()
        .min(8, "La contraseña debe tener mínimo 8 caracteres")
        .regex(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8, "La contraseña debe tener mínimo 8 caracteres"),
});
