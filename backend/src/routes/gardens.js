import { Router } from "express";
import {
    getGardenById,
    createGarden,
    updateGarden,
    deleteGarden,
} from "../controllers/gardensController.js";

import validate from "../middlewares/validate.js";
import { createGardenSchema, updateGardenSchema } from "../schemas/gardenSchema.js";
import {idSchema} from "../schemas/idSchema.js";

const router = Router();

router.get("/:id", validate({ params: idSchema }), getGardenById);
router.post("/", validate({ body: createGardenSchema }), createGarden);
router.put("/:id", validate({ params: idSchema, body: updateGardenSchema } ), updateGarden);
router.delete("/:id", validate({ params: idSchema }), deleteGarden);

export default router;
