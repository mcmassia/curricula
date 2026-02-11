
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DidacticUnitEditor } from '../../components/DidacticUnitEditor';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { saveDidacticUnit, updateDidacticUnit } from '../../services/didacticUnitService';
import { completeDidacticUnitSection, generateUnitBody } from '../../services/geminiService';
import { DidacticUnit, SavedDidacticUnit } from '../../types';

export const DidacticUnitEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { savedUnits, setSavedUnits, history } = useData();
    const { addToast } = useToast();

    const [unitData, setUnitData] = useState<SavedDidacticUnit | DidacticUnit | null>(null);

    useEffect(() => {
        if (id) {
            const found = savedUnits.find(u => u.id === id);
            if (found) {
                setUnitData(found);
            } else {
                addToast("Unidad no encontrada.", 'error');
                navigate('/units/repository');
            }
        } else {
            // New Unit
            const emptyUnit: DidacticUnit = {
                title: '', introduction: '',
                curricularConnection: { competencies: [], criteria: [], knowledge: [] },
                activitySequence: { start: [], development: [], closure: [] },
                methodology: '', groupings: '', diversity: '',
                resources: { materials: [], spaces: [], timing: '' },
                evaluation: { description: '', rubric: { title: '', criteria: [] } }
            };
            setUnitData(emptyUnit);
        }
    }, [id, savedUnits, navigate, addToast]);

    const handleSave = async (data: SavedDidacticUnit | DidacticUnit) => {
        if (!user) return;
        try {
            if ('id' in data && data.id) {
                // Update
                const { id, subject, course, region, createdAt, rubricId, detailedActivities, curriculumId, ...unitContent } = data as any;
                await updateDidacticUnit(id, { unit: unitContent });
                const updatedUnit: SavedDidacticUnit = {
                    id, subject, course, region,
                    unit: unitContent,
                    createdAt: createdAt || new Date().toISOString(),
                    rubricId, detailedActivities, curriculumId
                };
                setSavedUnits(prev => prev.map(u => u.id === id ? updatedUnit : u));
                addToast("Unidad didáctica actualizada.", 'success');
            } else {
                // Create
                const { subject, course, region, curriculumId, ...unit } = data as any;
                const saved = await saveDidacticUnit({
                    subject: subject || 'N/A',
                    course: course || 'N/A',
                    region: region || 'N/A',
                    unit,
                    curriculumId
                }, user.uid);
                setSavedUnits(prev => [saved, ...prev]);
                addToast("Unidad didáctica creada.", 'success');
            }
            navigate('/units/repository');
        } catch (error) {
            addToast("Error al guardar la unidad.", 'error', error);
        }
    };

    const handleAiCompleteSection = async (partialData: DidacticUnit | SavedDidacticUnit, section: string) => {
        const unitContent = 'unit' in partialData ? partialData.unit : partialData;
        return completeDidacticUnitSection(unitContent, section);
    };

    const handleAiGenerateBody = async (partialData: { title: string, introduction: string }) => {
        return generateUnitBody(partialData);
    };

    if (!unitData) return null; // Or Loader

    return (
        <DidacticUnitEditor
            unitData={unitData}
            onSave={handleSave}
            onCancel={() => navigate('/units/repository')}
            onAiCompleteSection={handleAiCompleteSection}
            onAiGenerateBody={handleAiGenerateBody}
            history={history}
        />
    );
};
