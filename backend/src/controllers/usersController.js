import prisma from "../prisma.js";

// ==============================
// Controlador de Users
// ==============================

// Obtener todos los usuarios
export const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.users.findMany({
            include: { gardens: true }, // trae también los gardens
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// Obtener un usuario por ID
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.users.findUnique({
            where: { id },
            include: { gardens: true },
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
        const { username, email, full_name } = req.body;

        const newUser = await prisma.users.create({
            data: { username, email, full_name },
        });

        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
};

// Actualizar usuario
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, full_name } = req.body;

        const updated = await prisma.users.update({
            where: { id },
            data: { username, email, full_name },
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Eliminar usuario
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.users.delete({
            where: { id },
        });

        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
