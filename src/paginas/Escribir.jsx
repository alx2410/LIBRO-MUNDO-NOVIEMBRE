import { useState, useRef } from "react";
import VistaPrevia from "../components/VistaPrevia.jsx";
import { db, storage } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";

export default function Escribir() {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [portada, setPortada] = useState(null);
  const [filePortada, setFilePortada] = useState(null); // archivo real
  const [contenido, setContenido] = useState("");
  const [permitirCalificacion, setPermitirCalificacion] = useState(true);
  const textareaRef = useRef(null);

  const { user } = useAuth();

  // === PUBLICAR HISTORIA (Firebase) ===
  const publicarHistoria = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para publicar una historia.");
      return;
    }

    if (!titulo.trim() || !genero || !contenido.trim()) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      // 1️⃣ Subir portada si existe
      let portadaURL = "";
      if (filePortada instanceof File) {
        const storageRef = ref(storage, `historias/${user.uid}/${Date.now()}`);
        await uploadBytes(storageRef, filePortada);
        portadaURL = await getDownloadURL(storageRef);
      }

      // 2️⃣ Crear ID único
      const id = crypto.randomUUID();

      // 3️⃣ Guardar historia en Firestore
      await setDoc(doc(db, "historias", id), {
        id,
        autorId: user.uid,
        autorNombre: user.username || user.email,
        titulo,
        genero,
        contenido,
        portada: portadaURL,
        permitirCalificacion,
        createdAt: new Date(),
      });

      alert("Historia publicada correctamente.");

      // 4️⃣ Reset form
      setTitulo("");
      setGenero("");
      setContenido("");
      setPortada(null);
      setFilePortada(null);
      setPermitirCalificacion(true);
    } catch (error) {
      console.error(error);
      alert("Error al publicar historia.");
    }
  };

  // === FORMATO DE TEXTO ===
  const aplicarFormato = (formato) => {
    const textarea = textareaRef.current;
    const inicio = textarea.selectionStart;
    const fin = textarea.selectionEnd;
    const textoSeleccionado = contenido.substring(inicio, fin);

    let nuevoTexto = contenido;

    if (formato === "bold") {
      nuevoTexto =
        contenido.substring(0, inicio) +
        `**${textoSeleccionado || "negrita"}**` +
        contenido.substring(fin);
    } else if (formato === "italic") {
      nuevoTexto =
        contenido.substring(0, inicio) +
        `*${textoSeleccionado || "cursiva"}*` +
        contenido.substring(fin);
    } else if (formato === "underline") {
      nuevoTexto =
        contenido.substring(0, inicio) +
        `<u>${textoSeleccionado || "subrayado"}</u>` +
        contenido.substring(fin);
    }

    setContenido(nuevoTexto);
    setTimeout(() => textarea.focus(), 0);
  };

  // === SUBIR PORTADA PREVIEW ===
  const manejarPortada = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFilePortada(file);
      const url = URL.createObjectURL(file);
      setPortada(url);
    }
  };

  return (
    <div className="escribir-container">
      <div className="escribir-card">
        <h2>✍️ Escribir nueva historia</h2>

        <form onSubmit={publicarHistoria}>
          {/* === TÍTULO === */}
          <div>
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              placeholder="Escribe el título de tu historia"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          {/* === GÉNERO === */}
          <div>
            <label htmlFor="genero">Género</label>
            <select
              id="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              required
            >
              <option value="">Selecciona un género</option>
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

          {/* === PORTADA === */}
          <div>
            <label htmlFor="portada">Portada</label>
            <input
              type="file"
              id="portada"
              accept="image/*"
              onChange={manejarPortada}
            />
            {portada && (
              <img
                src={portada}
                alt="Vista previa portada"
                className="portada-preview"
              />
            )}
          </div>

          {/* === BOTONES DE FORMATO === */}
          <div className="format-buttons">
            <button type="button" onClick={() => aplicarFormato("bold")}>
              <b>B</b>
            </button>
            <button type="button" onClick={() => aplicarFormato("italic")}>
              <i>I</i>
            </button>
            <button type="button" onClick={() => aplicarFormato("underline")}>
              <u>U</u>
            </button>
          </div>

          {/* === CONTENIDO === */}
          <div>
            <label htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              ref={textareaRef}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Empieza a escribir tu historia aquí..."
              required
            />
          </div>

          {/* === OPCIÓN DE CALIFICACIÓN === */}
          <div className="checkbox-calificacion">
            <input
              type="checkbox"
              id="permitirCalificacion"
              checked={permitirCalificacion}
              onChange={(e) => setPermitirCalificacion(e.target.checked)}
            />
            <label htmlFor="permitirCalificacion">
              Permitir que los lectores califiquen mi libro ⭐
            </label>
          </div>

          {/* === BOTÓN PUBLICAR === */}
          <button type="submit" className="boton-publicar">
            Publicar historia
          </button>
        </form>

        {/* === VISTA PREVIA === */}
        <div className="vista-previa">
          <h3>📖 Vista previa</h3>

          {portada && (
            <img
              src={portada}
              alt="Vista previa portada"
              className="portada-preview"
            />
          )}
          <h4>{titulo || "Título de la historia"}</h4>
          <p style={{ fontWeight: "600", color: "#555" }}>
            {genero ? `Género: ${genero}` : "Sin género seleccionado"}
          </p>

          <div
            style={{ marginTop: "10px", lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{
              __html: contenido
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                .replace(/\*(.*?)\*/g, "<i>$1</i>")
                .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>"),
            }}
          />

          <p style={{ marginTop: "15px", fontSize: "0.95rem" }}>
            {permitirCalificacion
              ? "⭐ Los lectores podrán calificar este libro."
              : "🚫 Calificaciones desactivadas para este libro."}
          </p>
        </div>
      </div>
    </div>
  );
}
