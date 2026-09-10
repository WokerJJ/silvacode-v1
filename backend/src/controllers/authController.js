import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en las variables de entorno");

// Registro
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.validatedBody;

        // Nunca guardamos la contraseña tal cual: si la base de datos se filtra algún día,
        // un hash de bcrypt no se puede revertir a la contraseña original.
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { username, email, password: hashedPassword },
            // select explícito: así el hash de la contraseña nunca sale en la respuesta,
            // aunque en el futuro se agreguen más campos al modelo users.
            select: { id: true, username: true, email: true, full_name: true, created_at: true },
        });

        res.status(201).json({ message: "Usuario registrado", user });
    } catch (err) {
        next(err);
    }
};

// Login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.validatedBody;

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        // bcrypt.compare hashea el password recibido con la misma sal que se usó
        // al registrar al usuario y compara los hashes (nunca se descifra el guardado).
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

        // El token lleva el userId adentro: authMiddleware lo decodifica en cada
        // request y así el resto de la app sabe "quién" está pidiendo algo sin
        // tener que consultar la base de datos en cada petición. El jti (JWT ID)
        // es un identificador único de ESTE token en particular — no del usuario,
        // que puede tener varios tokens activos a la vez (uno por dispositivo/
        // sesión) — y es lo que logout() usa más abajo para revocar solo este
        // login sin afectar los demás.
        const jti = crypto.randomUUID();
        const token = jwt.sign({ userId: user.id, jti }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login exitoso", token });
    } catch (err) {
        next(err);
    }
};

// Logout. Un JWT es stateless: no hay forma de "borrarlo" del lado del
// cliente una vez emitido, sigue siendo válido por firma hasta que expira.
// Para que un logout real invalide el token, guardamos su jti en
// revoked_tokens; authMiddleware rechaza cualquier token cuyo jti esté ahí,
// aunque la firma sea válida (ver authMiddleware.js).
export const logout = async (req, res, next) => {
    try {
        const { jti, exp } = req.user; // ya verificados por authMiddleware

        await prisma.revoked_tokens.upsert({
            where: { jti },
            update: {},
            create: { jti, expires_at: new Date(exp * 1000) }, // exp del JWT viene en segundos, Date lo espera en ms
        });

        // Aprovechamos este request para limpiar tokens revocados que ya
        // vencieron de todos modos — evita que la tabla crezca sin límite
        // sin necesitar un cron aparte.
        await prisma.revoked_tokens.deleteMany({ where: { expires_at: { lt: new Date() } } });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
