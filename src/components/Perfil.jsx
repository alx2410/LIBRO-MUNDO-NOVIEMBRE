// src/componentes/Perfil.jsx
import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const { user } = useAuth();

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  return (
    <div className="perfil-container">
      <h2>Tu perfil</h2>
      {user.photoURL && <img src={user.photoURL} alt="avatar" className="avatar" />}
      <p><strong>Nombre:</strong> {user.displayName || user.username}</p>
      <p><strong>Correo:</strong> {user.email}</p>
    </div>
  );
}
