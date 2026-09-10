import express from "express";
import validate from "../middlewares/validate.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authLimiter from "../middlewares/rateLimiter.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

// authLimiter va antes de validate: no tiene sentido gastar un intento del
// límite en algo que ni siquiera pasó la validación de forma, pero tampoco
// queremos que alguien evada el límite mandando basura a propósito — por
// eso limita primero, sin importar si el body es válido.
router.post("/register", authLimiter, validate({ body: registerSchema}), register);
router.post("/login", authLimiter, validate({ body: loginSchema}), login);

// logout sí requiere estar autenticado: necesita el jti del token que se
// está cerrando, y eso solo lo tenemos después de que authMiddleware lo
// verificó.
router.post("/logout", authMiddleware, logout);

export default router;
