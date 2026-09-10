// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en las variables de entorno");

// Se engancha antes de las rutas privadas (ver app.js). Espera el header
// "Authorization: Bearer <token>" que login() generó en authController.js.
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>" -> <token>

    if (!token) return res.status(401).json({ error: "Token requerido" });

    try {
        // jwt.verify revisa la firma y la expiración; si el token fue alterado
        // o venció, lanza una excepción y cae al catch de abajo.
        const decoded = jwt.verify(token, JWT_SECRET);

        // La firma puede ser válida y el token seguir siendo inválido: si el
        // usuario hizo logout, su jti quedó en revoked_tokens (ver logout en
        // authController.js) aunque el JWT en sí no haya expirado todavía.
        const revoked = await prisma.revoked_tokens.findUnique({ where: { jti: decoded.jti } });
        if (revoked) return res.status(403).json({ error: "Token inválido o expirado" });

        // req.user queda disponible para cualquier controller que se ejecute después.
        // req.user.userId es la fuente de verdad de "quién soy" — los controllers
        // la usan para comparar contra el dueño real de cada recurso (ownership check).
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Token inválido o expirado" });
    }
};

export default authMiddleware;
