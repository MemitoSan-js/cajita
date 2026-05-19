export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem("token") || "";

export const saveSession = ({ usuario, token }) => {
  if (!usuario || !token) return;

  localStorage.setItem("token", token);
  localStorage.setItem(
    "usuario",
    JSON.stringify({
      id: usuario._id || usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    })
  );
};

export const clearSession = () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
};

export const getSession = () => {
  const usuario = getStoredUser();
  const token = getAuthToken();

  if (!usuario?.id || !usuario?.rol || !token) return null;

  return { usuario, token };
};

export const getHomeByRole = (rol) => {
  return rol === "admin" ? "/administrador" : "/cajita";
};
