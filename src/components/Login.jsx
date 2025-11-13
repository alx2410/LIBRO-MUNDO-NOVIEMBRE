import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onRegistroClick, onLoginExitoso }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (onLoginExitoso) onLoginExitoso();
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      if (onLoginExitoso) onLoginExitoso();
    } catch (err) {
      setError("Error con Google: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Correo" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>

      <button onClick={handleGoogle}>Continuar con Google</button>
      <p>
        ¿No tienes cuenta?{" "}
        <button className="link" onClick={onRegistroClick}>
          Regístrate
        </button>
      </p>
    </div>
  );
}
