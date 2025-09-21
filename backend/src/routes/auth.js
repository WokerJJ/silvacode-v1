import express from "express";
import validate from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", validate({ body: registerSchema}), register);
router.post("/login", validate({ body: loginSchema}), login);

export default router;
