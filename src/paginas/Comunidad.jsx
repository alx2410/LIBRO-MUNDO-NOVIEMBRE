// src/pages/Comunidad.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/StarRating";
import "../styles/Comunidad.css";

/* ============================
   COMPONENTE COMENTARIO
=============================== */
function Comentario({ comentario, publicacionId, user }) {
  const [editando, setEditando] = useState(false);
  const [nuevoTexto, setNuevoTexto] = useState(comentario.texto);

  const handleEditar = async () => {
    const comentarioRef = doc(
      db,
      "comunidad",
      publicacionId,
      "comentarios",
      comentario.id
    );
    await updateDoc(comentarioRef, { texto: nuevoTexto });
    setEditando(false);
  };

  const handleBorrar = async () => {
    const comentarioRef = doc(
      db,
      "comunidad",
      publicacionId,
      "comentarios",
      comentario.id
    );
    await deleteDoc(comentarioRef);
  };

  return (
    <div className="comentario-card">
      <p>
        <strong>
          <Link to={`/perfil/${comentario.autorUid}`} className="autor-link">
            {comentario.autorNombre}
          </Link>
        </strong>
      </p>

      {editando ? (
        <>
          <textarea
            className="comentario-input"
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
          />
          <button onClick={handleEditar} className="btn-edit mt-2">
            Guardar
          </button>
        </>
      ) : (
        <p>{comentario.texto}</p>
      )}

      {user?.uid === comentario.autorUid && !editando && (
        <div className="botones-comentario">
          <button onClick={() => setEditando(true)} className="btn-edit">
            Editar
          </button>
          <button onClick={handleBorrar} className="btn-delete">
            Borrar
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================
   COMPONENTE PRINCIPAL
=============================== */
export default function Comunidad() {
  const { user } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [rating, setRating] = useState(0);
  const [comentarioPrincipal, setComentarioPrincipal] = useState("");

  /* === Escuchar TODA la colección comunidad === */
  useEffect(() => {
    const q = query(
      collection(db, "comunidad"),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPublicaciones(data);
    });

    return () => unsubscribe();
  }, []);

  /* === Crear nueva publicación === */
  const handlePublicar = async () => {
    if (!titulo || rating === 0 || !comentarioPrincipal) return;
    if (!user) return alert("Debes iniciar sesión.");

    await addDoc(collection(db, "comunidad"), {
      titulo,
      rating,
      comentarioPrincipal,
      autorNombre: user.username,
      autorUid: user.uid,
      fecha: serverTimestamp(),
    });

    setTitulo("");
    setRating(0);
    setComentarioPrincipal("");
  };

  return (
    <div className="comunidad-container">
      <h1 className="comunidad-titulo">Comunidad</h1>

      {/* Formulario nueva publicación */}
      <div className="formulario-post">
        <input
          type="text"
          placeholder="Título del libro"
          className="w-full p-2 rounded"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <p>Puntaje:</p>
        <StarRating
          totalStars={5}
          onRating={(value) => setRating(value)}
          value={rating}
        />

        <textarea
          placeholder="Escribe tu opinión ..."
          className="comentario-input"
          rows="3"
          value={comentarioPrincipal}
          onChange={(e) => setComentarioPrincipal(e.target.value)}
        />

        <button onClick={handlePublicar} className="btn-publicar">
          Publicar
        </button>
      </div>

      {/* Lista de publicaciones */}
      <div>
        {publicaciones.map((pub) => (
          <div key={pub.id} className="post-card">
            <h2 className="post-titulo">{pub.titulo}</h2>

            <div className="rating-mostrar">
              <StarRating totalStars={5} value={pub.rating} readOnly />
              <span>({pub.rating}★)</span>
            </div>

            <p className="mt-2">{pub.comentarioPrincipal}</p>

            <div className="post-info">
              <span>
                Por:{" "}
                <Link to={`/perfil/${pub.autorUid}`} className="autor-link">
                  {pub.autorNombre}
                </Link>
              </span>

              <span>
                {pub.fecha
                  ? new Date(pub.fecha.seconds * 1000).toLocaleDateString()
                  : ""}
              </span>
            </div>

            <Comentarios publicacionId={pub.id} user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================
   COMENTARIOS SECUNDARIOS
=============================== */
function Comentarios({ publicacionId, user }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  /* === Escuchar comentarios de cada publicación === */
  useEffect(() => {
    const q = query(
      collection(db, "comunidad", publicacionId, "comentarios"),
      orderBy("fecha", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [publicacionId]);

  /* === Crear comentario === */
  const handlePublicarComentario = async () => {
    if (!nuevoComentario) return;
    if (!user) return alert("Debes iniciar sesión para comentar.");

    await addDoc(
      collection(db, "comunidad", publicacionId, "comentarios"),
      {
        texto: nuevoComentario,
        autorNombre: user.username,
        autorUid: user.uid,
        fecha: serverTimestamp(),
      }
    );

    setNuevoComentario("");
  };

  return (
    <div>
      {comentarios.map((c) => (
        <Comentario
          key={c.id}
          comentario={c}
          publicacionId={publicacionId}
          user={user}
        />
      ))}

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          className="comentario-input"
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
        />
        <button onClick={handlePublicarComentario} className="btn-comentar">
          Comentar nuevos cambios
        </button>
      </div>
    </div>
  );
}
