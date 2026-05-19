import { Router } from "express";
import mongoose from "mongoose";
import Usuario from "../models/Usuario.js";

const router = Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/", async (_req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, email, rol, password } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Nombre, correo y contraseña son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existe = await Usuario.findOne({ email: emailNormalizado });

    if (existe) {
      return res.status(400).json({ message: "Ya existe un usuario con ese correo" });
    }

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      email: emailNormalizado,
      rol: rol || "usuario",
      password,
    });

    const usuarioSinPassword = await Usuario.findById(nuevoUsuario._id);
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear usuario",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    const { nombre, email, rol, password } = req.body;
    const usuario = await Usuario.findById(req.params.id).select("+password");

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ message: "El nombre no puede estar vacío" });
      }
      usuario.nombre = String(nombre).trim();
    }

    if (email !== undefined) {
      const emailNormalizado = String(email).trim().toLowerCase();

      if (!emailNormalizado) {
        return res.status(400).json({ message: "El correo no puede estar vacío" });
      }

      const existe = await Usuario.findOne({
        email: emailNormalizado,
        _id: { $ne: usuario._id },
      });

      if (existe) {
        return res.status(400).json({ message: "Ya existe otro usuario con ese correo" });
      }

      usuario.email = emailNormalizado;
    }

    if (rol !== undefined) {
      if (!["usuario", "admin"].includes(rol)) {
        return res.status(400).json({ message: "Rol no válido" });
      }
      usuario.rol = rol;
    }

    if (password) {
      usuario.password = password;
    }

    await usuario.save();
    const usuarioActualizado = await Usuario.findById(usuario._id);
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
});

export default router;
