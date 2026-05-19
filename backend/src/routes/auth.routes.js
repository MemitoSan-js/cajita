import { Router } from "express";
import Usuario from "../models/Usuario.js";
import { firmarToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios",
      });
    }

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!usuario) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const passwordCorrecto = await usuario.compararPassword(password);

    if (!passwordCorrecto) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }

    const token = firmarToken(usuario);

    res.json({
      message: "Inicio de sesión correcto",
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

export default router;
