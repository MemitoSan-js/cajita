import mongoose from "mongoose";

const metaGlobalSchema = new mongoose.Schema(
  {
    clave: {
      type: String,
      default: "global",
      unique: true,
    },
    cantidad: {
      type: Number,
      default: 80000,
      min: 1,
    },
    descripcion: {
      type: String,
      default: "Meta anual del equipo",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "metas_globales",
  }
);

metaGlobalSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("MetaGlobal", metaGlobalSchema);
