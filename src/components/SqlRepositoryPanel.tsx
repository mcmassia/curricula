

import React, { useState, useMemo, useEffect } from 'react';
import { HistoryItem } from '../services/historyService';
import { DownloadIcon, TrashIcon, UploadIcon, LightbulbIcon } from './icons';

interface SqlRepositoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onSuggestResources: (item: HistoryItem) => void;
    initialFilter?: string;
}

export const SqlRepositoryPanel: React.FC<SqlRepositoryPanelProps> = ({ history, onSelect, onDelete, onSuggestResources, initialFilter }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilter || '');
    
    useEffect(() => {
        if (initialFilter) {
            setSearchTerm(initialFilter);
        }
    }, [initialFilter]);

    const filteredHistory = useMemo(() => {
        if (!searchTerm.trim()) {
            return history;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return history.filter(item =>
            item.subject.toLowerCase().includes(lowercasedFilter) ||
            item.course.toLowerCase().includes(lowercasedFilter) ||
            item.region.toLowerCase().includes(lowercasedFilter)
        );
    }, [history, searchTerm]);

    const handleDownload = (e: React.MouseEvent, item: HistoryItem) => {
        e.stopPropagation();
        const blob = new Blob([item.sql], { type: 'application/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.fileName}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onDelete(id);
    };
    
    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100">Repositorio de Currículos</h1>
                <p className="mt-2 text-lg text-gray-400">Consulte, cargue y gestione todos sus currículos generados.</p>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por materia, curso o comunidad..."
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-200"
                    />
                </div>

                {filteredHistory.length > 0 ? (
                    <div className="space-y-3">
                        {filteredHistory.map(item => (
                            <div
                                key={item.id}
                                className="group p-4 rounded-lg border bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors flex justify-between items-center"
                            >
                                <div className="flex-1 cursor-pointer" onClick={() => onSelect(item)}>
                                    <p className="font-semibold text-gray-100">{item.subject}</p>
                                    <p className="text-sm text-gray-400">{item.course} - {item.region}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Creado: {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                     <button
                                        onClick={(e) => { e.stopPropagation(); onSuggestResources(item); }}
                                        className="p-2 text-gray-400 hover:text-yellow-300 hover:bg-yellow-900/50 rounded-md transition-colors"
                                        title="Sugerir Recursos Educativos"
                                    >
                                        <LightbulbIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                                        title="Cargar en el Generador"
                                    >
                                        <UploadIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDownload(e, item)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                                        title="Descargar Script"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                                        title="Eliminar Script"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-lg">
                        <p className="text-gray-400">
                            {history.length === 0 ? "No hay generaciones guardadas." : "No se encontraron resultados."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};