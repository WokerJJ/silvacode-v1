import { z } from "zod";

export const createCropSchema = z.object({
    name: z.string()
        .min(2, "El nombre del cultivo debe tener al menos 2 caracteres")
        .max(100, "El nombre del cultivo no puede exceder 100 caracteres"),

    description: z.string()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .optional(),

    climate: z.record(z.any()).optional(), // JSON flexible (ej: {temp: "20-30", humedad: "alta"})

    cycle_days: z.number()
        .int("Debe ser un número entero")
        .positive("Debe ser mayor a 0")
        .optional(),

    hacks: z.array(z.string())
        .max(20, "Máximo 20 hacks por cultivo")
        .optional(),
});

export const updateCropSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    climate: z.record(z.any()).optional(),
    cycle_days: z.number().int().positive().optional(),
    hacks: z.array(z.string()).max(20).optional(),
});
