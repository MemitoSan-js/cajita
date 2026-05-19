import mongoose from "mongoose";

const cajaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la cajita es obligatorio"],
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
      default: "",
    },
    meta: {
      type: Number,
      required: [true, "La meta es obligatoria"],
      min: [1, "La meta debe ser mayor a 0"],
    },
    ahorrado: {
      type: Number,
      default: 0,
      min: [0, "El ahorro no puede ser negativo"],
    },
    color: {
      type: String,
      default: "#1D9E75",
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "cajas",
  }
);

cajaSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Caja", cajaSchema);
