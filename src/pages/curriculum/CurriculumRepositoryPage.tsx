
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SqlRepositoryPanel } from '../../components/SqlRepositoryPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { deleteHistoryItem, HistoryItem } from '../../services/historyService';
import { saveEducationalResource } from '../../services/educationalResourceService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { ResourceSuggestModal } from '../../components/ResourceSuggestModal';
import { SaberWithResources } from '../../types';
import { suggestResourcesForSaberes } from '../../services/geminiService';
import { extractCurricularItemsFromSql } from '../../services/sqlParser';

export const CurriculumRepositoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { history, setHistory, savedEducationalResources, setSavedEducationalResources } = useData();
    const { addToast } = useToast();

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Resource Suggestion State
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [suggestedResources, setSuggestedResources] = useState<SaberWithResources[] | null>(null);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [resourceError, setResourceError] = useState<string | null>(null);
    const [curriculumForResources, setCurriculumForResources] = useState<HistoryItem | null>(null);

    const handleSelect = (item: HistoryItem) => {
        // Navigate to generator with the item ID or pass via state
        // For now, let's use state to avoid complex URL/loading logic in Generator if not needed yet
        // But plan was URL param. Let's stick to simple state passing for speed, or URL param if Generator supports it.
        // Generator is not yet implemented to read URL param. 
        // Let's use navigate with state.
        navigate('/sql/generator', { state: { historyItem: item } });
    };

    const handleDelete = (id: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Eliminación",
            message: "¿Está seguro de que desea eliminar este script SQL del historial? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                if (user) {
                    try {
                        await deleteHistoryItem(id);
                        setHistory(prev => prev.filter(item => item.id !== id));
                        addToast("Script eliminado del historial.", 'success');
                    } catch (error) {
                        console.error("Error deleting history item:", error);
                        addToast("Error al eliminar el script.", 'error');
                    }
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleSuggestResources = useCallback(async (item: HistoryItem) => {
        setIsResourceModalOpen(true);
        setIsLoadingResources(true);
        setResourceError(null);
        setSuggestedResources(null);
        setCurriculumForResources(item);
        try {
            const { knowledge } = extractCurricularItemsFromSql(item.sql);
            if (knowledge.length === 0) {
                throw new Error("No se encontraron 'saberes básicos' en este currículo para sugerir recursos.");
            }
            const resources = await suggestResourcesForSaberes(knowledge);
            setSuggestedResources(resources);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
            setResourceError(message);
        } finally {
            setIsLoadingResources(false);
        }
    }, []);

    const handleSaveResource = useCallback(async (resource: any) => {
        if (!user || !curriculumForResources) return;
        try {
            const resourceData = {
                name: resource.title,
                description: resource.description,
                url: resource.url,
                curriculumId: curriculumForResources.id,
                curriculumSubject: curriculumForResources.subject
            };
            const savedResource = await saveEducationalResource(resourceData, user.uid);
            setSavedEducationalResources(prev => [savedResource, ...prev]);
            addToast("Recurso guardado.", 'success');
        } catch (error) {
            addToast("Error al guardar el recurso.", 'error', error);
        }
    }, [user, curriculumForResources, addToast, setSavedEducationalResources]);


    return (
        <>
            <SqlRepositoryPanel
                history={history}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onSuggestResources={handleSuggestResources}
            />

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
            />

            <ResourceSuggestModal
                isOpen={isResourceModalOpen}
                onClose={() => setIsResourceModalOpen(false)}
                isLoading={isLoadingResources}
                error={resourceError}
                data={suggestedResources}
                onSave={handleSaveResource}
                savedResourceUrls={new Set(savedEducationalResources.map(r => r.url))}
            />
        </>
    );
};
