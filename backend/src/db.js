import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("Falta configurar MONGO_URI en el archivo .env");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB conectado: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Error al conectar MongoDB:", error.message);
    process.exit(1);
  }
};
