
import React from 'react';
import { CloseIcon, WarningIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-yellow-500/30 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-yellow-300 flex items-center gap-3">
            <WarningIcon className="w-6 h-6 text-yellow-400" />
            {title}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-gray-950/50 border-t border-gray-800 rounded-b-lg">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors">
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
