import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credenciais
const firebaseConfig = {
  apiKey: "AIzaSyDPlUDEJ5Ae1F52W0N-Mr6D-xD5j89tpjw",
  authDomain: "rpglimbo.firebaseapp.com",
  projectId: "rpglimbo",
  storageBucket: "rpglimbo.firebasestorage.app",
  messagingSenderId: "157341980665",
  appId: "1:157341980665:web:2fa822e8a3901d96354f28",
  measurementId: "G-ZSTXR0KRRL"
};

// Inicialização
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);