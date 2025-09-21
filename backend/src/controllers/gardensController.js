import prisma from "../prisma.js";
import slugify from "../utils/slugify.js";

// ==============================
// Controlador de Users
// ==============================

export const getGardenById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const garden = await prisma.gardens.findUnique({
            where: { id: Number(id) },
            include: { garden_crop: { include: { crop: true } } },
        });

        if (!garden) return res.status(404).json({ error: "Garden not found" });

        res.json(garden);
    } catch (err) {
        next(err);
    }
};

// Crear usuario
export const createGarden = async (req, res, next) => {
    try {
        const { user_id, name, slug, lat, lng } = req.body;

        const newGarden = await prisma.gardens.create({
            data: {
                user_id,
                name,
                slug: slug ? slug : slugify(name),
                lat,
                lng,
            },
        });
        res.status(201).json(newGarden);
    } catch (err) {
        next(err);
    }
};

// Actualizar usuario
export const updateGarden = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_id, name, slug, lat, lng } = req.body;

        const updated = await prisma.gardens.update({
            where: { id: Number(id) },
            data: { user_id, name, slug, lat, lng },
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Eliminar usuario
export const deleteGarden = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.gardens.delete({
            where: { id: Number(id) },
        });

        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
