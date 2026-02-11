

import React, { useState } from 'react';
import { DidacticUnit } from '../types';
import { Loader } from './Loader';
import { BookOpenIcon, GraduationCapIcon, SaveIcon, WandSparklesIcon, CheckIcon } from './icons';
import { HistoryItem } from '../services/historyService';
import { RubricDisplay } from './RubricDisplay';

type UnitInputTab = 'history' | 'text';

interface DidacticUnitsPanelProps {
    history: HistoryItem[];
    onSelectHistory: (item: HistoryItem) => void;
    selectedHistoryItem: HistoryItem | null;
    units: DidacticUnit[];
    onGenerate: (curriculumText: string) => void;
    isLoading: boolean;
    error: string | null;
    onSave: (unit: DidacticUnit) => void;
    onCreateActivity: (context: string, activityTitle: string) => void;
    recentlySavedTitles: Set<string>;
}

const ActivityList: React.FC<{
    activities: string[],
    onActivityClick: (title: string) => void
}> = ({ activities, onActivityClick }) => (
    <ul className="text-gray-400 space-y-2 text-sm">
        {(activities || []).map((activity, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
                <span>- {activity}</span>
                <button
                    onClick={() => onActivityClick(activity)}
                    className="text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded-md transition-colors flex-shrink-0"
                >
                    Crear Actividad
                </button>
            </li>
        ))}
    </ul>
);

