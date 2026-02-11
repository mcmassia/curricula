import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../services/historyService';
import { DownloadIcon, HistoryIcon, TrashIcon, CloseIcon } from './icons';

interface HistorySidePanelProps {
  isOpen: boolean;
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const HistorySidePanel: React.FC<HistorySidePanelProps> = ({ isOpen, history, activeId, onSelect, onDelete, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDownload = (item: HistoryItem) => {
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-3 text-gray-100">
            <HistoryIcon className="w-6 h-6 text-gray-400" />
            Historial de Generaciones
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por materia, curso o región..."
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 text-gray-200"
          />
        </div>

        {/* History List */}
        <div className="flex-grow overflow-y-auto">
          {filteredHistory.length > 0 ? (
            <div className="space-y-3 p-4">
              {filteredHistory.map(item => (
                <div
                    key={item.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 group ${
                    activeId === item.id 
                        ? 'bg-gray-800/50 border-gray-600' 
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                >
                    <div className="flex justify-between items-start" onClick={() => onSelect(item)}>
                        <div>
                            <p className="font-semibold text-gray-100">{item.subject}</p>
                            <p className="text-sm text-gray-400">{item.course} - {item.region}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(item.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                            aria-label="Descargar script"
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
              {history.length === 0 ? "No hay generaciones guardadas." : "No se encontraron resultados."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};