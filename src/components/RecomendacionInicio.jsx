import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "./Recomendacion.css"

export default function RecomendacionInicio() {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    try {
      await addDoc(collection(db, "recomendacionesInicio"), {
        texto,
        fecha: new Date(),
      });
      setEstado("enviado");
      setTexto("");
    } catch (err) {
      setEstado("error");
    }
  };

  return (
    <div className="recomendacion-wrapper">
      <div>
       <h1 className="recomendacion-titulo">
        Recomienda <br />
        una historia</h1>
        <p className="recomendacion-sub">
      Tu opinión es importante para nosotros
    </p>   
      </div>
    
        
        
        

      <div className="recomendacion-form-box">
    <form onSubmit={enviar}>
      <input
        type="text"
        placeholder="Escribe una recomendación..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button type="submit">Enviar</button>
    </form>

    {estado === "enviado" && <p className="ok-msg">Recomendación enviada</p>}
    {estado === "error" && <p className="error-msg">Error al enviar</p>}
  </div>
    </div>
  );
}