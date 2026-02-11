import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from './icons';
import { Loader } from './Loader';
import { CorrectionLog } from './CorrectionAssistant';

interface SqlCorrectionAssistantProps {
    onRefine: (userRequest: string) => void;
    log: CorrectionLog[];
    isRefining: boolean;
    isEnabled: boolean;
}

export const SqlCorrectionAssistant: React.FC<SqlCorrectionAssistantProps> = ({ onRefine, log, isRefining, isEnabled }) => {
    const [userInput, setUserInput] = useState('');
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isRefining) {
            onRefine(userInput);
            setUserInput('');
        }
    };

    return (
        <div className="flex flex-col space-y-4">
             <div className={`bg-gray-900 border border-gray-700 rounded-lg transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-50'}`}>
                <div className="p-4">
                    <p className="text-sm text-gray-400">
                        Si el script SQL generado contiene algún error, descríbalo aquí para intentar corregirlo. Ej: "La relación del criterio 'c' es incorrecta".
                    </p>
                </div>
                {log.length > 0 && (
                     <div className="max-h-48 overflow-y-auto p-4 border-t border-gray-700 space-y-4">
                        {log.map((entry, index) => (
                            <div key={index} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg text-sm ${entry.role === 'user' ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-gray-300'}`}>
                                    <pre className="whitespace-pre-wrap font-sans">{entry.content}</pre>
                                </div>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                )}
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
                    <div className="relative">
                        <textarea
                            rows={4}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isEnabled ? "Indique su corrección sobre el SQL..." : "Primero debe generar un script SQL."}
                            disabled={isRefining || !isEnabled}
                            className="w-full p-2 pr-10 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 text-gray-200 disabled:cursor-not-allowed resize-y"
                        />
                        <button
                            type="submit"
                            disabled={isRefining || !userInput.trim() || !isEnabled}
                            className="absolute top-2 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isRefining ? <Loader /> : <PaperAirplaneIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
