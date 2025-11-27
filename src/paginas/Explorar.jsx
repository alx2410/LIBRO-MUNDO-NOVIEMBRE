import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "../styles/Explorar.css";

export default function Explorar() {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroGenero, setFiltroGenero] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoriaURL = queryParams.get("genero") || "";
  const searchURL = queryParams.get("search") || "";
  const querySearch = searchURL.toLowerCase();

  // Cargar libros
  useEffect(() => {
    const q = query(collection(db, "libros"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const librosArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibros(librosArray);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Si viene un género por URL, aplicarlo
  useEffect(() => {
    if (categoriaURL) setFiltroGenero(categoriaURL.toLowerCase());
  }, [categoriaURL]);

  // Si viene búsqueda por URL, aplicarla
  useEffect(() => {
    if (searchURL) setBusqueda(searchURL.toLowerCase());
  }, [searchURL]);

  // =========================== FILTRO FINAL ===========================

  const librosFiltrados = libros.filter((libro) => {
    const generoLibro = libro.genero?.toLowerCase() || "";
    const tituloLibro = libro.titulo?.toLowerCase() || "";
    const autorLibro = libro.autor?.toLowerCase() || "";

    const coincideGenero =
      filtroGenero ? generoLibro.includes(filtroGenero) : true; // 💥 YA NO ES ===

    const coincideBusqueda =
      querySearch
        ? tituloLibro.includes(querySearch) || autorLibro.includes(querySearch) || generoLibro.includes(querySearch)
        : true;

    return coincideGenero && coincideBusqueda;
  });

  // ====================================================================

  return (
    <div className="explorar-container">
      <h1>Explorar</h1>
      <p>Aquí puedes descubrir nuevas historias y cómics.</p>

      {/* Selector de género (se mantiene, no afecta buscador) */}
      <div className="filtro-genero">
        <select
          value={filtroGenero}
          onChange={(e) => setFiltroGenero(e.target.value)}
        >
          <option value="">Todos los géneros</option>
          <option value="romance">Romance</option>
          <option value="fantasia">Fantasía</option>
          <option value="ciencia ficcion">Ciencia ficción</option>
          <option value="misterio">Misterio</option>
          <option value="drama">Drama</option>
          <option value="terror">Terror</option>
          <option value="comedia">Comedia</option>
          <option value="aventura">Aventura</option>
        </select>
      </div>

      {cargando ? (
        <p>Cargando libros...</p>
      ) : (
        <div className="grid-libros">
          {librosFiltrados.length > 0 ? (
            librosFiltrados.map((libro) => (
              <div key={libro.id} className="libro-card">
                <img src={libro.portada} alt={libro.titulo} />
                <div className="info-libro">
                  <h2>{libro.titulo}</h2>
                  <p>{libro.genero}</p>
                  <p>Autor: {libro.autor}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No hay resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}
