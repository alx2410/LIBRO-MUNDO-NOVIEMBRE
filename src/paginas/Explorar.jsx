import { useEffect, useState } from "react";
import { db } from "../firebase/config"; // Asegúrate de tu ruta
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "./Explorar.css"

export default function Explorar() {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroGenero, setFiltroGenero] = useState("");

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

  const librosFiltrados = filtroGenero
    ? libros.filter((libro) => libro.genero === filtroGenero)
    : libros;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Explorar</h1>
      <p>Aquí puedes descubrir nuevas historias y cómics.</p>

      {/* Filtro de géneros */}
      <div className="my-4">
        <label htmlFor="generoFiltro" className="mr-2">Filtrar por género:</label>
        <select
          id="generoFiltro"
          value={filtroGenero}
          onChange={(e) => setFiltroGenero(e.target.value)}
          className="text-black p-1 rounded"
        >
          <option value="">Todos</option>
          <option value="romance">💞 Romance</option>
          <option value="fantasia">🧚 Fantasía</option>
          <option value="ciencia-ficcion">🚀 Ciencia ficción</option>
          <option value="misterio">🕵️ Misterio</option>
          <option value="drama">🎭 Drama</option>
          <option value="terror">👻 Terror</option>
          <option value="comedia">😂 Comedia</option>
          <option value="aventura">🌍 Aventura</option>
        </select>
      </div>

      {cargando ? (
        <p>Cargando libros...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {librosFiltrados.map((libro) => (
            <div key={libro.id} className="bg-gray-800 p-4 rounded shadow">
              <img
                src={libro.portada}
                alt={`Portada de ${libro.titulo}`}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h2 className="text-lg font-bold">{libro.titulo}</h2>
              <p className="text-sm text-gray-300">{libro.genero}</p>
              <p className="text-sm text-gray-400">Autor: {libro.autor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

