import React from 'react';
import { CloseIcon, WandSparklesIcon, DownloadIcon } from './icons';
import { Loader } from './Loader';
import { marked } from 'marked';

interface WorksheetDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string | null;
  onRegenerate: () => void;
  onDownload: () => void;
}

export const WorksheetDisplayModal: React.FC<WorksheetDisplayModalProps> = ({ isOpen, onClose, isLoading, content, onRegenerate, onDownload }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 h-full">
          <Loader />
          <p className="mt-4 text-gray-400">Generando ficha de trabajo...</p>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="p-8 text-center text-gray-400">
          <p>No se pudo generar la ficha.</p>
        </div>
      );
    }

    return (
      <div
        className="prose prose-invert prose-sm sm:prose-base max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Previsualización de Ficha de Trabajo</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
        <div className="flex justify-between items-center gap-3 p-4 bg-gray-950/50 border-t border-gray-800 rounded-b-lg">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">
            Cancelar
          </button>
          <div className="flex items-center gap-3">
             <button onClick={onRegenerate} disabled={isLoading} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">
                <WandSparklesIcon className="w-5 h-5" />
                Volver a Generar
            </button>
            <button onClick={onDownload} disabled={isLoading || !content} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors">
                <DownloadIcon className="w-5 h-5" />
                Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};