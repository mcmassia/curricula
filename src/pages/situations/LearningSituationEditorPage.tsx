
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LearningSituationEditor } from '../../components/LearningSituationEditor';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { saveLearningSituation, updateLearningSituation } from '../../services/learningSituationService';
import { completeLearningSituationSection } from '../../services/geminiService';
import { LearningSituation, SavedLearningSituation } from '../../types';

export const LearningSituationEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { savedSituations, setSavedSituations, history } = useData();
    const { addToast } = useToast();

    const [situationData, setSituationData] = useState<SavedLearningSituation | LearningSituation | null>(null);

    useEffect(() => {
        if (id) {
            const found = savedSituations.find(s => s.id === id);
            if (found) {
                setSituationData(found);
            } else {
                addToast("Situación no encontrada.", 'error');
                navigate('/situations/repository');
            }
        } else {
            // New Situation
            const emptySituation: LearningSituation = {
                title: '', introduction: '',
                context: '', challenge: '', product: '',
                curricularConnection: { competencies: [], criteria: [], knowledge: [] },
                activitySequence: { start: [], development: [], closure: [] },
                evaluation: { description: '', rubric: { title: '', criteria: [] } }
            };
            setSituationData(emptySituation);
        }
    }, [id, savedSituations, navigate, addToast]);

    const handleSave = async (data: SavedLearningSituation | LearningSituation) => {
        if (!user) return;
        try {
            if ('id' in data && data.id) {
                // Update
                const { id, subject, course, region, createdAt, rubricId, detailedActivities, curriculumId, ...situationContent } = data as any;
                await updateLearningSituation(id, { situation: situationContent });
                const updatedSituation: SavedLearningSituation = {
                    id, subject, course, region,
                    situation: situationContent,
                    createdAt: createdAt || new Date().toISOString(),
                    rubricId, detailedActivities, curriculumId
                };
                setSavedSituations(prev => prev.map(s => s.id === id ? updatedSituation : s));
                addToast("Situación actualizada.", 'success');
            } else {
                // Create
                const { subject, course, region, curriculumId, ...situation } = data as any;
                const saved = await saveLearningSituation({
                    subject: subject || 'N/A',
                    course: course || 'N/A',
                    region: region || 'N/A',
                    situation,
                    curriculumId
                }, user.uid);
                setSavedSituations(prev => [saved, ...prev]);
                addToast("Situación creada.", 'success');
            }
            navigate('/situations/repository');
        } catch (error) {
            addToast("Error al guardar la situación.", 'error', error);
        }
    };

    const handleAiCompleteSection = async (partialData: LearningSituation | SavedLearningSituation, section: string) => {
        const situationContent = 'situation' in partialData ? partialData.situation : partialData;
        return completeLearningSituationSection(situationContent, section);
    };

    if (!situationData) return null; // Or Loader

    return (
        <LearningSituationEditor
            situationData={situationData}
            onSave={handleSave}
            onCancel={() => navigate('/situations/repository')}
            onAiCompleteSection={handleAiCompleteSection}
            history={history}
        />
    );
};
