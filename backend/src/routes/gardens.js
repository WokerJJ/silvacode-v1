import { Router } from "express";
import prisma from "../prisma.js";
import slugify from "../utils/slugify.js";

const router = Router();

// Listar jardines con dueño
router.get("/", async (req, res) => {
    const gardens = await prisma.gardens.findMany({
        include: { user: true, garden_crop: true },
    });
    res.json(gardens);
});

// Crear jardín
router.post("/", async (req, res) => {
    const { user_id, name, slug, lat, lng } = req.body;
    try {
        const garden = await prisma.gardens.create({
            data: {
                user_id,
                name,
                slug: slug ? slug : slugify(name),
                lat,
                lng,
            },
        });
        res.json(garden);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener jardín por id
router.get("/:id", async (req, res) => {
    const garden = await prisma.gardens.findUnique({
        where: { id: Number(req.params.id) },
        include: { garden_crops: { include: { crops: true } } },
    });
    if (!garden) return res.status(404).json({ error: "Jardín no encontrado" });
    res.json(garden);
});

// Eliminar jardín
router.delete("/:id", async (req, res) => {
    try {
        await prisma.gardens.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: "Jardín eliminado" });
    } catch {
        res.status(404).json({ error: "Jardín no encontrado" });
    }
});

export default router;
