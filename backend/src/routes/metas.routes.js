import { Router } from "express";
import MetaGlobal from "../models/MetaGlobal.js";

const router = Router();

router.get("/global", async (_req, res) => {
  try {
    const meta = await MetaGlobal.findOneAndUpdate(
      { clave: "global" },
      { $setOnInsert: { cantidad: 80000, descripcion: "Meta anual del equipo" } },
      { new: true, upsert: true }
    );

    res.json(meta);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener meta global",
      error: error.message,
    });
  }
});

router.put("/global", async (req, res) => {
  try {
    const cantidad = Number(req.body.cantidad ?? req.body.meta ?? req.body.monto);
    const descripcion = req.body.descripcion ?? req.body.desc;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ message: "La meta global debe ser mayor a 0" });
    }

    const meta = await MetaGlobal.findOneAndUpdate(
      { clave: "global" },
      {
        cantidad,
        descripcion: descripcion?.trim() || "Meta anual del equipo",
      },
      { new: true, upsert: true }
    );

    res.json(meta);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar meta global",
      error: error.message,
    });
  }
});

export default router;
