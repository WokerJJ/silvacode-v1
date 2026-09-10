// "./env.js" tiene que ser el primer import del archivo: en ES modules todos
// los imports de un archivo se resuelven antes que su propio código, así que
// si el .env se cargara más abajo, los módulos importados arriba (como
// authMiddleware, que lee JWT_SECRET apenas se importa) ya se habrían
// ejecutado sin esas variables disponibles.
import "./env.js";
import express from "express";
import helmet from "helmet";
import errorHandler from "./middlewares/errorHandler.js";
import authMiddleware from "./middlewares/authMiddleware.js";

import usersRouter from "./routes/users.js";
import cropsRouter from "./routes/crops.js";
import gardensRouter from "./routes/gardens.js";
import authRoutes from "./routes/auth.js";

const app = express();

// helmet pone headers de seguridad estándar (X-Content-Type-Options,
// X-Frame-Options, etc.) que Express no manda por defecto. No reemplaza
// nada de lo de abajo, es higiene HTTP básica.
app.use(helmet());
app.use(express.json());

// Rutas públicas: no pasan por authMiddleware porque todavía no hay token
// (son justo las que lo generan).
app.use("/auth", authRoutes);

// Todo lo que cuelga de /api/* pasa primero por authMiddleware. Si el token
// falta o es inválido, ni siquiera llega al router correspondiente.
app.use("/api/users", authMiddleware, usersRouter);
app.use("/api/crops", authMiddleware, cropsRouter);
app.use("/api/gardens", authMiddleware, gardensRouter);

// Ruta raíz de la API, útil para un chequeo rápido de "¿está vivo el servidor?"
app.get("/api", (req, res) => {
    res.json({ message: "SilvaCode Backend funcionando 🚀" });
});

// Siempre al final: Express solo lo trata como manejador de errores
// (en vez de un middleware normal) por tener 4 parámetros (err, req, res, next).
app.use(errorHandler);

export default app;
