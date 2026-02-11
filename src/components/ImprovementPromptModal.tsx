
import React, { useState, useEffect } from 'react';
import { CloseIcon, ClipboardIcon, CheckIcon } from './icons';

interface ImprovementPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
}

export const ImprovementPromptModal: React.FC<ImprovementPromptModalProps> = ({ isOpen, onClose, prompt }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl transform transition-transform duration-300 ease-in-out"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">Aplicar Mejora</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-gray-300 mb-4">
                Para implementar esta mejora, copie el siguiente prompt y péguelo en la conversación para que la IA pueda procesarlo.
            </p>
            <div className="bg-gray-800 rounded-md p-4 mb-4">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                    <code>{prompt}</code>
                </pre>
            </div>
            <div className="flex justify-end gap-4">
                 <button 
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors"
                >
                    Cerrar
                </button>
                <button 
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors w-36"
                >
                    {isCopied ? (
                        <>
                            <CheckIcon className="w-5 h-5 text-green-600" />
                            ¡Copiado!
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-5 h-5" />
                            Copiar Prompt
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
