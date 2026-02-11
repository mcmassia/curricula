
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassActivitiesRepositoryPanel } from '../../components/ClassActivitiesRepositoryPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { deleteClassActivity, updateClassActivity } from '../../services/classActivityService';
import { deleteRubricHistoryItem, saveRubricsHistory } from '../../services/rubricHistoryService';
import { generateRubric } from '../../services/geminiService';
import { deleteField } from '../../services/firebase';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { RubricDisplayModal } from '../../components/RubricDisplayModal';
import { SavedClassActivity, Rubric, RubricHistoryItem } from '../../types';

export const ClassActivitiesRepositoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { savedActivities, setSavedActivities, rubricsHistory, setRubricsHistory } = useData();
    const { addToast } = useToast();

    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
    const [rubricForModal, setRubricForModal] = useState<Rubric | null>(null);
    const [rubricSaveHandler, setRubricSaveHandler] = useState<(() => (rubric: Rubric) => Promise<void>) | null>(null);

    const handleDeleteActivity = useCallback((id: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Eliminación",
            message: "¿Está seguro de que desea eliminar esta actividad de clase?",
            onConfirm: async () => {
                try {
                    const activityToDelete = savedActivities.find(a => a.id === id);
                    await deleteClassActivity(id);
                    setSavedActivities(prev => prev.filter(a => a.id !== id));

                    if (activityToDelete?.rubricId && user) {
                        try {
                            await deleteRubricHistoryItem(activityToDelete.rubricId);
                            setRubricsHistory(prev => prev.filter(r => r.id !== activityToDelete.rubricId));
                        } catch (e) {
                            console.warn("Could not delete associated rubric", e);
                        }
                    }

                    addToast("Actividad eliminada.", 'success');
                } catch (error) {
                    addToast("Error al eliminar la actividad.", 'error', error);
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, [user, savedActivities, addToast, setSavedActivities, setRubricsHistory]);

    const handleGenerateRubricForActivity = useCallback(async (activityData: SavedClassActivity) => {
        setIsRubricModalOpen(true);
        setRubricForModal(null);
        try {
            // Generate rubric from criteria
            const items = (activityData.activity.criteria || []).map(c => ({ name: c, code: null }));
            const rubric = await generateRubric(items);
            setRubricForModal(rubric);

            setRubricSaveHandler(() => async (rubricToSave: Rubric) => {
                if (!user) return;
                const itemData: Partial<RubricHistoryItem> = {
                    subject: activityData.subject,
                    course: activityData.course,
                    region: activityData.region,
                    rubric: rubricToSave,
                    classActivityId: activityData.id,
                    classActivityTitle: activityData.activity.title,
                };
                const savedRubric = await saveRubricsHistory(itemData, user.uid);
                await updateClassActivity(activityData.id, { rubricId: savedRubric.id });

                setRubricsHistory(prev => [savedRubric, ...prev]);
                setSavedActivities(prev => prev.map(a => a.id === activityData.id ? { ...a, rubricId: savedRubric.id } : a));

                addToast("Rúbrica guardada y enlazada.", 'success');
                setIsRubricModalOpen(false);
            });
        } catch (error) {
            addToast("Error al generar la rúbrica.", 'error', error);
            setIsRubricModalOpen(false);
        }
    }, [user, addToast, setRubricsHistory, setSavedActivities]);

    const handleViewRubric = (activity: SavedClassActivity) => {
        const rubric = rubricsHistory.find(r => r.id === activity.rubricId);
        if (rubric) {
            setRubricForModal(rubric.rubric);
            setRubricSaveHandler(null);
            setIsRubricModalOpen(true);
        } else {
            addToast("Rúbrica no encontrada.", 'error');
        }
    };

    return (
        <>
            <ClassActivitiesRepositoryPanel
                savedActivities={savedActivities}
                onGenerateRubric={handleGenerateRubricForActivity}
                onDeleteActivity={handleDeleteActivity}
                onViewRubric={handleViewRubric}
                onEdit={(activity) => navigate(`/activities/editor/${activity.id}`)}
                onCreate={() => navigate('/activities/editor')}
                initialFilter=""
            />

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
            />

            <RubricDisplayModal
                isOpen={isRubricModalOpen}
                onClose={() => setIsRubricModalOpen(false)}
                rubric={rubricForModal}
                parentNames={new Set()}
                onSave={rubricSaveHandler ? rubricSaveHandler() : undefined}
            />
        </>
    );
};
