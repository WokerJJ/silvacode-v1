import express from "express";
import usersRouter from "./routes/users.js";
import cropsRouter from "./routes/crops.js";
import gardensRouter from "./routes/gardens.js";

const app = express();
app.use(express.json());

// Rutas
app.use("/api/users", usersRouter);
app.use("/api/crops", cropsRouter);
app.use("/api/gardens", gardensRouter);

// Ruta raíz
app.get("/api", (req, res) => {
    res.json({ message: "SilvaCode Backend funcionando 🚀" });
});

export default app;
