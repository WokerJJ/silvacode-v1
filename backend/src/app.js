import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import authMiddleware from "./middlewares/authMiddleware.js";

import usersRouter from "./routes/users.js";
import cropsRouter from "./routes/crops.js";
import gardensRouter from "./routes/gardens.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(express.json());

// Rutas públicas
app.use("/auth", authRoutes);

// Middleware global para rutas privadas
app.use("/api/users", authMiddleware, usersRouter);
app.use("/api/crops", authMiddleware, cropsRouter);
app.use("/api/gardens", authMiddleware, gardensRouter);

// Ruta raíz
app.get("/api", (req, res) => {
    res.json({ message: "SilvaCode Backend funcionando 🚀" });
});

app.use(errorHandler);

export default app;
