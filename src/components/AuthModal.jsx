// src/componentes/AuthModal.jsx
import { useState } from "react";
import Login from "./Login";
import Registro from "./Register";
import "../App.css"; // asegúrate que ahí estén tus estilos

export default function AuthModal({ onClose }) {
  const [modo, setModo] = useState("login"); // "login" o "registro"

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <button className="modal-cerrar" onClick={onClose}>✖</button>

        {modo === "login" ? (
          <Login onRegistroClick={() => setModo("registro")} onLoginExitoso={onClose} />
        ) : (
          <Registro
            irALogin={() => setModo("login")}
            onRegistroExitoso={onClose}
          />
        )}
      </div>
    </div>
  );
}
