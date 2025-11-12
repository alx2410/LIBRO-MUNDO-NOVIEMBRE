import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false); // 👈 controla el modal
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim() === "") return;
    console.log("Buscando:", searchTerm);
  }
  return (
    <nav>
      <h1>MiniWattpad</h1>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/explorar">Explorar</Link></li>
        <li><Link to="/comunidad">Comunidad</Link></li>
      </ul>

      {/*BARRA DE BUSQUEDA*/}
       <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar historias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

     <button onClick={() => setShowAuth(true)}>Iniciar sesión</button>

      {/* 👇 aquí el modal aparece solo cuando showAuth es true */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
