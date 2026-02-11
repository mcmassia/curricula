import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SavedLearningSituation } from '../types';
import { TrashIcon, DocumentTextIcon, CheckIcon, FileJsonIcon, PencilIcon, PresentationIcon } from './icons';
import { RubricDisplay } from './RubricDisplay';
import { Loader } from './Loader';

interface SituationsRepositoryPanelProps {
    savedSituations: SavedLearningSituation[];
    onDelete: (situationId: string) => void;
    onGenerateAndLinkActivity: (situation: SavedLearningSituation, activityTitle: string) => void;
    onNavigateToActivity: (activityId: string, parent: { type: 'situation', id: string }) => void;
    generatingLinkedActivity: Set<string>;
    highlightedSituationId?: string | null;
    onEdit: (situation: SavedLearningSituation) => void;
    onCreate: () => void;
    initialFilter?: string;
    onGenerateExam: (situations: SavedLearningSituation[]) => void;
    onGeneratePresentation: (situation: SavedLearningSituation) => void;
}

const ActivityList: React.FC<{
    activities: string[],
    parentSituation: SavedLearningSituation,
    onGenerateAndLinkActivity: (sit: SavedLearningSituation, activityTitle: string) => void;
    onNavigateToActivity: (activityId: string, parent: { type: 'situation', id: string }) => void;
    generatingLinkedActivity: Set<string>;
}> = ({ activities, parentSituation, onGenerateAndLinkActivity, onNavigateToActivity, generatingLinkedActivity }) => (
    <ul className="text-gray-400 space-y-2 text-sm">
        {activities.map((activityTitle, i) => {
            const encodedActivityTitle = btoa(encodeURIComponent(activityTitle));
            const linkedActivityId = parentSituation.detailedActivities?.[encodedActivityTitle];
            const loadingKey = `${parentSituation.id}_${activityTitle}`;
            const isLoading = generatingLinkedActivity.has(loadingKey);
            return (
                <li key={i} className="flex items-center justify-between gap-2">
                    <span>- {activityTitle}</span>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400"><Loader /> Creando...</div>
                    ) : linkedActivityId ? (
                        <button onClick={() => onNavigateToActivity(linkedActivityId, { type: 'situation', id: parentSituation.id })} className="text-xs font-semibold bg-green-900/50 hover:bg-green-800/50 text-green-300 px-2 py-1 rounded-md transition-colors flex-shrink-0">
                            Ver Actividad
                        </button>
                    ) : (
                        <button onClick={() => onGenerateAndLinkActivity(parentSituation, activityTitle)} className="text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded-md transition-colors flex-shrink-0">
                            Crear Actividad
                        </button>
                    )}
                </li>
            );
        })}
    </ul>
);

