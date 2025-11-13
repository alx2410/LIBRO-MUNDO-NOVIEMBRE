import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const { user, logout } = useAuth();

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <img
          src={user.photoURL || "https://via.placeholder.com/150"}
          alt="Avatar"
          className="perfil-avatar"
          referrerPolicy="no-referrer"
        />
        <h2>{user.displayName || "Usuario sin nombre"}</h2>
        <p>{user.email}</p>

        <button className="btn-cerrar" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
