import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Character } from '../interfaces/Character';


const COLLECTION_NAME = 'characters';

// Criar uma nova ficha
export const createCharacter = async (characterData: Omit<Character, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...characterData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    throw error;
  }
};

// Buscar apenas as fichas do usuário logado (Segurança por UID)
export const getUserCharacters = async (uid: string): Promise<Character[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      characters.push({
        id: doc.id,
        ...(doc.data() as Omit<Character, 'id'>),
      });
    });

    return characters;
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    throw error;
  }
};

// Buscar uma ficha específica pelo ID
export const getCharacterById = async (id: string): Promise<Character | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Character, 'id'>) };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar personagem:', error);
    throw error;
  }
};

// Atualizar uma ficha
export const updateCharacter = async (id: string, characterData: Partial<Character>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, characterData);
  } catch (error) {
    console.error('Erro ao atualizar personagem:', error);
    throw error;
  }
};

// Deletar uma ficha
export const deleteCharacter = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar personagem:', error);
    throw error;
  }

  
};