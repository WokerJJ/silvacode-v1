import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Registro
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.validatedBody;

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { username, email, password: hashedPassword },
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

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

        // Generar token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login exitoso", token });
    } catch (err) {
        next(err);
    }
};
