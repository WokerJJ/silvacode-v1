import bcrypt from "bcrypt";
import prisma from "../prisma.js";

// ==============================
// Controlador de Users
// ==============================

// Campos seguros para devolver al cliente (nunca el password hash)
const publicUserSelect = {
    id: true,
    username: true,
    email: true,
    full_name: true,
    created_at: true,
    gardens: true,
};

// Obtener todos los usuarios. Hoy cualquier usuario autenticado puede listar
// a todos los demás (sin paginar) — sirve para desarrollo, pero si esto crece
// hacia una red social conviene paginar esta ruta y pensar qué tan público
// debe ser el listado completo de usuarios.
export const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.users.findMany({
            select: publicUserSelect,
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// Obtener un usuario por ID
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const user = await prisma.users.findUnique({
            where: { id },
            select: publicUserSelect,
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        next(err);
    }
};

// Crear usuario
export const createUser = async (req, res, next) => {
    try {
        const { username, email, password, full_name } = req.validatedBody;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: { username, email, password: hashedPassword, full_name },
            select: publicUserSelect,
        });

        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
};

// Actualizar usuario (solo el dueño de la cuenta)
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;

        // Ownership check: el :id de la URL puede ser cualquier UUID (alguien
        // podría probar con el de otro usuario), así que se compara contra
        // req.user.userId, que viene del token y no se puede falsificar.
        if (id !== req.user.userId) {
            return res.status(403).json({ error: "No puedes modificar la cuenta de otro usuario" });
        }

        const { username, email, full_name } = req.validatedBody;

        const updated = await prisma.users.update({
            where: { id },
            data: { username, email, full_name },
            select: publicUserSelect,
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Eliminar usuario (solo el dueño de la cuenta)
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;

        if (id !== req.user.userId) {
            return res.status(403).json({ error: "No puedes eliminar la cuenta de otro usuario" });
        }

        await prisma.users.delete({
            where: { id },
        });

        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
