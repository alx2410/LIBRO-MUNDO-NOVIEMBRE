// src/componentes/Perfil.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/Perfil.css";

// ===== MOCKS =====
const mockHistorias = [
  { id: 1, titulo: "La Reina de Hielo", descripcion: "Una historia de magia, traición y un destino congelado.", portada: "https://via.placeholder.com/200x280" },
  { id: 2, titulo: "Sombras del Pasado", descripcion: "Un misterio que regresa para cambiarlo todo.", portada: "https://via.placeholder.com/200x280" },
];

export default function Perfil() {
  const { uid: uidPerfil } = useParams();
  const navigate = useNavigate();
  const { user, updateProfileData, getMuro, publicarPost, seguirUsuario, dejarSeguirUsuario } = useAuth();

  const esPerfilAjeno = Boolean(uidPerfil);
  const uidObjetivo = esPerfilAjeno ? uidPerfil : user.uid;

  // ===== ESTADOS =====
  const [datosPerfil, setDatosPerfil] = useState(null);
  const [esPropio, setEsPropio] = useState(false);
  const [yaSigo, setYaSigo] = useState(false);

  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [siguiendoCount, setSiguiendoCount] = useState(0);

  const [tab, setTab] = useState("info");
  const [posts, setPosts] = useState([]);
  const [nuevoPost, setNuevoPost] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // === MODAL SIGUIENDO ===
  const [showSiguiendoModal, setShowSiguiendoModal] = useState(false);
  const [listaSiguiendo, setListaSiguiendo] = useState([]);
  const [paginaSiguiendo, setPaginaSiguiendo] = useState(1);
  const [cargandoMas, setCargandoMas] = useState(false);
  const ITEMS_POR_PAGINA = 9;

  // para evitar recargar infinitamente cuando cambia perfil
  const [ultimaCargaUid, setUltimaCargaUid] = useState(null);

  // LISTA DE SEGUIDORES (NUEVO)
  const [listaSeguidores, setListaSeguidores] = useState([]);

  // =========================
  // 1. Cargar Perfil
  // =========================
  useEffect(() => {
    async function fetchPerfil() {
      const ref = doc(db, "usuarios", uidObjetivo);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setDatosPerfil({
          ...data,
          seguidores: [],
          siguiendo: [],
        });

        setDisplayName(data.username || "Sin nombre");
        setBio(data.bio || "");
        setPreview(data.avatar || data.photoURL || "");
      }

      setEsPropio(!esPerfilAjeno || user?.uid === uidPerfil);
    }
    fetchPerfil();
  }, [uidObjetivo, uidPerfil, user]);

  // =========================
  // 1b. Cargar seguidores y siguiendo
  // =========================
  useEffect(() => {
    if (!user || !datosPerfil) return;

    async function cargarCounts() {
      const snapSeguidores = await getDocs(collection(db, "usuarios", uidObjetivo, "seguidores"));
      const seguidores = snapSeguidores.docs.map(d => d.id);

      const snapSiguiendo = await getDocs(collection(db, "usuarios", uidObjetivo, "siguiendo"));
      const siguiendo = snapSiguiendo.docs.map(d => d.id);

      setSeguidoresCount(seguidores.length);
      setSiguiendoCount(siguiendo.length);

      setDatosPerfil(prev => ({
        ...prev,
        seguidores,
        siguiendo
      }));

      // evitar reset infinito
      if (ultimaCargaUid !== uidObjetivo) {
        setPaginaSiguiendo(1);
        setListaSiguiendo([]);
        setUltimaCargaUid(uidObjetivo);
      }
    }

    cargarCounts();
  }, [uidObjetivo, user, datosPerfil, ultimaCargaUid]);

  // =============================
  // 2. Saber si YA SIGO
  // =============================
  useEffect(() => {
    if (!user || !esPerfilAjeno) return;

    async function checkFollow() {
      const snap = await getDocs(collection(db, "usuarios", user.uid, "siguiendo"));
      const siguiendo = snap.docs.map(d => d.id);
      setYaSigo(siguiendo.includes(uidPerfil));
    }
    checkFollow();
  }, [user, uidPerfil, esPerfilAjeno]);

  // =============================
  // 3. Cargar Muro
  // =============================
  useEffect(() => {
    async function cargarMuro() {
      const data = await getMuro(uidObjetivo);
      setPosts(data);
    }
    cargarMuro();
  }, [uidObjetivo, getMuro]);

  // =============================
  // 4. Toggle Follow
  // =============================
  const toggleFollow = async () => {
    if (!user) return;

    setYaSigo(prev => !prev);

    if (yaSigo) {
      await dejarSeguirUsuario(user.uid, uidPerfil);
      setDatosPerfil(prev => ({
        ...prev,
        seguidores: prev.seguidores.filter(id => id !== user.uid)
      }));
      setSeguidoresCount(prev => prev - 1);
    } else {
      await seguirUsuario(user.uid, uidPerfil);
      setDatosPerfil(prev => ({
        ...prev,
        seguidores: [...prev.seguidores, user.uid]
      }));
      setSeguidoresCount(prev => prev + 1);
    }
  };

  // =============================
  // 5. Editar perfil
  // =============================
  const handleFileChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  const guardarCambios = async () => {
    try {
      await updateProfileData({ displayName, bio, file });
      alert("Perfil actualizado ✔");
      setEditMode(false);
    } catch (error) {
      alert("Error al actualizar perfil");
    }
  };

  // =============================
  // 6. Publicar en muro
  // =============================
  const publicarEnMuro = async () => {
    if (!nuevoPost.trim()) return;

    const nuevo = await publicarPost(nuevoPost, uidObjetivo);
    setPosts((prev) => [nuevo, ...prev]);
    setNuevoPost("");
  };

  // =============================
  // 7. Cargar info de SEGUIDORES (NUEVO)
  // =============================
  useEffect(() => {
    if (!datosPerfil) return;

    async function cargarSeguidores() {
      const segs = datosPerfil.seguidores || [];

      const lista = await Promise.all(
        segs.map(async (uid) => {
          const snap = await getDoc(doc(db, "usuarios", uid));
          if (!snap.exists()) return null;

          const data = snap.data();

          const postsSnap = await getDocs(collection(db, "posts"));
          const historias = postsSnap.docs.filter(p => p.data().uid === uid).length;

          const seguidoresSnap = await getDocs(collection(db, "usuarios", uid, "seguidores"));
          const siguiendoSnap = await getDocs(collection(db, "usuarios", uid, "siguiendo"));

          return {
            uid,
            nickname: data.username,
            usuario: data.email?.split("@")[0] || "",
            foto: data.avatar || data.photoURL || "",
            historias,
            seguidores: seguidoresSnap.docs.length,
          };
        })
      );

      setListaSeguidores(lista.filter(u => u !== null));
    }

    cargarSeguidores();
  }, [datosPerfil]);

  // =============================
  // 8. Cargar SIGUIENDO (modal)
  // =============================
  const cargarSiguiendo = async (reset = false) => {
    if (!datosPerfil) return;

    const segs = datosPerfil.siguiendo || [];

    // Si hay menos de 9 NO paginamos
    if (segs.length <= ITEMS_POR_PAGINA) {
      const lista = await Promise.all(
        segs.map(async (uid) => {
          const snap = await getDoc(doc(db, "usuarios", uid));
          if (!snap.exists()) return null;

          const data = snap.data();
          return {
            uid,
            nickname: data.username,
            usuario: data.email?.split("@")[0],
            foto: data.avatar || data.photoURL || "",
          };
        })
      );

      setListaSiguiendo(lista.filter(Boolean));
      return;
    }

    // === PAGINACIÓN ===
    setCargandoMas(true);

    const paginaActual = reset ? 1 : paginaSiguiendo;
    const start = (paginaActual - 1) * ITEMS_POR_PAGINA;

    const lote = segs.slice(start, start + ITEMS_POR_PAGINA);

    const nuevos = await Promise.all(
      lote.map(async (uid) => {
        const snap = await getDoc(doc(db, "usuarios", uid));
        if (!snap.exists()) return null;

        const data = snap.data();
        return {
          uid,
          nickname: data.username,
          usuario: data.email?.split("@")[0],
          foto: data.avatar || data.photoURL || "",
        };
      })
    );

    if (reset) {
      setListaSiguiendo(nuevos.filter(Boolean));
    } else {
      setListaSiguiendo(prev => [...prev, ...nuevos.filter(Boolean)]);
    }

    setPaginaSiguiendo(paginaActual + 1);
    setCargandoMas(false);
  };

  if (!datosPerfil) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">

      {/* =======================================================
           ENCABEZADO
      ======================================================= */}
      <div className="perfil-header">
        <img src={preview} alt="avatar" className="perfil-avatar" />

        <div>
          {!editMode ? (
            <>
              <h2 className="perfil-nombre">{datosPerfil.username}</h2>
              <p className="perfil-username">@{datosPerfil.email?.split("@")[0]}</p>

              <div className="perfil-stats">
                <span><strong>Historias:</strong> 2</span>
                <span><strong>Listas:</strong> 1</span>
                <span><strong>Seguidores:</strong> {seguidoresCount}</span>

                <span
                  className="clickable"
                  onClick={() => {
                    setShowSiguiendoModal(true);
                    setListaSiguiendo([]);
                    setPaginaSiguiendo(1);
                    cargarSiguiendo(true);
                  }}
                >
                  <strong>Siguiendo:</strong> {siguiendoCount}
                </span>
              </div>

              {!esPropio && (
                <button onClick={toggleFollow} className={`btn-editar ${yaSigo ? "siguiendo" : ""}`}>
                  {yaSigo ? "Siguiendo" : "Seguir"}
                </button>
              )}

              {esPropio && (
                <button className="btn-editar" onClick={() => setEditMode(true)}>
                  Editar perfil
                </button>
              )}
            </>
          ) : (
            <>
              <input className="input-text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <textarea className="textarea-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tu biografía..."></textarea>

              <label className="file-label">
                Cambiar foto
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              <button className="btn-guardar" onClick={guardarCambios}>Guardar cambios</button>
              <button className="btn-cancelar" onClick={() => setEditMode(false)}>Cancelar</button>
            </>
          )}
        </div>
      </div>

      {/* =======================================================
           PESTAÑAS
      ======================================================= */}
      <div className="perfil-tabs">
        <button onClick={() => setTab("info")} className={tab === "info" ? "active" : ""}>INFO</button>
        <button onClick={() => setTab("muro")} className={tab === "muro" ? "active" : ""}>MURO</button>
        <button onClick={() => setTab("seguidores")} className={tab === "seguidores" ? "active" : ""}>SEGUIDORES</button>
      </div>

      {/* =======================================================
           INFO
      ======================================================= */}
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
            <h3>Historias de {datosPerfil.username}</h3>
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

      {/* =======================================================
           MURO
      ======================================================= */}
      {tab === "muro" && (
        <div className="muro">
          <div className="muro-publicar">
            <textarea value={nuevoPost} onChange={(e) => setNuevoPost(e.target.value)} placeholder={esPropio ? "Escribe algo en tu muro..." : "Escribe un comentario..."}></textarea>
            <button onClick={publicarEnMuro} className="btn-editar">Publicar</button>
          </div>

          {posts.length ? (
            posts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((post) => (
              <div key={post.id} className="muro-post">
                {post.foto && <img src={post.foto} className="post-avatar" />}
                <div className="post-contenido">
                  <p className="post-autor">{post.autor}</p>
                  <p className="post-texto">{post.texto}</p>
                  {post.fecha && <span className="post-fecha">{new Date(post.fecha).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                </div>
              </div>
            ))
          ) : (
            <p>No hay publicaciones aún.</p>
          )}
        </div>
      )}

      {/* =======================================================
           SEGUIDORES
      ======================================================= */}
      {tab === "seguidores" && (
        <div className="seguidores-grid">
          {listaSeguidores.length ? (
            listaSeguidores.map((seg) => (
              <div
                key={seg.uid}
                className="seguidor-card"
                onClick={() => navigate(`/perfil/${seg.uid}`)}
              >
                <img src={seg.foto} className="seguidor-avatar" />

                <div className="seguidor-info">
                  <h4>{seg.nickname}</h4>
                  <p>@{seg.usuario}</p>
                  <p>📖 {seg.historias} historias</p>
                  <p>👥 {seg.seguidores} seguidores</p>
                </div>
              </div>
            ))
          ) : (
            <p>No tienes seguidores aún.</p>
          )}
        </div>
      )}

      {/* ===========================================
           MODAL SIGUIENDO — CORREGIDO
      =========================================== */}
      {showSiguiendoModal && (
        <div className="modal-overlay" onClick={() => setShowSiguiendoModal(false)}>
          <div className="modal-siguiendo" onClick={(e) => e.stopPropagation()}>

            {/* BOTÓN X */}
            <button className="cerrar-modal" onClick={() => setShowSiguiendoModal(false)}>
              ✕
            </button>

            {/* TÍTULO */}
            <h3 className="titulo-modal">({datosPerfil.siguiendo.length}) Siguiendo</h3>

            <div className="modal-lista">
              {listaSiguiendo.map((u) => (
                <div
                  key={u.uid}
                  className="modal-item"
                  onClick={() => navigate(`/perfil/${u.uid}`)}
                >
                  <img src={u.foto} className="modal-avatar" />
                  <div>
                    <p className="modal-nick">{u.nickname}</p>
                    <p className="modal-user">@{u.usuario}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CARGAR MÁS */}
            {listaSiguiendo.length < datosPerfil.siguiendo.length && (
              <button
                className="btn-cargar"
                onClick={() => cargarSiguiendo(false)}
                disabled={cargandoMas}
              >
                {cargandoMas ? "Cargando..." : "Cargar más"}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
