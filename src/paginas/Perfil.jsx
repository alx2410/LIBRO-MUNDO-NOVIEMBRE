// src/componentes/Perfil.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Perfil.css";

// Datos falsos para DEMO (luego los reemplazas con Firebase)
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
  const { user } = useAuth();
  const [tab, setTab] = useState("info");
  const [muroPosts, setMuroPosts] = useState([]);
  const [nuevoPost, setNuevoPost] = useState("");

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  const publicarEnMuro = () => {
    if (!nuevoPost.trim()) return;

    const nuevo = {
      id: Date.now(),
      autor: user.displayName,
      foto: user.photoURL,
      texto: nuevoPost,
      fecha: new Date().toLocaleString(),
    };

    setMuroPosts([nuevo, ...muroPosts]);
    setNuevoPost("");
  };

  return (
    <div className="perfil-container">
      {/* ENCABEZADO */}
      <div className="perfil-header">
        <img src={user.photoURL} alt="avatar" className="perfil-avatar" />

        <div>
          <h2 className="perfil-nombre">{user.displayName}</h2>
          <p className="perfil-username">@{user.email.split("@")[0]}</p>

          {/* Estadísticas */}
          <div className="perfil-stats">
            <span><strong>Historias:</strong> 2</span>
            <span><strong>Listas:</strong> 1</span>
            <span><strong>Seguidores:</strong> 120</span>
            <span><strong>Siguiendo:</strong> 45</span>
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="perfil-tabs">
        <button onClick={() => setTab("info")} className={tab === "info" ? "active" : ""}>
          INFO
        </button>

        <button onClick={() => setTab("muro")} className={tab === "muro" ? "active" : ""}>
          MURO
        </button>

        <button onClick={() => setTab("seguidores")} className={tab === "seguidores" ? "active" : ""}>
          SEGUIDORES
        </button>
      </div>

      {/* ================= INFO ================= */}
      {tab === "info" && (
        <div className="info-layout">
          {/* Columna 1 */}
          <div className="info-col-1">
            <h3>Biografía</h3>
            <p>{user.bio || "Aún no has escrito tu biografía."}</p>

            <h3>Siguiendo</h3>
            <p>Próximamente...</p>

            <h3>Último post</h3>
            {muroPosts[0] ? (
              <p>{muroPosts[0].texto}</p>
            ) : (
              <p>No has publicado aún.</p>
            )}
          </div>

          {/* Columnas 2 y 3 */}
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

      {/* ================= MURO ================= */}
      {tab === "muro" && (
        <div className="muro">
          {/* caja post */}
          <div className="muro-publicar">
            <textarea
              value={nuevoPost}
              onChange={(e) => setNuevoPost(e.target.value)}
              placeholder="Escribe algo en tu muro..."
            ></textarea>

            <button onClick={publicarEnMuro}>Publicar</button>
          </div>

          {/* posts */}
          {muroPosts.map((post) => (
            <div key={post.id} className="muro-post">
              <img src={post.foto} className="post-avatar" />
              <div>
                <p className="post-autor">{post.autor}</p>
                <p>{post.texto}</p>
                <span className="post-fecha">{post.fecha}</span>
              </div>
            </div>
          ))}

          {muroPosts.length === 0 && <p>No hay publicaciones aún.</p>}
        </div>
      )}

      {/* ================= SEGUIDORES ================= */}
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