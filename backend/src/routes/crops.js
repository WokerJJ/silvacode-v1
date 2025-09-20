import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Listar cultivos
router.get("/", async (req, res) => {
    const crops = await prisma.crops.findMany();
    res.json(crops);
});

// Crear cultivo
router.post("/", async (req, res) => {
    const { name, description, climate, cycle_days, hacks } = req.body;
    try {
        const crop = await prisma.crops.create({
            data: { name, description, climate, cycle_days, hacks },
        });
        res.json(crop);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener cultivo por id
router.get("/:id", async (req, res) => {
    const crop = await prisma.crops.findUnique({
        where: { id: Number(req.params.id) },
    });
    if (!crop) return res.status(404).json({ error: "Cultivo no encontrado" });
    res.json(crop);
});

// Eliminar cultivo
router.delete("/:id", async (req, res) => {
    try {
        await prisma.crops.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: "Cultivo eliminado" });
    } catch {
        res.status(404).json({ error: "Cultivo no encontrado" });
    }
});

export default router;
