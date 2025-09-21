import { Router } from "express";
import {
    getCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop,
} from "../controllers/cropsController.js";

import validate from "../middlewares/validate.js";
import { createCropSchema, updateCropSchema } from "../schemas/cropSchema.js";
import {idSchema} from "../schemas/idSchema.js";

const router = Router();

router.get("/", getCrops);
router.get("/:id",validate({ params: idSchema }), getCropById);
router.post("/", validate({ body: createCropSchema }), createCrop);
router.put("/:id", validate({ params: idSchema, body: updateCropSchema }), updateCrop);
router.delete("/:id", validate({ params: idSchema }), deleteCrop);

export default router;
