import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; // 👈 Importa el Provider
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/WATTPAD">
    <AuthProvider>  {/* 👈 Envuelve aquí */}
      <App />
    </AuthProvider>
    </BrowserRouter>
    
  </React.StrictMode>
);
