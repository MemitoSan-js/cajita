import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../db.js";
import Usuario from "../models/Usuario.js";

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@correo.com";
    const password = "123456";

    let admin = await Usuario.findOne({ email }).select("+password");

    if (admin) {
      admin.nombre = "Administrador";
      admin.rol = "admin";
      admin.password = password;
      await admin.save();
      console.log("Administrador actualizado correctamente");
    } else {
      admin = await Usuario.create({
        nombre: "Administrador",
        email,
        rol: "admin",
        password,
      });
      console.log("Administrador creado correctamente");
    }

    console.log(`Base de datos: ${mongoose.connection.name}`);
    console.log(`Correo: ${email}`);
    console.log(`Contraseña: ${password}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error al crear/actualizar administrador:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
