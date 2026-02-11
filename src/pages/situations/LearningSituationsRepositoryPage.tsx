
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SituationsRepositoryPanel } from '../../components/SituationsRepositoryPanel';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { deleteLearningSituation, updateLearningSituation } from '../../services/learningSituationService';
import { deleteRubricHistoryItem, saveRubricsHistory } from '../../services/rubricHistoryService';
import { generateDetailedActivity, generateExam, generatePresentation, generateWorksheetMarkdown } from '../../services/geminiService';
import { generateRubric } from '../../services/geminiService';
import { saveClassActivity } from '../../services/classActivityService';
import { generatePdfFromMarkdown } from '../../services/pdfGeneratorService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { RubricDisplayModal } from '../../components/RubricDisplayModal';
import { ExamDisplayModal } from '../../components/ExamDisplayModal';
import { PresentationDisplayModal } from '../../components/PresentationDisplayModal';
import { WorksheetDisplayModal } from '../../components/WorksheetDisplayModal';
import { SavedLearningSituation, Rubric, LearningSituation, ExamData, Slide, ClassActivity, RubricHistoryItem, SavedDidacticUnit } from '../../types';

export const LearningSituationsRepositoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { savedSituations, setSavedSituations, rubricsHistory, setRubricsHistory, setSavedActivities } = useData();
    const { addToast } = useToast();

    // Modals State
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
    const [rubricForModal, setRubricForModal] = useState<Rubric | null>(null);
    const [rubricSaveHandler, setRubricSaveHandler] = useState<(() => (rubric: Rubric) => Promise<void>) | null>(null);

    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isGeneratingExam, setIsGeneratingExam] = useState(false);
    const [generatedExam, setGeneratedExam] = useState<ExamData | null>(null);
    const [examSourcePlans, setExamSourcePlans] = useState<SavedLearningSituation[]>([]);

    const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
    const [isGeneratingPresentation, setIsGeneratingPresentation] = useState(false);
    const [generatedPresentation, setGeneratedPresentation] = useState<Slide[] | null>(null);

    const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
    const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
    const [worksheetContent, setWorksheetContent] = useState<string | null>(null);
    const [worksheetSourceSituation, setWorksheetSourceSituation] = useState<SavedLearningSituation | null>(null);

    const [generatingLinkedActivity, setGeneratingLinkedActivity] = useState<Set<string>>(new Set());


    const handleDeleteSituation = useCallback((id: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Eliminación",
            message: "¿Está seguro de que desea eliminar esta situación de aprendizaje?",
            onConfirm: async () => {
                try {
                    const situationToDelete = savedSituations.find(s => s.id === id);
                    await deleteLearningSituation(id);
                    setSavedSituations(prev => prev.filter(s => s.id !== id));

                    if (situationToDelete?.rubricId && user) {
                        try {
                            await deleteRubricHistoryItem(situationToDelete.rubricId);
                            setRubricsHistory(prev => prev.filter(r => r.id !== situationToDelete.rubricId));
                        } catch (e) {
                            console.warn("Could not delete associated rubric", e);
                        }
                    }

                    addToast("Situación eliminada.", 'success');
                } catch (error) {
                    addToast("Error al eliminar la situación.", 'error', error);
                }
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, [user, savedSituations, addToast, setSavedSituations, setRubricsHistory]);

    const handleGenerateRubricForSituation = useCallback(async (situation: SavedLearningSituation) => {
        setIsRubricModalOpen(true);
        setRubricForModal(null);
        try {
            // Generate rubric from situation criteria
            const items = (situation.situation.curricularConnection?.criteria || []).map(c => ({ name: c, code: null }));
            const rubric = await generateRubric(items);
            setRubricForModal(rubric);

            setRubricSaveHandler(() => async (rubricToSave: Rubric) => {
                if (!user) return;
                const itemData: Partial<RubricHistoryItem> = {
                    subject: situation.subject,
                    course: situation.course,
                    region: situation.region,
                    rubric: rubricToSave,
                    situationId: situation.id,
                    situationTitle: situation.situation.title,
                };
                const savedRubric = await saveRubricsHistory(itemData, user.uid);
                await updateLearningSituation(situation.id, { rubricId: savedRubric.id });

                setRubricsHistory(prev => [savedRubric, ...prev]);
                setSavedSituations(prev => prev.map(s => s.id === situation.id ? { ...s, rubricId: savedRubric.id } : s));

                addToast("Rúbrica guardada y enlazada.", 'success');
                setIsRubricModalOpen(false);
            });
        } catch (error) {
            addToast("Error al generar la rúbrica.", 'error', error);
            setIsRubricModalOpen(false);
        }
    }, [user, addToast, setRubricsHistory, setSavedSituations]);

    const handleViewRubric = (situation: SavedLearningSituation) => {
        const rubric = rubricsHistory.find(r => r.id === situation.rubricId);
        if (rubric) {
            setRubricForModal(rubric.rubric);
            setRubricSaveHandler(null);
            setIsRubricModalOpen(true);
        } else {
            addToast("Rúbrica no encontrada.", 'error');
        }
    };

    const handleGenerateAndLinkActivity = useCallback(async (parent: SavedLearningSituation, activityTitle: string, activityDescription?: string) => {
        if (!user) return;
        const parentData = parent.situation;

        const context = `
            Situación de Aprendizaje: ${parentData.title}
             Contexto: ${parentData.context}
            Reto: ${parentData.challenge}
            Producto Final: ${parentData.product}
            Competencias: ${(parentData.curricularConnection?.competencies || []).join(', ')}
            Criterios: ${(parentData.curricularConnection?.criteria || []).join(', ')}
            Saberes: ${(parentData.curricularConnection?.knowledge || []).join(', ')}
        `;

        const loadingKey = `${parent.id}_${activityTitle}`;
        setGeneratingLinkedActivity(prev => new Set(prev).add(loadingKey));

        try {
            const activity = await generateDetailedActivity(context, activityTitle, activityDescription);
            const savedActivity = await saveClassActivity({
                subject: parent.subject,
                course: parent.course,
                region: parent.region,
                activity,
                curriculumId: parent.curriculumId,
            }, user.uid);

            setSavedActivities(prev => [savedActivity, ...prev]);

            const encodedActivityTitle = btoa(encodeURIComponent(activityTitle));
            const updatePayload = {
                [`detailedActivities.${encodedActivityTitle}`]: savedActivity.id
            };

            await updateLearningSituation(parent.id, updatePayload);
            setSavedSituations(prev => prev.map(u => u.id === parent.id ? { ...u, detailedActivities: { ...u.detailedActivities, [encodedActivityTitle]: savedActivity.id } } : u));

            addToast("Actividad detallada creada y enlazada.", 'success');
        } catch (error) {
            addToast("Error al generar y enlazadar la actividad.", 'error', error);
        } finally {
            setGeneratingLinkedActivity(prev => {
                const newSet = new Set(prev);
                newSet.delete(loadingKey);
                return newSet;
            });
        }
    }, [user, addToast, setSavedActivities, setSavedSituations]);

    const handleGenerateExamRequest = async (plans: SavedLearningSituation[]) => {
        if (plans.length === 0) return;
        setExamSourcePlans(plans);
        setIsGeneratingExam(true);
        setIsExamModalOpen(true);
        setGeneratedExam(null);
        try {
            // Exam generation currently expects DidacticUnits, but logic is same implicitly if we map props or if service supports it.
            // Service `generateExam` expects `SavedPlan[]`.
            // Check `geminiService.ts`: `export const generateExam = async (sourcePlans: (SavedDidacticUnit | SavedLearningSituation)[])`
            // So it should work!
            const exam = await generateExam(plans);
            setGeneratedExam(exam);
        } catch (error) {
            addToast("Error al generar la prueba.", 'error', error);
            setIsExamModalOpen(false);
        } finally {
            setIsGeneratingExam(false);
        }
    };

    const handleSaveExam = async () => {
        if (!user || !generatedExam || examSourcePlans.length === 0) return;
        const firstPlan = examSourcePlans[0];
        try {
            const examActivity: ClassActivity = {
                title: generatedExam.title,
                type: "Evaluación",
                description: generatedExam.instructions,
                objectives: ["Evaluar conocimientos adquiridos"],
                duration: "60 mins",
                materials: ["Examen impreso"],
                steps: [],
                evaluationNotes: "Ver guía de corrección",
                competencies: [],
                criteria: [],
                knowledge: []
            };

            const savedActivity = await saveClassActivity({
                subject: firstPlan.subject,
                course: firstPlan.course,
                region: firstPlan.region,
                activity: examActivity,
                curriculumId: firstPlan.curriculumId,
            }, user.uid);

            setSavedActivities(prev => [savedActivity, ...prev]);
            addToast("Prueba guardada en Actividades de Clase.", 'success');
            setIsExamModalOpen(false);
        } catch (e) {
            addToast("Error al guardar examen", 'error', e);
        }
    };

    const handleGeneratePresentationRequest = async (plan: SavedLearningSituation) => {
        setIsGeneratingPresentation(true);
        setIsPresentationModalOpen(true);
        setGeneratedPresentation(null);
        try {
            const slides = await generatePresentation(plan);
            setGeneratedPresentation(slides);
        } catch (e) {
            addToast("Error al generar presentación", 'error', e);
            setIsPresentationModalOpen(false);
        } finally {
            setIsGeneratingPresentation(false);
        }
    };

    const handleGenerateWorksheetRequest = async (situation: SavedLearningSituation) => {
        setWorksheetSourceSituation(situation);
        setIsWorksheetModalOpen(true);
        setIsGeneratingWorksheet(true);
        setWorksheetContent(null);
        try {
            const markdown = await generateWorksheetMarkdown(situation);
            setWorksheetContent(markdown);
        } catch (e) {
            addToast("Error al generar ficha", 'error', e);
            setIsWorksheetModalOpen(false);
        } finally {
            setIsGeneratingWorksheet(false);
        }
    };

    const handleRegenerateWorksheet = async () => {
        if (!worksheetSourceSituation) return;
        setIsGeneratingWorksheet(true);
        try {
            const markdown = await generateWorksheetMarkdown(worksheetSourceSituation);
            setWorksheetContent(markdown);
        } catch (e) {
            addToast("Error al regenerar ficha", 'error', e);
        } finally {
            setIsGeneratingWorksheet(false);
        }
    };

    const handleDownloadWorksheet = async () => {
        if (!worksheetContent || !worksheetSourceSituation) return;
        try {
            const fileName = `Ficha_${worksheetSourceSituation.situation.title.replace(/[\s,.\-']/g, '_')}`;
            await generatePdfFromMarkdown(worksheetContent, fileName);
            addToast("Ficha PDF descargada.", 'success');
        } catch (e) {
            addToast("Error al descargar PDF", 'error', e);
        }
    };

    return (
        <>
            <SituationsRepositoryPanel
                savedSituations={savedSituations}
                onGenerateRubric={handleGenerateRubricForSituation}
                onDeleteSituation={handleDeleteSituation}
                onViewRubric={handleViewRubric}
                onGenerateAndLinkActivity={// @ts-ignore
                    handleGenerateAndLinkActivity}
                onNavigateToActivity={(id) => navigate(`/activities/repository`)}
                generatingLinkedActivity={generatingLinkedActivity}
                onEdit={(situation) => navigate(`/situations/editor/${situation.id}`)}
                onCreate={() => navigate('/situations/editor')}
                initialFilter=""
                onGenerateExam={// @ts-ignore
                    handleGenerateExamRequest}
                onGeneratePresentation={// @ts-ignore
                    handleGeneratePresentationRequest}
                onGenerateWorksheet={handleGenerateWorksheetRequest}
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

            <ExamDisplayModal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                isLoading={isGeneratingExam}
                examContent={generatedExam}
                onSave={handleSaveExam}
            />
            <PresentationDisplayModal
                isOpen={isPresentationModalOpen}
                onClose={() => setIsPresentationModalOpen(false)}
                isLoading={isGeneratingPresentation}
                presentationData={generatedPresentation}
            />
            <WorksheetDisplayModal
                isOpen={isWorksheetModalOpen}
                onClose={() => setIsWorksheetModalOpen(false)}
                isLoading={isGeneratingWorksheet}
                content={worksheetContent}
                onRegenerate={handleRegenerateWorksheet}
                onDownload={handleDownloadWorksheet}
            />
        </>
    );
};
