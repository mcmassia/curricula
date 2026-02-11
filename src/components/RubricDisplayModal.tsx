

import React from 'react';
import { Rubric } from '../types';
import { CloseIcon, SaveIcon } from './icons';
import { RubricDisplay } from './RubricDisplay';
import { Loader } from './Loader';

interface RubricDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubric: Rubric | null;
  parentNames: Set<string>;
  onSave?: (rubric: Rubric) => void;
}

export const RubricDisplayModal: React.FC<RubricDisplayModalProps> = ({ isOpen, onClose, rubric, parentNames, onSave }) => {
  if (!isOpen) return null;

  const handleSave = () => {
    if (rubric && onSave) {
        onSave(rubric);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-950 border border-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-100">Rúbrica Generada</h2>
          <div className="flex items-center gap-2">
            {onSave && (
                <button 
                    onClick={handleSave} 
                    disabled={!rubric} 
                    className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1.5 px-3 rounded-md transition-colors disabled:opacity-50"
                >
                    <SaveIcon className="w-4 h-4" />
                    Guardar Rúbrica
                </button>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
            {!rubric ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Loader />
                    <p className="mt-4 text-gray-400">Generando rúbrica...</p>
                </div>
            ) : (
                <RubricDisplay rubric={rubric} parentNames={parentNames} />
            )}
        </div>
      </div>
    </div>
  );
};