
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningSituationsPanel } from '../../components/LearningSituationsPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateLearningSituations } from '../../services/geminiService';
import { saveLearningSituation } from '../../services/learningSituationService';
import { LearningSituation, SavedLearningSituation, HistoryItem } from '../../types';
import { SaveSituationModal } from '../../components/SaveSituationModal';

export const LearningSituationsGeneratorPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { history, setSavedSituations } = useData();
    const { addToast } = useToast();

    const [generatedSituations, setGeneratedSituations] = useState<LearningSituation[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

    // Save Modal State
    const [situationToSave, setSituationToSave] = useState<LearningSituation | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [recentlySavedTitles, setRecentlySavedTitles] = useState<Set<string>>(new Set());

    const handleGenerate = useCallback(async (curriculumText: string) => {
        if (!curriculumText) return;
        setIsGenerating(true);
        setGeneratedSituations([]);
        setError(null);
        setRecentlySavedTitles(new Set());
        try {
            const situations = await generateLearningSituations(curriculumText);
            setGeneratedSituations(situations);
        } catch (error) {
            console.error("Error generating situations:", error);
            setError("No se pudieron generar las situaciones de aprendizaje. Intente de nuevo.");
            addToast("Error al generar situaciones.", 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [addToast]);

    const handleSaveRequest = useCallback((situation: LearningSituation) => {
        if (selectedHistoryItem) {
            handleSave(situation, selectedHistoryItem.subject, selectedHistoryItem.course, selectedHistoryItem.region, selectedHistoryItem.id);
        } else {
            setSituationToSave(situation);
            setIsSaveModalOpen(true);
        }
    }, [selectedHistoryItem]);

    const handleSave = useCallback(async (situation: LearningSituation, subject: string, course: string, region: string, curriculumId?: string) => {
        if (!user) {
            addToast("Debe iniciar sesión para guardar.", 'error');
            return;
        }
        try {
            const savedItem = await saveLearningSituation({
                subject, course, region, situation, curriculumId
            }, user.uid);

            setSavedSituations(prev => [savedItem, ...prev]);
            setRecentlySavedTitles(prev => new Set(prev).add(situation.title));
            addToast("Situación de aprendizaje guardada con éxito.", 'success');
        } catch (error) {
            addToast("Error al guardar la situación.", 'error', error);
            console.error("Error saving learning situation:", error);
        } finally {
            setIsSaveModalOpen(false);
            setSituationToSave(null);
        }
    }, [user, addToast, setSavedSituations]);

    const handleCreateActivity = (context: string, activityTitle: string) => {
        navigate('/activities/generator', { state: { context, activityTitle } });
    };

    return (
        <>
            <LearningSituationsPanel
                history={history}
                onSelectHistory={setSelectedHistoryItem}
                selectedHistoryItem={selectedHistoryItem}
                situations={generatedSituations}
                onGenerate={handleGenerate}
                isLoading={isGenerating}
                error={error}
                onSave={handleSaveRequest}
                onCreateActivity={handleCreateActivity}
                recentlySavedTitles={recentlySavedTitles}
            />

            <SaveSituationModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(subject, course, region) => {
                    if (situationToSave) {
                        handleSave(situationToSave, subject, course, region);
                    }
                }}
                initialData={{
                    subject: selectedHistoryItem?.subject || '',
                    course: selectedHistoryItem?.course || '',
                    region: selectedHistoryItem?.region || ''
                }}
                situationTitle={situationToSave?.title || ''}
            />
        </>
    );
};
