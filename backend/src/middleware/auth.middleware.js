import crypto from "crypto";
import Usuario from "../models/Usuario.js";

const AUTH_SECRET = process.env.AUTH_SECRET || "mi-cajita-dev-secret-cambiar";

const base64url = (value) => {
  return Buffer.from(value).toString("base64url");
};

const signPayload = (payloadBase64) => {
  return crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadBase64)
    .digest("base64url");
};

const safeCompare = (a, b) => {
  const bufferA = Buffer.from(a || "");
  const bufferB = Buffer.from(b || "");

  if (bufferA.length !== bufferB.length) return false;

  return crypto.timingSafeEqual(bufferA, bufferB);
};

export const firmarToken = (usuario) => {
  const payload = {
    id: String(usuario._id),
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    iat: Date.now(),
  };

  const payloadBase64 = base64url(JSON.stringify(payload));
  const signature = signPayload(payloadBase64);

  return `${payloadBase64}.${signature}`;
};

export const verificarToken = (token) => {
  if (!token || typeof token !== "string") return null;

  const [payloadBase64, signature] = token.split(".");

  if (!payloadBase64 || !signature) return null;

  const expectedSignature = signPayload(payloadBase64);

  if (!safeCompare(signature, expectedSignature)) return null;

  try {
    return JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    const payload = verificarToken(token);

    if (!payload?.id) {
      return res.status(401).json({ message: "Sesión no válida. Inicia sesión nuevamente." });
    }

    const usuario = await Usuario.findById(payload.id);

    if (!usuario) {
      return res.status(401).json({ message: "Usuario no encontrado. Inicia sesión nuevamente." });
    }

    req.usuario = {
      id: String(usuario._id),
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    res.status(500).json({
      message: "Error al validar la sesión",
      error: error.message,
    });
  }
};

export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: "Sesión no válida. Inicia sesión nuevamente." });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ message: "No tienes permisos para acceder a esta sección." });
    }

    next();
  };
};
