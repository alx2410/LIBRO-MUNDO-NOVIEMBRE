import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Este componente envuelve las rutas que necesitan sesión iniciada
export function RutaProtegida({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  // Si no hay usuario, lo manda al inicio o al login
  if (!user) return <Navigate to="/" replace />;

  return children;
}
