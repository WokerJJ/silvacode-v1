import prisma from "../prisma.js";
import slugify from "../utils/slugify.js";

// ==============================
// Controlador de Gardens
// ==============================
//
// Patrón que se repite en updateGarden/deleteGarden/getGardenById: como el
// id del jardín es un simple entero autoincremental, cualquiera puede
// *adivinar* uno probando 1, 2, 3... El "ownership check" (comparar
// garden.user_id contra req.user.userId) es lo que realmente impide que un
// usuario toque el jardín de otro, no el hecho de tener que estar logueado.
// Estar autenticado dice "sé quién eres"; el ownership check dice "y por eso
// no puedes tocar lo que no es tuyo".

export const getGardenById = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const garden = await prisma.gardens.findUnique({
            where: { id: Number(id) },
            include: { garden_crop: { include: { crop: true } } },
        });

        if (!garden) return res.status(404).json({ error: "Garden not found" });

        if (garden.user_id !== req.user.userId) {
            return res.status(403).json({ error: "No puedes ver el jardín de otro usuario" });
        }

        res.json(garden);
    } catch (err) {
        next(err);
    }
};

// Crear jardín. El dueño SIEMPRE sale de req.user.userId (el token), nunca de
// algo que mande el cliente en el body — si no, cualquiera podría crear un
// jardín "a nombre de" otro usuario con solo conocer su id.
export const createGarden = async (req, res, next) => {
    try {
        const { name, slug, lat, lng } = req.validatedBody;

        const newGarden = await prisma.gardens.create({
            data: {
                user_id: req.user.userId,
                name,
                // El slug es opcional en el schema (ver gardenSchema.js): si no
                // lo mandan, se genera automáticamente a partir del nombre.
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

// Actualizar jardín (solo el dueño, ver nota de ownership arriba)
export const updateGarden = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;
        const { name, slug, lat, lng } = req.validatedBody;

        const garden = await prisma.gardens.findUnique({ where: { id: Number(id) } });
        if (!garden) return res.status(404).json({ error: "Garden not found" });
        if (garden.user_id !== req.user.userId) {
            return res.status(403).json({ error: "No puedes modificar el jardín de otro usuario" });
        }

        const updated = await prisma.gardens.update({
            where: { id: Number(id) },
            data: { name, slug, lat, lng },
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Eliminar jardín (solo el dueño, ver nota de ownership arriba)
export const deleteGarden = async (req, res, next) => {
    try {
        const { id } = req.validatedParams;

        const garden = await prisma.gardens.findUnique({ where: { id: Number(id) } });
        if (!garden) return res.status(404).json({ error: "Garden not found" });
        if (garden.user_id !== req.user.userId) {
            return res.status(403).json({ error: "No puedes eliminar el jardín de otro usuario" });
        }

        await prisma.gardens.delete({
            where: { id: Number(id) },
        });

        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
