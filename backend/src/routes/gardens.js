import { Router } from "express";
import {
    getGardenById,
    createGarden,
    updateGarden,
    deleteGarden,
} from "../controllers/gardensController.js";

import { validate } from "../middlewares/validate.js";
import { createGardenSchema, updateGardenSchema } from "../schemas/gardenSchema.js";

const router = Router();

router.get("/:id", getGardenById);
router.post("/", validate(createGardenSchema), createGarden);
router.put("/:id", validate(updateGardenSchema), updateGarden);
router.delete("/:id", deleteGarden);

export default router;
