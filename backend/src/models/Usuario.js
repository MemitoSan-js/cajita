import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    rol: {
      type: String,
      enum: ["usuario", "admin"],
      default: "usuario",
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "usuarios",
  }
);

usuarioSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

usuarioSchema.methods.compararPassword = function compararPassword(password) {
  return bcrypt.compare(password, this.password);
};

usuarioSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Usuario", usuarioSchema);
