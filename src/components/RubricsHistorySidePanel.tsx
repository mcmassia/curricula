import React, { useState, useMemo } from 'react';
import { RubricHistoryItem } from '../types';
import { DownloadIcon, HistoryIcon, TrashIcon, CloseIcon } from './icons';

interface RubricsHistorySidePanelProps {
  isOpen: boolean;
  history: RubricHistoryItem[];
  onSelect: (item: RubricHistoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const RubricsHistorySidePanel: React.FC<RubricsHistorySidePanelProps> = ({ isOpen, history, onSelect, onDelete, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) {
      return history;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return history.filter(item =>
      item.subject.toLowerCase().includes(lowercasedFilter) ||
      item.course.toLowerCase().includes(lowercasedFilter) ||
      item.region.toLowerCase().includes(lowercasedFilter) ||
      item.rubric.title.toLowerCase().includes(lowercasedFilter)
    );
  }, [history, searchTerm]);
  
  const handleDownloadJson = (item: RubricHistoryItem) => {
    const jsonString = JSON.stringify(item.rubric, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = item.rubric.title.replace(/[\s,.\-']/g, '') || 'rubrica';
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0 }}
    >
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-950 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-800"
        onClick={e => e.stopPropagation()}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-3 text-gray-100">
            <HistoryIcon className="w-6 h-6 text-gray-400" />
            Historial de Rúbricas
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar rúbricas..."
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 text-gray-200"
          />
        </div>

        <div className="flex-grow overflow-y-auto">
          {filteredHistory.length > 0 ? (
            <div className="space-y-3 p-4">
              {filteredHistory.map(item => (
                <div
                    key={item.id}
                    className="p-3 rounded-lg border bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 group"
                >
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => onSelect(item)}>
                        <div>
                            <p className="font-semibold text-gray-100">{item.rubric.title}</p>
                            <p className="text-sm text-gray-400">{item.subject} / {item.course} / {item.region}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(item.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDownloadJson(item); }}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                                aria-label="Descargar JSON"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                                aria-label="Eliminar del historial"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-8">
              {history.length === 0 ? "No hay rúbricas guardadas." : "No se encontraron resultados."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};