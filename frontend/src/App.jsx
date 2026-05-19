import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Cajita from "./pages/Cajita";
import Administrador from "./pages/Administrador";
import { getHomeByRole, getSession } from "./utils/auth";

function RutaPublica({ children }) {
  const session = getSession();

  if (session) {
    return <Navigate to={getHomeByRole(session.usuario.rol)} replace />;
  }

  return children;
}

function RutaProtegida({ rolesPermitidos, children }) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!rolesPermitidos.includes(session.usuario.rol)) {
    return <Navigate to={getHomeByRole(session.usuario.rol)} replace />;
  }

  return children;
}

function RedireccionInicial() {
  const session = getSession();
  return <Navigate to={session ? getHomeByRole(session.usuario.rol) : "/login"} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RedireccionInicial />} />
      <Route
        path="/login"
        element={
          <RutaPublica>
            <Login />
          </RutaPublica>
        }
      />
      <Route
        path="/cajita"
        element={
          <RutaProtegida rolesPermitidos={["usuario"]}>
            <Cajita />
          </RutaProtegida>
        }
      />
      <Route
        path="/administrador"
        element={
          <RutaProtegida rolesPermitidos={["admin"]}>
            <Administrador />
          </RutaProtegida>
        }
      />
      <Route path="*" element={<RedireccionInicial />} />
    </Routes>
  );
}

export default App;
