import { PrismaClient } from "@prisma/client";

// Una sola instancia compartida por toda la app (por eso se importa este
// archivo en vez de hacer `new PrismaClient()` en cada controller): Prisma
// mantiene un pool de conexiones a Postgres detrás de escena, y crear varias
// instancias desperdiciaría conexiones.
const prisma = new PrismaClient();

export default prisma;
