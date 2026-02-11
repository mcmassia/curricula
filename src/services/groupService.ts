

import { db, serverTimestamp } from './firebase';
import { SavedStudentGroup, StudentGroup } from '../types';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

type GroupDocumentData = Omit<SavedStudentGroup, 'id' | 'createdAt'> & { createdAt: Timestamp };

const groupsCollection = collection(db, 'student_groups');

/**
 * Loads all saved student groups for a specific user from Firestore.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedStudentGroup objects.
 */
export const loadGroups = async (userId: string): Promise<SavedStudentGroup[]> => {
    try {
        const q = query(groupsCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as GroupDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error("Failed to load student groups from Firestore:", error);
        throw new FirestoreServiceError(error, 'student_groups');
    }
};

/**
 * Saves a new student group to Firestore for a specific user.
 * @param groupData The data for the new group.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedStudentGroup with its Firestore ID and timestamp.
 */
export const saveGroup = async (
    groupData: StudentGroup,
    userId: string
): Promise<SavedStudentGroup> => {
    try {
        const docRef = await addDoc(groupsCollection, {
            ...groupData,
            userId,
            createdAt: serverTimestamp(),
        });
        const now = new Date();
        return { 
            ...groupData, 
            id: docRef.id, 
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Failed to save student group to Firestore:", error);
        throw error;
    }
};

/**
 * Updates an existing student group in Firestore.
 * @param groupId The ID of the group to update.
 * @param updates An object containing the fields to update.
 */
export const updateGroup = async (
    groupId: string,
    updates: Partial<StudentGroup>
): Promise<void> => {
    try {
        const groupRef = doc(db, 'student_groups', groupId);
        await updateDoc(groupRef, updates);
    } catch (error) {
        console.error("Failed to update student group in Firestore:", error);
        throw error;
    }
};


/**
 * Deletes a student group from Firestore.
 * @param groupId The ID of the group to delete.
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
    try {
        const groupRef = doc(db, 'student_groups', groupId);
        await deleteDoc(groupRef);
    } catch (error) {
        console.error("Failed to delete student group from Firestore:", error);
        throw error;
    }
};