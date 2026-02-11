import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../services/historyService';
import { extractCurricularItemsFromSql } from '../services/sqlParser';
import { parseTextForCurricularItems } from '../services/geminiService';
import { CloseIcon } from './icons';
import { Loader } from './Loader';

type PickerTab = 'history' | 'text';

interface CurricularItems {
    competencies: string[];
    criteria: string[];
    knowledge: string[];
}

interface CurriculumPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedItems: CurricularItems) => void;
    history: HistoryItem[];
}

export const CurriculumPickerModal: React.FC<CurriculumPickerModalProps> = ({ isOpen, onClose, onConfirm, history }) => {
    const [activeTab, setActiveTab] = useState<PickerTab>('history');
    const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
    const [textInput, setTextInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [parsedItems, setParsedItems] = useState<CurricularItems | null>(null);
    const [selectedItems, setSelectedItems] = useState<CurricularItems>({ competencies: [], criteria: [], knowledge: [] });

    useEffect(() => {
        // Reset state when opening/closing
        if (isOpen) {
            setActiveTab('history');
            setSelectedHistoryId('');
            setTextInput('');
            setIsLoading(false);
            setParsedItems(null);
            setSelectedItems({ competencies: [], criteria: [], knowledge: [] });
            setError(null);
        }
    }, [isOpen]);

    const handleHistorySelect = (id: string) => {
        setSelectedHistoryId(id);
        setError(null);
        const selected = history.find(h => h.id === id);
        if (selected) {
            try {
                const items = extractCurricularItemsFromSql(selected.sql);
                setParsedItems(items);
            } catch(e) {
                 console.error("Error parsing SQL for items:", e);
                setParsedItems(null);
                setError("No se pudo analizar el script SQL. Es posible que el formato no sea compatible.");
            }
        } else {
            setParsedItems(null);
        }
    };

    const handleParseText = async () => {
        if (!textInput.trim()) return;
        setIsLoading(true);
        setParsedItems(null);
        setError(null);
        try {
            const items = await parseTextForCurricularItems(textInput);
            setParsedItems(items);
        } catch (error) {
            console.error("Error parsing text for items:", error);
            setError("La IA no pudo analizar el texto. Por favor, revise el formato o inténtelo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCheckboxChange = (type: keyof CurricularItems, item: string) => {
        setSelectedItems(prev => {
            const currentList = prev[type];
            const isSelected = currentList.includes(item);
            const newList = isSelected ? currentList.filter(i => i !== item) : [...currentList, item];
            return { ...prev, [type]: newList };
        });
    };

    const handleConfirm = () => {
        onConfirm(selectedItems);
        onClose();
    };

    const renderItemList = (title: string, type: keyof CurricularItems, items: string[]) => (
        <div>
            <h4 className="font-semibold text-gray-300 mb-2">{title} ({selectedItems[type].length}/{items.length})</h4>
            <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-950 rounded-md border border-gray-700">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={`${type}-${index}`} className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id={`${type}-${index}`}
                            checked={selectedItems[type].includes(item)}
                            onChange={() => handleCheckboxChange(type, item)}
                            className="h-4 w-4 mt-1 rounded bg-gray-700 border-gray-600 text-gray-500 focus:ring-gray-600 flex-shrink-0"
                        />
                        <label htmlFor={`${type}-${index}`} className="text-sm text-gray-300">{item}</label>
                    </div>
                )) : <p className="text-sm text-gray-500 italic p-2">No se encontraron elementos.</p>}
            </div>
        </div>
    );
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-100">Seleccionar Elementos Curriculares</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="p-2 flex space-x-2 border-b border-gray-700">
                            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'history' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Desde Historial</button>
                            <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === 'text' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Desde Texto</button>
                        </div>
                        <div className="p-4">
                            {activeTab === 'history' ? (
                                <select 
                                    value={selectedHistoryId} 
                                    onChange={(e) => handleHistorySelect(e.target.value)} 
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200"
                                >
                                    <option value="">-- Seleccione un currículo del historial --</option>
                                    {history.map(item => <option key={item.id} value={item.id}>{item.subject} - {item.course}</option>)}
                                </select>
                            ) : (
                                <div className="space-y-2">
                                    <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={6} placeholder="Pegue aquí el texto..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-200" />
                                    <button onClick={handleParseText} disabled={isLoading || !textInput.trim()} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-700">
                                        {isLoading ? <span className="flex items-center justify-center"><Loader /> Analizando...</span> : 'Analizar Texto'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 rounded-md text-red-300 text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {parsedItems && (
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {renderItemList('Competencias Específicas', 'competencies', parsedItems.competencies)}
                            {renderItemList('Criterios de Evaluación', 'criteria', parsedItems.criteria)}
                            {renderItemList('Saberes Básicos', 'knowledge', parsedItems.knowledge)}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end gap-3 p-4 bg-gray-950/50 border-t border-gray-800 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md">Cancelar</button>
                    <button onClick={handleConfirm} disabled={!parsedItems} className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-md disabled:bg-gray-800">
                        Añadir Seleccionados
                    </button>
                </div>
            </div>
        </div>
    );
};