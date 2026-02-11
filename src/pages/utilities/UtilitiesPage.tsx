
import React, { useState, useCallback } from 'react';
import { UtilitiesPanel } from '../../components/UtilitiesPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { gradeAssignment } from '../../services/geminiService';
import { GradingResult, Rubric } from '../../types';
import { RubricDisplayModal } from '../../components/RubricDisplayModal';

export const UtilitiesPage: React.FC = () => {
    const { rubricsHistory } = useData();
    const { addToast } = useToast();

    const [isGrading, setIsGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
    const [gradingError, setGradingError] = useState<string | null>(null);

    const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
    const [rubricForModal, setRubricForModal] = useState<Rubric | null>(null);

    const handleGradeAssignment = useCallback(async (file: File, rubricId: string) => {
        setIsGrading(true);
        setGradingError(null);
        setGradingResult(null);

        const rubricItem = rubricsHistory.find(r => r.id === rubricId);
        if (!rubricItem) {
            setGradingError("No se encontró la rúbrica seleccionada.");
            setIsGrading(false);
            return;
        }

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                // Check if file type logic is needed here or in service.
                // Assuming service handles it or we pass specific structure.
                // App.tsx passed: { inlineData: { mimeType: file.type, data: base64Data } }
                const filePart = { inlineData: { mimeType: file.type, data: base64Data } };
                const result = await gradeAssignment(filePart, rubricItem.rubric);
                setGradingResult(result);
                setIsGrading(false);
            };
            reader.onerror = () => {
                setGradingError("No se pudo leer el archivo.");
                setIsGrading(false);
            };
        } catch (error) {
            console.error("Error grading assignment:", error);
            setGradingError("No se pudo evaluar el trabajo. Inténtelo de nuevo.");
            setIsGrading(false);
        }

    }, [rubricsHistory]);

    const handleViewRubric = (rubric: Rubric) => {
        setRubricForModal(rubric);
        setIsRubricModalOpen(true);
    };

    return (
        <>
            <UtilitiesPanel
                rubricsHistory={rubricsHistory}
                onGradeAssignment={handleGradeAssignment}
                isGrading={isGrading}
                gradingResult={gradingResult}
                gradingError={gradingError}
                onClearGrading={() => { setGradingResult(null); setGradingError(null); }}
                onViewRubric={handleViewRubric}
            />

            <RubricDisplayModal
                isOpen={isRubricModalOpen}
                onClose={() => setIsRubricModalOpen(false)}
                rubric={rubricForModal}
                parentNames={new Set()}
            />
        </>
    );
};
