

import { db, serverTimestamp } from './firebase';
import { SavedDidacticUnit } from '../types';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

type UnitDocumentData = Omit<SavedDidacticUnit, 'id' | 'createdAt'> & { createdAt: Timestamp };

/**
 * Loads all saved didactic units for a specific user from Firestore.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedDidacticUnit objects.
 */
export const loadDidacticUnits = async (userId: string): Promise<SavedDidacticUnit[]> => {
    try {
        const coll = collection(db, 'didactic_units');
        const q = query(coll, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as UnitDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load didactic units from Firestore:", error);
        throw new FirestoreServiceError(error, 'didactic_units');
    }
};

/**
 * Saves a new didactic unit to Firestore for a specific user.
 * @param unitData The data for the new unit, including metadata.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedDidacticUnit with its Firestore ID and timestamp.
 */
export const saveDidacticUnit = async (
    unitData: Omit<SavedDidacticUnit, 'id' | 'createdAt'>,
    userId: string
): Promise<SavedDidacticUnit> => {
    try {
        const dataToSave: { [key: string]: any } = {
            ...unitData,
            userId,
            createdAt: serverTimestamp(),
        };

        // Firestore does not allow `undefined` values.
        if (dataToSave.curriculumId === undefined) {
            delete dataToSave.curriculumId;
        }
        
        const coll = collection(db, 'didactic_units');
        const docRef = await addDoc(coll, dataToSave);
        const now = new Date();
        return { 
            ...unitData, 
            id: docRef.id, 
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Failed to save didactic unit to Firestore:", error);
        throw error;
    }
};

/**
 * Updates an existing didactic unit in Firestore.
 * @param unitId The ID of the unit to update.
 * @param updates An object containing the fields to update. To update the whole unit object, pass { unit: newUnitObject }.
 */
export const updateDidacticUnit = async (
    unitId: string,
    updates: { [key: string]: any }
): Promise<void> => {
    try {
        const unitRef = doc(db, 'didactic_units', unitId);
        await updateDoc(unitRef, updates);
    } catch (error) {
        console.error("Failed to update didactic unit in Firestore:", error);
        throw error;
    }
};

/**
 * Deletes a didactic unit from Firestore.
 * @param unitId The ID of the unit to delete.
 */
export const deleteDidacticUnit = async (unitId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'didactic_units', unitId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Failed to delete didactic unit from Firestore:", error);
        throw error;
    }
};