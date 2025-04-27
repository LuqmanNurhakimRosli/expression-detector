import { db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

export interface AnalysisHistory {
  id: string;
  userId: string; // Added userId to match getAnalysisHistory query
  fileName: string;
  fileType: 'audio' | 'pdf';
  createdAt: Date;
  transcription?: string;
  note?: any;
  quiz?: any[];
  flashcards?: any[];
}

export const saveAnalysis = async (data: Omit<AnalysisHistory, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'analysis'), {
      ...data,
      createdAt: serverTimestamp() // Using server timestamp instead of client Date
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export const getAnalysis = async (id: string) => {
  try {
    const docRef = doc(db, 'analysis', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...(data as Omit<AnalysisHistory, 'id'>),
        createdAt: (data?.createdAt?.toDate?.() ?? new Date()) as Date, // Firestore Timestamp to JS Date
      } as AnalysisHistory;
    }
    return null;
  } catch (error) {
    console.error('Error getting analysis:', error);
    throw error;
  }
};

export const updateAnalysis = async (id: string, data: Partial<AnalysisHistory>) => {
  try {
    const docRef = doc(db, 'analysis', id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating analysis:', error);
    throw error;
  }
};

export const getAnalysisHistory = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'analysis'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...(data as Omit<AnalysisHistory, 'id'>),
        createdAt: (data?.createdAt?.toDate?.() ?? new Date()) as Date, // Convert Firestore Timestamp
      } as AnalysisHistory;
    });
  } catch (error) {
    console.error('Error getting analysis history:', error);
    throw error;
  }
};

export const deleteAnalysis = async (id: string) => {
  const docRef = doc(db, 'analysis', id);
  await deleteDoc(docRef);
};
