
import React, { useState, useCallback } from 'react';
import { StudentsPanel } from '../../components/StudentsPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveStudent, deleteStudent, updateStudent, saveStudentGroup, updateStudentGroup, deleteStudentGroup } from '../../services/studentService';
import { Student, SavedStudent, SavedStudentGroup } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { ImportStudentsModal } from '../../components/ImportStudentsModal';
import { AssignCurriculaModal } from '../../components/AssignCurriculaModal';
import { StudentDetailModal } from '../../components/StudentDetailModal';

export const StudentsPage: React.FC = () => {
    const { user } = useAuth();
    const { savedStudents, setSavedStudents, savedGroups, setSavedGroups, history } = useData();
    const { addToast } = useToast();

    // Modals & Confirmation State
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Curricula Assignment
    const [isAssignCurriculaModalOpen, setIsAssignCurriculaModalOpen] = useState(false);
    const [groupForAssignment, setGroupForAssignment] = useState<SavedStudentGroup | null>(null);

    // Student Detail
    const [studentDetail, setStudentDetail] = useState<SavedStudent | null>(null);
    const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);


    // --- Student Handlers ---
    const handleSaveStudent = useCallback(async (student: Student) => {
        if (!user) return;
        try {
            const savedStudent = await saveStudent(student, user.uid);
            setSavedStudents(prev => [...prev, savedStudent].sort((a, b) => a.lastName.localeCompare(b.lastName)));
            addToast("Alumno guardado.", 'success');
        } catch (error) {
            addToast("Error al guardar el alumno.", 'error', error);
        }
    }, [user, addToast, setSavedStudents]);

    const handleDeleteStudent = useCallback(async (studentIds: string[]) => {
        if (!user) return;
        const confirmMessage = studentIds.length > 1
            ? `¿Está seguro de que desea eliminar a los ${studentIds.length} alumnos seleccionados? También se eliminarán de todos los grupos.`
            : "¿Está seguro de que desea eliminar a este alumno? También se eliminará de todos los grupos.";

        setConfirmation({
            isOpen: true,
            title: "Confirmar Eliminación",
            message: confirmMessage,
            onConfirm: async () => {
                try {
                    // Delete students
                    await Promise.all(studentIds.map(id => deleteStudent(id)));

                    // Remove from local state
                    setSavedStudents(prev => prev.filter(s => !studentIds.includes(s.id)));

                    // Remove from all groups (update local state primarily, backend handles cascade ideally or we do it here)
                    // Given Firestore structure usually requires manual update or array-remove.
                    // Let's assume we update groups locally and backend acts or we fire and forget.
                    const updatedGroups = savedGroups.map(group => {
                        const newStudentIds = group.studentIds.filter(id => !studentIds.includes(id));
                        if (newStudentIds.length !== group.studentIds.length) {
                            updateStudentGroup(group.id, { studentIds: newStudentIds }).catch(console.error);
                            return { ...group, studentIds: newStudentIds };
                        }
                        return group;
                    });
                    setSavedGroups(updatedGroups);

                    addToast(`${studentIds.length} alumno(s) eliminado(s).`, 'success');
                } catch (error) {
                    addToast("Error al eliminar alumno(s).", 'error', error);
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, [user, savedGroups, savedStudents, addToast, setSavedStudents, setSavedGroups]);

    const handleImportStudents = useCallback(async (students: Student[]) => {
        if (!user) return;
        let importedCount = 0;
        const errors = [];

        setIsImportModalOpen(false); // Close modal first
        const loadingToastId = addToast("Importando alumnos...", 'info');

        try {
            for (const student of students) {
                try {
                    const saved = await saveStudent(student, user.uid);
                    setSavedStudents(prev => [...prev, saved].sort((a, b) => a.lastName.localeCompare(b.lastName)));
                    importedCount++;
                } catch (e) {
                    console.error("Error saving student:", student.lastName, e);
                    errors.push(`${student.lastName}, ${student.firstName}`);
                }
            }

            if (importedCount > 0) {
                addToast(`Se importaron ${importedCount} alumnos correctamente.`, 'success');
            }
            if (errors.length > 0) {
                addToast(`Error al importar ${errors.length} alumnos.`, 'warning');
            }
        } catch (e) {
            addToast("Error general en la importación.", 'error', e);
        }
    }, [user, addToast, setSavedStudents]);


    // --- Group Handlers ---
    const handleSaveGroup = useCallback(async (name: string) => {
        if (!user) return;
        try {
            const savedGroup = await saveStudentGroup({ name, studentIds: [], curriculumIds: [] }, user.uid);
            setSavedGroups(prev => [...prev, savedGroup]);
            addToast("Grupo creado.", 'success');
        } catch (error) {
            addToast("Error al crear grupo.", 'error', error);
        }
    }, [user, addToast, setSavedGroups]);

    const handleUpdateGroup = useCallback(async (groupId: string, updates: Partial<SavedStudentGroup>) => {
        try {
            await updateStudentGroup(groupId, updates);
            setSavedGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
            addToast("Grupo actualizado.", 'success');
        } catch (error) {
            addToast("Error al actualizar grupo.", 'error', error);
        }
    }, [addToast, setSavedGroups]);

    const handleDeleteGroup = useCallback(async (groupId: string) => {
        setConfirmation({
            isOpen: true,
            title: "Eliminar Grupo",
            message: "¿Está seguro de que desea eliminar este grupo? Los alumnos no se eliminarán.",
            onConfirm: async () => {
                try {
                    await deleteStudentGroup(groupId);
                    setSavedGroups(prev => prev.filter(g => g.id !== groupId));
                    addToast("Grupo eliminado.", 'success');
                } catch (error) {
                    addToast("Error al eliminar grupo.", 'error', error);
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, [addToast, setSavedGroups]);

    // --- Curricula & Details ---
    const handleAssignCurricula = (group: SavedStudentGroup) => {
        setGroupForAssignment(group);
        setIsAssignCurriculaModalOpen(true);
    };

    const handleSaveCurriculaAssignment = async (curriculumIds: string[]) => {
        if (!groupForAssignment) return;
        try {
            await updateStudentGroup(groupForAssignment.id, { curriculumIds });
            setSavedGroups(prev => prev.map(g => g.id === groupForAssignment.id ? { ...g, curriculumIds } : g));
            addToast("Asignación de currículos actualizada.", 'success');
            setIsAssignCurriculaModalOpen(false);
        } catch (error) {
            addToast("Error al asignar currículos.", 'error', error);
        }
    };

    const handleViewStudent = (student: SavedStudent) => {
        setStudentDetail(student);
        setIsStudentDetailModalOpen(true);
    };

    const handleUpdateStudentDetail = async (studentData: SavedStudent) => {
        try {
            // Assuming updateStudent service exists and takes id and data
            const { id, ...updates } = studentData;
            await updateStudent(id, updates);
            setSavedStudents(prev => prev.map(s => s.id === id ? studentData : s));
            addToast("Datos del alumno actualizados.", 'success');
            setIsStudentDetailModalOpen(false);
        } catch (error) {
            addToast("Error al actualizar alumno.", 'error', error);
        }
    };

    return (
        <>
            <StudentsPanel
                students={savedStudents}
                groups={savedGroups}
                onSaveStudent={handleSaveStudent}
                onDeleteStudent={handleDeleteStudent}
                onImportStudents={() => setIsImportModalOpen(true)}
                onSaveGroup={handleSaveGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onAssignCurricula={handleAssignCurricula}
                onViewStudent={handleViewStudent}
                initialFilter=""
            />

            <ImportStudentsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportStudents}
            />

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
            />

            <AssignCurriculaModal
                isOpen={isAssignCurriculaModalOpen}
                onClose={() => setIsAssignCurriculaModalOpen(false)}
                groupName={groupForAssignment?.name || ''}
                history={history}
                selectedCurriculaIds={groupForAssignment?.curriculumIds || []}
                onSave={handleSaveCurriculaAssignment}
            />

            <StudentDetailModal
                isOpen={isStudentDetailModalOpen}
                onClose={() => setIsStudentDetailModalOpen(false)}
                student={studentDetail}
                onSave={handleUpdateStudentDetail}
                // @ts-ignore
                rubricsHistory={[]} // Assuming we can pass rubrics history if needed for grades, for now empty or useData()
            />
        </>
    );
};
