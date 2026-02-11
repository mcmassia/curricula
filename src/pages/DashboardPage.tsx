
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomePanel } from '../components/WelcomePanel';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { updateGroup, deleteGroup } from '../services/groupService';
import { AssignCurriculaModal } from '../components/AssignCurriculaModal';
import { SavedStudentGroup, SearchResult } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        history, savedUnits, savedSituations, savedActivities,
        savedEducationalResources, rubricsHistory, savedStudents, savedGroups,
        setSavedGroups
    } = useData();
    const { addToast } = useToast();

    const [isAssignCurriculaModalOpen, setIsAssignCurriculaModalOpen] = useState(false);
    const [groupToAssign, setGroupToAssign] = useState<SavedStudentGroup | null>(null);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const handleUpdateGroup = async (groupId: string, updates: Partial<SavedStudentGroup>) => {
        try {
            await updateGroup(groupId, updates);
            setSavedGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
            addToast("Grupo actualizado.", 'success');
        } catch (error) {
            addToast("Error al actualizar el grupo.", 'error', error);
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Eliminación",
            message: "¿Está seguro de que desea eliminar este grupo? Los alumnos no serán eliminados.",
            onConfirm: async () => {
                try {
                    await deleteGroup(groupId);
                    setSavedGroups(prev => prev.filter(g => g.id !== groupId));
                    addToast("Grupo eliminado.", 'success');
                } catch (error) {
                    addToast("Error al eliminar el grupo.", 'error', error);
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleAssignCurricula = async (groupId: string, curriculumIds: string[]) => {
        try {
            await updateGroup(groupId, { curriculumIds });
            setSavedGroups(prev => prev.map(g => g.id === groupId ? { ...g, curriculumIds } : g));
            addToast("Currículos asignados al grupo.", 'success');
            setIsAssignCurriculaModalOpen(false);
        } catch (error) {
            addToast("Error al asignar los currículos.", 'error', error);
        }
    };

    const handleNavigate = (view: string, subView?: string) => {
        let path = `/${view}`;
        if (subView) path += `/${subView}`;
        navigate(path);
    };

    const handleGlobalSearchSelect = (result: SearchResult) => {
        handleNavigate(result.view, result.subView);
        // Note: We are not setting initial filter state here yet. 
        // Ideally we should pass it via state in navigate or context.
        // For now, simple navigation.
        // TODO: Implement search filter passing via URL query params or location state.
    };

    return (
        <>
            <WelcomePanel
                onNavigate={handleNavigate}
                onGlobalSearchSelect={handleGlobalSearchSelect}
                history={history}
                savedUnits={savedUnits}
                savedSituations={savedSituations}
                savedActivities={savedActivities}
                savedEducationalResources={savedEducationalResources}
                rubricsHistory={rubricsHistory}
                savedStudents={savedStudents}
                savedGroups={savedGroups}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onOpenAssignCurricula={(group) => { setGroupToAssign(group); setIsAssignCurriculaModalOpen(true); }}
            />

            <AssignCurriculaModal
                isOpen={isAssignCurriculaModalOpen}
                onClose={() => setIsAssignCurriculaModalOpen(false)}
                group={groupToAssign}
                allCurricula={history}
                onSave={handleAssignCurricula}
            />

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};
