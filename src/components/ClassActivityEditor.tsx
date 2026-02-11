import React, { useState } from 'react';
import { ClassActivity, SavedClassActivity, RubricCriterion } from '../types';
import { SaveIcon, TrashIcon, WandSparklesIcon } from './icons';
import { Loader } from './Loader';

// A helper to create an empty activity structure
const createEmptyActivity = (): ClassActivity => ({
    title: '',
    type: '',
    description: '',
    objectives: [],
    duration: '',
    materials: [],
    steps: [],
    evaluationNotes: '',
    competencies: [],
    criteria: [],
    knowledge: [],
    rubric: { title: '', criteria: [] }
});

// The state is a flattened object.
type EditorActivityState = ClassActivity & Partial<Omit<SavedClassActivity, 'activity'>>;


interface ClassActivityEditorProps {
    activityData: ClassActivity | SavedClassActivity | null;
    onSave: (activity: ClassActivity | SavedClassActivity) => void;
    onCancel: () => void;
    onAiCompleteSection: (partialData: ClassActivity | SavedClassActivity, section: string) => Promise<any>;
}

export const ClassActivityEditor: React.FC<ClassActivityEditorProps> = ({ activityData, onSave, onCancel, onAiCompleteSection }) => {
    const [activity, setActivity] = useState<EditorActivityState>(() => {
        if (!activityData) return createEmptyActivity();
        if ('activity' in activityData) {
            const { activity, ...rest } = activityData;
            return { ...activity, ...rest };
        }
        return activityData;
    });

    const [aiLoading, setAiLoading] = useState<string | null>(null);

    const isNew = !('id' in (activityData || {}));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');

        setActivity(prev => {
            const newActivity = { ...prev };
            if (keys.length === 1) {
                return { ...newActivity, [name]: value };
            }
            
            // Handle nested properties like rubric.title
            let ref: any = newActivity;
            for (let i = 0; i < keys.length - 1; i++) {
                ref[keys[i]] = { ...ref[keys[i]] };
                ref = ref[keys[i]];
            }
            ref[keys[keys.length - 1]] = value;
            return newActivity;
        });
    };

    const handleAddItem = (section: keyof Pick<EditorActivityState, 'objectives' | 'materials' | 'steps' | 'competencies' | 'criteria' | 'knowledge'>) => {
        setActivity(prev => ({
            ...prev,
            [section]: [...(prev[section] as string[] || []), '']
        }));
    };

    const handleRemoveItem = (section: keyof Pick<EditorActivityState, 'objectives' | 'materials' | 'steps' | 'competencies' | 'criteria' | 'knowledge'>, index: number) => {
        setActivity(prev => {
            const currentArray = prev[section] as string[] || [];
            return {
                ...prev,
                [section]: currentArray.filter((_, i) => i !== index)
            };
        });
    };
    
    const handleListChange = (section: keyof Pick<EditorActivityState, 'objectives' | 'materials' | 'steps' | 'competencies' | 'criteria' | 'knowledge'>, index: number, value: string) => {
        setActivity(prev => {
            const currentArray = prev[section] as string[] || [];
            const newArray = [...currentArray];
            newArray[index] = value;
            return {
                ...prev,
                [section]: newArray
            };
        });
    };

    const handleRubricCriterionChange = (critIndex: number, value: string) => {
        setActivity(prev => {
            if (!prev.rubric) return prev;
            const newCriteria = [...prev.rubric.criteria];
            newCriteria[critIndex] = { ...newCriteria[critIndex], criterion: value };
            return { ...prev, rubric: { ...prev.rubric, criteria: newCriteria } };
        });
    };

     const handleAddRubricCriterion = () => {
        const newCriterion: RubricCriterion = {
            criterion: '',
            levels: [
                { levelName: "Insuficiente", description: "", score: "0-4" },
                { levelName: "Suficiente", description: "", score: "5" },
                { levelName: "Bien", description: "", score: "6" },
                { levelName: "Notable", description: "", score: "7-8" },
                { levelName: "Sobresaliente", description: "", score: "9-10" }
            ]
        };
        setActivity(prev => ({
            ...prev,
            rubric: prev.rubric ? {
                ...prev.rubric,
                criteria: [...prev.rubric.criteria, newCriterion]
            } : { title: `Rúbrica para ${prev.title}`, criteria: [newCriterion] }
        }));
    };

    const handleAiComplete = async (section: string) => {
        setAiLoading(section);
        try {
            const completedSection = await onAiCompleteSection(activity, section);
            setActivity(prev => ({ ...prev, ...completedSection }));
        } catch (error) {
            console.error(`Failed to complete section ${section}:`, error);
        } finally {
            setAiLoading(null);
        }
    };
    
     const renderInput = (name: string, label: string, value: string) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <input type="text" name={name} value={value || ''} onChange={handleChange} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
        </div>
    );
    
    const renderTextarea = (name: string, label: string, value: string, sectionKey: string) => (
         <div className="relative">
             <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
              <AiButton section={sectionKey} isLoading={aiLoading === sectionKey} onClick={() => handleAiComplete(sectionKey)} />
            <textarea name={name} value={value || ''} onChange={handleChange} rows={5} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
        </div>
    );

    const renderDynamicList = (sectionKey: keyof Pick<EditorActivityState, 'objectives' | 'materials' | 'steps' | 'competencies' | 'criteria' | 'knowledge'>, label: string, items: string[]) => (
        <div className="relative">
            <h4 className="font-semibold text-gray-300 mb-2">{label}</h4>
            <AiButton section={sectionKey} isLoading={aiLoading === sectionKey} onClick={() => handleAiComplete(sectionKey)} />
            <div className="space-y-2">
                {(items || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" value={item} onChange={(e) => handleListChange(sectionKey, index, e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 text-sm" />
                        <button type="button" onClick={() => handleRemoveItem(sectionKey, index)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-md"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddItem(sectionKey)} className="text-sm text-gray-300 hover:text-white font-semibold">+ Añadir</button>
            </div>
        </div>
    );
    
    const AiButton = ({ section, isLoading, onClick }: { section: string, isLoading: boolean, onClick: () => void }) => (
        <button type="button" onClick={onClick} disabled={isLoading} className="absolute top-0 right-0 flex items-center gap-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-1 px-2 rounded-md transition-colors">
            {isLoading ? <Loader /> : <WandSparklesIcon className="w-4 h-4" />} Completar con IA
        </button>
    );

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-100">{isNew ? "Crear Nueva Actividad de Clase" : "Editar Actividad de Clase"}</h1>
            
            <form onSubmit={(e) => { e.preventDefault(); onSave(activity); }} className="space-y-8">
                {isNew && (
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderInput('subject', 'Materia', activity.subject || '')}
                        {renderInput('course', 'Curso', activity.course || '')}
                        {renderInput('region', 'Comunidad Autónoma', activity.region || '')}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('title', 'Título', activity.title)}
                    {renderInput('type', 'Tipo de Actividad', activity.type)}
                </div>
                
                {renderTextarea('description', 'Descripción', activity.description, 'description')}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderDynamicList('objectives', 'Objetivos', activity.objectives || [])}
                    {renderDynamicList('materials', 'Materiales', activity.materials || [])}
                </div>
                
                {renderInput('duration', 'Duración', activity.duration || '')}

                {renderDynamicList('steps', 'Pasos a Seguir', activity.steps || [])}

                <div className="relative p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-4">
                     <h3 className="font-bold text-lg text-gray-200 mb-2">Conexión Curricular</h3>
                     <AiButton section="curricularConnection" isLoading={aiLoading === 'curricularConnection'} onClick={() => handleAiComplete('curricularConnection')} />
                     {renderDynamicList('competencies', 'Competencias Específicas', activity.competencies)}
                     {renderDynamicList('criteria', 'Criterios de Evaluación', activity.criteria)}
                     {renderDynamicList('knowledge', 'Saberes Básicos', activity.knowledge)}
                </div>
                
                {renderTextarea('evaluationNotes', 'Notas de Evaluación', activity.evaluationNotes || '', 'evaluationNotes')}

                {activity.rubric && (
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-4">
                        <h3 className="font-bold text-lg text-gray-200 mb-2">Rúbrica</h3>
                        {renderInput('rubric.title', 'Título de la Rúbrica', activity.rubric.title)}
                        {activity.rubric.criteria.map((crit, i) => (
                            <div key={i} className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                                <input type="text" value={crit.criterion} onChange={e => handleRubricCriterionChange(i, e.target.value)} placeholder="Nombre del Criterio" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 font-semibold" />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddRubricCriterion} className="text-sm text-gray-300 hover:text-white font-semibold">+ Añadir Criterio a Rúbrica</button>
                    </div>
                )}
                 {!activity.rubric && <button type="button" onClick={handleAddRubricCriterion}>Añadir Rúbrica</button>}


                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">Cancelar</button>
                    <button type="submit" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md">
                        <SaveIcon className="w-5 h-5" /> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};