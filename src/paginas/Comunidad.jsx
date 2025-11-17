// src/pages/Comunidad.jsx
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
import "./Comunidad.css";

/* ============================
   COMPONENTE COMENTARIO
=============================== */
function Comentario({ comentario, postId, user }) {
  const [editando, setEditando] = useState(false);
  const [nuevoTexto, setNuevoTexto] = useState(comentario.texto);

  const handleEditar = async () => {
    const comentarioRef = doc(db, "posts", postId, "comentarios", comentario.id);
    await updateDoc(comentarioRef, { texto: nuevoTexto });
    setEditando(false);
  };

  const handleBorrar = async () => {
    const comentarioRef = doc(db, "posts", postId, "comentarios", comentario.id);
    await deleteDoc(comentarioRef);
  };

  return (
    <div className="comentario-card">
      <p><strong>{comentario.autorNombre}</strong></p>

      {editando ? (
        <>
          <textarea
            className="w-full p-2 rounded comentario-input"
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

      {/* Permisos: solo el autor verdadero puede editar o borrar */}
      {user?.uid === comentario.autorUid && !editando && (
        <div className="mt-1 flex gap-2">
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
  const { user } = useAuth(); // ← usuario real (uid, username, avatar, email)
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [rating, setRating] = useState(0);
  const [comentarioPrincipal, setComentarioPrincipal] = useState("");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handlePublicar = async () => {
    if (!titulo || rating === 0 || !comentarioPrincipal) return;
    if (!user) return alert("Debes iniciar sesión.");

    await addDoc(collection(db, "posts"), {
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

      {/* Formulario nuevo post */}
      <div className="formulario-post">
        <input
          type="text"
          placeholder="Título del libro"
          className="w-full p-2 mb-3 rounded"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <p className="mb-2">Puntaje:</p>
        <StarRating totalStars={5} onRating={(value) => setRating(value)} value={rating} />

        <textarea
          placeholder="Escribe tu opinión ..."
          className="w-full p-2 mt-3 rounded comentario-input"
          rows="3"
          value={comentarioPrincipal}
          onChange={(e) => setComentarioPrincipal(e.target.value)}
        />

        <button onClick={handlePublicar} className="btn-publicar mt-3">
          Publicar
        </button>
      </div>

      {/* Lista de posts */}
      <div>
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <h2 className="post-titulo">{post.titulo}</h2>

            <div className="rating-mostrar">
              <StarRating totalStars={5} value={post.rating} readOnly />
              <span>({post.rating}★)</span>
            </div>

            <p className="mt-2 text-gray-700">{post.comentarioPrincipal}</p>

            <div className="post-info">
              <span>Por: {post.autorNombre}</span>
              <span>
                {post.fecha ? new Date(post.fecha.seconds * 1000).toLocaleDateString() : ""}
              </span>
            </div>

            <Comentarios postId={post.id} user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================
   COMENTARIOS SECUNDARIOS
=============================== */
function Comentarios({ postId, user }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comentarios"),
      orderBy("fecha", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [postId]);

  const handlePublicarComentario = async () => {
    if (!nuevoComentario) return;
    if (!user) return alert("Debes iniciar sesión para comentar.");

    await addDoc(collection(db, "posts", postId, "comentarios"), {
      texto: nuevoComentario,
      autorNombre: user.username,
      autorUid: user.uid,
      fecha: serverTimestamp(),
    });

    setNuevoComentario("");
  };

  return (
    <div>
      {comentarios.map((c) => (
        <Comentario key={c.id} comentario={c} postId={postId} user={user} />
      ))}

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          className="w-full p-2 rounded comentario-input"
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
        />
        <button onClick={handlePublicarComentario} className="btn-comentar">
          Comentar
        </button>
      </div>
    </div>
  );
}
