import { Router } from "express";
import {
    getCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop,
} from "../controllers/cropsController.js";

import { validate } from "../middlewares/validate.js";
import { createCropSchema, updateCropSchema } from "../schemas/cropSchema.js";

const router = Router();

router.get("/", getCrops);
router.get("/:id", getCropById);
router.post("/", validate(createCropSchema), createCrop);
router.put("/:id", validate(updateCropSchema), updateCrop);
router.delete("/:id", deleteCrop);

export default router;
