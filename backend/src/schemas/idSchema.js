import { z } from "zod";

// ID genérico (numérico)
export const idSchema = z.object({
    //Zod tiene coerce que convierte automáticamente strings en números
    id: z.coerce.number().int().positive("El id debe ser un número positivo"),
});