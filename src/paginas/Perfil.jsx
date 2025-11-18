// src/componentes/Perfil.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Perfil.css";

const mockHistorias = [
  {
    id: 1,
    titulo: "La Reina de Hielo",
    descripcion: "Una historia de magia, traición y un destino congelado.",
    portada: "https://via.placeholder.com/200x280",
  },
  {
    id: 2,
    titulo: "Sombras del Pasado",
    descripcion: "Un misterio que regresa para cambiarlo todo.",
    portada: "https://via.placeholder.com/200x280",
  },
];

const mockSeguidores = [
  {
    id: 1,
    nickname: "LunaVelvet",
    usuario: "@lunita",
    foto: "https://via.placeholder.com/80",
    historias: 12,
    seguidores: 250,
    siguiendo: 51,
  },
  {
    id: 2,
    nickname: "LeoWriter",
    usuario: "@leo_w",
    foto: "https://via.placeholder.com/80",
    historias: 4,
    seguidores: 88,
    siguiendo: 12,
  },
];

export default function Perfil() {

  const { user, updateProfileData, getMuro, publicarPost } = useAuth();
  const [tab, setTab] = useState("info");

  // ===== MURO =====
  const [posts, setPosts] = useState([]);
  const [nuevoPost, setNuevoPost] = useState("");

  // ===== EDITAR PERFIL =====
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user.photoURL);

  // === CARGAR MURO DESDE FIRESTORE ===
  useEffect(() => {
    if (!user) return;

    async function cargarMuro() {
      const data = await getMuro(user.uid);
      setPosts(data);
    }

    cargarMuro();
  }, [user, getMuro]);

  // Cambiar foto
  const handleFileChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  // Guardar perfil
  const guardarCambios = async () => {
    try {
      await updateProfileData({
        displayName,
        bio,
        file,
      });

      alert("Perfil actualizado ✔");
      setEditMode(false);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar perfil");
    }
  };

  // Publicar en muro
  const publicarEnMuro = async () => {
    if (!nuevoPost.trim()) return;

    const nuevo = await publicarPost(nuevoPost);

    setPosts((prev) => [nuevo, ...prev]);
    setNuevoPost("");
  };

  return (
    <div className="perfil-container">

      {/* ===================== ENCABEZADO ===================== */}
      <div className="perfil-header">

        {/* FOTO */}
        <img src={preview} alt="avatar" className="perfil-avatar" />

        <div>
          {!editMode ? (
            <>
              <h2 className="perfil-nombre">{user.displayName}</h2>
              <p className="perfil-username">@{user.email.split("@")[0]}</p>

              <div className="perfil-stats">
                <span><strong>Historias:</strong> 2</span>
                <span><strong>Listas:</strong> 1</span>
                <span><strong>Seguidores:</strong> 120</span>
                <span><strong>Siguiendo:</strong> 45</span>
              </div>

              <button className="btn-editar" onClick={() => setEditMode(true)}>
                ✏ Editar perfil
              </button>
            </>
          ) : (
            <>
              <input
                className="input-text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <textarea
                className="textarea-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tu biografía..."
              ></textarea>

              <label className="file-label">
                Cambiar foto
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              <button className="btn-guardar" onClick={guardarCambios}>
                Guardar cambios
              </button>

              <button className="btn-cancelar" onClick={() => setEditMode(false)}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===================== PESTAÑAS ===================== */}
      <div className="perfil-tabs">
        <button onClick={() => setTab("info")} className={tab === "info" ? "active" : ""}>
          INFO
        </button>

        <button onClick={() => setTab("muro")} className={tab === "muro" ? "active" : ""}>
          MURO
        </button>

        <button
          onClick={() => setTab("seguidores")}
          className={tab === "seguidores" ? "active" : ""}
        >
          SEGUIDORES
        </button>
      </div>

      {/* ===================== INFO ===================== */}
      {tab === "info" && (
        <div className="info-layout">
          <div className="info-col-1">
            <h3>Biografía</h3>
            <p>{bio || "Aún no has escrito tu biografía."}</p>

            <h3>Siguiendo</h3>
            <p>Próximamente...</p>

            <h3>Último post</h3>
            {posts[0] ? <p>{posts[0].texto}</p> : <p>No has publicado aún.</p>}
          </div>

          <div className="info-col-2">
            <h3>Historias de {user.displayName}</h3>

            {mockHistorias.map((h) => (
              <div key={h.id} className="historia-card">
                <div className="historia-content">
                  <h4>{h.titulo}</h4>
                  <p>{h.descripcion}</p>
                </div>
                <img src={h.portada} alt="portada" className="historia-portada" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MURO ===================== */}
      {tab === "muro" && (
        <div className="muro">
          <div className="muro-publicar">
            <textarea
              value={nuevoPost}
              onChange={(e) => setNuevoPost(e.target.value)}
              placeholder="Escribe algo en tu muro..."
            ></textarea>
            <button onClick={publicarEnMuro}>Publicar</button>
          </div>

          {posts
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map((post) => (
              <div key={post.id} className="muro-post">
  <img src={post.foto} className="post-avatar" />

  <div className="post-contenido">
    <p className="post-autor">{post.autor}</p>
    <p className="post-texto">{post.texto}</p>
    <span className="post-fecha">
      {new Date(post.fecha).toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  </div>
</div>

            ))}

          {posts.length === 0 && <p>No hay publicaciones aún.</p>}
        </div>
      )}

      {/* ===================== SEGUIDORES ===================== */}
      {tab === "seguidores" && (
        <div className="seguidores-grid">
          {mockSeguidores.map((seg) => (
            <div key={seg.id} className="seguidor-card">
              <img src={seg.foto} className="seguidor-avatar" />
              <h4>{seg.nickname}</h4>
              <p className="seg-username">{seg.usuario}</p>

              <div className="seguidor-stats">
                <p>📘 Historias: {seg.historias}</p>
                <p>👥 Seguidores: {seg.seguidores}</p>
                <p>➡️ Siguiendo: {seg.siguiendo}</p>
              </div>

              <button className="btn-ver">Ver perfil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
