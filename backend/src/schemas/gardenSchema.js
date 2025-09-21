import { z } from "zod";

export const createGardenSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener mínimo 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    slug: z.string()
        .regex(/^[a-z0-9-]+$/, "El slug solo puede contener minúsculas, números y guiones"),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

export const updateGardenSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});
