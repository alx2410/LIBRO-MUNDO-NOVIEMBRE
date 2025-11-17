import "./MiniWattpad.css";

export default function MiniWattpad() {
  return (
    <div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="inicio-container">
        <div className="inicio-texto">
          <h1>
            Ven por la historia. <br />
            Quédate por la conexión.
          </h1>

          <p className="descripcion">
            Historias mejores que el streaming y secciones de comentarios
            mejores que el chat de tu grupo.
          </p>

          <button className="btn-comenzar">Comenzar</button>

          <p className="texto-sec">
            ¿Ya tienes una cuenta? <span>Inicia sesión</span>
          </p>
        </div>

        <div className="inicio-imagen">
          <img
            src="https://img.wattpad.com/illustration-example.png"
            alt="Ilustración"
          />
        </div>
      </div>

      {/* MINI CARRUSEL */}
      <div className="mini-carrusel-container">
        <h2 className="mini-carrusel-title">Recomendados para ti</h2>

        <div className="mini-carrusel">
          <button className="carrusel-btn">‹</button>

          <div className="mini-carrusel-items">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM04Wu4kbkTnQb7l_uOFpwFWvJivWGxavtlw&s" alt="img1" />
            <img src="https://images.cdn1.buscalibre.com/fit-in/360x360/87/ac/87ac05af4868b66b9520d3f84dbc886e.jpg" alt="img2" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG9BxxJcDRsBabRy0I6hdrqAEsOekJpksRrw&s" alt="img3" />
            <img src="https://images.cdn2.buscalibre.com/fit-in/360x360/8e/28/8e2808346ffb11afb7f118576999050a.jpg" alt="img4" />
            <img src="https://images.cdn3.buscalibre.com/fit-in/360x360/49/42/4942b939de795b95d9c852609abe48df.jpg" alt="img5" />
            <img src="https://images.cdn1.buscalibre.com/fit-in/520x520/11/d2/11d2f5cc990034a702c1846d57967bb4.jpg" alt="" />
            <img src="https://images.cdn3.buscalibre.com/fit-in/360x360/1b/d5/1bd59711aa7de679ded4d293ff95fa51.jpg" alt="" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1kNWJd5KHILa97FeYxlTZe_qmdjnEKEWz_w&s" alt="" />
          </div>

          <button className="carrusel-btn">›</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-links">
          <a>Privacidad</a>
          <a>Condiciones</a>
          <a>Ayuda</a>
          <a>Idioma</a>
        </div>

        <p className="footer-copy">© 2025 MiniWattpad</p>
      </footer>
    </div>
  );
}
