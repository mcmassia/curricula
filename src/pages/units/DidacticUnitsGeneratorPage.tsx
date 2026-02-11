
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DidacticUnitsPanel } from '../../components/DidacticUnitsPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateDidacticUnits } from '../../services/geminiService';
import { saveDidacticUnit } from '../../services/didacticUnitService';
import { DidacticUnit, SavedDidacticUnit, HistoryItem } from '../../types';
import { SaveUnitModal } from '../../components/SaveUnitModal';

export const DidacticUnitsGeneratorPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { history, setSavedUnits } = useData();
    const { addToast } = useToast();

    const [generatedUnits, setGeneratedUnits] = useState<DidacticUnit[]>([]);
    const [isGeneratingUnits, setIsGeneratingUnits] = useState(false);
    const [unitsError, setUnitsError] = useState<string | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

    // Save Modal State
    const [unitToSave, setUnitToSave] = useState<DidacticUnit | null>(null);
    const [isSaveUnitModalOpen, setIsSaveUnitModalOpen] = useState(false);
    const [recentlySavedTitles, setRecentlySavedTitles] = useState<Set<string>>(new Set());

    const handleGenerateUnits = useCallback(async (curriculumText: string) => {
        if (!curriculumText) return;
        setIsGeneratingUnits(true);
        setGeneratedUnits([]);
        setUnitsError(null);
        setRecentlySavedTitles(new Set());
        try {
            const units = await generateDidacticUnits(curriculumText);
            setGeneratedUnits(units);
        } catch (error) {
            console.error("Error generating didactic units:", error);
            setUnitsError("No se pudieron generar las unidades didácticas. Intente de nuevo.");
            addToast("Error al generar unidades didácticas.", 'error');
        } finally {
            setIsGeneratingUnits(false);
        }
    }, [addToast]);

    const handleSaveUnitRequest = useCallback((unit: DidacticUnit) => {
        if (selectedHistoryItem) {
            handleSaveUnit(unit, selectedHistoryItem.subject, selectedHistoryItem.course, selectedHistoryItem.region, selectedHistoryItem.id);
        } else {
            setUnitToSave(unit);
            setIsSaveUnitModalOpen(true);
        }
    }, [selectedHistoryItem]);

    const handleSaveUnit = useCallback(async (unit: DidacticUnit, subject: string, course: string, region: string, curriculumId?: string) => {
        if (!user) {
            addToast("Debe iniciar sesión para guardar.", 'error');
            return;
        }
        try {
            const unitData: Omit<SavedDidacticUnit, 'id' | 'createdAt'> = { subject, course, region, unit, curriculumId };
            const savedUnit = await saveDidacticUnit(unitData, user.uid);
            setSavedUnits(prev => [savedUnit, ...prev]);
            setRecentlySavedTitles(prev => new Set(prev).add(unit.title));
            addToast("Unidad didáctica guardada con éxito.", 'success');
        } catch (error) {
            addToast("Error al guardar la unidad didáctica.", 'error', error);
            console.error("Error saving didactic unit:", error);
        } finally {
            setIsSaveUnitModalOpen(false);
            setUnitToSave(null);
        }
    }, [user, addToast, setSavedUnits]);

    const handleCreateActivity = (context: string, activityTitle: string) => {
        navigate('/activities/generator', { state: { context, activityTitle } });
    };

    return (
        <>
            <DidacticUnitsPanel
                history={history}
                onSelectHistory={setSelectedHistoryItem}
                selectedHistoryItem={selectedHistoryItem}
                units={generatedUnits}
                onGenerate={handleGenerateUnits}
                isLoading={isGeneratingUnits}
                error={unitsError}
                onSave={handleSaveUnitRequest}
                onCreateActivity={handleCreateActivity}
                recentlySavedTitles={recentlySavedTitles}
            />

            <SaveUnitModal
                isOpen={isSaveUnitModalOpen}
                onClose={() => setIsSaveUnitModalOpen(false)}
                onSave={(subject, course, region) => {
                    if (unitToSave) {
                        handleSaveUnit(unitToSave, subject, course, region);
                    }
                }}
                initialData={{
                    subject: selectedHistoryItem?.subject || '',
                    course: selectedHistoryItem?.course || '',
                    region: selectedHistoryItem?.region || ''
                }}
                unitTitle={unitToSave?.title || ''}
            />
        </>
    );
};
