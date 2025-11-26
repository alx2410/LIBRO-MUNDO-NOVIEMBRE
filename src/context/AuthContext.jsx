/* eslint-disable react-refresh/only-export-components */
// src/context/authContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/auth";
import { db, storage, googleProvider } from "../firebase/config";

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc, // 👈 FALTABA
} from "firebase/firestore";



import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const AuthContext = createContext();

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // 🔥 Unifica Auth + Firestore en un solo objeto
  // ============================================
  const cargarUsuarioCompleto = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const userRef = doc(db, "usuarios", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      setUser({
        ...firebaseUser,
        ...snap.data(),
      });
    } else {
      setUser(firebaseUser);
    }
  };

  // Escuchar sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) await cargarUsuarioCompleto(firebaseUser);
      else setUser(null);

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ============================================
  // 🟢 REGISTRO
  // ============================================
  const register = async (email, password, { username, avatarFile }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;
    const uid = firebaseUser.uid;

    let avatarUrl = "";

    if (avatarFile) {
      const avatarRef = ref(storage, `usuario/${uid}-${Date.now()}`);
      await uploadBytes(avatarRef, avatarFile);
      avatarUrl = await getDownloadURL(avatarRef);

      await updateProfile(firebaseUser, { photoURL: avatarUrl });
    }

    // Perfil en Firestore
    await setDoc(doc(db, "usuarios", uid), {
      uid,
      email,
      username,
      avatar: avatarUrl,
      bio: "",
      provider: "password",
      createdAt: serverTimestamp(),
    });

    await cargarUsuarioCompleto(firebaseUser);
    return firebaseUser;
  };

  // ============================================
  // 🟢 LOGIN normal
  // ============================================
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cargarUsuarioCompleto(cred.user);
    return cred.user;
  };

  // ============================================
  // 🟢 LOGIN con Google
  // ============================================
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;

    const refUser = doc(db, "usuarios", gUser.uid);
    const snap = await getDoc(refUser);

    if (!snap.exists()) {
      await setDoc(refUser, {
        uid: gUser.uid,
        email: gUser.email,
        username: gUser.displayName || "",
        avatar: gUser.photoURL || "",
        bio: "",
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }

    await cargarUsuarioCompleto(gUser);
    return gUser;
  };

  // ============================================
  // 🟢 ACTUALIZAR PERFIL (foto, nombre, bio)
  // ============================================
  const updateProfileData = async ({ displayName, bio, file }) => {
    if (!user) return;

    const uid = user.uid;
    let photoURL = user.photoURL;

    // Subir nueva foto si existe
    if (file) {
      const imgRef = ref(storage, `usuario/${uid}-${Date.now()}`);
      await uploadBytes(imgRef, file);
      photoURL = await getDownloadURL(imgRef);

      // Update en Auth
      await updateProfile(auth.currentUser, { photoURL });
    }

    // Update Firestore
    await updateDoc(doc(db, "usuarios", uid), {
      username: displayName,
      bio: bio || "",
      avatar: photoURL,
    });

    // Recargar usuario mezclado
    await cargarUsuarioCompleto(auth.currentUser);
  };

  // ============================================
  // 🟢 PUBLICAR EN MURO
  // ============================================
  const publicarPost = async (texto) => {
    if (!user) return;

    const nuevo = {
      uid: user.uid,
      autor: user.username || user.email,
      texto,
      foto: user.avatar || user.photoURL || "",
      fecha: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, "posts"), nuevo);
    return { id: ref.id, ...nuevo, fecha: new Date() };
  };

  // ============================================
  // 🟢 OBTENER MURO
  // ============================================
  const getMuro = async (uid) => {
    const q = query(
      collection(db, "posts"),
      where("uid", "==", uid),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      fecha: d.data().fecha?.toDate?.() || new Date(),
    }));

    return list;
  };

  // ============================================
  // 🟢 RESET + LOGOUT
  // ============================================
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };


  // ============================================
// 🟢 SEGUIR
// ============================================
const seguirUsuario = async (miUid, uidObjetivo) => {
  await setDoc(
    doc(db, "usuarios", uidObjetivo, "seguidores", miUid),
    { fecha: Date.now() }
  );

  await setDoc(
    doc(db, "usuarios", miUid, "siguiendo", uidObjetivo),
    { fecha: Date.now() }
  );
};

// ============================================
// 🟢 DEJAR DE SEGUIR
// ============================================
const dejarSeguirUsuario = async (miUid, uidObjetivo) => {
  await deleteDoc(doc(db, "usuarios", uidObjetivo, "seguidores", miUid));
  await deleteDoc(doc(db, "usuarios", miUid, "siguiendo", uidObjetivo));
};

// ============================================
// 🟢 VERIFICAR SI LO SIGO
// ============================================
const yaLoSigo = async (miUid, uidObjetivo) => {
  const ref = doc(db, "usuarios", miUid, "siguiendo", uidObjetivo);
  const snap = await getDoc(ref);
  return snap.exists();
};

// ============================================
// 🟢 OBTENER LISTA DE SIGUIENDO
// ============================================
const obtenerSiguiendo = async (miUid) => {
  const colRef = collection(db, "usuarios", miUid, "siguiendo");
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.id); // retorna array de UIDs
};

// ============================================
// 🟢 OBTENER LISTA DE SEGUIDORES
// ============================================
const obtenerSeguidores = async (miUid) => {
  const colRef = collection(db, "usuarios", miUid, "seguidores");
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.id); // retorna array de UIDs
};



  // ============================================
  // 🔥 CONTEXTO FINAL
  // ============================================
  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    updateProfileData,
    publicarPost,
    getMuro,
      seguirUsuario,
  dejarSeguirUsuario,
  yaLoSigo,
  obtenerSiguiendo,   // <--- aquí
    obtenerSeguidores, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
