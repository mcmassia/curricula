

import { db, serverTimestamp } from './firebase';
import { SavedLearningSituation } from '../types';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, deleteDoc, updateDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

type SituationDocumentData = Omit<SavedLearningSituation, 'id' | 'createdAt'> & { createdAt: Timestamp };

/**
 * Loads all saved learning situations for a specific user from Firestore.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedLearningSituation objects.
 */
export const loadLearningSituations = async (userId: string): Promise<SavedLearningSituation[]> => {
    try {
        const coll = collection(db, 'learning_situations');
        const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as SituationDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load learning situations from Firestore:", error);
        throw new FirestoreServiceError(error, 'learning_situations');
    }
};

/**
 * Saves a new learning situation to Firestore for a specific user.
 * @param situationData The data for the new situation, including metadata.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedLearningSituation with its Firestore ID and timestamp.
 */
export const saveLearningSituation = async (
    situationData: Omit<SavedLearningSituation, 'id' | 'createdAt'>,
    userId: string
): Promise<SavedLearningSituation> => {
    try {
        const dataToSave: { [key: string]: any } = {
            ...situationData,
            userId,
            createdAt: serverTimestamp(),
        };

        // Firestore does not allow `undefined` values.
        if (dataToSave.curriculumId === undefined) {
            delete dataToSave.curriculumId;
        }

        const coll = collection(db, 'learning_situations');
        const docRef = await addDoc(coll, dataToSave);
        const now = new Date();
        return { 
            ...situationData, 
            id: docRef.id, 
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Failed to save learning situation to Firestore:", error);
        throw error;
    }
};

/**
 * Deletes a learning situation from Firestore.
 * @param situationId The ID of the situation to delete.
 */
export const deleteLearningSituation = async (situationId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'learning_situations', situationId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete learning situation from Firestore:", error);
        throw error;
    }
};

/**
 * Updates an existing learning situation in Firestore.
 * @param situationId The ID of the situation to update.
 * @param updates An object containing the fields to update. To update the whole object, pass { situation: newSituationObject }.
 */
export const updateLearningSituation = async (
    situationId: string,
    updates: { [key: string]: any }
): Promise<void> => {
    try {
        const situationRef = doc(db, 'learning_situations', situationId);
        await updateDoc(situationRef, updates);
    } catch (error) {
        console.error("Failed to update learning situation in Firestore:", error);
        throw error;
    }
};