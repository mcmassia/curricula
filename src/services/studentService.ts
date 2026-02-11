

import { db, serverTimestamp } from './firebase';
import { SavedStudent, Student } from '../types';
// Fix: Updated Firebase import path to use the scoped package '@firebase/firestore'.
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "@firebase/firestore";
import { FirestoreServiceError } from './firebaseErrorHelper';

type StudentDocumentData = Omit<SavedStudent, 'id' | 'createdAt'> & { createdAt: Timestamp };

const studentsCollection = collection(db, 'students');

/**
 * Loads all saved students for a specific user from Firestore.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedStudent objects.
 */
export const loadStudents = async (userId: string): Promise<SavedStudent[]> => {
    try {
        // The orderBy clause is removed to avoid needing a composite index in Firestore.
        // Sorting will be done on the client side.
        const q = query(studentsCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const students = querySnapshot.docs.map(doc => {
            const data = doc.data() as StudentDocumentData;
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
        // Client-side sorting by last name.
        return students.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } catch (error) {
        console.error("Failed to load students from Firestore:", error);
        throw new FirestoreServiceError(error, 'students');
    }
};

/**
 * Saves a new student to Firestore for a specific user.
 * @param studentData The data for the new student.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedStudent with its Firestore ID and timestamp.
 */
export const saveStudent = async (
    studentData: Student,
    userId: string
): Promise<SavedStudent> => {
    try {
        // Create a copy to clean undefined values
        const dataToSave: { [key: string]: any } = { ...studentData };
        Object.keys(dataToSave).forEach(key => {
            if (dataToSave[key] === undefined) {
                delete dataToSave[key];
            }
        });

        const docRef = await addDoc(studentsCollection, {
            ...dataToSave,
            userId,
            createdAt: serverTimestamp(),
        });
        const now = new Date();
        return {
            ...studentData,
            id: docRef.id,
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Failed to save student to Firestore:", error);
        throw error;
    }
};

/**
 * Updates an existing student in Firestore.
 * @param studentId The ID of the student to update.
 * @param updates An object containing the fields to update.
 */
export const updateStudent = async (
    studentId: string,
    updates: Partial<Student>
): Promise<void> => {
    try {
        // Create a copy to clean undefined values
        const dataToUpdate: { [key: string]: any } = { ...updates };
        Object.keys(dataToUpdate).forEach(key => {
            if (dataToUpdate[key] === undefined) {
                delete dataToUpdate[key];
            }
        });

        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, dataToUpdate);
    } catch (error) {
        console.error("Failed to update student in Firestore:", error);
        throw error;
    }
};

/**
 * Deletes a student from Firestore.
 * @param studentId The ID of the student to delete.
 */
export const deleteStudent = async (studentId: string): Promise<void> => {
    try {
        const studentRef = doc(db, 'students', studentId);
        await deleteDoc(studentRef);
    } catch (error) {
        console.error("Failed to delete student from Firestore:", error);
        throw error;
    }
};

// --- STUDENT GROUPS ---

const groupsCollection = collection(db, 'student_groups');

/**
 * Loads all student groups for a specific user.
 * @param userId The ID of the logged-in user.
 * @returns A promise that resolves to an array of SavedStudentGroup objects.
 */
export const loadStudentGroups = async (userId: string): Promise<SavedStudentGroup[]> => {
    try {
        const q = query(groupsCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                studentIds: data.studentIds || [],
                curriculumIds: data.curriculumIds || [],
                userId: data.userId,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as SavedStudentGroup;
        });
    } catch (error) {
        console.error("Failed to load student groups:", error);
        throw new FirestoreServiceError(error, 'student_groups');
    }
};

/**
 * Saves a new student group.
 * @param groupData The data for the new group.
 * @param userId The ID of the logged-in user.
 * @returns The newly created SavedStudentGroup.
 */
export const saveStudentGroup = async (groupData: StudentGroup, userId: string): Promise<SavedStudentGroup> => {
    try {
        const params = {
            ...groupData,
            userId,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(groupsCollection, params);
        return {
            ...groupData,
            id: docRef.id,
            userId,
            createdAt: new Date().toISOString(),
        } as SavedStudentGroup;
    } catch (error) {
        console.error("Failed to save student group:", error);
        throw error;
    }
};

/**
 * Updates a student group.
 * @param groupId The ID of the group to update.
 * @param updates Partial data to update.
 */
export const updateStudentGroup = async (groupId: string, updates: Partial<StudentGroup>): Promise<void> => {
    try {
        const groupRef = doc(db, 'student_groups', groupId);
        await updateDoc(groupRef, updates);
    } catch (error) {
        console.error("Failed to update student group:", error);
        throw error;
    }
};

/**
 * Deletes a student group.
 * @param groupId The ID of the group to delete.
 */
export const deleteStudentGroup = async (groupId: string): Promise<void> => {
    try {
        const groupRef = doc(db, 'student_groups', groupId);
        await deleteDoc(groupRef);
    } catch (error) {
        console.error("Failed to delete student group:", error);
        throw error;
    }
};