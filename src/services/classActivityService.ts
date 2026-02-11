

import { db, serverTimestamp } from './firebase';
import { SavedClassActivity } from '../types';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

type ActivityDocumentData = Omit<SavedClassActivity, 'id' | 'createdAt'> & { createdAt: Timestamp };

/**
 * Loads all saved class activities for a specific user from Firestore.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedClassActivity objects.
 */
export const loadClassActivities = async (userId: string): Promise<SavedClassActivity[]> => {
    try {
        const coll = collection(db, 'class_activities');
        const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as ActivityDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load class activities from Firestore:", error);
        throw new FirestoreServiceError(error, 'class_activities');
    }
};

/**
 * Saves a new class activity to Firestore for a specific user.
 * @param activityData The data for the new activity, including metadata.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedClassActivity with its Firestore ID and timestamp.
 */
export const saveClassActivity = async (
    activityData: Omit<SavedClassActivity, 'id' | 'createdAt'>,
    userId: string
): Promise<SavedClassActivity> => {
    try {
        const dataToSave: { [key: string]: any } = {
            ...activityData,
            userId,
            createdAt: serverTimestamp(),
        };

        // Firestore does not allow `undefined` values.
        if (dataToSave.curriculumId === undefined) {
            delete dataToSave.curriculumId;
        }

        const coll = collection(db, 'class_activities');
        const docRef = await addDoc(coll, dataToSave);
        const now = new Date();
        return { 
            ...activityData, 
            id: docRef.id, 
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Failed to save class activity to Firestore:", error);
        throw error;
    }
};

/**
 * Updates an existing class activity in Firestore.
 * @param activityId The ID of the activity to update.
 * @param updates An object containing the fields to update. To update the whole object, pass { activity: newActivityObject }.
 */
export const updateClassActivity = async (
    activityId: string,
    updates: { [key: string]: any }
): Promise<void> => {
    try {
        const activityRef = doc(db, 'class_activities', activityId);
        await updateDoc(activityRef, updates);
    } catch (error) {
        console.error("Failed to update class activity in Firestore:", error);
        throw error;
    }
};


/**
 * Deletes a class activity from Firestore.
 * @param activityId The ID of the activity to delete.
 */
export const deleteClassActivity = async (activityId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'class_activities', activityId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete class activity from Firestore:", error);
        throw error;
    }
};