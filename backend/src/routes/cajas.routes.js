import { Router } from "express";
import mongoose from "mongoose";
import Caja from "../models/Caja.js";

const router = Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAdmin = (req) => req.usuario?.rol === "admin";
const usuarioSesionId = (req) => String(req.usuario?.id || "");

const getUsuarioIdAdmin = (req) => {
  return req.query.usuario || req.query.userId || req.body.usuario || req.body.userId || null;
};

const buildFiltroUsuario = (req) => {
  if (!isAdmin(req)) {
    return { usuario: usuarioSesionId(req) };
  }

  const usuarioId = req.query.usuario || req.query.userId;

  if (!usuarioId) {
    return {};
  }

  if (!isValidObjectId(usuarioId)) {
    return null;
  }

  return { usuario: usuarioId };
};

const puedeModificarCaja = (req, caja) => {
  if (isAdmin(req)) return true;
  return caja.usuario && String(caja.usuario) === usuarioSesionId(req);
};

const obtenerUsuarioParaCrear = (req) => {
  if (!isAdmin(req)) {
    return usuarioSesionId(req);
  }

  return getUsuarioIdAdmin(req);
};

router.get("/", async (req, res) => {
  try {
    const filtro = buildFiltroUsuario(req);

    if (filtro === null) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    const cajas = await Caja.find(filtro)
      .populate("usuario", "nombre email rol")
      .sort({ createdAt: -1 });

    res.json(cajas);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener cajitas",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de cajita no válido" });
    }

    const caja = await Caja.findById(req.params.id).populate("usuario", "nombre email rol");

    if (!caja) {
      return res.status(404).json({ message: "Cajita no encontrada" });
    }

    if (!puedeModificarCaja(req, caja)) {
      return res.status(403).json({ message: "No puedes acceder a una cajita de otro usuario" });
    }

    res.json(caja);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener cajita",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, desc, meta, color } = req.body;
    const usuarioId = obtenerUsuarioParaCrear(req);

    if (!nombre?.trim()) {
      return res.status(400).json({ message: "El nombre de la cajita es obligatorio" });
    }

    if (!meta || Number(meta) <= 0) {
      return res.status(400).json({ message: "La meta debe ser mayor a 0" });
    }

    if (usuarioId && !isValidObjectId(usuarioId)) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    const nuevaCaja = await Caja.create({
      nombre: nombre.trim(),
      desc: desc?.trim() || "",
      meta: Number(meta),
      ahorrado: 0,
      color: color || "#1D9E75",
      usuario: usuarioId || null,
    });

    const cajaGuardada = await Caja.findById(nuevaCaja._id).populate("usuario", "nombre email rol");

    res.status(201).json(cajaGuardada);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear cajita",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de cajita no válido" });
    }

    const { nombre, desc, meta, color } = req.body;
    const caja = await Caja.findById(req.params.id);

    if (!caja) {
      return res.status(404).json({ message: "Cajita no encontrada" });
    }

    if (!puedeModificarCaja(req, caja)) {
      return res.status(403).json({ message: "No puedes modificar una cajita de otro usuario" });
    }

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ message: "El nombre no puede estar vacío" });
      }
      caja.nombre = String(nombre).trim();
    }

    if (desc !== undefined) {
      caja.desc = String(desc).trim();
    }

    if (meta !== undefined) {
      const metaNumero = Number(meta);

      if (!metaNumero || metaNumero <= 0) {
        return res.status(400).json({ message: "La meta debe ser mayor a 0" });
      }

      caja.meta = metaNumero;

      if (caja.ahorrado > caja.meta) {
        caja.ahorrado = caja.meta;
      }
    }

    if (color !== undefined) {
      caja.color = color;
    }

    if (isAdmin(req) && (req.body.usuario !== undefined || req.body.userId !== undefined)) {
      const usuarioId = getUsuarioIdAdmin(req);

      if (usuarioId && !isValidObjectId(usuarioId)) {
        return res.status(400).json({ message: "ID de usuario no válido" });
      }

      caja.usuario = usuarioId || null;
    }

    await caja.save();

    const cajaActualizada = await Caja.findById(caja._id).populate("usuario", "nombre email rol");
    res.json(cajaActualizada);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar cajita",
      error: error.message,
    });
  }
});

const agregarAhorro = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de cajita no válido" });
    }

    const monto = Number(req.body.monto ?? req.body.cantidad ?? req.body.amount);

    if (!monto || monto <= 0) {
      return res.status(400).json({ message: "El monto debe ser mayor a 0" });
    }

    const caja = await Caja.findById(req.params.id);

    if (!caja) {
      return res.status(404).json({ message: "Cajita no encontrada" });
    }

    if (!puedeModificarCaja(req, caja)) {
      return res.status(403).json({ message: "No puedes agregar ahorro a una cajita de otro usuario" });
    }

    caja.ahorrado = Math.min(Number(caja.ahorrado || 0) + monto, Number(caja.meta));
    await caja.save();

    const cajaActualizada = await Caja.findById(caja._id).populate("usuario", "nombre email rol");
    res.json(cajaActualizada);
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar ahorro",
      error: error.message,
    });
  }
};

router.put("/:id/agregar", agregarAhorro);
router.put("/:id/ahorro", agregarAhorro);
router.patch("/:id/agregar", agregarAhorro);
router.patch("/:id/ahorro", agregarAhorro);

router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de cajita no válido" });
    }

    const filtro = { _id: req.params.id };

    if (!isAdmin(req)) {
      filtro.usuario = usuarioSesionId(req);
    }

    const caja = await Caja.findOneAndDelete(filtro);

    if (!caja) {
      return res.status(404).json({ message: "Cajita no encontrada o no pertenece al usuario" });
    }

    res.json({ message: "Cajita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar cajita",
      error: error.message,
    });
  }
});

export default router;
