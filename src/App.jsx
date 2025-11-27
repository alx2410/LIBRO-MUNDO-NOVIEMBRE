// App.jsx
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import MiniWattpad from "./paginas/MiniWattpad";
import Perfil from "./paginas/Perfil";

import Intranet from "./components/Intranet";
import Dashboard from "./paginas/intranet/Dashboard";
import Lectores from "./paginas/intranet/Lectores";
import Escritores from "./paginas/intranet/Escritores";
import AdminUsuarios from "./paginas/intranet/AdminUsuarios";

import RutaProtegida from "./components/RutaProtegida";
import RutaAdmin from "./components/RutaAdmin";


import { LibrosProvider } from "./context/LibrosContext";

import "./App.css";

export default function App() {
  return (
    <LibrosProvider>
      <Navbar />

      <Routes>
        {/* HOME que carga automáticamente */}
        <Route path="/" element={<MiniWattpad />} />

        {/* RUTAS PÚBLICAS */}
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/escribir" element={<Escribir />} />
        <Route path="/perfil/:uid?" element={<Perfil />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/miniwattpad" element={<MiniWattpad />} />


        {/* RUTAS PROTEGIDAS: INTRANET */}
        <Route
          path="/intranet"
          element={
            <RutaProtegida>
              <Intranet />
            </RutaProtegida>
          }
        >
          {/* Rutas internas de intranet */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lectores" element={<Lectores />} />
          <Route path="escritores" element={<Escritores />} />

          {/* RUTA SOLO ADMIN */}
          <Route
            path="admin/usuarios"
            element={
              <RutaAdmin>
                <AdminUsuarios />
              </RutaAdmin>
            }
          />
        </Route>
      </Routes>
    </LibrosProvider>
  );
}