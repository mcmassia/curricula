import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SavedClassActivity, ExamCorrectionGuide, Rubric } from '../types';
import { TrashIcon, PencilIcon } from './icons';
import { RubricDisplay } from './RubricDisplay';

interface ClassActivitiesRepositoryPanelProps {
    savedActivities: SavedClassActivity[];
    onDelete: (activityId: string) => void;
    highlightedActivityId?: string | null;
    activityParent: { type: 'unit' | 'situation', id: string } | null;
    onNavigateBackToParent: () => void;
    onEdit: (activity: SavedClassActivity) => void;
    onCreate: () => void;
    initialFilter?: string;
}

const CorrectionGuideDisplay: React.FC<{ guide: ExamCorrectionGuide }> = ({ guide }) => (
    <div className="mt-4 space-y-4 prose prose-invert prose-sm max-w-none">
        <section>
            <h4>Respuestas de Opción Múltiple</h4>
            <ol>
                {guide.multipleChoiceAnswers.map((a, i) =>(
                    <li key={i}><strong>{a.question}:</strong> {a.answer}</li>
                ))}
            </ol>
        </section>
        <section>
            <h4>Pautas para Preguntas de Desarrollo</h4>
            <ol>
                {guide.shortAnswerGuidelines.map((g, i) =>(
                    <li key={i}>{g}</li>
                ))}
            </ol>
        </section>
        <section>
            <h4>Pautas para Supuesto Práctico</h4>
            <p>{guide.practicalCaseGuidelines}</p>
        </section>
    </div>
);

