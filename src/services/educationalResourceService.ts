

import { db, serverTimestamp } from './firebase';
import { SavedEducationalResource, EducationalResource } from '../types';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

type ResourceDocumentData = Omit<SavedEducationalResource, 'id' | 'createdAt'> & { createdAt: Timestamp };

/**
 * Loads all saved educational resources for a specific user from Firestore.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedEducationalResource objects.
 */
export const loadEducationalResources = async (userId: string): Promise<SavedEducationalResource[]> => {
    try {
        const coll = collection(db, 'educational_resources');
        const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as ResourceDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load educational resources from Firestore:", error);
        throw new FirestoreServiceError(error, 'educational_resources');
    }
};

/**
 * Saves a new educational resource to Firestore for a specific user.
 * @param resourceData The data for the new resource.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedEducationalResource with its Firestore ID.
 */
export const saveEducationalResource = async (
    resourceData: EducationalResource,
    userId: string
): Promise<SavedEducationalResource> => {
    try {
        const coll = collection(db, 'educational_resources');
        const docRef = await addDoc(coll, {
            ...resourceData,
            userId,
            createdAt: serverTimestamp(),
        });
        const now = new Date();
        return {
            ...resourceData,
            id: docRef.id,
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Failed to save educational resource to Firestore:", error);
        throw error;
    }
};

/**
 * Deletes an educational resource from Firestore.
 * @param resourceId The ID of the resource to delete.
 */
export const deleteEducationalResource = async (resourceId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'educational_resources', resourceId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete educational resource from Firestore:", error);
        throw error;
    }
};