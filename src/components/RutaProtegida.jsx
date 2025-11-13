<<<<<<< HEAD

// src/components/RutaProtegida.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // o "../context/authContext"

export default function RutaProtegida({ children }) {
  const { user } = useAuth(); // 👈 usuario actual de Firebase

  // Si no hay usuario, redirige al inicio ("/")
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario, renderiza el componente hijo
  return children;
}
=======
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
>>>>>>> 0fa67559f97e0be5ac9ebf54138a3ee9ec0cee13