const RubricTable: React.FC<{ rubric: Rubric }> = ({ rubric }) => (
    <div className="overflow-x-auto mt-2 not-prose">
        <table className="w-full min-w-[600px] text-sm text-left text-gray-300 border-collapse">
            <thead className="bg-gray-800 text-xs text-gray-300 uppercase">
                <tr>
                    <th scope="col" className="px-4 py-3 border border-gray-700 w-1/4">{rubric.title}</th>
                    {rubric.criteria[0]?.levels?.map(level => (
                        <th key={level.levelName} scope="col" className="px-4 py-3 border border-gray-700">
                            {level.levelName} ({level.score})
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rubric.criteria.map((criterion, index) => (
                    <tr key={index} className="bg-gray-900 hover:bg-gray-800/50">
                        <td className="px-4 py-3 border border-gray-700 align-top font-semibold">{criterion.criterion}</td>
                        {criterion.levels?.map(level => (
                            <td key={level.levelName} className="px-4 py-3 border border-gray-700 align-top">
                                {level.description}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const renderMaterialWithLink = (material: string, index: number) => {
    if (typeof material === 'string' && (material.startsWith('http://') || material.startsWith('https://'))) {
        return (
            <li key={index}>
                <a href={material} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                    {material}
                </a>
            </li>
        );
    }
    return <li key={index}>{material}</li>;
};

const ActivityDetails: React.FC<{ activity: SavedClassActivity, activityParent: { type: 'unit' | 'situation', id: string } | null, onNavigateBackToParent: () => void }> = ({ activity, activityParent, onNavigateBackToParent }) => (
    <div className="p-4 border-t border-gray-800 space-y-4 text-sm">
        {activityParent && (
            <div className="flex justify-end">
                <button 
                    onClick={onNavigateBackToParent}
                    className="text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md transition-colors"
                >
                    &larr; Volver a la {activityParent.type === 'unit' ? 'Unidad Didáctica' : 'S. de Aprendizaje'}
                </button>
            </div>
        )}
        
        {activity.activity.isGradable ? (
             <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: activity.activity.description }} />
        ) : (
            activity.activity.description && <div><h3 className="font-semibold text-gray-300 mb-1">Descripción</h3><p className="text-gray-400">{activity.activity.description}</p></div>
        )}
        
        {!activity.activity.isGradable && (
            <>
                {activity.activity.competencies && activity.activity.competencies.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Competencias Específicas</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.activity.competencies.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
                {activity.activity.criteria && activity.activity.criteria.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Criterios de Evaluación</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.activity.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
                {activity.activity.knowledge && activity.activity.knowledge.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Saberes Básicos</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.activity.knowledge.map((k, i) => <li key={i}>{k}</li>)}</ul></div>}

                {activity.activity.objectives && activity.activity.objectives.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Objetivos</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.activity.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></div>}
                {activity.activity.duration && <div><h3 className="font-semibold text-gray-300 mb-1">Duración Estimada</h3><p className="text-gray-400">{activity.activity.duration}</p></div>}
                {activity.activity.materials && activity.activity.materials.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Materiales</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.activity.materials.map(renderMaterialWithLink)}</ul></div>}
                {activity.activity.steps && activity.activity.steps.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Pasos a Seguir</h3><ol className="list-decimal list-inside text-gray-400 space-y-1">{activity.activity.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
                {activity.activity.evaluationNotes && <div><h3 className="font-semibold text-gray-300 mb-1">Notas de Evaluación</h3><p className="text-gray-400">{activity.activity.evaluationNotes}</p></div>}
            </>
        )}
        
        {activity.activity.correctionGuide && (
             <details className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <summary className="font-bold text-lg text-gray-200 cursor-pointer">Guía de Corrección</summary>
                <CorrectionGuideDisplay guide={activity.activity.correctionGuide} />
            </details>
        )}

        {activity.activity.rubric && (
            <details className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700" open={activity.activity.isGradable}>
                <summary className="font-bold text-lg text-gray-200 cursor-pointer">Rúbrica de Calificación</summary>
                <RubricTable rubric={activity.activity.rubric} />
            </details>
        )}
    </div>
);


export const ClassActivitiesRepositoryPanel: React.FC<ClassActivitiesRepositoryPanelProps> = ({ savedActivities, onDelete, highlightedActivityId, activityParent, onNavigateBackToParent, onEdit, onCreate, initialFilter }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilter || '');
    const [showGradableOnly, setShowGradableOnly] = useState(false);
    const activityRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    useEffect(() => {
        if (initialFilter) {
            setSearchTerm(initialFilter);
        }
    }, [initialFilter]);

    const filteredActivities = useMemo(() => {
        let activities = savedActivities;

        if (showGradableOnly) {
            activities = activities.filter(item => item.activity.isGradable);
        }

        if (!searchTerm.trim()) {
            return activities;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        return activities.filter(item =>
            item.activity.title.toLowerCase().includes(lowercasedFilter) ||
            item.subject.toLowerCase().includes(lowercasedFilter) ||
            item.course.toLowerCase().includes(lowercasedFilter) ||
            item.region.toLowerCase().includes(lowercasedFilter)
        );
    }, [savedActivities, searchTerm, showGradableOnly]);

    useEffect(() => {
        if (highlightedActivityId && activityRefs.current[highlightedActivityId]) {
            const element = activityRefs.current[highlightedActivityId];
            setTimeout(() => {
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                const detailsElement = element?.querySelector('details');
                if (detailsElement && !detailsElement.open) {
                    detailsElement.open = true;
                }
    
                element?.classList.add('highlight-animation');
                setTimeout(() => {
                    element?.classList.remove('highlight-animation');
                }, 2000);
            }, 100);
        }
    }, [highlightedActivityId, filteredActivities]);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Repositorio de Actividades de Clase</h1>
                <p className="mt-2 text-lg text-gray-400">Consulte, filtre y gestione todas sus actividades guardadas.</p>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por título, materia, curso..."
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-200"
                    />
                     <label className="flex items-center space-x-2 text-sm text-gray-300 flex-shrink-0">
                        <input 
                            type="checkbox" 
                            checked={showGradableOnly} 
                            onChange={e => setShowGradableOnly(e.target.checked)} 
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                        />
                        <span>Mostrar solo calificables</span>
                    </label>
                    <button 
                        onClick={onCreate}
                        className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Crear Nueva Actividad
                    </button>
                </div>

                {filteredActivities.length > 0 ? (
                    <div className="space-y-4">
                        {filteredActivities.map(item => (
                            <div 
                                key={item.id}
                                className="bg-gray-900 border border-gray-800 rounded-lg"
                                ref={el => { activityRefs.current[item.id] = el }}
                            >
                                <details className="group">
                                    <summary className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 rounded-t-lg gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="font-semibold text-gray-100 text-lg">{item.activity.title}</h2>
                                                {item.activity.isGradable && (
                                                    <span className="text-xs font-medium text-yellow-300 bg-yellow-900/50 px-2 py-0.5 rounded-full">
                                                        Calificable
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">{item.subject} &bull; {item.course} &bull; {item.region}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                             <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors bg-gray-700/50 hover:bg-gray-700 text-gray-300">
                                                <PencilIcon className="w-4 h-4"/> Editar
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="flex items-center gap-2 text-xs bg-red-900/40 hover:bg-red-900/70 text-red-300 font-semibold py-1.5 px-3 rounded-md transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" /> Borrar
                                            </button>
                                        </div>
                                        <span className="transition-transform duration-200 transform group-open:rotate-90 text-gray-500 hidden sm:block">&#9656;</span>
                                    </summary>
                                    <ActivityDetails activity={item} activityParent={activityParent} onNavigateBackToParent={onNavigateBackToParent} />
                                </details>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-lg">
                        <p className="text-gray-400">
                            {savedActivities.length === 0 ? "No tiene ninguna actividad guardada." : "No se encontraron actividades con ese filtro."}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {savedActivities.length === 0 ? "Vaya al 'Generador' para crear y guardar su primera actividad." : "Intente con otros términos de búsqueda."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};