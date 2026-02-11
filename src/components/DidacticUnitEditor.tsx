import React, { useState } from 'react';
import { DidacticUnit, SavedDidacticUnit, RubricCriterion } from '../types';
import { SaveIcon, TrashIcon, WandSparklesIcon } from './icons';
import { Loader } from './Loader';
import { HistoryItem } from '../services/historyService';
import { CurriculumPickerModal } from './CurriculumPickerModal';

// A helper to create an empty unit structure
const createEmptyUnit = (): DidacticUnit => ({
    title: '',
    introduction: '',
    curricularConnection: { competencies: [], criteria: [], knowledge: [] },
    activitySequence: { start: [], development: [], closure: [] },
    methodology: '',
    groupings: '',
    diversity: '',
    resources: { materials: [], spaces: [], timing: '' },
    evaluation: {
        description: '',
        rubric: { title: '', criteria: [] }
    }
});

// The state is a flattened object, not a union of the original types.
type EditorUnitState = DidacticUnit & Partial<Omit<SavedDidacticUnit, 'unit'>>;


interface DidacticUnitEditorProps {
    unitData: DidacticUnit | SavedDidacticUnit | null;
    onSave: (unit: DidacticUnit | SavedDidacticUnit) => void;
    onCancel: () => void;
    onAiCompleteSection: (partialData: DidacticUnit | SavedDidacticUnit, section: string) => Promise<any>;
    onAiGenerateBody: (partialData: { title: string, introduction: string }) => Promise<any>;
    history: HistoryItem[];
}

const sanitizeActivitySequence = (seq: any): { start: string[], development: string[], closure: string[] } => {
    if (!seq) return { start: [], development: [], closure: [] };
    const sanitizeArray = (arr: any[]): string[] => {
        if (!Array.isArray(arr)) {
            // If it's not an array, but some other truthy value, wrap it in an array and try to process it
            if (arr) {
                return sanitizeArray([arr]);
            }
            return [];
        }
        return arr.map(item => {
            if (typeof item === 'object' && item !== null) {
                if (item.title && item.description) {
                    return `${item.title}: ${item.description}`;
                }
                // Fallback for other unexpected object structures
                return `[object Object]`; 
            }
            return String(item); // Ensure it's always a string
        });
    };

    return {
        start: sanitizeArray(seq.start),
        development: sanitizeArray(seq.development),
        closure: sanitizeArray(seq.closure),
    };
};


