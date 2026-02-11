

import { db, serverTimestamp } from './firebase';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

export interface HistoryItem {
    id: string;
    subject: string;
    course: string;
    region: string;
    sql: string;
    fileName: string;
    createdAt: string; // Stays as ISO string for consistency
}

// Type for data sent to Firestore (excluding id)
export type HistoryItemData = Omit<HistoryItem, 'id' | 'createdAt'>;
// Type for data received from Firestore
type HistoryDocumentData = Omit<HistoryItem, 'id' | 'createdAt'> & { createdAt: Timestamp };


/**
 * Loads the history of generated scripts from Firestore for a specific user.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of HistoryItem objects.
 */
export const loadHistory = async (userId: string): Promise<HistoryItem[]> => {
    try {
        const coll = collection(db, 'generations');
        const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as HistoryDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load history from Firestore:", error);
        throw new FirestoreServiceError(error, 'generations');
    }
};

/**
 * Saves a new generated script to Firestore for a specific user.
 * @param itemData The data for the new history item (without an id).
 * @param userId The ID of the logged-in user.
 * @returns The newly created HistoryItem with its Firestore ID.
 */
export const saveHistory = async (itemData: Omit<HistoryItem, 'id' | 'createdAt'>, userId: string): Promise<HistoryItem> => {
    try {
        const coll = collection(db, 'generations');
        const docRef = await addDoc(coll, {
            ...itemData,
            userId,
            createdAt: serverTimestamp(),
        });
        // We return a client-side version immediately for UI updates, createdAt will be slightly different but acceptable
        const now = new Date();
        return { ...itemData, id: docRef.id, createdAt: now.toISOString() };
    } catch (error) {
        console.error("Failed to save history to Firestore:", error);
        throw error;
    }
};

/**
 * Deletes a history item from Firestore.
 * @param itemId The ID of the document to delete.
 */
export const deleteHistoryItem = async (itemId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'generations', itemId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete history item from Firestore:", error);
        throw error;
    }
};