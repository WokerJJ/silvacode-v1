import rateLimit from "express-rate-limit";

// Factory en vez de una instancia fija: así rateLimiter.test.js puede armar
// un limiter que SÍ aplique (con skipInTest: false) sin tocar el skip
// automático que usa el resto de la app cuando corren los tests de
// integración — esos reusan el mismo "IP" (127.0.0.1, vía supertest) en
// decenas de logins/registers por diseño, y chocarían con cualquier límite
// real.
export function createAuthLimiter({ windowMs = 15 * 60 * 1000, limit = 10, skipInTest = true } = {}) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => skipInTest && process.env.NODE_ENV === "test",
        message: { error: "Demasiados intentos, esperá unos minutos antes de volver a intentar" },
    });
}

// Instancia real que usan las rutas de auth: 10 intentos cada 15 minutos por
// IP en /auth/login y /auth/register. No es infalible (alguien detrás de un
// proxy/NAT comparte IP con otros), pero sube muchísimo el costo de un
// ataque de fuerza bruta o de creación masiva de cuentas, que es lo que
// importa acá.
const authLimiter = createAuthLimiter();

export default authLimiter;