const SituationDetails: React.FC<{
    situation: SavedLearningSituation;
    onCopyText: (sit: SavedLearningSituation) => void;
    onDownloadJson: (sit: SavedLearningSituation) => void;
    copiedTextId: string | null;
    onGenerateAndLinkActivity: (situation: SavedLearningSituation, activityTitle: string) => void;
    onNavigateToActivity: (activityId: string, parent: { type: 'situation', id: string }) => void;
    generatingLinkedActivity: Set<string>;
}> = ({ situation, onCopyText, onDownloadJson, copiedTextId, onGenerateAndLinkActivity, onNavigateToActivity, generatingLinkedActivity }) => {
    
    return (
        <div className="p-4 sm:p-6 space-y-6 text-sm border-t border-gray-800">
             <div className="flex items-center justify-end gap-2">
                <button onClick={() => onCopyText(situation)} className="flex items-center gap-2 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-1.5 px-3 rounded-md transition-colors">
                    {copiedTextId === situation.id ? <CheckIcon className="w-4 h-4 text-green-400" /> : <DocumentTextIcon className="w-4 h-4"/>}
                    {copiedTextId === situation.id ? '¡Copiado!' : 'Copiar Texto'}
                </button>
                 <button onClick={() => onDownloadJson(situation)} className="flex items-center gap-2 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-1.5 px-3 rounded-md transition-colors">
                    <FileJsonIcon className="w-4 h-4"/> Descargar JSON
                </button>
            </div>
             <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">1. Introducción y Justificación</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{situation.situation.introduction}</p>
                <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-2">
                    <div>
                        <h4 className="font-semibold text-gray-300">Contexto y Situación</h4>
                        <p className="text-gray-400">{situation.situation.context}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300">Reto y Producto Final</h4>
                        <p className="text-gray-400"><strong>Reto:</strong> {situation.situation.challenge}</p>
                        <p className="text-gray-400"><strong>Producto:</strong> {situation.situation.product}</p>
                    </div>
                </div>
            </section>
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">2. Conexión Curricular</h3>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Competencias Específicas</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(situation.situation.curricularConnection?.competencies || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Criterios de Evaluación</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(situation.situation.curricularConnection?.criteria || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Saberes Básicos</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(situation.situation.curricularConnection?.knowledge || []).map((k, i) => <li key={i}>{k}</li>)}</ul>
                    </div>
                </div>
            </section>
             <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">3. Secuencia de Actividades</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2 text-base">Fase de Inicio</h4>
                        <ActivityList activities={situation.situation.activitySequence?.start || []} parentSituation={situation} {...{ onGenerateAndLinkActivity, onNavigateToActivity, generatingLinkedActivity }} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2 text-base">Fase de Desarrollo</h4>
                        <ActivityList activities={situation.situation.activitySequence?.development || []} parentSituation={situation} {...{ onGenerateAndLinkActivity, onNavigateToActivity, generatingLinkedActivity }} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2 text-base">Fase de Cierre</h4>
                        <ActivityList activities={situation.situation.activitySequence?.closure || []} parentSituation={situation} {...{ onGenerateAndLinkActivity, onNavigateToActivity, generatingLinkedActivity }} />
                    </div>
                </div>
            </section>
             <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">8. Evaluación</h3>
                 <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Tipos, Técnicas y Herramientas</h4>
                    <p className="text-gray-400 whitespace-pre-wrap">{situation.situation.evaluation?.description}</p>
                </div>
                <div className="mt-4">
                    <h4 className="font-semibold text-gray-300 mb-2">Rúbrica de Evaluación Final</h4>
                    {situation.situation.evaluation?.rubric && <RubricDisplay rubric={situation.situation.evaluation.rubric} parentNames={new Set()} />}
                </div>
            </section>
        </div>
    );
};

