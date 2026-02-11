import React from 'react';
import { Improvement } from '../services/improvementsService';
import { TrashIcon } from './icons';

interface ImprovementsPanelProps {
    improvements: Improvement[];
    onApply: (improvement: Improvement) => void;
    onDelete: (improvement: Improvement) => void;
}

export const ImprovementsPanel: React.FC<ImprovementsPanelProps> = ({ improvements, onApply, onDelete }) => {
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-100">Próximas Funcionalidades</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Ideas y mejoras que podrían llevar CurrículoSQL al siguiente nivel.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {improvements.map((item) => (
                    <div key={item.title} className="relative bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col hover:border-gray-700 transition-colors">
                        <button
                            onClick={() => onDelete(item)}
                            className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-colors"
                            aria-label="Eliminar sugerencia"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2 pr-6">{item.title}</h3>
                        <p className="text-gray-400 text-sm flex-grow mb-4">{item.description}</p>
                        <button
                            onClick={() => onApply(item)}
                            className="mt-auto w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Ver Prompt
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};