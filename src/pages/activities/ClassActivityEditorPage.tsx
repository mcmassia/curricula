
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClassActivityEditor } from '../../components/ClassActivityEditor';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { saveClassActivity, updateClassActivity } from '../../services/classActivityService';
import { completeClassActivitySection } from '../../services/geminiService';
import { ClassActivity, SavedClassActivity } from '../../types';

export const ClassActivityEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { savedActivities, setSavedActivities } = useData();
    const { addToast } = useToast();

    const [activityData, setActivityData] = useState<SavedClassActivity | ClassActivity | null>(null);

    useEffect(() => {
        if (id) {
            const found = savedActivities.find(a => a.id === id);
            if (found) {
                setActivityData(found);
            } else {
                addToast("Actividad no encontrada.", 'error');
                navigate('/activities/repository');
            }
        } else {
            // New Activity
            const emptyActivity: ClassActivity = {
                title: '', type: '', description: '',
                objectives: [], duration: '', materials: [],
                steps: [], evaluationNotes: '',
                competencies: [], criteria: [], knowledge: [],
                rubric: { title: '', criteria: [] }
            };
            setActivityData(emptyActivity);
        }
    }, [id, savedActivities, navigate, addToast]);

    const handleSave = async (data: SavedClassActivity | ClassActivity) => {
        if (!user) return;
        try {
            if ('id' in data && data.id) {
                // Update
                const { id, subject, course, region, createdAt, rubricId, curriculumId, ...activityContent } = data as any;
                await updateClassActivity(id, { activity: activityContent });
                const updatedActivity: SavedClassActivity = {
                    id, subject, course, region,
                    activity: activityContent,
                    createdAt: createdAt || new Date().toISOString(),
                    rubricId, curriculumId
                };
                setSavedActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
                addToast("Actividad actualizada.", 'success');
            } else {
                // Create
                const { subject, course, region, curriculumId, ...activity } = data as any;
                const saved = await saveClassActivity({
                    subject: subject || 'N/A',
                    course: course || 'N/A',
                    region: region || 'N/A',
                    activity,
                    curriculumId
                }, user.uid);
                setSavedActivities(prev => [saved, ...prev]);
                addToast("Actividad creada.", 'success');
            }
            navigate('/activities/repository');
        } catch (error) {
            addToast("Error al guardar la actividad.", 'error', error);
        }
    };

    const handleAiCompleteSection = async (partialData: ClassActivity | SavedClassActivity, section: string) => {
        const activityContent = 'activity' in partialData ? partialData.activity : partialData;
        return completeClassActivitySection(activityContent, section);
    };

    if (!activityData) return null; // Or Loader

    return (
        <ClassActivityEditor
            activityData={activityData}
            onSave={handleSave}
            onCancel={() => navigate('/activities/repository')}
            onAiCompleteSection={handleAiCompleteSection}
        />
    );
};
