


import React, { useState, useMemo, useEffect } from 'react';
import { SavedEducationalResource } from '../types';
import { HistoryItem } from '../services/historyService';
import { TrashIcon, LinkIcon } from './icons';

interface EducationalResourcesPanelProps {
    resources: SavedEducationalResource[];
    history: HistoryItem[];
    onDelete: (resourceId: string) => void;
    onAdd: () => void;
    initialFilter?: string;
}

export const EducationalResourcesPanel: React.FC<EducationalResourcesPanelProps> = ({ resources, history, onDelete, onAdd, initialFilter }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilter || '');

    useEffect(() => {
        if (initialFilter) {
            setSearchTerm(initialFilter);
        }
    }, [initialFilter]);

    const resourcesByCurriculum = useMemo(() => {
        const grouped: { [key: string]: SavedEducationalResource[] } = {};
        resources.forEach(resource => {
            if (!grouped[resource.curriculumId]) {
                grouped[resource.curriculumId] = [];
            }
            grouped[resource.curriculumId].push(resource);
        });
        return grouped;
    }, [resources]);

    const filteredAndGroupedResources = useMemo(() => {
        if (!searchTerm.trim()) {
            return resourcesByCurriculum;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered: { [key: string]: SavedEducationalResource[] } = {};
        
        for (const curriculumId in resourcesByCurriculum) {
            const curriculum = history.find(h => h.id === curriculumId);
            const curriculumName = curriculum ? `${curriculum.subject} - ${curriculum.course}` : "Currículo Desconocido";

            const matchingResources = resourcesByCurriculum[curriculumId].filter(resource => 
                resource.name.toLowerCase().includes(lowercasedFilter) ||
                resource.description.toLowerCase().includes(lowercasedFilter) ||
                curriculumName.toLowerCase().includes(lowercasedFilter)
            );

            if (matchingResources.length > 0) {
                filtered[curriculumId] = matchingResources;
            }
        }
        return filtered;

    }, [resourcesByCurriculum, searchTerm, history]);


    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Repositorio de Recursos Educativos</h1>
                <p className="mt-2 text-lg text-gray-400">Guarde y organice sus recursos web por currículo.</p>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, descripción o currículo..."
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-200"
                    />
                     <button 
                        onClick={onAdd}
                        className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Añadir Nuevo Recurso
                    </button>
                </div>

                {Object.keys(filteredAndGroupedResources).length > 0 ? (
                    <div className="space-y-6">
                        {Object.keys(filteredAndGroupedResources).map(curriculumId => {
                             const resourcesList = filteredAndGroupedResources[curriculumId];
                             const curriculum = history.find(h => h.id === curriculumId);
                             const curriculumName = curriculum ? `${curriculum.subject} - ${curriculum.course}` : "Currículo Desconocido";
                            return (
                                <div key={curriculumId}>
                                    <h2 className="text-xl font-semibold text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">
                                        {curriculumName}
                                    </h2>
                                    <div className="space-y-3">
                                        {resourcesList.map(resource => (
                                            <div key={resource.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex justify-between items-start gap-4">
                                                <div className="flex-grow">
                                                     <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group inline-flex items-center gap-2 font-semibold text-gray-200 hover:text-white"
                                                    >
                                                        <LinkIcon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                                        {resource.name}
                                                    </a>
                                                     <p className="mt-1 text-sm text-gray-400 pl-6">{resource.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => onDelete(resource.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors flex-shrink-0"
                                                    title="Eliminar Recurso"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                     <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-lg">
                        <p className="text-gray-400">
                            {resources.length === 0 ? "No tiene ningún recurso guardado." : "No se encontraron recursos con ese filtro."}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {resources.length === 0 ? "Use el botón 'Añadir' o guarde sugerencias de la IA para empezar." : "Intente con otros términos de búsqueda."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
