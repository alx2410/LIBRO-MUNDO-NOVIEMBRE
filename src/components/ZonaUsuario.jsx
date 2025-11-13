import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

<<<<<<< HEAD
export function ZonaUsuario ({ onAbrirLogin}){
    //VARIABLE PARA LA AUTENTICACION
    const { user, logout} = useAuth();
=======
export function ZonaUsuario({ onAbrirLogin }) {
  const { user, logout } = useAuth();
>>>>>>> 0fa67559f97e0be5ac9ebf54138a3ee9ec0cee13

  if (!user) {
    return (
      <div className="zona-usuario">
        <button className="btn-login" onClick={onAbrirLogin}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="zona-usuario">
      <Link to="/perfil" className="usuario-info">
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt="Foto de perfil"
          className="usuario-avatar"
        />
        <span className="usuario-nombre">{user.displayName || "Usuario"}</span>
      </Link>

      <button className="btn-logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}
