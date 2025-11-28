// src/paginas/Escribir.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Escribir() {
  const { user } = useAuth();

  // ========= STATES PRINCIPALES =========
  const [tituloLibro, setTituloLibro] = useState("");
  const [genero, setGenero] = useState("");
  const [estado, setEstado] = useState("publicado");

  const [portada, setPortada] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);

  const [capitulos, setCapitulos] = useState([]);
  const [tituloCap, setTituloCap] = useState("");
  const [contenidoCap, setContenidoCap] = useState("");
  const [musicaCap, setMusicaCap] = useState("");
  const [stickersCap, setStickersCap] = useState([]);

  const [subiendo, setSubiendo] = useState(false);

  const inputPortadaRef = useRef();

  // ========= SUBIR PORTADA =========
  const handlePortada = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortada(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  const subirPortadaYObtenerURL = async () => {
    if (!portada) return null;

    const storageRef = ref(
      storage,
      `portadas/${user.uid}/${Date.now()}_${portada.name}`
    );

    await uploadBytes(storageRef, portada);
    return await getDownloadURL(storageRef);
  };

  // ========= AGREGAR CAPÍTULO =========
  const agregarCapitulo = () => {
    if (!tituloCap || !contenidoCap) return;

    const nuevo = {
      tituloCapitulo: tituloCap,
      contenido: contenidoCap,
      musica: musicaCap || null,
      stickers: stickersCap,
      fecha: Date.now(),
    };

    setCapitulos((prev) => [...prev, nuevo]);

    // limpiar inputs
    setTituloCap("");
    setContenidoCap("");
    setMusicaCap("");
    setStickersCap([]);
  };

  // ========= PUBLICAR LIBRO =========
  const publicarLibro = async () => {
    if (!tituloLibro || !genero || capitulos.length === 0)
      return alert("Falta completar datos");

    setSubiendo(true);

    try {
      // 1. Subir portada si existe
      const portadaUrl = await subirPortadaYObtenerURL();

      // 2. Crear libro
      const librosRef = collection(db, "libros");

      const libroDoc = await addDoc(librosRef, {
        titulo: tituloLibro,
        genero: genero,
        portada: portadaUrl || null,
        autor: user.displayName || "Usuario",
        autorId: user.uid,
        fecha: Date.now(),
        estado: estado,
      });

      // 3. Subir capítulos como subcolección
      const capsRef = collection(db, `libros/${libroDoc.id}/capitulos`);
      for (const cap of capitulos) {
        await addDoc(capsRef, cap);
      }

      alert("📚 ¡Libro publicado con éxito!");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al publicar.");
    }

    setSubiendo(false);
  };

  // ========= RESET =========
  const resetForm = () => {
    setTituloLibro("");
    setGenero("");
    setEstado("publicado");
    setCapitulos([]);
    setPortada(null);
    setPortadaPreview(null);
  };

  return (
    <div className="escribir-container">
      <h1 className="titulo">Crear nueva historia</h1>

      {/* DATOS DEL LIBRO */}
      <section className="seccion">
        <label>Título del libro:</label>
        <input
          type="text"
          value={tituloLibro}
          onChange={(e) => setTituloLibro(e.target.value)}
        />

        <label>Género:</label>
        <input
          type="text"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
        />

        <label>Estado:</label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="publicado">Publicado</option>
          <option value="en-proceso">En proceso</option>
          <option value="terminado">Terminado</option>
        </select>

        {/* PORTADA */}
        <label>Portada:</label>
        <input
          type="file"
          ref={inputPortadaRef}
          onChange={handlePortada}
          accept="image/*"
        />

        {portadaPreview && (
          <img
            src={portadaPreview}
            alt="Portada"
            className="portada-preview"
          />
        )}
      </section>

      {/* CAPÍTULOS */}
      <section className="seccion">
        <h2>Agregar capítulo</h2>

        <input
          type="text"
          placeholder="Título del capítulo"
          value={tituloCap}
          onChange={(e) => setTituloCap(e.target.value)}
        />

        <textarea
          placeholder="Contenido del capítulo"
          value={contenidoCap}
          onChange={(e) => setContenidoCap(e.target.value)}
        />

        <input
          type="text"
          placeholder="Música (URL opcional)"
          value={musicaCap}
          onChange={(e) => setMusicaCap(e.target.value)}
        />

        <button onClick={agregarCapitulo}>Agregar capítulo</button>

        {/* LISTA DE CAPÍTULOS CREADOS */}
        {capitulos.length > 0 && (
          <div className="lista-caps">
            <h3>Capítulos añadidos:</h3>
            <ul>
              {capitulos.map((c, index) => (
                <li key={index}>
                  <strong>{c.tituloCapitulo}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* PUBLICAR LIBRO */}
      <section className="seccion">
        <button
          className="btn btn-primary"
          onClick={publicarLibro}
          disabled={subiendo}
        >
          {subiendo ? "Publicando..." : "Publicar libro"}
        </button>
      </section>
    </div>
  );
}
