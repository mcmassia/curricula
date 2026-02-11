
import React, { useState } from 'react';
import { FirebaseErrorDetails } from '../types';
import { CloseIcon, ClipboardIcon, CheckIcon, WarningIcon, LinkIcon } from './icons';

interface FirebaseErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: FirebaseErrorDetails | null;
}

export const FirebaseErrorModal: React.FC<FirebaseErrorModalProps> = ({ isOpen, onClose, details }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !details) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(details.solution);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-red-500/30 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-300 flex items-center gap-3">
            <WarningIcon className="w-6 h-6 text-red-400" />
            Asistente de Errores de Firebase
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-200">Problema Detectado:</h3>
            <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded-md mt-1">{details.message}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Solución Propuesta:</h3>
            <p className="text-sm text-gray-400 mb-2">{details.solution}</p>
            {details.url ? (
                <a 
                    href={details.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    <LinkIcon className="w-5 h-5" />
                    Crear Índice en Firebase
                </a>
            ) : (
                <div className="relative bg-gray-950 p-4 rounded-md border border-gray-700">
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-1 px-2 rounded-md"
                    >
                        {isCopied ? <><CheckIcon className="w-4 h-4 text-green-400"/> Copiado</> : <><ClipboardIcon className="w-4 h-4"/> Copiar</>}
                    </button>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                        <code>{details.solution}</code>
                    </pre>
                </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-900 border-t border-gray-800 rounded-b-lg flex justify-end">
           <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};