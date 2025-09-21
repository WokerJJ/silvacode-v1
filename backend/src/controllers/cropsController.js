import prisma from "../prisma.js";

// ==============================
// Controlador de Users
// ==============================

// Obtener todos los usuarios
export const getCrops = async (req, res, next) => {
    try {
        const crops = await prisma.crops.findMany();
        res.json(crops);
    } catch (err) {
        next(err);
    }
};

// Obtener un usuario por ID
export const getCropById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const crop = await prisma.crops.findUnique({
            where: { id: Number(id) },
            include: { garden: true },
        });

        if (!crop) return res.status(404).json({ error: "Crop not found" });

        res.json(crop);
    } catch (err) {
        next(err);
    }
};

// Crear usuario
export const createCrop = async (req, res, next) => {
    try {
        const { name, description, climate, cycle_days, hacks } = req.body;

        const newCrop = await prisma.crops.create({
            data: { name, description, climate, cycle_days, hacks },
        });
        res.status(201).json(newCrop);
    } catch (err) {
        next(err);
    }
};

// Actualizar usuario
export const updateCrop = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, climate, cycle_days, hacks }= req.body;

        const updated = await prisma.crops.update({
            where: { id: Number(id) },
            data: { name, description, climate, cycle_days, hacks },
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Eliminar usuario
export const deleteCrop = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.crops.delete({
            where: { id: Number(id) },
        });

        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
