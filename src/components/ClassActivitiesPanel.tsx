import React, { useState, useRef } from 'react';
import { ClassActivity } from '../types';
import { Loader } from './Loader';
import { GraduationCapIcon, SaveIcon, WandSparklesIcon, LinkIcon, UploadIcon } from './icons';
import { HistoryItem } from '../services/historyService';
import { RubricDisplay } from './RubricDisplay';

type ActivityInputTab = 'history' | 'text' | 'url' | 'file';

interface ClassActivitiesPanelProps {
    history: HistoryItem[];
    onSelectHistory: (item: HistoryItem) => void;
    selectedHistoryItem: HistoryItem | null;
    activities: ClassActivity[];
    onGenerate: (curriculumText: string) => void;
    onGenerateFromUrl: (url: string, subject: string, course: string) => void;
    onGenerateFromFile: (file: File, subject: string, course: string) => void;
    isLoading: boolean;
    error: string | null;
    onSave: (activity: ClassActivity, subject: string, course: string) => void;
    context: { context: string; activityTitle: string } | null;
    onClearContext: () => void;
}

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

const ActivityDetails: React.FC<{ activity: ClassActivity }> = ({ activity }) => (
    <div className="p-4 border-t border-gray-800 space-y-4 text-sm">
        {activity.description && <div><h3 className="font-semibold text-gray-300 mb-1">Descripción</h3><p className="text-gray-400">{activity.description}</p></div>}

        {activity.competencies && activity.competencies.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Competencias Específicas</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.competencies.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
        {activity.criteria && activity.criteria.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Criterios de Evaluación</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
        {activity.knowledge && activity.knowledge.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Saberes Básicos</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.knowledge.map((k, i) => <li key={i}>{k}</li>)}</ul></div>}

        {activity.objectives && activity.objectives.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Objetivos</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></div>}
        {activity.duration && <div><h3 className="font-semibold text-gray-300 mb-1">Duración Estimada</h3><p className="text-gray-400">{activity.duration}</p></div>}
        {activity.materials && activity.materials.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Materiales</h3><ul className="list-disc list-inside text-gray-400 space-y-1">{activity.materials.map(renderMaterialWithLink)}</ul></div>}
        {activity.steps && activity.steps.length > 0 && <div><h3 className="font-semibold text-gray-300 mb-2">Pasos a Seguir</h3><ol className="list-decimal list-inside text-gray-400 space-y-1">{activity.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
        {activity.evaluationNotes && <div><h3 className="font-semibold text-gray-300 mb-1">Notas de Evaluación</h3><p className="text-gray-400">{activity.evaluationNotes}</p></div>}
        {activity.rubric && <div><h3 className="font-semibold text-gray-300 mb-2">Rúbrica de Evaluación</h3><RubricDisplay rubric={activity.rubric} parentNames={new Set()} /></div>}
    </div>
);

export const ClassActivitiesPanel: React.FC<ClassActivitiesPanelProps> = ({
    history,
    onSelectHistory,
    selectedHistoryItem,
    activities,
    onGenerate,
    onGenerateFromUrl,
    onGenerateFromFile,
    isLoading,
    error,
    onSave,
    context,
    onClearContext,
}) => {
    const [activeTab, setActiveTab] = useState<ActivityInputTab>('history');
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [subject, setSubject] = useState('');
    const [course, setCourse] = useState('');


    const curriculumSourceText = activeTab === 'history' ? selectedHistoryItem?.sql || '' : textInput;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };
    
    const renderInputSelection = () => (
        <div className="space-y-4 max-w-3xl mx-auto">
             <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                Paso 1: Proporcione el contexto y la fuente
            </h2>
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg space-y-3">
                <p className="text-sm text-gray-400">
                    Proporcione la materia y el curso para dar contexto a la IA, especialmente al generar desde URL o documento.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Materia (ej: Francés)" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md" />
                    <input type="text" value={course} onChange={e => setCourse(e.target.value)} placeholder="Curso (ej: 1º ESO)" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md" />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <div className="p-2 flex space-x-2 border-b border-gray-700 flex-wrap">
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'history' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Currículo (Historial)</button>
                    <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'text' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Currículo (Texto)</button>
                    <button onClick={() => setActiveTab('url')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'url' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde URL</button>
                    <button onClick={() => setActiveTab('file')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'file' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}>Desde Documento</button>
                </div>
                <div className="p-4">
                    {activeTab === 'history' && (
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                            {history.length > 0 ? history.map(item => (
                                <button key={item.id} onClick={() => onSelectHistory(item)} className={`w-full text-left p-3 rounded-lg border bg-gray-900 hover:border-gray-600 transition-colors ${selectedHistoryItem?.id === item.id ? 'border-gray-500' : 'border-gray-800'}`}>
                                    <p className="font-semibold text-gray-100">{item.subject}</p>
                                    <p className="text-sm text-gray-400">{item.course} - {item.region}</p>
                                </button>
                            )) : <p className="text-gray-500 text-center p-4">No hay elementos en el historial.</p>}
                        </div>
                    )}
                    {activeTab === 'text' && (
                        <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Pegue aquí el texto del currículo..." className="w-full h-60 p-3 bg-gray-800 border border-gray-600 rounded-md" />
                    )}
                     {activeTab === 'url' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-400">Pegue el enlace a un recurso web (artículo, vídeo, etc.) para generar una actividad de clase basada en él.</p>
                            <input 
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://ejemplo.com/recurso-educativo" 
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md" 
                            />
                            <button onClick={() => onGenerateFromUrl(urlInput, subject, course)} disabled={isLoading || !urlInput.trim() || !subject.trim() || !course.trim()} className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-bold py-3 px-4 rounded-lg">
                                <LinkIcon className="w-5 h-5" /> Generar Actividad desde URL
                            </button>
                        </div>
                    )}
                    {activeTab === 'file' && (
                        <div className="space-y-3 flex flex-col items-center">
                            <p className="text-sm text-gray-400 text-center">Suba un documento (PDF, TXT) para que la IA diseñe una actividad basada en su contenido.</p>
                             <UploadIcon className="w-12 h-12 text-gray-600 mt-4" />
                            <input
                                type="file"
                                accept=".pdf,.txt,.md"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="font-semibold text-gray-300 hover:text-white underline transition-colors"
                            >
                                {selectedFile ? `Cambiar: ${selectedFile.name}` : "Seleccionar archivo"}
                            </button>
                            <button 
                                onClick={() => selectedFile && onGenerateFromFile(selectedFile, subject, course)}
                                disabled={isLoading || !selectedFile || !subject.trim() || !course.trim()}
                                className="w-full max-w-xs flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-bold py-3 px-4 rounded-lg"
                            >
                                <UploadIcon className="w-5 h-5" /> Generar Actividad desde Documento
                            </button>
                        </div>
                    )}
                </div>
            </div>
             {(activeTab === 'history' || activeTab === 'text') && (
                <button onClick={() => onGenerate(curriculumSourceText)} disabled={isLoading || !curriculumSourceText.trim()} className="w-full flex justify-center items-center gap-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 font-bold py-3 px-4 rounded-lg">
                    <WandSparklesIcon className="w-5 h-5" /> Generar Actividades desde Currículo
                </button>
             )}
        </div>
    );
    
    const renderActivities = () => (
         <div className="space-y-6">
            {context && (
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-400">Generando actividad detallada para:</p>
                            <h3 className="font-semibold text-gray-200">"{context.activityTitle}"</h3>
                        </div>
                        <button onClick={onClearContext} className="text-sm text-gray-400 hover:text-white underline">Limpiar</button>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg">
                        <details className="group" open={activities.length === 1}>
                             <summary className="flex items-center justify-between p-4 cursor-pointer text-lg font-semibold text-gray-100 hover:bg-gray-800/50 rounded-t-lg">
                                <h2>{activity.title} <span className="text-sm font-normal text-gray-500 ml-2">({activity.type})</span></h2>
                                <span className="transition-transform duration-200 transform group-open:rotate-90 text-gray-500">&#9656;</span>
                            </summary>
                            <ActivityDetails activity={activity} />
                             <div className="p-4 border-t border-gray-700/50 flex items-center justify-end">
                                <button 
                                    onClick={() => onSave(activity, subject, course)}
                                    className="flex items-center gap-2 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-1.5 px-3 rounded-md transition-colors"
                                >
                                    <SaveIcon className="w-4 h-4"/> Guardar en Repositorio
                                </button>
                            </div>
                        </details>
                    </div>
                ))}
            </div>
        </div>
    );


    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Generador de Actividades de Clase</h1>
                <p className="mt-2 text-lg text-gray-400">Cree actividades de aula a partir del currículo o desarrolle ideas en planes detallados.</p>
            </div>

             <div className="max-w-7xl mx-auto">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-8"><Loader /><p className="mt-4 text-gray-400">Generando...</p></div>
                )}
                {!isLoading && activities.length === 0 && !context && renderInputSelection()}
                {!isLoading && (activities.length > 0 || context) && renderActivities()}
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};