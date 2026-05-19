import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import cajasRoutes from "./routes/cajas.routes.js";
import metasRoutes from "./routes/metas.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import { requireAuth, requireRole } from "./middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 4001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Servidor Mi Cajita funcionando");
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "API Mi Cajita funcionando",
    port: PORT,
  });
});

app.use("/api/auth", authRoutes);

// Rutas protegidas por sesión.
// - admin: puede administrar todas las cajitas, usuarios y metas.
// - usuario: solo puede administrar sus propias cajitas.
app.use("/api/cajas", requireAuth, cajasRoutes);
app.use("/api/cajitas", requireAuth, cajasRoutes);

app.use("/api/usuarios", requireAuth, requireRole("admin"), usuariosRoutes);
app.use("/api/users", requireAuth, requireRole("admin"), usuariosRoutes);

app.use("/api/metas", requireAuth, requireRole("admin"), metasRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const startServer = async () => {
  await connectDB();
};

startServer();
