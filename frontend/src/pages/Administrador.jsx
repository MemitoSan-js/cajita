import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addAhorroCaja,
  createCaja,
  createUsuario,
  deleteCaja,
  deleteUsuario,
  getCajas,
  getMetaGlobal,
  getUsuarios,
  updateCaja,
  updateMetaGlobal,
  updateUsuario,
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

const avatarColors = [
  "bg-[#E1F5EE] text-[#0F6E56]",
  "bg-[#E6F1FB] text-[#185FA5]",
  "bg-[#FAEEDA] text-[#854F0B]",
  "bg-[#FBEAF0] text-[#993556]",
];

export default function Administrador() {
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const [page, setPage] = useState("cajitas");

  const [cajas, setCajas] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const [modalCajaOpen, setModalCajaOpen] = useState(false);
  const [modalDeleteCajaOpen, setModalDeleteCajaOpen] = useState(false);
  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [modalDeleteUserOpen, setModalDeleteUserOpen] = useState(false);

  const [deleteCajaId, setDeleteCajaId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const [addAmounts, setAddAmounts] = useState({});
  const [metaGlobal, setMetaGlobal] = useState(80000);
  const [metaDesc, setMetaDesc] = useState("Meta anual del equipo");

  const [toastCaja, setToastCaja] = useState("");
  const [toastUser, setToastUser] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [cajaForm, setCajaForm] = useState({
    id: null,
    nombre: "",
    desc: "",
    meta: "",
    color: "#1D9E75",
  });

  const [userForm, setUserForm] = useState({
    id: null,
    nombre: "",
    apellido: "",
    email: "",
    rol: "usuario",
    pass: "",
    pass2: "",
  });

  const pageTitles = {
    cajitas: "Mis cajitas",
    metas: "Configurar metas",
    usuarios: "Usuarios",
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setErrorGeneral("");

      const [cajasDB, usuariosDB, metaDB] = await Promise.all([
        getCajas(),
        getUsuarios(),
        getMetaGlobal(),
      ]);

      setCajas(Array.isArray(cajasDB) ? cajasDB : []);
      setUsers(Array.isArray(usuariosDB) ? usuariosDB : []);

      if (metaDB) {
        setMetaGlobal(metaDB.cantidad || 80000);
        setMetaDesc(metaDB.descripcion || "Meta anual del equipo");
      }
    } catch (error) {
      console.error(error);
      setErrorGeneral(error.message || "No se pudo conectar con el backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, []);

  const fmt = (n) => "$" + Math.round(Number(n || 0)).toLocaleString("es-MX");

  const pct = (ahorrado, meta) => {
    if (!meta || meta <= 0) return 0;
    return Math.min(Math.round((ahorrado / meta) * 100), 100);
  };

  const initials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const totalAhorrado = cajas.reduce(
    (acc, caja) => acc + Number(caja.ahorrado || 0),
    0
  );

  const metasLogradas = cajas.filter(
    (caja) => Number(caja.ahorrado || 0) >= Number(caja.meta || 0)
  ).length;

  const resetCajaForm = () => {
    setCajaForm({
      id: null,
      nombre: "",
      desc: "",
      meta: "",
      color: "#1D9E75",
    });
    setToastCaja("");
  };

  const resetUserForm = () => {
    setUserForm({
      id: null,
      nombre: "",
      apellido: "",
      email: "",
      rol: "usuario",
      pass: "",
      pass2: "",
    });
    setToastUser("");
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  const openNewCajaModal = () => {
    resetCajaForm();
    setModalCajaOpen(true);
  };

  const closeCajaModal = () => {
    setModalCajaOpen(false);
    resetCajaForm();
  };

  const openEditCajaModal = (caja) => {
    setCajaForm({
      id: caja._id,
      nombre: caja.nombre,
      desc: caja.desc || "",
      meta: caja.meta,
      color: caja.color || "#1D9E75",
    });

    setToastCaja("");
    setModalCajaOpen(true);
  };

  const saveCaja = async () => {
    try {
      const nombre = cajaForm.nombre.trim();
      const meta = Number(cajaForm.meta);

      if (!nombre) {
        setToastCaja("Ingresa un nombre para la cajita");
        return;
      }

      if (!meta || meta <= 0) {
        setToastCaja("Ingresa una meta válida");
        return;
      }

      const data = {
        nombre,
        desc: cajaForm.desc.trim(),
        meta,
        color: cajaForm.color,
      };

      if (cajaForm.id) {
        await updateCaja(cajaForm.id, data);
      } else {
        await createCaja(data);
      }

      closeCajaModal();
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setToastCaja(error.message || "No se pudo guardar la cajita");
    }
  };

  const askDeleteCaja = (id) => {
    setDeleteCajaId(id);
    setModalDeleteCajaOpen(true);
  };

  const confirmDeleteCaja = async () => {
    try {
      await deleteCaja(deleteCajaId);
      setDeleteCajaId(null);
      setModalDeleteCajaOpen(false);
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setErrorGeneral("No se pudo eliminar la cajita");
    }
  };

  const addAmountToCaja = async (id) => {
    try {
      const value = Number(addAmounts[id]);

      if (!value || value <= 0) return;

      await addAhorroCaja(id, value);

      setAddAmounts((prev) => ({
        ...prev,
        [id]: "",
      }));

      await cargarDatos();
    } catch (error) {
      console.error(error);
      setErrorGeneral("No se pudo agregar el ahorro");
    }
  };

  const openNewUserModal = () => {
    resetUserForm();
    setModalUserOpen(true);
  };

  const closeUserModal = () => {
    setModalUserOpen(false);
    resetUserForm();
  };

  const openEditUserModal = (user) => {
    const parts = user.nombre.split(" ");

    setUserForm({
      id: user._id,
      nombre: parts[0] || "",
      apellido: parts.slice(1).join(" ") || "",
      email: user.email,
      rol: user.rol,
      pass: "",
      pass2: "",
    });

    setToastUser("");
    setModalUserOpen(true);
  };

  const saveUser = async () => {
    try {
      const nombre = userForm.nombre.trim();
      const apellido = userForm.apellido.trim();
      const email = userForm.email.trim();
      const nombreCompleto = `${nombre}${apellido ? " " + apellido : ""}`;

      if (!nombre || !email) {
        setToastUser("Nombre y correo son requeridos");
        return;
      }

      if (!userForm.id && !userForm.pass) {
        setToastUser("La contraseña es requerida");
        return;
      }

      if (userForm.pass && userForm.pass !== userForm.pass2) {
        setToastUser("Las contraseñas no coinciden");
        return;
      }

      const data = {
        nombre: nombreCompleto,
        email,
        rol: userForm.rol,
      };

      if (userForm.pass) {
        data.password = userForm.pass;
      }

      if (userForm.id) {
        await updateUsuario(userForm.id, data);
      } else {
        await createUsuario(data);
      }

      closeUserModal();
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setToastUser(error.message || "No se pudo guardar el usuario");
    }
  };

  const askDeleteUser = (id) => {
    setDeleteUserId(id);
    setModalDeleteUserOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUsuario(deleteUserId);
      setDeleteUserId(null);
      setModalDeleteUserOpen(false);
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setErrorGeneral("No se pudo eliminar el usuario");
    }
  };

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = [
      "Ingresa contraseña",
      "Muy débil",
      "Regular",
      "Buena",
      "Muy fuerte",
    ];

    return {
      score,
      label: password.length === 0 ? labels[0] : labels[score] || "Muy débil",
    };
  };

  const passwordStrength = getPasswordStrength(userForm.pass);

  const getStrengthColor = (index) => {
    if (index > passwordStrength.score) return "bg-slate-200";
    if (passwordStrength.score <= 1) return "bg-[#E24B4A]";
    if (passwordStrength.score === 2) return "bg-[#EF9F27]";
    if (passwordStrength.score === 3) return "bg-[#1D9E75]";
    return "bg-[#0F6E56]";
  };

  const updateCajaMeta = async (id, newMeta) => {
    try {
      const caja = cajas.find((item) => item._id === id);
      const meta = Number(newMeta);

      if (!caja || !meta || meta <= 0) return;

      await updateCaja(id, {
        nombre: caja.nombre,
        desc: caja.desc,
        color: caja.color,
        meta,
      });

      await cargarDatos();
    } catch (error) {
      console.error(error);
      setErrorGeneral("No se pudo actualizar la meta");
    }
  };

  const updateGlobalMeta = async () => {
    try {
      const cantidad = Number(metaGlobal);

      if (!cantidad || cantidad <= 0) {
        setErrorGeneral("La meta global debe ser mayor a 0");
        return;
      }

      const metaActualizada = await updateMetaGlobal({
        cantidad,
        descripcion: metaDesc,
      });

      setMetaGlobal(metaActualizada.cantidad);
      setMetaDesc(metaActualizada.descripcion);
      setErrorGeneral("");
    } catch (error) {
      console.error(error);
      setErrorGeneral(error.message || "No se pudo actualizar la meta global");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-[380px] min-h-screen mx-auto bg-slate-50 pb-20">
        <h2 className="sr-only">
          Sistema Mi Cajita — gestión de metas, cajitas y usuarios
        </h2>

        <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <i
                className="ti ti-piggy-bank text-white text-base"
                aria-hidden="true"
              ></i>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">Mi Cajita</p>
              <p className="text-[13px] text-slate-500">{pageTitles[page]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center text-[11px] font-medium">
              {(usuario?.nombre || "AD")
                .split(" ")
                .filter(Boolean)
                .map((word) => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-500 text-[11px] font-medium hover:bg-slate-50"
            >
              Salir
            </button>
          </div>
        </header>

        {errorGeneral && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
            {errorGeneral}
          </div>
        )}

        {loading && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs">
            Cargando datos...
          </div>
        )}

        {page === "cajitas" && (
          <section className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-900">
                Mis cajitas
              </span>

              <button
                type="button"
                onClick={openNewCajaModal}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#1D9E75] rounded-lg bg-transparent text-[#0F6E56] text-xs font-medium hover:bg-[#E1F5EE]"
              >
                <i className="ti ti-plus" aria-hidden="true"></i>
                Nueva cajita
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <MiniStat value={cajas.length} label="Cajitas activas" />
              <MiniStat value={fmt(totalAhorrado)} label="Total ahorrado" />
              <MiniStat value={metasLogradas} label="Metas logradas" />
            </div>

            {cajas.length === 0 ? (
              <EmptyState
                icon="ti ti-inbox"
                text={
                  <>
                    Aún no tienes cajitas.
                    <br />
                    Crea tu primera arriba.
                  </>
                }
              />
            ) : (
              <div>
                {cajas.map((caja) => (
                  <CajaCard
                    key={caja._id}
                    caja={caja}
                    percent={pct(caja.ahorrado, caja.meta)}
                    value={addAmounts[caja._id] || ""}
                    onChangeAmount={(value) =>
                      setAddAmounts((prev) => ({
                        ...prev,
                        [caja._id]: value,
                      }))
                    }
                    onAdd={() => addAmountToCaja(caja._id)}
                    onEdit={() => openEditCajaModal(caja)}
                    onDelete={() => askDeleteCaja(caja._id)}
                    fmt={fmt}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {page === "metas" && (
          <section className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-900">
                Configurar metas
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Ajusta la meta global de ahorro del sistema y las metas
              individuales por cajita.
            </p>

            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-3">
              <p className="text-xs font-medium text-slate-900 mb-3">
                Meta global del sistema
              </p>

              <FormField label="Cantidad meta (MXN)">
                <input
                  type="number"
                  placeholder="80000"
                  step="1000"
                  value={metaGlobal}
                  onChange={(e) => setMetaGlobal(e.target.value)}
                  className="input-base"
                />
              </FormField>

              <FormField label="Descripción">
                <input
                  type="text"
                  placeholder="Ej. Meta anual del equipo"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="input-base"
                />
              </FormField>

              <button
                type="button"
                onClick={updateGlobalMeta}
                className="w-full mt-2 py-3 rounded-lg bg-[#1D9E75] text-white text-[13px] font-medium hover:bg-[#0F6E56]"
              >
                Actualizar meta global
              </button>
            </div>

            <p className="text-xs font-medium text-slate-900 mb-2">
              Metas por cajita
            </p>

            {cajas.length === 0 ? (
              <p className="text-xs text-slate-500">
                Crea cajitas para configurar sus metas individualmente.
              </p>
            ) : (
              <div>
                {cajas.map((caja) => (
                  <div
                    key={caja._id}
                    className="bg-white border border-slate-200 rounded-xl p-5 mb-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: caja.color }}
                      ></div>

                      <p className="text-[13px] font-medium text-slate-900">
                        {caja.nombre}
                      </p>
                    </div>

                    <FormField label="Meta de ahorro (MXN)">
                      <input
                        type="number"
                        defaultValue={caja.meta}
                        step="1000"
                        onBlur={(e) => updateCajaMeta(caja._id, e.target.value)}
                        className="input-base"
                      />
                    </FormField>

                    <button
                      type="button"
                      onClick={() => updateCajaMeta(caja._id, caja.meta)}
                      className="px-4 py-2 rounded-lg text-white text-xs font-medium"
                      style={{ backgroundColor: caja.color }}
                    >
                      Actualizar meta
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "usuarios" && (
          <section className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-900">
                Usuarios
              </span>

              <button
                type="button"
                onClick={openNewUserModal}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#1D9E75] rounded-lg bg-transparent text-[#0F6E56] text-xs font-medium hover:bg-[#E1F5EE]"
              >
                <i className="ti ti-user-plus" aria-hidden="true"></i>
                Nuevo
              </button>
            </div>

            {users.length === 0 ? (
              <EmptyState
                icon="ti ti-user-off"
                text="No hay usuarios registrados."
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {users.map((user, index) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-200 last:border-b-0"
                  >
                    <div
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        avatarColors[index % avatarColors.length]
                      }`}
                    >
                      {initials(user.nombre)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 truncate">
                        {user.nombre}
                      </p>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {user.email} ·{" "}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            user.rol === "admin"
                              ? "bg-[#E6F1FB] text-[#185FA5]"
                              : "bg-[#E1F5EE] text-[#0F6E56]"
                          }`}
                        >
                          {user.rol}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <IconButton
                        icon="ti ti-edit"
                        label="Editar usuario"
                        onClick={() => openEditUserModal(user)}
                      />

                      <IconButton
                        icon="ti ti-trash"
                        label="Eliminar usuario"
                        danger
                        onClick={() => askDeleteUser(user._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[380px] flex border-t border-slate-200 bg-white z-30">
          <NavButton
            active={page === "cajitas"}
            icon="ti ti-layout-cards"
            label="Cajitas"
            onClick={() => setPage("cajitas")}
          />

          <NavButton
            active={page === "metas"}
            icon="ti ti-target"
            label="Metas"
            onClick={() => setPage("metas")}
          />

          <NavButton
            active={page === "usuarios"}
            icon="ti ti-users"
            label="Usuarios"
            onClick={() => setPage("usuarios")}
          />
        </nav>

        {modalCajaOpen && (
          <Modal>
            <p className="text-[15px] font-medium text-slate-900 mb-4">
              {cajaForm.id ? "Editar cajita" : "Nueva cajita"}
            </p>

            {toastCaja && <Toast type="error" text={toastCaja} />}

            <FormField label="Nombre de la cajita">
              <input
                type="text"
                placeholder="Ej. Vacaciones Cancún"
                value={cajaForm.nombre}
                onChange={(e) =>
                  setCajaForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <FormField label="Descripción (opcional)">
              <input
                type="text"
                placeholder="Para qué es esta cajita"
                value={cajaForm.desc}
                onChange={(e) =>
                  setCajaForm((prev) => ({ ...prev, desc: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <FormField label="Meta de ahorro (MXN)">
              <input
                type="number"
                placeholder="80000"
                step="1000"
                value={cajaForm.meta}
                onChange={(e) =>
                  setCajaForm((prev) => ({ ...prev, meta: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <div className="mb-4">
              <label className="block text-[11px] text-slate-500 mb-1 tracking-wide">
                Color de la cajita
              </label>

              <div className="flex gap-1.5 mt-1.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setCajaForm((prev) => ({ ...prev, color }))
                    }
                    className={`w-5 h-5 rounded-full border-2 ${
                      cajaForm.color === color
                        ? "border-slate-900"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Seleccionar color ${color}`}
                  ></button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={saveCaja}
              className="w-full py-3 rounded-lg bg-[#1D9E75] text-white text-[13px] font-medium hover:bg-[#0F6E56]"
            >
              Guardar cajita
            </button>

            <button
              type="button"
              onClick={closeCajaModal}
              className="w-full mt-1.5 py-2.5 border border-slate-300 rounded-lg text-slate-500 text-[13px] hover:bg-slate-50"
            >
              Cancelar
            </button>
          </Modal>
        )}

        {modalDeleteCajaOpen && (
          <Modal>
            <p className="text-[15px] font-medium text-slate-900 mb-4">
              ¿Eliminar cajita?
            </p>

            <p className="text-[13px] text-slate-500 mb-4">
              Esta acción no se puede deshacer. Se perderán todos los datos de
              progreso.
            </p>

            <button
              type="button"
              onClick={confirmDeleteCaja}
              className="w-full py-2.5 border border-[#F09595] rounded-lg text-[#A32D2D] text-[13px] hover:bg-[#FCEBEB]"
            >
              Sí, eliminar
            </button>

            <button
              type="button"
              onClick={() => setModalDeleteCajaOpen(false)}
              className="w-full mt-1.5 py-2.5 border border-slate-300 rounded-lg text-slate-500 text-[13px] hover:bg-slate-50"
            >
              Cancelar
            </button>
          </Modal>
        )}

        {modalUserOpen && (
          <Modal>
            <p className="text-[15px] font-medium text-slate-900 mb-4">
              {userForm.id ? "Editar usuario" : "Nuevo usuario"}
            </p>

            {toastUser && <Toast type="error" text={toastUser} />}

            <div className="grid grid-cols-2 gap-2.5">
              <FormField label="Nombre">
                <input
                  type="text"
                  placeholder="Ana"
                  value={userForm.nombre}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      nombre: e.target.value,
                    }))
                  }
                  className="input-base"
                />
              </FormField>

              <FormField label="Apellido">
                <input
                  type="text"
                  placeholder="García"
                  value={userForm.apellido}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      apellido: e.target.value,
                    }))
                  }
                  className="input-base"
                />
              </FormField>
            </div>

            <FormField label="Correo electrónico">
              <input
                type="email"
                placeholder="ana@correo.com"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input-base"
              />
            </FormField>

            <FormField label="Rol">
              <select
                value={userForm.rol}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, rol: e.target.value }))
                }
                className="input-base"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </FormField>

            <FormField label="Contraseña">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={userForm.pass}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, pass: e.target.value }))
                  }
                  className="input-base pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-label="Mostrar contraseña"
                >
                  <i
                    className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>

              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={`flex-1 h-[3px] rounded-full ${getStrengthColor(
                      item
                    )}`}
                  ></div>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 mt-1">
                {passwordStrength.label}
              </p>
            </FormField>

            <FormField label="Confirmar contraseña">
              <div className="relative">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={userForm.pass2}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, pass2: e.target.value }))
                  }
                  className="input-base pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-label="Mostrar contraseña"
                >
                  <i
                    className={
                      showPasswordConfirm ? "ti ti-eye-off" : "ti ti-eye"
                    }
                    aria-hidden="true"
                  ></i>
                </button>
              </div>
            </FormField>

            <button
              type="button"
              onClick={saveUser}
              className="w-full py-3 rounded-lg bg-[#1D9E75] text-white text-[13px] font-medium hover:bg-[#0F6E56]"
            >
              Guardar usuario
            </button>

            <button
              type="button"
              onClick={closeUserModal}
              className="w-full mt-1.5 py-2.5 border border-slate-300 rounded-lg text-slate-500 text-[13px] hover:bg-slate-50"
            >
              Cancelar
            </button>
          </Modal>
        )}

        {modalDeleteUserOpen && (
          <Modal>
            <p className="text-[15px] font-medium text-slate-900 mb-4">
              ¿Eliminar usuario?
            </p>

            <p className="text-[13px] text-slate-500 mb-4">
              Se eliminará permanentemente la cuenta y sus datos.
            </p>

            <button
              type="button"
              onClick={confirmDeleteUser}
              className="w-full py-2.5 border border-[#F09595] rounded-lg text-[#A32D2D] text-[13px] hover:bg-[#FCEBEB]"
            >
              Sí, eliminar
            </button>

            <button
              type="button"
              onClick={() => setModalDeleteUserOpen(false)}
              className="w-full mt-1.5 py-2.5 border border-slate-300 rounded-lg text-slate-500 text-[13px] hover:bg-slate-50"
            >
              Cancelar
            </button>
          </Modal>
        )}
      </section>
    </main>
  );
}

function CajaCard({
  caja,
  percent,
  value,
  onChangeAmount,
  onAdd,
  onEdit,
  onDelete,
  fmt,
}) {
  const done = percent >= 100;

  let badgeClass = "bg-[#F1EFE8] text-[#5F5E5A]";
  let badgeText = "Iniciando";

  if (done) {
    badgeClass = "bg-[#E1F5EE] text-[#0F6E56]";
    badgeText = "Completada";
  } else if (percent >= 50) {
    badgeClass = "bg-[#FAEEDA] text-[#854F0B]";
    badgeText = "En progreso";
  }

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-3">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: caja.color }}
              ></div>

              <p className="text-sm font-medium text-slate-900">
                {caja.nombre}
              </p>
            </div>

            <p className="text-[11px] text-slate-500">{caja.desc}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}
            >
              {badgeText}
            </span>

            <div className="flex gap-1.5">
              <IconButton
                icon="ti ti-edit"
                label="Editar cajita"
                onClick={onEdit}
              />

              <IconButton
                icon="ti ti-trash"
                label="Eliminar cajita"
                danger
                onClick={onDelete}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-100 rounded-full h-2 overflow-hidden my-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: caja.color,
            }}
          ></div>
        </div>

        <div className="flex justify-between text-[11px] text-slate-500">
          <span className="font-medium text-slate-900">{percent}% logrado</span>
          <span className="font-medium text-slate-900">
            {fmt(caja.ahorrado)} de {fmt(caja.meta)}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 px-5 py-3 border-t border-slate-200">
        <input
          type="number"
          placeholder="Agregar cantidad..."
          step="100"
          value={value}
          onChange={(e) => onChangeAmount(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-[13px] outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-emerald-100"
        />

        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 rounded-lg text-white text-xs font-medium hover:opacity-90"
          style={{ backgroundColor: caja.color }}
        >
          + Agregar
        </button>
      </div>
    </article>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="flex-1 bg-slate-100 rounded-lg px-3 py-2.5">
      <p className="text-lg font-medium text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function IconButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-7 h-7 border border-slate-300 rounded-lg bg-transparent flex items-center justify-center text-sm transition ${
        danger
          ? "text-slate-500 hover:bg-[#FCEBEB] hover:text-[#A32D2D] hover:border-[#F09595]"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <i className={icon} aria-hidden="true"></i>
    </button>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] bg-white ${
        active ? "text-[#1D9E75]" : "text-slate-500"
      }`}
    >
      <i className={`${icon} text-xl`} aria-hidden="true"></i>
      {label}
    </button>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-5">
      <div className="w-full max-w-[340px] bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
        {children}
      </div>
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

function Toast({ text, type = "success" }) {
  return (
    <div
      className={`mb-3.5 px-3 py-2 rounded-lg border text-xs ${
        type === "error"
          ? "bg-[#FCEBEB] border-[#F09595] text-[#A32D2D]"
          : "bg-[#E1F5EE] border-[#5DCAA5] text-[#0F6E56]"
      }`}
    >
      {text}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="text-center px-4 py-8 text-slate-500 text-[13px]">
      <div className="text-3xl text-slate-300 mb-2">
        <i className={icon} aria-hidden="true"></i>
      </div>
      {text}
    </div>
  );
}