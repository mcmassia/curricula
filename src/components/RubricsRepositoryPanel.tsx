

import React, { useState, useMemo, useEffect } from 'react';
import { Rubric, RubricHistoryItem } from '../types';
import { RubricDisplay } from './RubricDisplay';
import { TrashIcon } from './icons';

interface RubricsRepositoryPanelProps {
    rubricsHistory: RubricHistoryItem[];
    onDelete: (rubricId: string) => void;
    onView: (rubric: Rubric) => void;
    initialFilter?: string;
}

export const RubricsRepositoryPanel: React.FC<RubricsRepositoryPanelProps> = ({ rubricsHistory, onDelete, onView, initialFilter }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilter || '');
    
    useEffect(() => {
        if (initialFilter) {
            setSearchTerm(initialFilter);
        }
    }, [initialFilter]);

    const filteredRubrics = useMemo(() => {
        if (!searchTerm.trim()) {
            return rubricsHistory;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return rubricsHistory.filter(item =>
            item.rubric.title.toLowerCase().includes(lowercasedFilter) ||
            item.subject.toLowerCase().includes(lowercasedFilter) ||
            item.course.toLowerCase().includes(lowercasedFilter) ||
            item.region.toLowerCase().includes(lowercasedFilter) ||
            item.unitTitle?.toLowerCase().includes(lowercasedFilter)
        );
    }, [rubricsHistory, searchTerm]);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Repositorio de Rúbricas</h1>
                <p className="mt-2 text-lg text-gray-400">Consulte, filtre y gestione todas sus rúbricas guardadas.</p>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por título, materia, curso o unidad..."
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-200"
                    />
                </div>

                {filteredRubrics.length > 0 ? (
                    <div className="space-y-4">
                        {filteredRubrics.map(item => (
                            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg">
                                <details className="group">
                                    <summary className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 rounded-t-lg gap-2">
                                        <div className="flex-1">
                                            <h2 className="font-semibold text-gray-100 text-lg">{item.rubric.title}</h2>
                                            <p className="text-sm text-gray-400">
                                                {item.subject} &bull; {item.course}
                                                {item.unitTitle && <span className="text-gray-500"> (para UD: {item.unitTitle})</span>}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                className="flex items-center gap-2 text-xs bg-red-900/40 hover:bg-red-900/70 text-red-300 font-semibold py-1.5 px-3 rounded-md transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" /> Borrar
                                            </button>
                                        </div>
                                        <span className="transition-transform duration-200 transform group-open:rotate-90 text-gray-500 hidden sm:block">&#9656;</span>
                                    </summary>
                                    <div className="p-4 border-t border-gray-800">
                                        <RubricDisplay rubric={item.rubric} parentNames={new Set()} />
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-lg">
                        <p className="text-gray-400">
                            {rubricsHistory.length === 0 ? "No tiene ninguna rúbrica guardada." : "No se encontraron rúbricas con ese filtro."}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {rubricsHistory.length === 0 ? "Vaya al 'Generador' para crear y guardar su primera rúbrica." : "Intente con otros términos de búsqueda."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};