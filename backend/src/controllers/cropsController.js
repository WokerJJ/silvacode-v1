import prisma from "../prisma.js";

// ==============================
// Controlador de Crops
// ==============================

// Obtener todos los cultivos
export const getCrops = async (req, res, next) => {
    try {
        const crops = await prisma.crops.findMany();
        res.json(crops);
    } catch (err) {
        next(err);
    }
};

// Obtener un cultivo por ID
export const getCropById = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const crop = await prisma.crops.findUnique({
            where: { id: Number(id) },
            include: { garden_crop: { include: { garden: true } } },
        });

        if (!crop) return res.status(404).json({ error: "Crop not found" });

        res.json(crop);
    } catch (err) {
        next(err);
    }
};

// Crear cultivo
export const createCrop = async (req, res, next) => {
    try {
        const { name, description, climate, cycle_days, hacks } = req.validatedBody;

        const newCrop = await prisma.crops.create({
            data: { name, description, climate, cycle_days, hacks },
        });
        res.status(201).json(newCrop);
    } catch (err) {
        next(err);
    }
};

// Actualizar cultivo
export const updateCrop = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const { name, description, climate, cycle_days, hacks }= req.validatedBody;

        const updated = await prisma.crops.update({
            where: { id: Number(id) },
            data: { name, description, climate, cycle_days, hacks },
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Eliminar cultivo
export const deleteCrop = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;

        await prisma.crops.delete({
            where: { id: Number(id) },
        });

        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
