import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Listar usuarios
router.get("/", async (req, res) => {
    const users = await prisma.users.findMany();
    res.json(users);
});

// Crear usuario
router.post("/", async (req, res) => {
    const { username, email, full_name } = req.body;
    try {
        const user = await prisma.users.create({
            data: { username, email, full_name },
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener un usuario por id
router.get("/:id", async (req, res) => {
    const user = await prisma.users.findUnique({
        where: { id: req.params.id },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
    try {
        await prisma.users.delete({ where: { id: req.params.id } });
        res.json({ message: "Usuario eliminado" });
    } catch {
        res.status(404).json({ error: "Usuario no encontrado" });
    }
});

export default router;
