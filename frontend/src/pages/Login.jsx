import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/api";
import { getHomeByRole, saveSession } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Ingresa correo y contraseña");
        return;
      }

      setLoading(true);

      const data = await loginUsuario(email.trim(), password);
      const usuario = data.usuario;

      if (!data.token || !usuario?.rol) {
        setError("El servidor no devolvió una sesión válida");
        return;
      }

      saveSession({ usuario, token: data.token });
      navigate(getHomeByRole(usuario.rol), { replace: true });
    } catch (error) {
      console.error(error);
      setError(error.message || "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-[380px]">
        <h2 className="sr-only">Pantalla de inicio de sesión</h2>

        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#1D9E75] flex items-center justify-center mb-3.5 shadow-sm">
            <i
              className="ti ti-piggy-bank text-white text-[28px]"
              aria-hidden="true"
            ></i>
          </div>

          <p className="text-xl font-medium text-slate-900 m-0">Mi Cajita</p>

          <p className="text-sm text-slate-500 mt-1">Bienvenido de vuelta</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-7 shadow-sm">
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-xs text-slate-500 mb-1.5 tracking-wide"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full box-border px-3.5 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 text-[15px] outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-xs text-slate-500 mb-1.5 tracking-wide"
            >
              Contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                className="w-full box-border px-3.5 py-3 pr-11 border border-slate-300 rounded-lg bg-white text-slate-900 text-[15px] outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-500 p-0 text-lg flex items-center"
              >
                <i
                  className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-[#1D9E75] text-white text-[15px] font-medium border-none cursor-pointer transition hover:bg-[#0F6E56] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </div>
      </section>
    </main>
  );
}