const UnitDetails: React.FC<{
    unit: DidacticUnit;
    onCreateActivity: (context: string, activityTitle: string) => void;
}> = ({ unit, onCreateActivity }) => {

    const handleCreateActivityClick = (activityTitle: string) => {
        const context = `
            Unidad Didáctica: ${unit.title}
            Competencias: ${(unit.curricularConnection?.competencies || []).join(', ')}
            Criterios: ${(unit.curricularConnection?.criteria || []).join(', ')}
            Saberes: ${(unit.curricularConnection?.knowledge || []).join(', ')}
        `;
        onCreateActivity(context, activityTitle);
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 text-sm border-t border-gray-800">
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">1. Introducción y Justificación</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{unit.introduction}</p>
            </section>
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">2. Conexión Curricular</h3>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Competencias Específicas</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(unit.curricularConnection?.competencies || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Criterios de Evaluación</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(unit.curricularConnection?.criteria || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Saberes Básicos</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(unit.curricularConnection?.knowledge || []).map((k, i) => <li key={i}>{k}</li>)}</ul>
                    </div>
                </div>
            </section>
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">3. Secuencia de Actividades</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2 text-base">Fase de Inicio</h4>
                        <ActivityList activities={unit.activitySequence?.start || []} onActivityClick={handleCreateActivityClick} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2 text-base">Fase de Desarrollo</h4>
                        <ActivityList activities={unit.activitySequence?.development || []} onActivityClick={handleCreateActivityClick} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2 text-base">Fase de Cierre</h4>
                        <ActivityList activities={unit.activitySequence?.closure || []} onActivityClick={handleCreateActivityClick} />
                    </div>
                </div>
            </section>
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">4. Metodología y Modelos de Enseñanza</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{unit.methodology}</p>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h3 className="font-bold text-lg text-gray-200 mb-2">5. Agrupamientos</h3>
                    <p className="text-gray-400 whitespace-pre-wrap">{unit.groupings}</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-200 mb-2">6. Atención a la Diversidad e Inclusión</h3>
                    <p className="text-gray-400 whitespace-pre-wrap">{unit.diversity}</p>
                </div>
            </section>
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">7. Recursos</h3>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Recursos y Materiales</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(unit.resources?.materials || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Uso de Espacios</h4>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">{(unit.resources?.spaces || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Distribución Temporal</h4>
                        <p className="text-gray-400">{unit.resources?.timing}</p>
                    </div>
                </div>
            </section>
            <section>
                <h3 className="font-bold text-lg text-gray-200 mb-2">8. Evaluación</h3>
                <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Tipos, Técnicas y Herramientas</h4>
                    <p className="text-gray-400 whitespace-pre-wrap">{unit.evaluation?.description}</p>
                </div>
                 <div className="mt-4">
                    <h4 className="font-semibold text-gray-300 mb-2">Rúbrica de Evaluación Final</h4>
                    {unit.evaluation?.rubric && <RubricDisplay rubric={unit.evaluation.rubric} parentNames={new Set()} />}
                </div>
            </section>
        </div>
    );
};

export const DidacticUnitsPanel: React.FC<DidacticUnitsPanelProps> = ({
    history,
    onSelectHistory,
    selectedHistoryItem,
    units,
    onGenerate,
    isLoading,
    error,
    onSave,
    onCreateActivity,
    recentlySavedTitles,
}) => {
    const [activeTab, setActiveTab] = useState<UnitInputTab>('history');
    const [textInput, setTextInput] = useState('');
    
    const curriculumSourceText = activeTab === 'history' ? selectedHistoryItem?.sql || '' : textInput;
    
    const renderInputSelection = () => (
        <div className="space-y-4 max-w-3xl mx-auto">
             <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                <GraduationCapIcon className="w-6 h-6" />
                Paso 1: Proporcione el currículo
            </h2>
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <div className="p-2 flex space-x-2 border-b border-gray-700">
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'history' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Historial</button>
                    <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'text' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Texto</button>
                </div>
                <div className="p-4">
                    {activeTab === 'history' && (
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                            {history.length > 0 ? history.map(item => (
                                <button key={item.id} onClick={() => onSelectHistory(item)} className={`w-full text-left p-3 rounded-lg border bg-gray-900 hover:border-gray-600 transition-colors ${selectedHistoryItem?.id === item.id ? 'border-gray-500' : 'border-gray-800'}`}>
                                    <p className="font-semibold text-gray-100">{item.subject}</p>
                                    <p className="text-sm text-gray-400">{item.course} - {item.region}</p>
                                </button>
                            )) : <p className="text-gray-500 text-center p-4">No hay elementos en el historial. Genere un script SQL primero.</p>}
                        </div>
                    )}
                    {activeTab === 'text' && (
                        <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Pegue aquí el texto del currículo..." className="w-full h-60 p-3 bg-gray-800 border border-gray-600 rounded-md" />
                    )}
                </div>
            </div>
             <button onClick={() => onGenerate(curriculumSourceText)} disabled={isLoading || !curriculumSourceText.trim()} className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-bold py-3 px-4 rounded-lg">
                <WandSparklesIcon className="w-5 h-5" /> Generar Unidades Didácticas
            </button>
        </div>
    );

    const renderUnits = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-100">Unidades Generadas</h2>
                <button onClick={() => onGenerate(curriculumSourceText)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 font-semibold py-2 px-3 rounded-md transition-colors">
                    <WandSparklesIcon className="w-4 h-4" /> Generar de Nuevo
                </button>
            </div>
            <div className="space-y-4">
                {units.map((unit, index) => {
                    const isSaved = recentlySavedTitles.has(unit.title);
                    return (
                    <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg">
                        <details className="group">
                             <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 rounded-t-lg">
                                <h3 className="font-semibold text-lg text-gray-100">{unit.title}</h3>
                                <div className="flex items-center gap-2">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); if (!isSaved) onSave(unit); }} 
                                        disabled={isSaved}
                                        className={`flex items-center gap-2 text-sm font-semibold py-1.5 px-3 rounded-md transition-colors ${
                                            isSaved 
                                            ? 'bg-green-800/50 text-green-300 cursor-not-allowed'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                        }`}
                                    >
                                        {isSaved ? <CheckIcon className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
                                        {isSaved ? 'Guardada' : 'Guardar'}
                                    </button>
                                    <span className="transition-transform duration-200 transform group-open:rotate-90 text-gray-500">&#9656;</span>
                                </div>
                            </summary>
                            <UnitDetails unit={unit} onCreateActivity={onCreateActivity} />
                        </details>
                    </div>
                )})}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Generador de Unidades Didácticas</h1>
                <p className="mt-2 text-lg text-gray-400">Diseñe programaciones completas a partir de su currículo con ayuda de la IA.</p>
            </div>
            <div className="max-w-7xl mx-auto">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8"><Loader /><p className="mt-4 text-gray-400">Generando 10 unidades didácticas...</p></div>
                )}
                {!isLoading && units.length === 0 && renderInputSelection()}
                {!isLoading && units.length > 0 && renderUnits()}
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};
