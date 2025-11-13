import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { ZonaUsuario } from "./ZonaUsuario";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false);

  return (
<<<<<<< HEAD
    <nav>
<h1>
<Link to="/miniwattpad">MiniWattpad</Link>
</h1>
      
      <ul>
        
=======
    <nav className="navbar">
      <h1>MiniWattpad</h1>

      <ul className="nav-links">
>>>>>>> 0fa67559f97e0be5ac9ebf54138a3ee9ec0cee13
        <li><Link to="/explorar">Explorar</Link></li>
        <li><Link to="/comunidad">Comunidad</Link></li>
      </ul>

<<<<<<< HEAD
      {/*BARRA DE BUSQUEDA*/}
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
        <li ><Link to="/mundolector">MundoLector</Link></li>
         <li ><Link to="/perfil">Perfil</Link></li>
      </ul>

     <button onClick={() => setShowAuth(true)}>Iniciar sesión</button>

      {/* 👇 aquí el modal aparece solo cuando showAuth es true */}
=======
      <ZonaUsuario onAbrirLogin={() => setShowAuth(true)} />

>>>>>>> 0fa67559f97e0be5ac9ebf54138a3ee9ec0cee13
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
