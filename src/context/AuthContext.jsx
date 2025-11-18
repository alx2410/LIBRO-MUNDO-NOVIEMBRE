/* eslint-disable react-refresh/only-export-components */
// src/context/authContext.jsx
// Contexto de autenticación unificado: Auth + Firestore + Storage

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db, storage } from "../firebase/config";

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
  getDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --------------- CONTEXTO ---------------
const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

// --------------- PROVIDER ---------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // mezcla Auth + Firestore
  const [loading, setLoading] = useState(true);

  // ===== CARGAR USUARIO COMPLETO (AUTH + FIRESTORE) =====
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
        setUser({
          ...firebaseUser,
          ...profile, // username, avatar, bio, seguidores, siguiendo, historiasPublicadas...
        });
      } else {
        // Si no existe documento, crearlo con valores por defecto mínimos
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          username: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || "",
          bio: "",
          seguidores: [],
          siguiendo: [],
          historiasPublicadas: [],
          createdAt: serverTimestamp(),
        });
        const snap2 = await getDoc(userRef);
        setUser({
          ...firebaseUser,
          ...snap2.data(),
        });
      }
    } catch (err) {
      console.error("Error cargando usuario:", err);
      // fallback: al menos guardar firebaseUser
      setUser(firebaseUser);
    }
  };

  // ===== ESCUCHAR CAMBIOS DE AUTENTICACIÓN =====
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await cargarUsuarioCompleto(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== REGISTRO (email/password) =====
  const register = async (email, password, { username, avatarFile } = {}) => {
    // 1) crear en Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;
    const uid = firebaseUser.uid;

    // 2) subir avatar si existe
    let avatarUrl = "";
    if (avatarFile) {
      const fileName = `${uid}-${Date.now()}-${avatarFile.name}`;
      const imgRef = ref(storage, `usuarios/${fileName}`);
      await uploadBytes(imgRef, avatarFile);
      avatarUrl = await getDownloadURL(imgRef);
    }

    // 3) crear doc en Firestore
    const userRef = doc(db, "usuarios", uid);
    await setDoc(userRef, {
      uid,
      email,
      username: username || firebaseUser.displayName || "",
      avatar: avatarUrl || firebaseUser.photoURL || "",
      bio: "",
      seguidores: [],
      siguiendo: [],
      historiasPublicadas: [],
      provider: "password",
      createdAt: serverTimestamp(),
    });

    // 4) recargar y setear en contexto
    await cargarUsuarioCompleto(firebaseUser);

    return firebaseUser;
  };

  // ===== LOGIN =====
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cargarUsuarioCompleto(cred.user);
    return cred.user;
  };

  // ===== LOGIN GOOGLE =====
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;

    const userRef = doc(db, "usuarios", gUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: gUser.uid,
        email: gUser.email || "",
        username: gUser.displayName || "",
        avatar: gUser.photoURL || "",
        bio: "",
        seguidores: [],
        siguiendo: [],
        historiasPublicadas: [],
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }

    await cargarUsuarioCompleto(gUser);
    return gUser;
  };

  // ===== LOGOUT =====
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ===== RESET PASSWORD =====
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // ===== ACTUALIZAR PERFIL (nombre, bio, file/avatar) =====
  const updateProfileData = async ({ displayName, bio, file } = {}) => {
    const authUser = auth.currentUser;
    if (!authUser) throw new Error("No hay usuario autenticado");

    let newPhotoURL = authUser.photoURL || "";

    // 1) subir imagen si hay
    if (file) {
      const imgRef = ref(storage, `usuarios/${authUser.uid}/avatar-${Date.now()}`);
      await uploadBytes(imgRef, file);
      newPhotoURL = await getDownloadURL(imgRef);
    }

    // 2) actualizar Firebase Auth (displayName + photoURL)
    await updateProfile(authUser, {
      displayName: displayName || authUser.displayName,
      photoURL: newPhotoURL,
    });

    // 3) actualizar Firestore (coherente con los campos que usamos)
    const userRef = doc(db, "usuarios", authUser.uid);
    await setDoc(
      userRef,
      {
        username: displayName || authUser.displayName || "",
        bio: bio || "",
        avatar: newPhotoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 4) recargar y actualizar contexto
    await cargarUsuarioCompleto(authUser);

    return true;
  };

  // ===== SEGUIR / DEJAR DE SEGUIR USUARIO =====
  const followUser = async (targetUid) => {
    if (!auth.currentUser) throw new Error("No autenticado");
    const myUid = auth.currentUser.uid;
    if (myUid === targetUid) return; // no seguir a uno mismo

    const myRef = doc(db, "usuarios", myUid);
    const targetRef = doc(db, "usuarios", targetUid);

    // recargar docs para verificar estado
    const mySnap = await getDoc(myRef);
    const targetSnap = await getDoc(targetRef);

    const myData = mySnap.exists() ? mySnap.data() : {};
    const targetData = targetSnap.exists() ? targetSnap.data() : {};

    const yaSigo = Array.isArray(myData.siguiendo) && myData.siguiendo.includes(targetUid);

    if (yaSigo) {
      // unfollow
      await updateDoc(myRef, { siguiendo: arrayRemove(targetUid) });
      await updateDoc(targetRef, { seguidores: arrayRemove(myUid) });
    } else {
      // follow
      await updateDoc(myRef, { siguiendo: arrayUnion(targetUid) });
      await updateDoc(targetRef, { seguidores: arrayUnion(myUid) });
    }

    // recargar user actual en contexto
    await cargarUsuarioCompleto(auth.currentUser);
  };

  // ===== PUBLICAR POST EN MURO =====
  // Guardamos posts en documento "muro/{uid}" con campo posts: array
// 🟣 PUBLICAR EN MURO
const publicarPost = async (texto) => {
  const uid = user.uid;

  const nuevoPost = {
    autor: user.displayName || "Usuario",
    foto: user.photoURL || "",   // <-- FOTO DE PERFIL
    texto,
    fecha: Date.now(),
    uid: uid,
  };

  const ref = doc(collection(db, "muro"));
  await setDoc(ref, nuevoPost);

  return { id: ref.id, ...nuevoPost }; // devolvemos para agregar al estado local
};


  // Obtener muro (de un usuario)
const getMuro = async (uid) => {
  const q = query(
    collection(db, "muro"),
    where("uid", "==", uid)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

  // ===== HISTORIAS =====
  // Publicar historia en colección "historias"
  const publicarHistoria = async (titulo, descripcion, portadaFile) => {
    if (!auth.currentUser) throw new Error("No autenticado");

    let portadaURL = "";
    if (portadaFile) {
      const imgRef = ref(storage, `historias/${auth.currentUser.uid}/${Date.now()}-${portadaFile.name}`);
      await uploadBytes(imgRef, portadaFile);
      portadaURL = await getDownloadURL(imgRef);
    }

    const historiasRef = collection(db, "historias");
    const docRef = await addDoc(historiasRef, {
      titulo,
      descripcion,
      portada: portadaURL,
      autor: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    // opcional: agregar id al array historiasPublicadas en el perfil del usuario
    const userRef = doc(db, "usuarios", auth.currentUser.uid);
    await updateDoc(userRef, {
      historiasPublicadas: arrayUnion(docRef.id),
    });

    // recargar user
    await cargarUsuarioCompleto(auth.currentUser);

    return docRef.id;
  };

  // Obtener historias de un usuario
  const getHistorias = async (uid) => {
    const historiasRef = collection(db, "historias");
    const q = query(historiasRef, where("autor", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  // ===== VALORES DEL CONTEXTO =====
  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    updateProfileData,
    followUser,
    publicarPost,
    getMuro,
    publicarHistoria,
    getHistorias,
    cargarUsuarioCompleto, // útil si necesitas forzar recarga desde UI
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
