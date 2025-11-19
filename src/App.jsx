// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Explorar from "./paginas/Explorar";
import Comunidad from "./paginas/Comunidad";
import Escribir from "./paginas/Escribir";
import Biblioteca from "./paginas/Biblioteca";
import MiniWattpad from "./paginas/MiniWattpad";
import Perfil from "./paginas/Perfil";

import { LibrosProvider } from "./context/LibrosContext";





import "./App.css";

export default function App() {
  return (
   
      <LibrosProvider>
          <Navbar />

          <Routes>
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/comunidad" element={<Comunidad />} />
             <Route path="/escribir" element={<Escribir />} />
             <Route path="/perfil" element={<Perfil />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/miniwattpad" element={<MiniWattpad />} />
          </Routes>
      </LibrosProvider>
    
  );
}
