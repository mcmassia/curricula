
import React, { useState } from 'react';
import { RubricsRepositoryPanel } from '../../components/RubricsRepositoryPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { deleteRubricHistoryItem } from '../../services/rubricHistoryService';
import { updateDidacticUnit } from '../../services/didacticUnitService';
import { deleteField } from '../../services/firebase';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { RubricDisplayModal } from '../../components/RubricDisplayModal';
import { Rubric } from '../../types';

export const RubricsRepositoryPage: React.FC = () => {
    const { user } = useAuth();
    const { rubricsHistory, setRubricsHistory, savedUnits, setSavedUnits } = useData();
    const { addToast } = useToast();

    const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
    const [rubricForModal, setRubricForModal] = useState<Rubric | null>(null);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const handleDelete = (id: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Eliminación",
            message: "¿Está seguro de que desea eliminar esta rúbrica del historial? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                if (user) {
                    try {
                        await deleteRubricHistoryItem(id);
                        setRubricsHistory(prev => prev.filter(item => item.id !== id));

                        // Also remove from linked unit if it exists
                        const unitToUpdate = savedUnits.find(u => u.rubricId === id);
                        if (unitToUpdate) {
                            await updateDidacticUnit(unitToUpdate.id, { rubricId: deleteField() });
                            setSavedUnits(prev => prev.map(u => u.id === unitToUpdate.id ? { ...u, rubricId: undefined } : u));
                        }

                        addToast("Rúbrica eliminada del historial.", 'success');
                    } catch (error) {
                        console.error("Error deleting rubric:", error);
                        addToast("Error al eliminar la rúbrica.", 'error');
                    }
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleView = (rubric: Rubric) => {
        setRubricForModal(rubric);
        setIsRubricModalOpen(true);
    };

    return (
        <>
            <RubricsRepositoryPanel
                rubricsHistory={rubricsHistory}
                onDelete={handleDelete}
                onView={handleView}
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
                // parentNames prop is optional or can be empty for repository view
                parentNames={new Set()}
            />
        </>
    );
};
