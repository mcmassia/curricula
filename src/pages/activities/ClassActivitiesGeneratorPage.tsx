
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ClassActivitiesPanel } from '../../components/ClassActivitiesPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateClassActivitiesFromCurriculum as generateClassActivities, generateDetailedActivity } from '../../services/geminiService';
import { saveClassActivity } from '../../services/classActivityService';
import { HistoryItem } from '../../services/historyService';
import { ClassActivity, SavedClassActivity } from '../../types';
import { SaveActivityModal } from '../../components/SaveActivityModal';

export const ClassActivitiesGeneratorPage: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { history, setSavedActivities } = useData();
    const { addToast } = useToast();

    const [generatedActivities, setGeneratedActivities] = useState<ClassActivity[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
    const [detailedActivity, setDetailedActivity] = useState<ClassActivity | null>(null);

    // Save Modal State
    const [activityToSave, setActivityToSave] = useState<ClassActivity | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [recentlySavedTitles, setRecentlySavedTitles] = useState<Set<string>>(new Set());

    // Auto-generate if navigated with state (e.g. from Units/Situations)
    useEffect(() => {
        if (location.state) {
            const { context, activityTitle, activityDescription } = location.state;
            if (context && activityTitle) {
                // Trigger detailed generation
                handleGenerateDetailed({
                    context,
                    activityTitle,
                    activityDescription
                });
            }
        }
    }, [location.state]);


    const handleGenerate = useCallback(async (curriculumText: string) => {
        if (!curriculumText) return;
        setIsGenerating(true);
        setGeneratedActivities([]);
        setDetailedActivity(null);
        setError(null);
        setRecentlySavedTitles(new Set());
        try {
            const activities = await generateClassActivities(curriculumText);
            setGeneratedActivities(activities);
        } catch (error) {
            console.error("Error generating activities:", error);
            setError("No se pudieron generar las actividades. Intente de nuevo.");
            addToast("Error al generar actividades.", 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [addToast]);

    const handleGenerateDetailed = useCallback(async (params: { context: string, activityTitle: string, activityDescription?: string }) => {
        setIsGenerating(true);
        setDetailedActivity(null);
        setError(null);
        try {
            const activity = await generateDetailedActivity(params.context, params.activityTitle, params.activityDescription);
            setDetailedActivity(activity);
            setGeneratedActivities([activity]); // Show it in the list or just detailed? 
            // ClassActivitiesPanel usually shows `activities` list. If detailed, `generatedActivities` should contain it.
        } catch (error) {
            console.error("Error generating detailed activity:", error);
            setError("No se pudo generar el detalle de la actividad.");
            addToast("Error al generar actividad detallada.", 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [addToast]);

    const handleSaveRequest = useCallback((activity: ClassActivity) => {
        // If we have history item selected, use its context.
        // If generated from detailed context (state), we might not have `selectedHistoryItem`.
        // We should try to infer context from location state or ask user.
        if (selectedHistoryItem) {
            handleSave(activity, selectedHistoryItem.subject, selectedHistoryItem.course, selectedHistoryItem.region, selectedHistoryItem.id);
        } else {
            setActivityToSave(activity);
            setIsSaveModalOpen(true);
        }
    }, [selectedHistoryItem]);

    const handleSave = useCallback(async (activity: ClassActivity, subject: string, course: string, region: string, curriculumId?: string) => {
        if (!user) {
            addToast("Debe iniciar sesión para guardar.", 'error');
            return;
        }
        try {
            const savedItem = await saveClassActivity({
                subject, course, region, activity, curriculumId
            }, user.uid);

            setSavedActivities(prev => [savedItem, ...prev]);
            setRecentlySavedTitles(prev => new Set(prev).add(activity.title));
            addToast("Actividad guardada con éxito.", 'success');
        } catch (error) {
            addToast("Error al guardar la actividad.", 'error', error);
            console.error("Error saving activity:", error);
        } finally {
            setIsSaveModalOpen(false);
            setActivityToSave(null);
        }
    }, [user, addToast, setSavedActivities]);

    return (
        <>
            <ClassActivitiesPanel
                history={history}
                onSelectHistory={setSelectedHistoryItem}
                selectedHistoryItem={selectedHistoryItem}
                activities={generatedActivities}
                onGenerate={handleGenerate}
                onGenerateDetailed={(context, title, desc) => handleGenerateDetailed({ context, activityTitle: title, activityDescription: desc })}
                isLoading={isGenerating}
                error={error}
                onSave={handleSaveRequest}
                recentlySavedTitles={recentlySavedTitles}
            />

            <SaveActivityModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(subject, course, region) => {
                    if (activityToSave) {
                        handleSave(activityToSave, subject, course, region);
                    }
                }}
                initialData={{
                    subject: selectedHistoryItem?.subject || '',
                    course: selectedHistoryItem?.course || '',
                    region: selectedHistoryItem?.region || ''
                }}
                activityTitle={activityToSave?.title || ''}
            />
        </>
    );
};