export const DidacticUnitEditor: React.FC<DidacticUnitEditorProps> = ({ unitData, onSave, onCancel, onAiCompleteSection, onAiGenerateBody, history }) => {
    const [unit, setUnit] = useState<EditorUnitState>(() => {
        if (!unitData) return createEmptyUnit();
        if ('unit' in unitData) {
            const { unit, ...rest } = unitData;
            return { ...unit, ...rest };
        }
        return unitData;
    });

    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isBodyGenerated, setIsBodyGenerated] = useState(false);


    const isNew = !('id' in (unitData || {}));
    const showFullEditor = !isNew || isBodyGenerated;


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        setUnit(prev => {
            const newUnit = { ...prev };
            let ref: any = newUnit;
            for (let i = 0; i < keys.length - 1; i++) {
                ref[keys[i]] = { ...ref[keys[i]] }; // Deep copy path
                ref = ref[keys[i]];
            }
            ref[keys[keys.length - 1]] = value;
            return newUnit;
        });
    };
    
    // --- Dynamic List Handlers (IMMUTABLE) ---
    const handleListChange = (sectionKey: string, index: number, value: string) => {
        const keys = sectionKey.split('.');
        setUnit(prev => {
            const newUnit = { ...prev };
            let ref: any = newUnit;
            for (let i = 0; i < keys.length - 1; i++) {
                ref[keys[i]] = { ...ref[keys[i]] };
                ref = ref[keys[i]];
            }
            const lastKey = keys[keys.length - 1];
            const newArray = [...(ref[lastKey] || [])];
            newArray[index] = value;
            ref[lastKey] = newArray;
            return newUnit;
        });
    };
    
    const handleAddItem = (sectionKey: string) => {
        const keys = sectionKey.split('.');
        setUnit(prev => {
            const newUnit = { ...prev };
            let ref: any = newUnit;
            for (let i = 0; i < keys.length - 1; i++) {
                ref[keys[i]] = { ...ref[keys[i]] };
                ref = ref[keys[i]];
            }
            const lastKey = keys[keys.length - 1];
            ref[lastKey] = [...(ref[lastKey] || []), ''];
            return newUnit;
        });
    };

    const handleRemoveItem = (sectionKey: string, index: number) => {
        const keys = sectionKey.split('.');
        setUnit(prev => {
            const newUnit = { ...prev };
            let ref: any = newUnit;
            for (let i = 0; i < keys.length - 1; i++) {
                ref[keys[i]] = { ...ref[keys[i]] };
                ref = ref[keys[i]];
            }
            const lastKey = keys[keys.length - 1];
            const newArray = [...(ref[lastKey] || [])];
            newArray.splice(index, 1);
            ref[lastKey] = newArray;
            return newUnit;
        });
    };
    
    // --- Rubric Handlers ---
    const handleRubricCriterionChange = (critIndex: number, value: string) => {
        setUnit(prev => {
            const newCriteria = [...prev.evaluation.rubric.criteria];
            newCriteria[critIndex] = { ...newCriteria[critIndex], criterion: value };
            return { ...prev, evaluation: { ...prev.evaluation, rubric: { ...prev.evaluation.rubric, criteria: newCriteria } } };
        });
    };

    const handleRubricLevelChange = (critIndex: number, levelIndex: number, field: 'description' | 'levelName' | 'score', value: string) => {
        setUnit(prev => {
            const newCriteria = [...prev.evaluation.rubric.criteria];
            const newLevels = [...newCriteria[critIndex].levels];
            newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
            newCriteria[critIndex] = { ...newCriteria[critIndex], levels: newLevels };
            return { ...prev, evaluation: { ...prev.evaluation, rubric: { ...prev.evaluation.rubric, criteria: newCriteria } } };
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
        setUnit(prev => ({
            ...prev,
            evaluation: {
                ...prev.evaluation,
                rubric: {
                    ...prev.evaluation.rubric,
                    criteria: [...prev.evaluation.rubric.criteria, newCriterion]
                }
            }
        }));
    };

    const handleRemoveRubricCriterion = (index: number) => {
        setUnit(prev => {
            const newCriteria = [...prev.evaluation.rubric.criteria];
            newCriteria.splice(index, 1);
            return { ...prev, evaluation: { ...prev.evaluation, rubric: { ...prev.evaluation.rubric, criteria: newCriteria } } };
        });
    };

    const handleAiComplete = async (section: string) => {
        setAiLoading(section);
        try {
            const completedSection = await onAiCompleteSection(unit, section);
            
            if (completedSection && completedSection.activitySequence) {
                const sanitizedSequence = sanitizeActivitySequence(completedSection.activitySequence);
                const sanitizedUpdate = { ...completedSection, activitySequence: sanitizedSequence };
                setUnit(prev => ({ ...prev, ...sanitizedUpdate }));
            } else {
                setUnit(prev => ({ ...prev, ...completedSection }));
            }
        } catch (error) {
            console.error(`Failed to complete section ${section}:`, error);
        } finally {
            setAiLoading(null);
        }
    };
    
    const handleGenerateBody = async () => {
        setAiLoading('body');
        try {
            const body = await onAiGenerateBody({ title: unit.title, introduction: unit.introduction });
            if (body.activitySequence) {
                body.activitySequence = sanitizeActivitySequence(body.activitySequence);
            }
            setUnit(prev => ({ ...prev, ...body }));
            setIsBodyGenerated(true);
        } catch (error) {
             console.error(`Failed to generate body:`, error);
        } finally {
            setAiLoading(null);
        }
    };

    const handleCurriculumItemsConfirm = (selectedItems: { competencies: string[], criteria: string[], knowledge: string[] }) => {
        setUnit(prev => ({
            ...prev,
            curricularConnection: {
                competencies: [...new Set([...prev.curricularConnection.competencies, ...selectedItems.competencies])],
                criteria: [...new Set([...prev.curricularConnection.criteria, ...selectedItems.criteria])],
                knowledge: [...new Set([...prev.curricularConnection.knowledge, ...selectedItems.knowledge])],
            }
        }));
    };

    // --- Generic Input and Textarea components for reuse ---
    const renderInput = (name: string, label: string, value: string) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <input type="text" name={name} value={value} onChange={handleChange} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
        </div>
    );

    const renderTextarea = (name: string, label: string, value: string, sectionKey: string) => (
         <div className="relative">
             <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
              <AiButton section={sectionKey} isLoading={aiLoading === sectionKey} onClick={() => handleAiComplete(sectionKey)} />
            <textarea name={name} value={value} onChange={handleChange} rows={5} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
        </div>
    );

    const renderDynamicList = (sectionKey: string, label: string, items: string[]) => (
        <div>
            <h4 className="font-semibold text-gray-300 mb-2">{label}</h4>
            <div className="space-y-2">
                {(items || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" value={String(item)} onChange={(e) => handleListChange(sectionKey, index, e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 text-sm" />
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
            <h1 className="text-3xl font-bold text-gray-100">{isNew ? "Crear Nueva Unidad Didáctica" : "Editar Unidad Didáctica"}</h1>
            
            <form onSubmit={(e) => { e.preventDefault(); onSave(unit); }} className="space-y-8">
                {isNew && (
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderInput('subject', 'Materia', unit.subject || '')}
                        {renderInput('course', 'Curso', unit.course || '')}
                        {renderInput('region', 'Comunidad Autónoma', unit.region || '')}
                    </div>
                )}
                
                {renderInput('title', 'Título de la Unidad', unit.title)}
                {renderTextarea('introduction', '1. Introducción y Justificación', unit.introduction, 'introduction')}

                {!showFullEditor && (
                     <button 
                        type="button" 
                        onClick={handleGenerateBody} 
                        disabled={aiLoading === 'body' || !unit.title || !unit.introduction}
                        className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-bold py-3 px-4 rounded-lg"
                    >
                        {aiLoading === 'body' ? <Loader /> : <WandSparklesIcon className="w-5 h-5" />}
                        Generar Resto del Contenido con IA
                    </button>
                )}

                {showFullEditor && (
                    <>
                        <div className="relative p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-4">
                            <h3 className="font-bold text-lg text-gray-200 mb-2">2. Conexión Curricular</h3>
                            <button type="button" onClick={() => setIsPickerOpen(true)} className="absolute top-2 right-24 flex items-center gap-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-1 px-2 rounded-md transition-colors">
                                Seleccionar del Currículo
                            </button>
                            <AiButton section="curricularConnection" isLoading={aiLoading === 'curricularConnection'} onClick={() => handleAiComplete('curricularConnection')} />
                            {renderDynamicList('curricularConnection.competencies', 'Competencias Específicas', unit.curricularConnection.competencies)}
                            {renderDynamicList('curricularConnection.criteria', 'Criterios de Evaluación', unit.curricularConnection.criteria)}
                            {renderDynamicList('curricularConnection.knowledge', 'Saberes Básicos', unit.curricularConnection.knowledge)}
                        </div>

                        <div className="relative p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-4">
                            <h3 className="font-bold text-lg text-gray-200 mb-2">3. Secuencia de Actividades</h3>
                            <AiButton section="activitySequence" isLoading={aiLoading === 'activitySequence'} onClick={() => handleAiComplete('activitySequence')} />
                            {renderDynamicList('activitySequence.start', 'Fase de Inicio', unit.activitySequence.start)}
                            {renderDynamicList('activitySequence.development', 'Fase de Desarrollo', unit.activitySequence.development)}
                            {renderDynamicList('activitySequence.closure', 'Fase de Cierre', unit.activitySequence.closure)}
                        </div>

                        {renderTextarea('methodology', '4. Metodología', unit.methodology, 'methodology')}
                        {renderTextarea('groupings', '5. Agrupamientos', unit.groupings, 'groupings')}
                        {renderTextarea('diversity', '6. Atención a la Diversidad', unit.diversity, 'diversity')}

                        <div className="relative p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-4">
                            <h3 className="font-bold text-lg text-gray-200 mb-2">7. Recursos</h3>
                            <AiButton section="resources" isLoading={aiLoading === 'resources'} onClick={() => handleAiComplete('resources')} />
                            {renderDynamicList('resources.materials', 'Recursos y Materiales', unit.resources.materials)}
                            {renderDynamicList('resources.spaces', 'Uso de Espacios', unit.resources.spaces)}
                            {renderInput('resources.timing', 'Distribución Temporal', unit.resources.timing)}
                        </div>

                        <div className="relative p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-4">
                            <h3 className="font-bold text-lg text-gray-200 mb-2">8. Evaluación</h3>
                            <AiButton section="evaluation" isLoading={aiLoading === 'evaluation'} onClick={() => handleAiComplete('evaluation')} />
                            {renderTextarea('evaluation.description', 'Tipos, Técnicas y Herramientas', unit.evaluation.description, 'evaluation.description')}
                            
                            <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Rúbrica de Evaluación Final</h4>
                                {renderInput('evaluation.rubric.title', 'Título de la Rúbrica', unit.evaluation.rubric.title)}
                                <div className="space-y-4 mt-4">
                                    {unit.evaluation.rubric.criteria.map((crit, i) => (
                                        <div key={i} className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <input type="text" value={crit.criterion} onChange={e => handleRubricCriterionChange(i, e.target.value)} placeholder="Nombre del Criterio" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200 font-semibold" />
                                                <button type="button" onClick={() => handleRemoveRubricCriterion(i)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-md"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                                                {crit.levels.map((level, j) => (
                                                    <div key={j}>
                                                        <label className="block font-medium text-gray-400 mb-1">{level.levelName} ({level.score})</label>
                                                        <textarea value={level.description} onChange={e => handleRubricLevelChange(i, j, 'description', e.target.value)} rows={3} className="w-full p-1 bg-gray-800 border border-gray-600 rounded-md text-gray-300"></textarea>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddRubricCriterion} className="text-sm text-gray-300 hover:text-white font-semibold">+ Añadir Criterio a Rúbrica</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">Cancelar</button>
                    <button type="submit" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md">
                        <SaveIcon className="w-5 h-5" /> Guardar Cambios
                    </button>
                </div>
            </form>

            <CurriculumPickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onConfirm={handleCurriculumItemsConfirm}
                history={history}
            />
        </div>
    );
};