

import React, { useState, useMemo } from 'react';
import { CloseIcon, ClipboardIcon, CheckIcon, DownloadIcon, SaveIcon } from './icons';
import { marked } from 'marked';
import { Loader } from './Loader';
import { DidacticUnit, SavedDidacticUnit } from '../types';

interface SequenceDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence: string | null;
  unit: DidacticUnit | SavedDidacticUnit | null;
  onSave?: (sequence: string) => void;
  onGenerateAndLinkActivity?: (parent: SavedDidacticUnit, activityTitle: string, activityDescription?: string) => void;
  onNavigateToActivity?: (activityId: string, parent: { type: 'unit'; id: string }) => void;
  generatingLinkedActivity?: Set<string>;
}

type SequenceBlock = {
    type: 'activity' | 'prose';
    title: string;
    description: string;
};

export const SequenceDisplayModal: React.FC<SequenceDisplayModalProps> = ({ 
    isOpen, 
    onClose, 
    sequence, 
    unit, 
    onSave,
    onGenerateAndLinkActivity,
    onNavigateToActivity,
    generatingLinkedActivity,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const isSavedUnit = unit && 'id' in unit;
  const title = unit ? ('unit' in unit ? unit.unit.title : unit.title) : '';

  const sequenceBlocks = useMemo(() => {
    if (!sequence) return [];

    // Use a more flexible regex that looks for the keyword at the beginning of the title.
    const activityTitleRegex = /^(actividad|sesión|tarea|ejercicio|fase|paso)\b/i;

    const parts = sequence.split(/(?=^##\s)/m).filter(part => part.trim() !== '');
    
    return parts.map(part => {
        const titleMatch = part.match(/^##\s*(.*)/);
        const title = titleMatch ? titleMatch[1].trim() : "Sección sin título";
        const description = part.replace(/^##\s*(.*)/, '').trim();

        if (activityTitleRegex.test(title)) {
            return { type: 'activity' as const, title, description };
        } else {
            return { type: 'prose' as const, title, description };
        }
    });
  }, [sequence]);


  if (!isOpen) return null;

  const handleCopy = () => {
    if (sequence) {
        navigator.clipboard.writeText(sequence);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleDownload = () => {
    if (sequence) {
        const blob = new Blob([sequence], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secuencia_${title.replace(/[\s,.-]/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
  };
  
  const handleSave = () => {
    if (sequence && onSave) {
      onSave(sequence);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-950 border border-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Secuencia Didáctica</h2>
            <p className="text-sm text-gray-400">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
                 <button onClick={handleSave} disabled={!sequence} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-semibold">
                    <SaveIcon className="w-5 h-5" /> Guardar Secuencia
                </button>
            )}
            <button onClick={handleDownload} disabled={!sequence} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"><DownloadIcon className="w-5 h-5" /></button>
            <button onClick={handleCopy} disabled={!sequence} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50">
                {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
            {sequence ? (
                <div className="space-y-6">
                    {sequenceBlocks.map((block, index) => {
                        const htmlContent = marked.parse(`## ${block.title}\n${block.description}`);
                        
                        if (block.type === 'prose') {
                            return (
                                <div key={index} className="prose prose-invert prose-sm sm:prose-base max-w-none"
                                     dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            );
                        }

                        // It's an activity block
                        const activityTitle = block.title;
                        const encodedActivityTitle = isSavedUnit ? btoa(encodeURIComponent(activityTitle)) : '';
                        const linkedActivityId = isSavedUnit ? (unit as SavedDidacticUnit).detailedActivities?.[encodedActivityTitle] : undefined;
                        const loadingKey = isSavedUnit ? `${(unit as SavedDidacticUnit).id}_${activityTitle}` : '';
                        const isLoading = generatingLinkedActivity?.has(loadingKey);

                        return (
                            <div key={index} className="prose prose-invert prose-sm sm:prose-base max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                {isSavedUnit && onGenerateAndLinkActivity && onNavigateToActivity && (
                                     <div className="mt-2 text-right not-prose">
                                        {isLoading ? (
                                            <div className="inline-flex items-center gap-2 text-sm text-gray-400"><Loader /> Creando...</div>
                                        ) : linkedActivityId ? (
                                            <button onClick={() => onNavigateToActivity(linkedActivityId, { type: 'unit', id: (unit as SavedDidacticUnit).id })} className="text-sm font-semibold bg-green-900/50 hover:bg-green-800/50 text-green-300 px-3 py-1.5 rounded-md transition-colors">
                                                Ver Actividad Creada
                                            </button>
                                        ) : (
                                            <button onClick={() => onGenerateAndLinkActivity(unit as SavedDidacticUnit, activityTitle, block.description)} className="text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-md transition-colors">
                                                Crear Actividad Detallada
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <Loader />
                    <p className="mt-4 text-gray-400">Generando secuencia...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