export const SituationsRepositoryPanel: React.FC<SituationsRepositoryPanelProps> = ({ 
    savedSituations, 
    onDelete, 
    onGenerateAndLinkActivity, 
    onNavigateToActivity, 
    generatingLinkedActivity,
    highlightedSituationId,
    onEdit,
    onCreate,
    initialFilter,
    onGenerateExam,
    onGeneratePresentation
}) => {
    const [searchTerm, setSearchTerm] = useState(initialFilter || '');
    const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
    const [selectedSituationIds, setSelectedSituationIds] = useState<Set<string>>(new Set());
    const situationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (initialFilter) {
            setSearchTerm(initialFilter);
        }
    }, [initialFilter]);


    const filteredSituations = useMemo(() => {
        if (!searchTerm.trim()) {
            return savedSituations;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return savedSituations.filter(item =>
            item.situation.title.toLowerCase().includes(lowercasedFilter) ||
            item.subject.toLowerCase().includes(lowercasedFilter) ||
            item.course.toLowerCase().includes(lowercasedFilter) ||
            item.region.toLowerCase().includes(lowercasedFilter)
        );
    }, [savedSituations, searchTerm]);

    useEffect(() => {
        if (highlightedSituationId && situationRefs.current[highlightedSituationId]) {
            const element = situationRefs.current[highlightedSituationId];
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
    }, [highlightedSituationId, filteredSituations]);


    const handleCopyText = (sitToCopy: SavedLearningSituation) => {
        // ... text formatting logic ...
        navigator.clipboard.writeText("").then(() => {
            setCopiedTextId(sitToCopy.id);
            setTimeout(() => setCopiedTextId(null), 2000);
        });
    };

    const handleDownloadJson = (sitToDownload: SavedLearningSituation) => {
        const jsonString = JSON.stringify(sitToDownload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = sitToDownload.situation.title.replace(/[\s,.\-']/g, '_') || 'situacion_aprendizaje';
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSelectSituation = (situationId: string) => {
        setSelectedSituationIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(situationId)) {
                newSet.delete(situationId);
            } else {
                newSet.add(situationId);
            }
            return newSet;
        });
    };

    const handleGenerateExam = () => {
        if (selectedSituationIds.size > 0) {
            const selectedSituations = savedSituations.filter(s => selectedSituationIds.has(s.id));
            onGenerateExam(selectedSituations);
            setSelectedSituationIds(new Set());
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Repositorio de Situaciones de Aprendizaje</h1>
                <p className="mt-2 text-lg text-gray-400">Consulte, filtre y gestione todas sus situaciones guardadas.</p>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por título, materia, curso o comunidad..."
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-200"
                    />
                    <button 
                        onClick={handleGenerateExam}
                        disabled={selectedSituationIds.size === 0}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Generar Prueba ({selectedSituationIds.size})
                    </button>
                     <button 
                        onClick={onCreate}
                        className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Crear Nueva Situación
                    </button>
                </div>

                {filteredSituations.length > 0 ? (
                    <div className="space-y-4">
                        {filteredSituations.map(item => {
                             const activityCount = Object.keys(item.detailedActivities || {}).length;
                             return (
                            <div key={item.id} ref={el => { situationRefs.current[item.id] = el }} className="bg-gray-900 border border-gray-800 rounded-lg flex items-start gap-3 p-4 pr-2">
                                <input
                                    type="checkbox"
                                    checked={selectedSituationIds.has(item.id)}
                                    onChange={() => handleSelectSituation(item.id)}
                                    className="h-5 w-5 mt-1 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 flex-shrink-0"
                                />
                                <div className="flex-grow">
                                    <details className="group">
                                        <summary className="flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer gap-2">
                                            <div className="flex-1">
                                                <h2 className="font-semibold text-gray-100 text-lg">{item.situation.title}</h2>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm text-gray-400">{item.subject} &bull; {item.course} &bull; {item.region}</p>
                                                    {activityCount > 0 && 
                                                        <span className="text-xs font-medium text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full">{activityCount} Act. Creada{activityCount > 1 ? 's' : ''}</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                                <button onClick={(e) => { e.stopPropagation(); onGeneratePresentation(item); }} className="flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors bg-gray-700/50 hover:bg-gray-700 text-gray-300">
                                                    <PresentationIcon className="w-4 h-4"/> Crear Presentación
                                                </button>
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
                                        <SituationDetails 
                                            situation={item}
                                            onCopyText={handleCopyText}
                                            onDownloadJson={handleDownloadJson}
                                            copiedTextId={copiedTextId}
                                            onGenerateAndLinkActivity={onGenerateAndLinkActivity}
                                            onNavigateToActivity={onNavigateToActivity}
                                            generatingLinkedActivity={generatingLinkedActivity}
                                        />
                                    </details>
                                </div>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-lg">
                        <p className="text-gray-400">
                            {savedSituations.length === 0 ? "No tiene ninguna situación de aprendizaje guardada." : "No se encontraron situaciones con ese filtro."}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {savedSituations.length === 0 ? "Vaya al 'Generador' para crear y guardar su primera situación." : "Intente con otros términos de búsqueda."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};