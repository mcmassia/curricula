import React from 'react';
import { Toast as ToastType, FirebaseErrorDetails } from '../types';
import { CheckIcon, XCircleIcon, InfoIcon, CloseIcon, LinkIcon } from './icons';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: number) => void;
  onShowDetails: (details: FirebaseErrorDetails) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove, onShowDetails }) => {
  const { id, message, type, details, url } = toast;

  const iconMap = {
    success: <CheckIcon className="w-6 h-6 text-green-400" />,
    error: <XCircleIcon className="w-6 h-6 text-red-400" />,
    info: <InfoIcon className="w-6 h-6 text-blue-400" />,
  };

  const baseClasses = "relative w-full max-w-sm p-4 rounded-lg shadow-lg border flex items-start gap-3 transition-all transform animate-fade-in-right";
  const typeClasses = {
    success: 'bg-green-900/50 border-green-500/30 text-green-200',
    error: 'bg-red-900/50 border-red-500/30 text-red-200',
    info: 'bg-blue-900/50 border-blue-500/30 text-blue-200',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex-shrink-0">{iconMap[type]}</div>
      <div className="flex-grow">
        <p className="text-sm font-semibold">{message}</p>
        {details && (
          <button 
            onClick={() => onShowDetails(details)}
            className="mt-2 text-xs font-bold underline hover:text-white"
          >
            Ver Detalles
          </button>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs font-bold underline hover:text-white inline-flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            Ver Documento
          </a>
        )}
      </div>
      <button 
        onClick={() => onRemove(id)}
        className="p-1 -mt-1 -mr-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};