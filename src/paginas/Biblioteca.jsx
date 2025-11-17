import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Biblioteca() {
  const { user } = useAuth();
  const [historias, setHistorias] = useState([]);

  useEffect(() => {
    if (!user) return;

    const cargar = async () => {
      const q = query(
        collection(db, "historias"),
        where("autorId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const datos = snap.docs.map((doc) => doc.data());
      setHistorias(datos);
    };

    cargar();
  }, [user]);

  if (!user) {
    return <p>Debes iniciar sesión para ver tu biblioteca.</p>;
  }

  return (
    <div className="biblioteca-container">
      <h2>📚 Tus Historias</h2>

      {historias.length === 0 && (
        <p>Aún no has publicado ninguna historia.</p>
      )}

      <div className="biblioteca-grid">
        {historias.map((h) => (
          <div key={h.id} className="historia-card">
            {h.portada && (
              <img src={h.portada} alt={h.titulo} className="historia-portada" />
            )}
            <h3>{h.titulo}</h3>
            <p>Género: {h.genero}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
