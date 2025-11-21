import { Link } from "react-router-dom";
import { useState } from "react";
import { ZonaUsuario } from "./ZonaUsuario";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import logo from "../assets/logo.png"

export default function Navbar() {

  const { user } = useAuth(); // 👈 AQUÍ USAMOS EL CONTEXT
  console.log("USER EN NAVBAR:", user);
  
  const [showAuth, setShowAuth] = useState(false);

  //  Estado de la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  //  Función para manejar la búsqueda
  function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return; // evita búsquedas vacías
    console.log("Buscando:", searchTerm); 
    // aquí puedes redirigir o filtrar
  }

  return (
    <nav>
  <div className="logo-container">
    <Link to="/miniwattpad">
      <img src={logo} alt="MiniWattpad Logo" className="logo" />
    </Link>
  </div>
  <ul>
    <li><Link to="/explorar">Explorar</Link></li>
    <li><Link to="/comunidad">Comunidad</Link></li>
  </ul>

  {/* SEARCH */}
  <form className="search-bar" onSubmit={handleSearch}>
    <input
      type="text"
      placeholder="Buscar historias..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <button type="submit" aria-label="Buscar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="icon-search"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
        />
      </svg>
    </button>
  </form>

  <ul>
    <li><Link to="/escribir">Escribir</Link></li>
    <li><Link to="/biblioteca">Biblioteca</Link></li>
    <li><Link to="/intranet">Intranet</Link></li>
    <li><Link to="/perfil">Perfil</Link></li>
  </ul>

  <button onClick={() => setShowAuth(true)}>Iniciar sesión</button>

  {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
</nav>

  );
}
