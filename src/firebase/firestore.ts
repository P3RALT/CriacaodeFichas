import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  setDoc,
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Character } from '../interfaces/Character';

const COLLECTION_NAME = 'characters';

// ==========================================
// INTERFACES
// ==========================================

export interface Campaign {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  criadorId: string;
  criadoEm: string;
  membros: string[];
}

// ==========================================
// FUNÇÕES DE PERSONAGEM
// ==========================================

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

// Buscar apenas as fichas do usuário logado
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

// ==========================================
// FUNÇÕES DE CAMPANHA
// ==========================================

// Criar campanha
export const createCampaign = async (campaignData: Campaign) => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignData.id);
    await setDoc(campaignRef, campaignData);
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    throw error;
  }
};

// Buscar campanha pelo Código/ID
export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const docRef = doc(db, 'campaigns', id.toLowerCase().trim());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Campaign;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar campanha:', error);
    throw error;
  }
};

// Adicione no final do arquivo src/firebase/firestore.ts
export const getUserCampaigns = async (uid: string): Promise<Campaign[]> => {
  try {
    const q = query(collection(db, 'campaigns'), where('membros', 'array-contains', uid));
    const querySnapshot = await getDocs(q);

    const campaigns: Campaign[] = [];
    querySnapshot.forEach((doc) => {
      campaigns.push(doc.data() as Campaign);
    });

    return campaigns;
  } catch (error) {
    console.error('Erro ao buscar campanhas do usuário:', error);
    throw error;
  }
};


// Entrar em uma campanha
export const joinCampaign = async (campaignId: string, userId: string) => {
  try {
    const docRef = doc(db, 'campaigns', campaignId);
    await updateDoc(docRef, {
      membros: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Erro ao entrar na campanha:', error);
    throw error;
  }

};