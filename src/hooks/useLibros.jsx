import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function useLibros() {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    async function obtenerLibros() {
      const ref = collection(db, "libros");
      const snapshot = await getDocs(ref);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLibros(data);
    }

    obtenerLibros();
  }, []);

  return libros;
}
