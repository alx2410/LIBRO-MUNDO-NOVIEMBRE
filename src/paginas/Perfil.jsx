<<<<<<< HEAD
export default function Perfil(){
    return(
        <div>
            <h1>Perfil</h1>
            <p>ARA ARA </p>
        </div>
    )
}
=======
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
>>>>>>> 0fa67559f97e0be5ac9ebf54138a3ee9ec0cee13
