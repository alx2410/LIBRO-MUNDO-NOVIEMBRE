import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; // 👈 Importa el Provider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>  {/* 👈 Envuelve aquí */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
