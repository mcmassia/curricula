

import { RubricHistoryItem } from '../types';
import { db, serverTimestamp } from './firebase';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';


// Type for data sent to Firestore
export type RubricHistoryItemData = Omit<RubricHistoryItem, 'id' | 'createdAt'>;
// Type for data received from Firestore
type RubricHistoryDocumentData = Omit<RubricHistoryItem, 'id' | 'createdAt'> & { createdAt: Timestamp };

/**
 * Loads the history of generated rubrics from Firestore for a specific user.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of RubricHistoryItem objects.
 */
export const loadRubricsHistory = async (userId: string): Promise<RubricHistoryItem[]> => {
    try {
        const coll = collection(db, 'rubrics');
        const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as RubricHistoryDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load rubrics history from Firestore:", error);
        throw new FirestoreServiceError(error, 'rubrics');
    }
};

/**
 * Saves a new generated rubric to Firestore for a specific user.
 * @param itemData The data for the new rubric history item.
 * @param userId The ID of the logged-in user.
 * @returns The newly created RubricHistoryItem with its Firestore ID.
 */
export const saveRubricsHistory = async (itemData: Partial<RubricHistoryItemData>, userId: string): Promise<RubricHistoryItem> => {
    try {
        const coll = collection(db, 'rubrics');
        const docRef = await addDoc(coll, {
            ...itemData,
            userId,
            createdAt: serverTimestamp(),
        });
        const now = new Date().toISOString();
        return { ...(itemData as RubricHistoryItemData), id: docRef.id, createdAt: now };
    } catch (error) {
        console.error("Failed to save rubric history to Firestore:", error);
        throw error;
    }
};

/**
 * Deletes a rubric history item from Firestore.
 * @param itemId The ID of the document to delete.
 */
export const deleteRubricHistoryItem = async (itemId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'rubrics', itemId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete rubric history item from Firestore:", error);
        throw error;
    }
};