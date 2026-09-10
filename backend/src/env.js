// Carga las variables de entorno desde .env antes de que se importe cualquier
// otro módulo. Debe ser el PRIMER import en app.js: en ES modules los imports
// se resuelven antes que el código del módulo que los declara, así que cargar
// esto en index.js no serviría (app.js ya se habría importado primero).
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Los tests fuerzan NODE_ENV=test antes de importar app.js (ver
// backend/tests/setup.js), así que acá usamos .env.test en vez de .env: así
// los tests pegan contra la base de datos silvacode_test y nunca tocan datos
// de desarrollo.
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
const envPath = path.join(__dirname, "..", envFile);

try {
    process.loadEnvFile(envPath);
} catch (err) {
    // En producción las variables pueden venir ya inyectadas por el entorno
    if (err.code !== "ENOENT") throw err;
}
