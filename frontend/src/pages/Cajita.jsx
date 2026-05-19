import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addAhorroCaja,
  createCaja,
  deleteCaja,
  getCajasUsuario,
} from "../services/api";
import { clearSession } from "../utils/auth";

const colors = [
  "#1D9E75",
  "#378ADD",
  "#D85A30",
  "#D4537E",
  "#BA7517",
  "#7F77DD",
];

export default function Cajita() {
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);

  const [cajas, setCajas] = useState([]);
  const [addAmounts, setAddAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    desc: "",
    meta: "",
    color: "#1D9E75",
  });

  const cargarCajas = async () => {
    if (!usuario?.id) return;

    try {
      setError("");
      setLoading(true);
      const cajasDB = await getCajasUsuario(usuario.id);
      setCajas(cajasDB);
    } catch (error) {
      console.error(error);
      setError(error.message || "No se pudieron cargar tus cajitas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCajas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (number) => {
    return "$" + Math.round(Number(number || 0)).toLocaleString("es-MX");
  };

  const pct = (ahorrado, meta) => {
    const saved = Number(ahorrado || 0);
    const goal = Number(meta || 0);

    if (goal <= 0) return 0;

    return Math.min(Math.round((saved / goal) * 100), 100);
  };

  const totalAhorrado = cajas.reduce(
    (acc, caja) => acc + Number(caja.ahorrado || 0),
    0
  );

  const metasLogradas = cajas.filter(
    (caja) => Number(caja.ahorrado || 0) >= Number(caja.meta || 0)
  ).length;

  const resetForm = () => {
    setForm({
      nombre: "",
      desc: "",
      meta: "",
      color: "#1D9E75",
    });
  };

  const guardarCaja = async () => {
    try {
      setError("");
      setSuccess("");

      const nombre = form.nombre.trim();
      const meta = Number(form.meta);

      if (!usuario?.id) {
        setError("Tu sesión no es válida. Inicia sesión nuevamente.");
        return;
      }

      if (!nombre) {
        setError("Ingresa el nombre de la cajita");
        return;
      }

      if (!meta || meta <= 0) {
        setError("Ingresa una meta válida");
        return;
      }

      setSaving(true);

      await createCaja({
        nombre,
        desc: form.desc.trim(),
        meta,
        color: form.color,
        usuario: usuario.id,
      });

      resetForm();
      setShowForm(false);
      setSuccess("Cajita creada correctamente");
      await cargarCajas();
    } catch (error) {
      console.error(error);
      setError(error.message || "No se pudo crear la cajita");
    } finally {
      setSaving(false);
    }
  };

  const addAmount = async (cajaId) => {
    try {
      setError("");
      setSuccess("");

      const value = Number(addAmounts[cajaId]);

      if (!value || value <= 0) return;

      await addAhorroCaja(cajaId, value, usuario.id);

      setAddAmounts((prev) => ({
        ...prev,
        [cajaId]: "",
      }));

      await cargarCajas();
    } catch (error) {
      console.error(error);
      setError(error.message || "No se pudo agregar el ahorro");
    }
  };

  const deleteUserCaja = async (caja) => {
    const confirmar = window.confirm(
      `¿Eliminar la cajita "${caja.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setError("");
      setSuccess("");

      await deleteCaja(caja._id, { usuario: usuario.id });
      setSuccess("Cajita eliminada correctamente");
      await cargarCajas();
    } catch (error) {
      console.error(error);
      setError(error.message || "No se pudo eliminar la cajita");
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (!usuario?.id) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 flex items-center justify-center">
        <section className="w-full max-w-[380px] bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-4xl text-slate-300 mb-3">
            <i className="ti ti-lock" aria-hidden="true"></i>
          </div>

          <p className="text-base font-medium text-slate-900">
            Sesión no encontrada
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Inicia sesión para administrar tus propias cajitas.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full mt-5 py-3 rounded-lg bg-[#1D9E75] text-white text-sm font-medium hover:bg-[#0F6E56]"
          >
            Ir al login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5">
      <section className="w-full max-w-[380px] mx-auto pb-8">
        <h2 className="sr-only">Mis cajitas de ahorro</h2>

        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500">Mi Cajita</p>
            <p className="text-xl font-semibold text-slate-900 leading-tight">
              Tus cajitas
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {usuario.nombre || usuario.email}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 rounded-lg border border-slate-300 text-slate-500 text-xs hover:bg-white"
          >
            Salir
          </button>
        </header>

        {error && (
          <Alert type="error" text={error} />
        )}

        {success && (
          <Alert type="success" text={success} />
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          <MiniStat value={cajas.length} label="Cajitas" />
          <MiniStat value={fmt(totalAhorrado)} label="Ahorrado" />
          <MiniStat value={metasLogradas} label="Logradas" />
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="w-full mb-3 py-3 rounded-xl bg-[#1D9E75] text-white text-sm font-medium hover:bg-[#0F6E56]"
        >
          {showForm ? "Cerrar formulario" : "+ Crear nueva cajita"}
        </button>

        {showForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900 mb-4">
              Nueva cajita
            </p>

            <FormField label="Nombre de la cajita">
              <input
                type="text"
                placeholder="Ej. Moto nueva"
                value={form.nombre}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <FormField label="Descripción opcional">
              <input
                type="text"
                placeholder="Ej. Ahorro personal"
                value={form.desc}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, desc: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <FormField label="Meta de ahorro">
              <input
                type="number"
                min="1"
                step="100"
                placeholder="10000"
                value={form.meta}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, meta: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <div className="mb-4">
              <label className="block text-[11px] text-slate-500 mb-1 tracking-wide">
                Color
              </label>

              <div className="flex gap-2 mt-1.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      form.color === color ? "border-slate-900" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Seleccionar color ${color}`}
                  ></button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={guardarCaja}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-[#1D9E75] text-white text-sm font-medium hover:bg-[#0F6E56] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cajita"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm">
            Cargando tus cajitas...
          </div>
        ) : cajas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl text-slate-300 mb-3">
              <i className="ti ti-piggy-bank" aria-hidden="true"></i>
            </div>

            <p className="text-base font-medium text-slate-900">
              Aún no tienes cajitas
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Crea tu primera cajita para empezar a registrar tus ahorros.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cajas.map((caja) => (
              <CajaUsuarioCard
                key={caja._id}
                caja={caja}
                percent={pct(caja.ahorrado, caja.meta)}
                fmt={fmt}
                value={addAmounts[caja._id] || ""}
                onChangeAmount={(value) =>
                  setAddAmounts((prev) => ({ ...prev, [caja._id]: value }))
                }
                onAdd={() => addAmount(caja._id)}
                onDelete={() => deleteUserCaja(caja)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CajaUsuarioCard({
  caja,
  percent,
  fmt,
  value,
  onChangeAmount,
  onAdd,
  onDelete,
}) {
  const goal = Number(caja.meta || 0);
  const saved = Number(caja.ahorrado || 0);
  const left = Math.max(goal - saved, 0);
  const completed = percent >= 100;

  const quickAmounts = [100, 500, 1000, 5000];

  const addQuickAmount = (amount) => {
    const current = Number(value || 0);
    onChangeAmount(String(current + amount));
  };

  return (
    <article className="bg-white border border-slate-200 rounded-[18px] shadow-sm px-6 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold tracking-wide text-slate-600 uppercase">
            {caja.nombre || "Mi meta"}
          </p>

          <p className="text-[34px] leading-none font-semibold text-slate-950 mt-1">
            {fmt(saved)}
          </p>

          <p className="text-[13px] text-slate-600 mt-1">
            de {fmt(goal)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
              completed
                ? "bg-[#1D9E75] text-white"
                : "bg-[#DDF7EC] text-[#0F6E56]"
            }`}
          >
            {completed ? "Completada" : "En progreso"}
          </span>

          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center"
            aria-label="Eliminar cajita"
            title="Eliminar cajita"
          >
            <i className="ti ti-trash text-[16px]" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {caja.desc && (
        <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">
          {caja.desc}
        </p>
      )}

      <div className="mt-5">
        <div className="w-full h-3 rounded-full bg-[#F7F5F0] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: caja.color || "#1D9E75",
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[13px] font-medium text-slate-700">
            {percent}%
          </p>

          <p className="text-[13px] font-medium text-slate-700">
            {left > 0 ? `Faltan ${fmt(left)}` : "Meta lograda"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <div className="bg-[#F7F5F0] rounded-lg px-3 py-3">
          <p className="text-[17px] leading-none font-bold text-slate-950">
            {fmt(saved)}
          </p>
          <p className="text-[12px] text-slate-700 mt-1">Ahorrado</p>
        </div>

        <div className="bg-[#F7F5F0] rounded-lg px-3 py-3">
          <p className="text-[17px] leading-none font-bold text-slate-950">
            {fmt(left)}
          </p>
          <p className="text-[12px] text-slate-700 mt-1">Faltante</p>
        </div>

        <div className="bg-[#F7F5F0] rounded-lg px-3 py-3">
          <p className="text-[17px] leading-none font-bold text-slate-950">
            {percent}%
          </p>
          <p className="text-[12px] text-slate-700 mt-1">Completado</p>
        </div>
      </div>

      <div className="border-t border-slate-200 mt-5 pt-4">
        <p className="text-[13px] font-medium text-slate-800 mb-3">
          Agregar ahorros
        </p>

        <div className="grid grid-cols-2 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => addQuickAmount(amount)}
              className="h-9 rounded-lg border border-slate-300 bg-white text-slate-900 text-[14px] font-semibold hover:bg-slate-50 active:scale-[0.98] transition"
            >
              + {fmt(amount)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 mt-3">
          <input
            type="number"
            min="0"
            step="100"
            placeholder="Otra cantidad..."
            value={value}
            onChange={(e) => onChangeAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
            className="w-full min-w-0 h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 text-[15px] outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-100"
          />

          <button
            type="button"
            onClick={onAdd}
            className="h-10 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 text-[14px] font-semibold hover:bg-slate-50 active:scale-[0.98] transition"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
      <p className="text-base font-semibold text-slate-900 truncate">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] text-slate-500 mb-1 tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Alert({ type, text }) {
  const classes =
    type === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div className={`mb-3 px-3 py-2 rounded-lg border text-xs ${classes}`}>
      {text}
    </div>
  );
}
