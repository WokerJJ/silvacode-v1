import { Router } from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/usersController.js";

import validate from "../middlewares/validate.js";
import {createUserSchema, updateUserSchema, userIdSchema} from "../schemas/userSchema.js";

const router = Router();

router.get("/", getUsers);
router.get("/:id", validate({ params: userIdSchema }), getUserById);
router.post("/", validate( { body: createUserSchema} ), createUser);
router.put("/:id", validate({ params: userIdSchema, body: updateUserSchema } ), updateUser);
router.delete("/:id", validate({ params: userIdSchema }), deleteUser);

export default router;
