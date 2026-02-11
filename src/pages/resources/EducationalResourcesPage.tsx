
import React, { useState, useCallback } from 'react';
import { EducationalResourcesPanel } from '../../components/EducationalResourcesPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveEducationalResource, deleteEducationalResource } from '../../services/educationalResourceService';
import { SavedEducationalResource } from '../../types';
import { AddResourceModal } from '../../components/AddResourceModal';

export const EducationalResourcesPage: React.FC = () => {
    const { user } = useAuth();
    const { savedEducationalResources: resources, setSavedEducationalResources: setResources, history } = useData();
    const { addToast } = useToast();

    const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

    const handleAddResource = useCallback(async (name: string, url: string, description: string, curriculumId: string) => {
        if (!user) return;
        try {
            const curriculum = history.find(h => h.id === curriculumId);
            const curriculumSubject = curriculum ? `${curriculum.subject} - ${curriculum.course}` : "Desconocido";

            const newResource: Omit<SavedEducationalResource, 'id' | 'createdAt'> = {
                name, url, description, curriculumId, curriculumSubject
            };
            const savedResource = await saveEducationalResource(newResource, user.uid);
            setResources(prev => [savedResource, ...prev]);
            addToast("Recurso añadido.", 'success');
            setIsAddResourceModalOpen(false);
        } catch (error) {
            addToast("Error al guardar el recurso.", 'error', error);
        }
    }, [user, addToast, setResources]);

    const handleDeleteResource = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await deleteEducationalResource(id);
            setResources(prev => prev.filter(r => r.id !== id));
            addToast("Recurso eliminado.", 'success');
        } catch (error) {
            addToast("Error al eliminar el recurso.", 'error', error);
        }
    }, [user, addToast, setResources]);

    return (
        <>
            <EducationalResourcesPanel
                resources={resources}
                history={history}
                onDelete={handleDeleteResource}
                onAdd={() => setIsAddResourceModalOpen(true)}
                initialFilter=""
            />

            <AddResourceModal
                isOpen={isAddResourceModalOpen}
                onClose={() => setIsAddResourceModalOpen(false)}
                onSave={handleAddResource}
                history={history}
            />
        </>
    );
};
