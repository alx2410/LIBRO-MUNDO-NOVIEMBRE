/* eslint-disable react-refresh/only-export-components */
// src/context/authContext.jsx
// 👇 Contexto de autenticación unificado: Auth + Firestore + Storage

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db, storage } from "../firebase/config";
 // 🔹 CAMBIO: asegurarse de importar db y storage

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // 🔹 CAMBIO: para subir avatar

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

// 3. Componente proveedor
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // 🔹 CAMBIO: aquí guardamos Auth + perfil
  const [loading, setLoading] = useState(true);

  // 🔹 CAMBIO: función que mezcla datos de Auth + Firestore en un solo objeto user
  const cargarUsuarioCompleto = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      const userRef = doc(db, "usuarios", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const profile = snap.data();
        // Mezclamos todo en un solo objeto user
        setUser({
          ...firebaseUser,     // datos de Firebase Auth (uid, email, displayName, photoURL, etc.)
          ...profile,          // datos de Firestore (username, avatar, provider, createdAt, etc.)
        });
      } else {
        // Si no hay perfil en Firestore, usamos solo el user de Auth
        setUser(firebaseUser);
      }
    } catch (error) {
      console.error("Error al cargar usuario completo:", error);
      setUser(firebaseUser); // al menos dejamos el user de Auth
    }
  };

  // Escuchamos cambios de sesión (login, logout, recarga de página, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await cargarUsuarioCompleto(firebaseUser); // 🔹 CAMBIO
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🟢 REGISTRO con email/password + avatar en Storage + perfil en Firestore
  const register = async (
    email,
    password,
    {
      username,      // 🔹 CAMBIO: nombre de usuario que viene del formulario
      avatarFile,    // 🔹 CAMBIO: archivo de imagen (File)
    }
  ) => {
    // 1. Crear usuario en Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;
    const uid = firebaseUser.uid;

    // 2. Subir avatar a Storage (si el usuario eligió archivo)
    let avatarUrl = "";

    if (avatarFile) {
      // 🔹 CAMBIO: nombre único para no sobreescribir
      const uniqueName = `${uid}-${Date.now()}-${avatarFile.name}`;
      const avatarRef = ref(storage, `usuario/${uniqueName}`);
      await uploadBytes(avatarRef, avatarFile);       // subir archivo
      avatarUrl = await getDownloadURL(avatarRef);    // obtener URL pública
    }

    // 3. Crear documento de perfil en Firestore
    const userRef = doc(db, "usuarios", uid);
    await setDoc(userRef, {
      uid,
      email,
      username,
      avatar: avatarUrl,
      provider: "password",        // 🔹 CAMBIO: cómo se registró
      createdAt: serverTimestamp()
    });

    // 4. Mezclar y guardar todo en user del contexto
    await cargarUsuarioCompleto(firebaseUser); // 🔹 CAMBIO

    return firebaseUser;
  };

  // 🟢 LOGIN con email/password
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;

    await cargarUsuarioCompleto(firebaseUser); // 🔹 CAMBIO
    return firebaseUser;
  };

  // 🟢 LOGIN con Google (y creación de perfil si no existe)
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;

    const userRef = doc(db, "usuarios", gUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: gUser.uid,
        email: gUser.email,
        username: gUser.displayName || "",
        avatar: gUser.photoURL || "",
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }

    await cargarUsuarioCompleto(gUser); // 🔹 CAMBIO

    return gUser;
  };

  // 🟢 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null); // 🔹 CAMBIO: limpiamos el user mezclado
  };

  // 🟢 RESET PASSWORD
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,            // 🔹 ESTE user ya tiene username y avatar (si existen en Firestore)
    loading,
    register,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}