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
import { StarRating } from "../components/StarRating";
import "./Comunidad.css";

/* === Componente Comentario === */
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
      <p><strong>{comentario.autor}</strong></p>

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

      {user === comentario.autor && !editando && (
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

/* === Página Comunidad === */
export default function Comunidad() {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [rating, setRating] = useState(0);
  const user = "MiUsuario";

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handlePublicar = async () => {
    if (!titulo && rating === 0) return;

    await addDoc(collection(db, "posts"), {
      titulo,
      rating,
      autor: user,
      fecha: serverTimestamp(),
    });

    setTitulo("");
    setRating(0);
  };

  return (
    <div className="comunidad-container">
      <h1 className="comunidad-titulo">Comunidad</h1>

      {/* === Formulario === */}
      <div className="formulario-post">
        <input
          type="text"
          placeholder="Título del libro"
          className="w-full p-2 mb-3 rounded"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <p className="mb-2">Puntaje:</p>
        <StarRating totalStars={5} onRating={(value) => setRating(value)} />

        <button onClick={handlePublicar} className="btn-publicar mt-3">
          Publicar
        </button>
      </div>

      {/* === Lista de Posts === */}
      <div>
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <h2 className="post-titulo">{post.titulo}</h2>

            <div className="rating-mostrar">
              <StarRating totalStars={5} onRating={() => {}} />
              <span>({post.rating}★)</span>
            </div>

            <div className="post-info">
              <span>Por: {post.autor}</span>
              <span>
                {post.fecha
                  ? new Date(post.fecha.seconds * 1000).toLocaleDateString()
                  : ""}
              </span>
            </div>

            <Comentarios postId={post.id} user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* === Comentarios === */
function Comentarios({ postId, user }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comentarios"),
      orderBy("fecha", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComentarios(data);
    });
    return () => unsubscribe();
  }, [postId]);

  const handlePublicarComentario = async () => {
    if (!nuevoComentario) return;
    await addDoc(collection(db, "posts", postId, "comentarios"), {
      texto: nuevoComentario,
      autor: user,
      fecha: serverTimestamp(),
    });
    setNuevoComentario("");
  };

  return (
    <div>
      {/* Comentarios */}
      <div className="mb-2">
        {comentarios.map((c) => (
          <Comentario key={c.id} comentario={c} postId={postId} user={user} />
        ))}
      </div>

      {/* Input comentar */}
      <div className="flex gap-2">
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
