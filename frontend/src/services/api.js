import { clearSession, getAuthToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (!entries.length) return "";

  return `?${new URLSearchParams(entries).toString()}`;
};

async function request(endpoint, options = {}) {
  try {
    const token = getAuthToken();

    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    };

    if (options.body !== undefined) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
      }

      throw new Error(data?.message || "Error en la petición al servidor");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `No se pudo conectar con el backend. Verifica que esté corriendo en ${API_URL}`, { cause: error }
      );
    }

    throw error;
  }
}

export const loginUsuario = (email, password) => {
  return request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
};

export const authLogin = ({ email, password }) => loginUsuario(email, password);

export const getCajas = (params = {}) => request(`/cajas${buildQuery(params)}`);
export const getCajasUsuario = (usuarioId) => getCajas({ usuario: usuarioId });
export const getCajaById = (id) => request(`/cajas/${id}`);

export const createCaja = (data) => {
  return request("/cajas", {
    method: "POST",
    body: data,
  });
};

export const updateCaja = (id, data) => {
  return request(`/cajas/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteCaja = (id, params = {}) => {
  return request(`/cajas/${id}${buildQuery(params)}`, {
    method: "DELETE",
  });
};

export const addAhorroCaja = (id, monto, usuarioId = null) => {
  return request(`/cajas/${id}/agregar`, {
    method: "PUT",
    body: { monto, usuario: usuarioId },
  });
};

export const getUsuarios = () => request("/usuarios");
export const getUsuarioById = (id) => request(`/usuarios/${id}`);

export const createUsuario = (data) => {
  return request("/usuarios", {
    method: "POST",
    body: data,
  });
};

export const updateUsuario = (id, data) => {
  return request(`/usuarios/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteUsuario = (id) => {
  return request(`/usuarios/${id}`, {
    method: "DELETE",
  });
};

export const getMetaGlobal = () => request("/metas/global");

export const updateMetaGlobal = (data) => {
  return request("/metas/global", {
    method: "PUT",
    body: data,
  });
};
